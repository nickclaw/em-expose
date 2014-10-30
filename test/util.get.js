var expect = require('chai').expect,
    get = require('../lib/util.js').get;

describe('util#get', function() {

    it('should return the value given a single property', function() {

        var obj = {a: 'a'},
            val = get(obj, 'a');

        expect(val).to.equal('a');
    });

    it('should return undefined when given a missing property', function() {

        var obj = {},
            val = get(obj, 'a');

        expect(val).to.equal(undefined);
    });

    it('should fetch values down a path', function() {
        var obj = {a: {a: 'a'}},
            val = get(obj, 'a.a');

        expect(val).to.equal('a');
    });

    it('should fetch return undefined given a missing path', function() {
        var obj = {a: {}},
            val = get(obj, 'a.a');

        expect(val).to.equal(undefined);
    });

    it('should not break on null', function() {
        var obj = {a: null},
            val = get(obj, 'a.a');

        expect(val).to.equal(undefined);
    });

    it('should not break on a "" path', function() {
        var obj = {a: {'': 'a'}},
            val = get(obj, 'a.');

        expect(val).to.equal('a');
    });
});
