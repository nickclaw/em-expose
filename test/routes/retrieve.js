var Model = require('../fixtures/model');

describe('route#retrieve', function() {

    var model;

    before(function(done) {
        model = new Model({
            string: "hi",
            number: 100,
            docArray: [
                {a: "hi", b: 1},
                {c: "by", b: 2}
            ],
            object: {a: "hi", b: 1},
        });

        model.save(done);
    });

    it('can retrieve the whole object', function() {
        app.use(em(Model, {
            methods: {
                create: null,
                update: null,
                remove: null,
                browse: null
            }
        }));

        return request('http://localhost:' + C.port + '/' + model._id)
            .should.be.fulfilled
            .then(JSON.parse)
            .then(function(data) {
                expect(data).to.have.keys('string', 'number', 'docArray', 'object', '_id', '__v');
                expect(data.docArray[0]).to.have.keys('a', 'b', '_id');
                expect(data.object).to.have.keys('a', 'b');
            });
    });

    it('can selectively block certain properties', function() {

        app.use(em(Model, {
            private: {
                string: true,
                number: true,
                'docArray.b': true,
                'object.a': true
            },
            methods: {
                create: null,
                update: null,
                delete: null,
                browse: null
            }
        }));

        return request('http://localhost:' + C.port + '/' + model._id).should.be.fulfilled
            .then(JSON.parse)
            .then(function(data) {
                expect(data).to.have.keys('docArray', 'object', '_id', '__v');
                expect(data.docArray[0]).to.have.keys('_id', 'a');
                expect(data.object).to.have.keys('b');
            });
    });

    after(function() {
        model = null;
    });
});
