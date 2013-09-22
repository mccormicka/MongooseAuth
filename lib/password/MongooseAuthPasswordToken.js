'use strict';

var model;
exports = module.exports.Model = function MongooseAuthPasswordToken(db, options) {
    var _ = require('lodash');
    var log = require('nodelogger').Logger(__filename);
    var bcrypt = require('bcrypt');

    options = _.defaults(options||{}, {tokenExpires:'1m'});

    var TYPE = 'mongooseauthpasswordtoken';
    var SALT_WORK_FACTOR = 1;

    if (!model) {
        if(!db){
            log.error('Unable to generate template schema. You must pass a db instance');
        }
        //Create temporary model so we can get a hold of a valid Schema object.
        var schema = db.model('____mongooseauthpasswordtoken____', {}).schema;
        schema.add({
                type: {type: String, 'default': TYPE},
                href: String,
                objectId: String,
                token: String,
                valid: {
                    type: Boolean,
                    'default': true
                },
                expire: {
                    type: Date,
                    expires: options.tokenExpires,
                    'default': Date.now
                }
            }
        );

        schema.statics.TYPE = TYPE;

        schema.statics.createPasswordResetToken = function (model, next) {
            var self = this;
            bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                if (err) {
                    log.error('Password reset token error generating salt', err);
                    next({message: 'api.error.server', data: err});
                } else {
                    // hash the password using our new salt
                    bcrypt.hash(model.email + self.expire, salt, function (err, hash) {
                        if (err) {
                            log.error('Password reset token error generating hash', err);
                            next({message: 'api.error.server', data: err});
                        } else {
                            self.create({href: '?token=' + encodeURIComponent(hash),
                                    objectId: model._id,
                                    token: hash},
                                function (err, result) {
                                    if (err) {
                                        log.error('Password reset token error saving reset token', err);
                                    } else {
                                        next(null, {message: 'api.success.ok', data: result});
                                    }
                                });
                        }
                    });
                }
            });
        };
        model = db.model(TYPE, schema);
    }
    return model;
};