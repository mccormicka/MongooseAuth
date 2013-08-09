'use strict';

module.exports = function NodeAuth(schema, options) {

    var _ = require('lodash');
    options = _.defaults(options || {}, {local:false, passwordMinLength:6});
//    var log = require('nodelogger')('NodeAuthPlugin');

    //Add Register plugin
    schema.plugin(require('./register/NodeAuthRegister'), options);
    //Add Password helper methods.
    schema.plugin(require('./password/NodeAuthPassword'), options);
    //Add local authorization if set.
    if(options.local){
        schema.plugin(require('./passport/NodeAuthPassportLocal'), options);
    }
};