var expect = require('chai').expect,
    omit = require('../lib/util.js').omit;

describe('util#omit', function() {

    it('should omit properties froma flat object', function() {
        var obj = {a: 'a', b: 'b', c: 'c', d: 'd'},
            newObj = omit(obj, ['a', 'c']);

        expect(newObj).to.deep.equal({b: 'b', d: 'd'});
        expect(newObj.a).to.equal(undefined);
    });

    it('should omit nested properties', function() {
        var obj = {a: {a: 'a'}, b: {b: {b: 'b'}}},
            newObj = omit(obj, ['a.a', 'b.b']);

        expect(newObj).to.deep.equal({a: {}, b: {}});
    });
});
