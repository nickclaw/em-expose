var chai = require('chai'),
    asPromised = require('chai-as-promised'),
    req = require('request-promise');

chai.should();
chai.use(asPromised);

global.expect = chai.expect;
global.em = require('..');
global.request = req;
global.C = require('./resources/config.json');
