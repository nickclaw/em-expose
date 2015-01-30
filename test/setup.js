var chai = require('chai'),
    req = require('request-promise');

chai.should();
chai.use(require('chai-as-promised'));
chai.use(require('chai-shallow-deep-equal'));

global.expect = chai.expect;
global.em = require('..');
global.request = req;
global.C = require('./resources/config.json');
