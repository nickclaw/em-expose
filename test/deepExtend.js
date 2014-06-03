var deepExtend = require('../lib/util.js').deepExtend,
    expect = require('chai').expect;

describe('deepDefault', function() {

    it('should work on a shallow object', function() {
        var defaults = {
            one: true,
            two: true
        };
        var obj = {
            two: true,
            three: true
        };

        expect(deepExtend(defaults, obj)).to.deep.equal({
            one: true,
            two: true,
            three: true
        });
    });

    it('should work on deep objects', function() {
        var defaults = {
            one: {
                one: {
                    one: true,
                    two: true,
                    three: true
                },
                two: {
                    one: true,
                    two: true,
                    three: true
                },
                three: {
                    one: true,
                    two: true,
                    three: true
                }
            }
        };
        var obj = {
            one: {
                one: {
                    one: true,
                    two: false
                },
                two: {
                    one: false,
                    two: true
                },
            }
        };
        
        expect(deepExtend(defaults, obj)).to.deep.equal({
            one: {
                one: {
                    one: true,
                    two: false,
                    three: true
                },
                two: {
                    one: false,
                    two: true,
                    three: true
                },
                three: {
                    one: true,
                    two: true,
                    three: true
                }
            }
        });
    });
});
