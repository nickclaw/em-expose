var Model = require('../fixtures/model');

describe.only('route#browse', function() {

    var models;

    beforeEach(function() {

        return Model.remove({}).exec()
            .then(function() {
                return Model.create([
                    {
                        string: "hi",
                        number: 100,
                        docArray: [
                            {a: "hi", b: 1},
                            {c: "by", b: 2}
                        ],
                        object: {a: "hi", b: 1},
                    },
                    {
                        string: "by",
                        number: 100,
                        docArray: [
                            {a: "hi", b: 1},
                            {c: "by", b: 2}
                        ],
                        object: {a: "hi", b: 1},
                    }
                ])
                .then(function(m1, m2) {
                    models = [m1.toJSON(), m2.toJSON()].map(function(m) {
                        m._id = m._id.toString();
                        m.docArray.map(function(m) {
                            m._id = m._id.toString();
                            return m;
                        });
                        return m;
                    });
                });
            });
    });

    it('successfully retrieves data', function() {
        app.use(em(Model, {
            methods: {
                create: null,
                update: null,
                remove: null,
                retrieve: null
            }
        }));

        var url = 'http://localhost:' + C.port;
        return request.get(url).should.be.fulfilled
        .then(JSON.parse)
        .then(function(data) {
            expect(data.length).to.equal(2);
        });
    });

    it('should obey limit queries', function() {
        app.use(em(Model, {
            methods: {
                create: null,
                update: null,
                remove: null,
                retrieve: null
            }
        }));

        var url = 'http://localhost:' + C.port + '?limit=1';
        return request.get(url).catch(console.log).should.be.fulfilled
        .then(JSON.parse)
        .then(function(data) {
            expect(data.length).to.equal(1);
            expect(data[0]).to.deep.equal(models[0]);
        });
    });

    it('should obey offset queries', function() {
        app.use(em(Model, {
            methods: {
                create: null,
                update: null,
                remove: null,
                retrieve: null
            }
        }));

        var url = 'http://localhost:' + C.port + '?offset=1';
        return request.get(url).catch(console.log).should.be.fulfilled
        .then(JSON.parse)
        .then(function(data) {
            expect(data.length).to.equal(1);
            expect(data[0]).to.deep.equal(models[1]);
        });
    });

});
