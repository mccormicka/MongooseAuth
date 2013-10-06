'use strict';

exports = module.exports = function MongooseAuthRegister(schema, extensionOptions) {
//    var log = require('nodelogger').Logger(__filename)
    var validate = require('mongoose-validator').validate;
    var _ = require('lodash');
    var errorUtil = require('../MongooseAuthErrorUtil');

    var invalidEmailParam = {field: 'email', reason: 'invalid'};
    var invalidPasswordParam = {field: 'password', reason: 'invalid'};

    extensionOptions = _.defaults(extensionOptions || {}, {
        passwordMinLength: 6,
        emailRequired: true,
        passwordRequired: true
    });

    var email = {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    };
    if (extensionOptions.emailRequired) {
        email.required = true;
        email.validate = [validate({message: 'invalid'}, 'isEmail')];
    }

    var password = {
        type: String
    };

    if (extensionOptions.passwordRequired) {
        password.required = true;
        password.validate =
            [validate({message: 'min.length:' + extensionOptions.passwordMinLength},
                'len', extensionOptions.passwordMinLength)];
    }

    schema.add({
        email: email,
        password: password
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