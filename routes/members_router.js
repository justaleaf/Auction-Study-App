var express = require('express');
var events = require('events');
global.myEventEmitter = new events.EventEmitter();
const io = require('socket.io').listen(1337);
var router = express.Router();

var picturesForAuction = global.paintings.filter(picture => picture.inAuct==true)

global.myEventEmitter.on('set-auction-timeout', () =>
{
    setAuctionTimeout();
});
var maxBid;
var nextPictureTimeout;
var prevPicture = undefined;

function emitNextPicture()
{
    var currPicture = picturesForAuction.pop();
    if(picturesForAuction.length > 0)
        var nextPicture = picturesForAuction[picturesForAuction.length-1];
    if(currPicture == undefined)
    {
            global.rollbar.log('leave');
            global.myEventEmitter.emit('next-picture');
            global.myEventEmitter.emit('end-auction');
    }
    else
    {
            global.myEventEmitter.emit('next-picture', prevPicture, currPicture, nextPicture);
            setTimeout(()=>maxBid = undefined, 100);
            nextPictureTimeout = setTimeout(() => emitNextPicture(), global.auctionInfo.timeout*10000);
    }
    prevPicture = currPicture;
}
var auctionTimeout;

function startAuction()
{
    picturesForAuction = global.paintings.filter(picture => picture.inAuct==true);
    clearTimeout(nextPictureTimeout);
    emitNextPicture();
    // global.rollbar.log(picturesForAuction)
}

function setAuctionTimeout()
{
    var nextAuctDate = new Date(global.auctionInfo.DateTime).getTime() - new Date().getTime();
    global.rollbar.log(nextAuctDate);
    if(nextAuctDate >= 0)
    {
        clearTimeout(auctionTimeout);
        auctionTimeout = setTimeout(function ()
        {
            global.myEventEmitter.emit('start-auction');
            startAuction();
        }, nextAuctDate);
    }
    else
    {
        // TODO сообщать о том что аукцион начался ?)
    }
}
setAuctionTimeout();


function nextPictureNotification(socket, currPicture, nextPicture)
{
    if(currPicture!== undefined)
    {
        let time = (new Date()).toLocaleTimeString();
        socket.json.emit("msg", {"message": `${time} | Выставлена картина: ${currPicture.name}`});

        if(nextPicture !== undefined)
        {
            socket.json.emit("msg", {"message": `${time} | Следующая картина: ${nextPicture.name}`});
        }
    }
}

io.sockets.on('connection', (socket)=>{

    global.myEventEmitter.on('start-auction', () =>
    {
        let time = (new Date()).toLocaleTimeString();
        socket.json.emit("msg", {"message": `${time} | Аукцион начался!`});
    });

    global.myEventEmitter.on('end-auction', () =>
    {
        let time = (new Date()).toLocaleTimeString();
        socket.json.emit("msg", {"message": `${time} | Аукцион завершен!`});
        if(socket["pictures"] !== undefined)
        {
            socket.json.emit("msg", {"message": `Выкупленные картины:`});
            for (var i = 0; i < socket["pictures"].length; i++)
            {
                socket.json.emit("msg", {"message": `${socket["pictures"][i].title} : ${socket["pictures"][i].cost}`}); //TODO добавить цену выкупа
            }
        }
    });

    global.myEventEmitter.on('next-picture', (prevPicture, currPicture, nextPicture) =>
    {
        let time = (new Date()).toLocaleTimeString();
        if(maxBid !== undefined)
        {
            if(socket === maxBid.user)
            {
                socket.json.emit("msg", {"message": `${time} | Вы выиграли торги!`});
                if(socket["pictures"] === undefined)
                    socket["pictures"] = new Array();
                socket["pictures"].push({title: prevPicture.name, cost: maxBid.bid});
            }
            else
            {
                global.rollbar.log('Not that one')
                socket.json.emit("msg", {"message": `${time} | ${maxBid.user["name"]} выиграл торги!`});
            }
        }

        nextPictureNotification(socket, currPicture, nextPicture);
        // TODO добавить сохранение картины на клиенте если сокет выиграл торги
    });
    socket.on('hello', (msg)=>{
        socket["name"] = msg.name;
        send(socket, `Присоединился ${msg.name}`);
    });

    socket.on('sold', (name, cost)=>{
        if(socket["pictures"] === undefined)
            socket["pictures"] = new Array();
        socket["pictures"].append({title: name, cost: cost});
    });

    socket.on('bid', (cost)=>{
        if(maxBid !== undefined)
        {
            if(parseInt(maxBid.bid) < cost)
            {
                global.rollbar.log(`multipleBid ${socket.name}`);
                maxBid = {user: socket, bid: cost};
            }
            else
                global.rollbar.log(`lowerBid ${socket.name}`)

        }
        else
        {
            global.rollbar.log(`firstBid ${socket.name}`);
            maxBid = {user: socket, bid: cost};
        }
        send(socket, `${socket["name"]} сделал ставку: ${cost}`);
    });

    socket.on('disconnect', (msg)=>{
        send(socket, `Покинул ${socket["name"]}`);
    });
});


function send(socket, msg) {
    let time = (new Date()).toLocaleTimeString();
    socket.json.emit("msg", {"message": `${time} | ${msg}`});
    socket.broadcast.json.emit("msg", {"message": `${time} | ${msg}`});
}


//loading  auction data from json


var auctMembers = [];
for (key in global.auctionMembers) {
    global.auctionMembers[key].ind = Number(key);
    auctMembers.push(global.auctionMembers[key]);
}
//end of loading data

/* GET auction members. */
router.get('/members', function(req, res, next) {
    res.render('members', { members: auctMembers });
});

/* delete auction member. */
router.post('/members/delete', function(req, res, next) {
    let body = req.body;
    if (!body.id.toString().match(/^\d+$/g)) {
        res.status(400);
        res.json({message: "Bad Request"});
    } else {
        auctMembers.splice(body.id, 1);
        for (let i = 0; i < auctMembers.length; i++) {
            auctMembers[i].ind = i;
        }
        res.render('members', { members: auctMembers });
    }
});

/* add auction member. */
router.post('/members/add', function(req, res, next) {
    let body = req.body;
    if (!body.name ||
        !body.money.toString().match(/^\d+$/g)) {
        res.status(400);
        res.json({message: "Bad Request"});
    } else {
        auctMembers.push({
            name: body.name,
            money: body.money,
            ind: auctMembers.length
        });
        res.render('members', { members: auctMembers });
    }
});

/* change auction member money. */
router.post('/members/changemoney', function(req, res, next) {
    let body = req.body;
    global.rollbar.log(req.body)
    if (!body.id ||
        !body.money.toString().match(/^\d+$/g)) {
        res.status(400);
        res.json({message: "Bad Request"});
    } else {
        for (let i = 0; i < auctMembers.length; i++) {
            if (auctMembers[i].ind == body.id) {
                auctMembers[i].money = body.money;
            }
        }
        res.render('members', { members: auctMembers });
    }
});

router.get('/members/:num(\\d+)', function(req, res) {

    res.render('member', {nextAuctionDate: auctionInfo.DateTime})

});

module.exports = router;
module.exports.auctMembers = auctMembers;