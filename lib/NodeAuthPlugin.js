'use strict';

module.exports = function NodeAuth(schema, options) {

    var _ = require('lodash');
    options = _.defaults(options || {}, {local:false});

    var log = require('nodelogger')('NodeAuthRegister');
    var validate = require('mongoose-validator').validate;
    var bcrypt = require('bcrypt');

    var SALT_WORK_FACTOR = 10;

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
            validate: [validate({message: 'min.length:6'}, 'len', 6)]
        }
    });

    schema.statics.auth = {};

    var invalidEmailParam = {field: 'email', reason: 'invalid'};
    var invalidPasswordParam = {field:'password', reason:'invalid'};

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

    /**
     * Password Validation. You must call this method as the
     * password is encrypted.
     * @param pass
     * @param done
     */
    schema.methods.isValidPassword = function (pass, done) {
        bcrypt.compare(pass, this.password, function (err, valid) {
            if (err) {
                done(err);
            } else {
                done(null, valid);
            }
        });
    };

    /**
     * Before saving encrypt the password if it has been modified.
     */
    schema.pre('save', function (next) {
        var nodeauth = this;

        //Password not modified so just continue.
        if (!nodeauth.isModified('password')) {
            return next();
        }
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
            if (err) {
                return next(err);
            }

            // hash the password using our new salt
            bcrypt.hash(nodeauth.password, salt, function (err, hash) {
                if (err) {
                    next(err);
                } else {
                    // override the cleartext password with the hashed one
                    nodeauth.password = hash;
                    next();
                }
            });
        });
    });

    if(options.local){
        schema.plugin(require('./NodeAuthLogin'), options);
    }

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function handleMongoError(err, next) {
        switch (err.code) {
        case 11000:
            next({message: 'api.error.conflict', data: [{field:'email', reason:'duplicate'}]});
            break;
        default:
            log.error('MongoError', err);
            next({message: 'api.error.invalid.params', data:[invalidEmailParam, invalidPasswordParam] });
            break;
        }
    }

    function handleError(err, next) {
        if (err) {
            if (err.name === 'MongoError') {
                handleMongoError(err, next);
            }else if(err.name === 'ValidationError'){
                log.error('ValidationError', err);
                next({message:'api.error.invalid.params', data: _.map(err.errors, function(error){
                    return {field:error.path, reason:error.type};
                })});
            } else {
                log.error('Unhandled Registration error', err);
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
};