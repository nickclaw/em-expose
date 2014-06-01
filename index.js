var util = require('./lib/util.js'),
    validator = require('./lib/validator.js'),
    Exposer = require('./lib/exposer.js');

module.exports = new Exposer();
module.exports.Exposer = Exposer; // so we can make more than one
module.exports.validator = validator;
module.exports.util = util;
