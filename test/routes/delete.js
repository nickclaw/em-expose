var Model = require('../fixtures/model');

describe('route#delete', function() {

    var model;

    beforeEach(function(done) {
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

    it('successfully deletes the object but returns the deleted data', function() {
        app.use(em(Model, {
            methods: {
                create: null,
                update: null,
                browse: null
            }
        }));


        var url = 'http://localhost:' + C.port + '/' + model._id;
        return request.del(url).should.be.fulfilled
        .then(JSON.parse)
        .then(function(data) {
            expect(data).to.have.keys('string', 'number', 'docArray', 'object', '_id', '__v');
            expect(data.docArray[0]).to.have.keys('a', 'b', '_id');
            expect(data.object).to.have.keys('a', 'b');
        })
        .then(function() {
            return request(url).should.be.rejected;
        })
        .then(function(req) {
            expect(req.response.statusCode).to.equal(404);
        });
    });

    it('can selectively block certain properties but still delete', function() {

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
                browse: null
            }
        }));

        var url = 'http://localhost:' + C.port + '/' + model._id;
        return request.del(url).should.be.fulfilled
        .then(JSON.parse)
        .then(function(data) {
            expect(data).to.have.keys('docArray', 'object', '_id', '__v');
            expect(data.docArray[0]).to.have.keys('_id', 'a');
            expect(data.object).to.have.keys('b');
        })
        .then(function() {
            return request(url).should.be.rejected;
        })
        .then(function(req) {
            expect(req.response.statusCode).to.equal(404);
        });
    });

    afterEach(function() {
        model = null;
    });
});
