// this is probably/definitely not necessary...
var noop = require('../lib/util.js').noop,
    expect = require('chai').expect;

describe('noop', function() {
    it('should do nothing...', function() {
        expect(noop()).to.equal(undefined);
    });

    it('should do nothing, asyncronously...', function(done) {
        noop(true, false, 1, function() {
            expect(arguments.length).to.equal(0);
            done();
        });
    });
});
