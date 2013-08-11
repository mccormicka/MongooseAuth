'use strict';

/**
 * Add the registration plugin to your user model before instantiating it.
 *
 * schema.plugin(MongooseAuth.plugin);
 *
 * @type {*}
 */
module.exports.plugin = require('./lib/MongooseAuthPlugin');