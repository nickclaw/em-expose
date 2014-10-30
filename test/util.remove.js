var expect = require('chai').expect,
    remove = require('../lib/util.js').remove;

describe('util#remove', function() {

    it('should remove a property from an object', function() {
        var obj = {a: 'a'};
        remove(obj, 'a');

        expect(obj).to.deep.equal({});
    });

    it('should remove a path from an object', function() {
        var obj = {a: {a: 'a'}};
        remove(obj, 'a.a');
        expect(obj).to.deep.equal({a: {}});
    });

    it('should remove as far down a path as possible', function() {
        var obj = {a: {a: null}};
        remove(obj, 'a.a.b');

        expect(obj).to.deep.equal({a: {}});
    });

});
