'use strict';

module.exports = function MongooseAuthPlugin(schema, options) {
    var _ = require('lodash');
    options = _.defaults(options || {}, {local:false});

    //Add Register plugin
    schema.plugin(require('./register/MongooseAuthRegister'), options);
    //Add Password helper methods.
    schema.plugin(require('./password/MongooseAuthPassword'), options);
    //Add local authorization if set.
    if(options.local){
        schema.plugin(require('./passport/MongooseAuthPassportLocal'), options);
    }

    schema.plugin(require('mongoose-json-select'), '-password');
};