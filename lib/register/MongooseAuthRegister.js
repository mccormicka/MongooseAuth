'use strict';

exports = module.exports = function MongooseAuthRegister(schema, options){
//    var log = require('nodelogger')('NodeAuthRegister');
    var validate = require('mongoose-validator').validate;
    var _ = require('lodash');
    var errorUtil = require('../MongooseAuthErrorUtil');

    var invalidEmailParam = {field: 'email', reason: 'invalid'};
    var invalidPasswordParam = {field:'password', reason:'invalid'};

    schema.add({
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validate({message: 'invalid'}, 'isEmail')]
        },
        password: {
            type: String,
            required: true,
            validate: [validate({message: 'min.length:' + options.passwordMinLength}, 'len', options.passwordMinLength)]
        }
    });

    schema.statics.register = function (email, password, next) {
        if (invalidEmail(email)) {
            next({message: 'api.error.invalid.params', data: [invalidEmailParam]});
        } else if (invalidPassword(password)) {
            next({message: 'api.error.invalid.params', data: [invalidPasswordParam]});
        } else {
            this.create({email: email, password: password}, function (err, result) {
                if (!handleError(err, next)) {
                    next(null, result);
                }
            });
        }
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function handleError(err, next) {
        if (err) {
            next(errorUtil(err));
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
};