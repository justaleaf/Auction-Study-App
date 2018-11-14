var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var lessMiddleware = require('less-middleware');
var logger = require('morgan');


var Rollbar = require("rollbar");
global.rollbar = new Rollbar({
    accessToken: 'e64992fdfe144d2592b59c3e9147efb7',
    captureUncaught: true,
    captureUnhandledRejections: true
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'build')));

global.auctionMembers = require('./data/members');
global.auctionInfo = require('./data/auction_settings');
global.auctionPictures = require('./data/picture');

var indexRouter = require('./routes/index');
var membersRouter = require('./routes/members_router');
var auctionSettsRouter = require('./routes/auction_setts_router');

app.use('/', indexRouter);
app.use('/', membersRouter);
app.use('/', auctionSettsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
module.exports.paintings = indexRouter.paintings;
module.exports.auctMembers = membersRouter.auctMembers;
module.exports.auctTimeSetts = auctionSettsRouter.auctTimeSetts;