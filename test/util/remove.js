var expect = require('chai').expect,
    remove = require('../../lib/util.js').remove;

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

    it('should handle removing keys of arrays children', function() {
        var obj = [{a: {a: true, b: true}}, {a: {a: true, b: true}}];
        remove(obj, 'a.a');

        expect(obj).to.deep.equal([{a: {b: true}}, {a: {b: true}}]);
    });

});
