'use strict';

/**
 * Add the local auth plugin to your model before instantiating it.
 *
 * schema.plugin(MongooseAuth.plugin);
 *
 * @type {*}
 */
module.exports.plugin = require('./lib/MongooseAuthPlugin');