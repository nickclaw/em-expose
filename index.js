var util = require('./lib/util.js'),
    Exposer = require('./lib/exposer.js');

module.exports = new Exposer();
module.exports.Exposer = Exposer; // so we can make more than one
module.exports.util = util;
