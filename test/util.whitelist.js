var expect = require('chai').expect,
    whitelist = require('../lib/util.js').whitelist;

describe('util#whitelist', function() {

    it ('should whitelist a flat object', function() {
        var obj = {a: 'a', b: 'b', c: 'c'},
            newObj = whitelist(obj, ['a', 'c']);

        expect(newObj).to.deep.equal({a: 'a', c: 'c'});
        expect(newObj.b).to.equal(undefined);
    });

    it('should whitelist nested paths', function() {
        var obj = {
            a: {
                a: 'a',
                b: 'b'
            },
            c: {
                c: {
                    c: {
                        c: 'c'
                    },
                    d: 'd'
                }
            }
        };
        var newObj = whitelist(obj, ['a.a', 'c.c.c']);

        expect(newObj).to.deep.equal({
            a: {a: 'a'},
            c: {c: {c: {c: 'c'}}}
        });
        expect(newObj.c.c.d).to.equal(undefined);
    });

    it('should not create paths that do not exist', function() {
        var obj = {},
            newObj = whitelist(obj, ['a.a.a', 'b.b.b', 'c.c.c']);

        expect(newObj).to.deep.equal({});
    });
});
