var expect = require('chai').expect,
    set = require('../../lib/util.js').set;

describe('util#set', function() {

    it('should set the value of a flat object', function() {
        var obj = {};
        set(obj, 'a', 'a');

        expect(obj.a).to.equal('a');
    });

    it('should create objects that do not exist', function() {
        var obj = {};
        set(obj, 'a.a.a', 'a');

        expect(obj.a.a.a).to.equal('a');
    });

    it('should overwrite undefined and null values', function() {
        var obj = {a: null};
        set(obj, 'a.a.a', 'a');

        expect(obj.a.a.a).to.equal('a');
    });

    it('should not overwrite objects, just add to', function() {
        var obj = {a: {a: 'a'}};
        set(obj, 'a.b', 'a');

        expect(obj.a.a).to.equal('a');
        expect(obj.a.b).to.equal('a');
    });

});
