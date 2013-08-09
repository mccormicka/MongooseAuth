'use strict';

exports = module.exports = function NodeAuthChangePassword(schema) {

    var async = require('async');
    var log = require('nodelogger')('NodeAuthChangePassword');
    var Token = require('./NodeAuthPasswordToken');
    var errorUtil = require('../NodeAuthErrorUtil');

    schema.statics.changePassword = function (email, password, token, next) {
        var Model = this;
        var connection;
        async.series({
            model: function (callback) {
                Model.findOne({email: email}, function(err, result){
                    if(err){
                        callback(err);
                    }else if(!result){
                        callback({message: 'api.error.invalid.params', data: [
                            {field: 'email', reason: 'invalid'}
                        ]});
                    }else{
                        connection = result.db;
                        callback(null, result);
                    }
                });
            },
            token: function (callback) {
                Token.Model(connection).findOne({token: token, valid:true}, callback);
            }
        }, function (err, result) {
            result.password = password;
            foundPasswordResults(err, result, next);
        });
    };

    schema.methods.changePassword = function (pass, next) {
        this.password = pass;
        this.save(function (err, result) {
            if (err) {
                log.error('Error saving new password', err);
                next(errorUtil(err));
            } else {
                next(null, {message: 'api.success.updated', data: result });
            }
        });
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function invalidateToken(result) {
        result.token.valid = false;
        result.token.save(function (err) {
            if (err) {
                log.warn('Error invalidating password token');
            }
        });
    }

    function updatePasswordIfTokensMatch(result, next) {
        if (result.model._id.equals(result.token.objectId)) {//Same items.
            result.model.changePassword(result.password, function (err, success) {
                if (err) {
                    next(err);
                } else {
                    invalidateToken(result);
                    next(null, success);
                }
            });
        } else {
            next({message: 'api.error.invalid.params', data: [
                {field: 'token', reason: 'invalid'}
            ]});
        }
    }

    function foundPasswordResults(err, result, next) {
        if (err) {
            next(err);
        } else if (!result.model || !result.token) {
            next({message: 'api.error.invalid.params', data: [
                {field: 'token', reason: 'expired'}
            ]});
        } else {
            updatePasswordIfTokensMatch(result, next);
        }
    }
};