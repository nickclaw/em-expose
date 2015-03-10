var Model = require('../fixtures/model');

describe('route#update', function() {

    var model;

    var obj = {
        string: "hi",
        number: 100,
        docArray: [
            {a: "hi", b: 1},
            {a: "by", b: 2}
        ],
        object: {a: "hi", b: 1},
    };

    beforeEach(function(done) {
        model = new Model(obj);

        model.save(done);
    });

    it('can edit values', function() {
        app.use(em(Model, {
            methods: {
                create: null,
                remove: null,
                browse: null,
                retrieve: null
            }
        }));

        return request({
            url: 'http://localhost:' + C.port + '/' + model._id,
            method: 'POST',
            json: {
                string: 'test',
                number: 1,
                object: {
                    b: 10
                }
            }
        }).should.be.fulfilled
        .then(function(data) {
            expect(data.string).to.equal('test');
            expect(data.number).to.equal(1);
            expect(data.docArray[0]).to.shallowDeepEqual({a: "hi", b: 1});
            expect(data.object.b).to.equal(10);
            expect(data.object.a).to.equal('hi');
        });
    });

    it('cant edit protected values', function() {
        app.use(em(Model, {
            protected: {
                string: true,
                number: true,
                'docArray.b': true,
                object: {
                    a: true,
                    b: true
                }
            },
            methods: {
                create: null,
                remove: null,
                browse: null,
                retrieve: null
            }
        }));

        return request({
            url: 'http://localhost:' + C.port + '/' + model._id,
            method: 'post',
            json: {
                string: "testing testing",
                number: 9001,

                object: {
                    a: 'bye',
                    b: 100
                }
            }
        }).should.be.fulfilled
        .then(function(data) {
            expect(data).to.shallowDeepEqual(obj);
        });
    });

    afterEach(function() {
        model = null;
    });
});
