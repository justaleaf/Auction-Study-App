
var express = require('express');
var router = express.Router();

//loading  auction data from json


global.paintings = [];
for (key in global.auctionPictures) {
    global.auctionPictures[key].ind = Number(key);
    global.paintings.push(global.auctionPictures[key]);
}
//end of loading data

function getPicObjForRender(fullObj) {
    return {
        id: fullObj.ind,
        name: fullObj.name,
        author: fullObj.author,
        description: fullObj.description,
        inAuct: fullObj.inAuct,
        startPrice: fullObj.startPrice,
        sMin: fullObj.step.min,
        sMax: fullObj.step.max,
        imgPath: fullObj.imgPath
    }
}

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { pics: global.paintings });
});

/* GET painting. */
router.get('/pictures/:num(\\d+)', function(req, res, next) {
    const painting = global.paintings.filter((p) => {
        if (p.ind == req.params.num) {
            return true;
        }
    })[0];
    res.render('picture', getPicObjForRender(painting));
});

/* POST new pic info. */
router.post('/pictures/:num(\\d+)', function(req, res, next) {
    let body = req.body;
    let painting;
    if (body.length === 6) {
        if (!body.author || !body.picName || !body.description ||
            !body.sMin || !body.sMax || !body.startPrice.toString().match(/^\d+$/g)) {
            res.status(400);
            res.json({message: "Bad Request"});
        }
    }

    for (let i = 0; i < global.paintings.length; i++) {
        if (global.paintings[i].ind == req.params.num) {
            if (Object.keys(body).length === 6) {
                global.paintings[i].author = body.author;
                global.paintings[i].name = body.picName;
                global.paintings[i].description = body.description;
                global.paintings[i].startPrice = body.startPrice;
                global.paintings[i].step.min = body.sMin;
                global.paintings[i].step.max = body.sMax;
            } else if (Object.keys(body).length === 1) {
                global.paintings[i].inAuct = body.inAuct !== 'true';
            }
            painting = global.paintings[i];
            break;
        }
    }

    if (painting) {
        res.render('picture', getPicObjForRender(painting));
    } else {
        res.status(400);
        res.json({message: "Bad Request"});
    }
});

module.exports = router;
