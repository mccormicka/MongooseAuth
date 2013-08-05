'use strict';

//var express = require('express');
//var app = express();
var _ = require('lodash');

//var passport = require('passport');
var log = require('nodelogger')('NodeAuth');
var Auth;

module.exports.initialize = function (mongoose, connection) {
    module.exports.NodeAuth = Auth = require('./lib/NodeAuth')(mongoose, connection);
//    app.configure(function () {
//        app.use(passport.initialize());
//        app.use(passport.session());
//    });

//    app.post('/register', module.exports.register);

    return function (req, res, next) {
        next();
    };
};

module.exports.register = function (req, res, next) {
    if (invalidEmail(req.body.email)) {
        next({message: 'api.error.invalid.params', data: 'invalid.email'});
    } else if (invalidPassword(req.body.pass)) {
        next({message: 'api.error.invalid.params', data: 'invalid.password'});
    } else {
        registerEmail(req, res, next);
    }
};

//-------------------------------------------------------------------------
//
// Private Methods
//
//-------------------------------------------------------------------------

function registerEmail(req, res, next) {
    Auth.create({email: req.body.email, password: req.body.pass}, function (err, result) {
        if (!handleError(err, next)) {
            next(null, result);
        }
    });
}

function handleError(err, next) {
    if (err) {
        if (err.name === 'MongoError' && err.code === 11000) {
            next({message: 'api.error.conflict', data: 'duplicate.email'});
        } else {
            log.error('Registering email', err);
            next({message: 'api.error.server'});
        }
        return true;
    }
    return false;
}

function invalidEmail(email) {
    return _.isArray(email);
}

function invalidPassword(pass) {
    return _.isArray(pass);
}