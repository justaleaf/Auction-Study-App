// @flow
var express = require('express');
var router = express.Router();


// function sum(x, y)
// {
//     return x + y;
// }
//
// sum(2, "2");
//
// function foo(x: ?number): string {
//     if (x) {
//         return x;
//     }
//     return "default string";
// }

/* GET settings page. */
router.get('/settings', function(req, res, next) {
    res.render('auct_setts', { setts: global.auctionInfo});
});

/* POST update settings */
router.post('/settings', function(req, res, next) {
    let body = req.body;
    if (!body.DateTime || !body.timeout || !body.allTime || !body.researchPause) {
        res.status(400);
        res.json({message: "Bad Request"});
    } else {
        global.auctionInfo.DateTime = body.DateTime;
        global.auctionInfo.timeout = body.timeout;
        global.auctionInfo.researchPause = body.researchPause;
        global.auctionInfo.allTime = body.allTime;
        global.myEventEmitter.emit('set-auction-timeout');
        res.status(200);
        res.json({message: "Success"});
    }
});

module.exports = router;
module.exports.auctTimeSetts = global.auctionInfo;