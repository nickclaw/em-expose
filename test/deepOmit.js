var util = require('../lib/util.js'),
    expect = require('chai').expect;

describe('deepOmit', function() {
    it('should omit shallowly', function() {
        var obj = {
            one: true,
            two: true,
            three: true,
            four: true,
            five: true
        };

        var ommited = util.deepOmit(obj, ['one', 'three', 'five']);

        expect(ommited).to.deep.equal({
            two: true,
            four: true
        });
    });

    it('should not omit partial paths', function() {
        var obj = {
            one: true,
            two: true
        }

        var ommited = util.deepOmit(obj, ['one.nothing', 'two']);
        expect(ommited).to.deep.equal({
            one: true
        });
    });

    it('should omit nested paths', function() {
        var obj = {
            one: {
                two: true,
                three: true
            },
            two: {
                three: true,
                four: true
            }
        };

        var ommited = util.deepOmit(obj, ['one.two', 'two']);

        expect(ommited).to.deep.equal({
            one: {
                three: true
            }
        })
    });

    it('should only omit full paths', function() {
        var obj = {
            one: {
                three: true
            },
            two: {
                three: true
            }
        }

        expect(util.deepOmit(obj, ['three'])).to.deep.equal(obj);
    });

    it('should handle array subobjects', function() {
        var obj = {
            one: [
                {one: true, two: true},
                {one: true, two: true},
                {one: true, two: true}
            ],
            two: {
                one: true,
                two: [
                    {one: true, two: true},
                    {two: true, one: true}
                ]
            }
        };

        var omitted = util.deepOmit(obj, ['one.two', 'two.one', 'two.two.one']);

        expect(omitted).to.deep.equal({
            one: [
                {one: true},
                {one: true},
                {one: true}
            ],
            two: {
                two: [
                    {two: true},
                    {two: true}
                ]
            }
        })
    });

    it('should handle arrays hellla well', function() {
        var obj = [{
            one: [
                {one: true, two: true}
            ],
            two: true
        }];

        var ommited = util.deepOmit(obj, ['one.one', 'two']);

        expect(ommited).to.deep.equal([{
            one: [{two: true}]
        }]);
    });
})
