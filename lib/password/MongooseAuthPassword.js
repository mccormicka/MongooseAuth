'use strict';

exports = module.exports = function MongooseAuthPassword(schema, options) {

    var log = require('nodelogger').Logger(__filename);
    var bcrypt = require('bcrypt');
    var Token = require('./MongooseAuthPasswordToken');

    var SALT_WORK_FACTOR = 10;

    //Import password change plugin
    schema.plugin(require('./MongooseAuthChangePassword'), options);

    /**
     * Password Validation. You must call this method as the
     * password is encrypted.
     * @param pass
     * @param next
     */
    schema.methods.isValidPassword = function (pass, next) {
        bcrypt.compare(pass, this.password, function (err, valid) {
            if (err) {
                next(err);
            } else {
                next(null, valid);
            }
        });
    };

    schema.statics.createPasswordResetToken = function (query, next) {
        this.findOne(query, function (err, result) {
            if (err || !result) {
                log.error('Password reset token error finding account', err);
                next({message:'api.error.invalid.params', data: err});
            } else {
                Token.Model(result.db, options).createPasswordResetToken(result, function (err, token) {
                    if (err) {
                        next(err);
                    } else {
                        next(null, {message: 'api.success.ok', data: {model:result, token:token.data}});
                    }
                });
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
                    // override the plain text password with the hashed one
                    nodeauth.password = hash;
                    next();
                }
            });
        });
    });
};