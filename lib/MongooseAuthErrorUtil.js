'use strict';

var log = require('bunyan').createLogger({name:'MongooseAuthErrorUtil'});
var _ = require('lodash');

exports = module.exports = function MongooseAuthErrorUtil(err) {
    if (err) {
        if (err.name === 'MongoError') {
            return handleMongoError(err);
        } else if (err.name === 'ValidationError') {
            log.error('ValidationError', err);
            return {message: 'api.error.invalid.params', data: _.map(err.errors, function (error) {
                return {field: error.path, reason: error.type};
            })};
        } else {
            log.error('Unhandled Registration error', err);
            return {message: 'api.error.server'};
        }
    }
};


function handleMongoError(err) {
    var errorMessage;
    switch (err.code) {
    case 11000:
        errorMessage = {message: 'api.error.conflict', data: [{field:'email', reason:'duplicate'}]};
        break;
    default:
        log.error('MongoError', err);
        errorMessage = {message: 'api.error.invalid.params', data:err };
        break;
    }
    return errorMessage;
}