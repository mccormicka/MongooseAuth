'use strict';

var log = require('bunyan').createLogger({name:'MongooseAuthPassportLocal'});

exports = module.exports = function MongooseAuthLogin(schema, options) {
    if (!options || !options.passport) {
        throw new Error('You must provide an instance of Passport.js in order for MongooseAuthLogin to work correctly');
    }

    var LocalStrategy = require('passport-local').Strategy;
    var passport = options.passport;
    var usingStrategy = false;

    schema.statics.authenticateLocal = function (req, res, next) {
        var Model = this;
        if (!usingStrategy) {
            usingStrategy = true;
            passport.use('local', new LocalStrategy({
                    usernameField: 'email',
                    passwordField: 'password',
                    passReqToCallback: true
                },
                function (req, username, password, next) {
                    log.debug('Local Auth function called.', username, password);
                    Model.findOne({ email: username }, function (err, auth) {
                        if (err || !auth) {
                            log.error('Unable to find user for login', err, auth);
                            next(unauthorizedResponse());
                        } else {
                            auth.isValidPassword(password, function (err, value) {
                                if (err || !value) {
                                    log.error('Invalid password provided at login', err);
                                    next(unauthorizedResponse());
                                } else {
                                    next(null, auth);
                                }
                            });
                        }
                    });
                }
            ));
        }

        passport.authenticate('local', function (err, auth) {
            if (err || !auth) {
                log.error('Authentication error', err, auth);
                next(unauthorizedResponse());
            } else {
                next(null, auth);
            }
        })(req, res, next);
    };

    //-------------------------------------------------------------------------
    //
    // Private Methods
    //
    //-------------------------------------------------------------------------

    function unauthorizedResponse() {
        return {message: 'api.error.invalid.params', data: [
            {field: 'email', reason: 'incorrect'},
            {field: 'password', reason: 'incorrect'}
        ]};
    }
};

