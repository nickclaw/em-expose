var expect = require('chai').expect,
    paths = require('../../lib/util.js').paths;

describe('util#paths', function() {

    it('should return the keys of a flat object', function() {
        var obj = {a: 'a', b: 'b'},
            keys = paths(obj);

        expect(keys).to.deep.equal(['a', 'b']);
    });

    it('should return all the paths of a nested object', function() {
        var obj = {a: {a: {a: {a: 'a'}}}},
            keys = paths(obj);

        expect(keys).to.deep.equal(['a.a.a.a']);
    });

    it('should handle wierd keys', function() {
        var obj = {"": {"": ""}},
            keys = paths(obj);

        expect(keys).to.deep.equal(['.']);
    });
});
