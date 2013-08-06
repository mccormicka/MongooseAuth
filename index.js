'use strict';

/**
 * Add the registration plugin to your user model before instantiating it.
 *
 * schema.plugin(NodeAuth.registrationPlugin);
 *
 * You will then be able to call. YourModel.register(email, password, next);
 * 
 * @type {*}
 */
module.exports.registrationPlugin = require('./lib/NodeAuthRegister');