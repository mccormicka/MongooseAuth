'use strict';
exports = module.exports = function NodeAuthLogin(schema, options) {
    if (!options || !options.passport) {
        throw new Error('You must provide an instance of Passport.js in order for NodeAuthLogin to work correctly');
    }

    var log = require('nodelogger')('NodeAuthLogin');
    var LocalStrategy = require('passport-local').Strategy;
    var passport = options.passport;
    var usingStrategy = false;

    schema.statics.authenticateLocal = function (res, req, next) {
        var Model = this;
        if (!usingStrategy) {
            usingStrategy = true;
            passport.use('local', new LocalStrategy({
                    usernameField: 'email',
                    passwordField: 'pass',
                    passReqToCallback: true
                },
                function (req, username, password, next) {
                    log.debug('Local Auth function called.');
                    Model.findOne({ email: username }, function (err, auth) {
                        if (err || !auth) {
                            next(unauthorizedResponse());
                        } else {
                            auth.isValidPassword(password, function (err, value) {
                                if (err || !value) {
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

