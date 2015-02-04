var Model = require('../resources/model');

describe('route#create', function() {

    it('successfully creates the object', function() {

        app.use(em(Model, {
            methods: {
                update: null,
                retrieve: null,
                remove: null,
                browse: null
            }
        }));

        var obj = {
            string: "Hello world",
            number: 1000,
            docArray: [
                {a: "hi", b: 1},
                {a: "by", b: 2}
            ],
            object: {a: "hi", b: 10}
        };

        return request({
            url: 'http://localhost:' + C.port,
            method: 'POST',
            json: obj
        }).should.be.fulfilled
        .then(function(data) {
            expect(data).to.have.keys('string', 'number', 'docArray', 'object', '_id', '__v');
            expect(data.docArray[0]).to.have.keys('a', 'b', '_id');
            expect(data.object).to.have.keys('a', 'b');
            expect(data).to.shallowDeepEqual(obj);
        });
    });

    it('should not allow protected/private paths to be defined', function() {

        app.use(em(Model, {
            private: {
                string: true,
                'docArray.b': true,
            },
            protected: {
                number: true,
                'docArray.a': true
            },
            methods: {
                update: null,
                retrieve: null,
                remove: null,
                browse: null
            }
        }));

        return request({
            url: 'http://localhost:' + C.port,
            method: 'POST',
            json: {
                string: "Hello world",
                number: 10000000,
                docArray: [
                    {a: "hi", b: 1},
                    {a: "by", b: 2}
                ],
                object: {a: 'hi', b: 100}
            }
        }).should.be.fulfilled
        .then(function(data) {
            expect(data).to.have.keys('number', 'docArray', 'object', '_id', '__v');
            expect(data.docArray[0]).to.have.keys('a', '_id');
            expect(data.object).to.have.keys('a', 'b');

            expect(data.number).to.equal(10);
            expect(data.docArray[0].a).to.equal('test');
        });

    });
});
