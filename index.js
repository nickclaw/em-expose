var _ = require('lodash'),
    util = require('./lib/util.js'),
    expose = require('./lib/expose'),
    errors = require('./lib/errors');

module.exports = expose;
module.exports.util = util;
_.extend(module.exports, errors);
