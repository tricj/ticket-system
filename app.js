/**
 * Module dependencies
 */
var express = require('express');
var validator = require('express-validator');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var rollbar = require('rollbar');
var sassMiddleware = require('node-sass-middleware');
var path = require('path');
var morgan = require('morgan');
var favicon = require('serve-favicon');

/**
 * Declare app environment
 */
var app = express();

/**
 * Configure Rollbar
 */
app.use(rollbar.errorHandler('963030b75d6b4cfa949fc6e7d9a22c3d'));
rollbar.handleUncaughtExceptionsAndRejections('963030b75d6b4cfa949fc6e7d9a22c3d');

/**
 * Configure SASS
 */
app.use(sassMiddleware({
    src: path.join(__dirname, 'sass'),
    dest: __dirname + '/public/stylesheets',
    debug: true,
    outputStyle: 'compressed',
    prefix: '/stylesheets'
}));

/**
 * Configure Express
 */
app.use(morgan('dev')); // logging utility
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(validator({
    customValidators: {}
}));


/**
 * Configure static routing
 */
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Configure routes
 */
require('./routes/interface');
require('./routes/api');

/**
 * Configure view engine
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// *************** HANDLERS *************** //

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    if(err.status != 404)
        rollbar.handleError(err);
    res.status(err.status || 500);
    var params = {
        message: err.message,
        error: err,
        user: req.user
    };
    if (app.get('env') === 'development')
        params.err = {};
    res.render('error', params);
    next();
});

module.exports = app;