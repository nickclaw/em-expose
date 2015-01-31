describe('route#dne', function() {

    beforeEach(function() {
        app.use(em(Model, {
            methods: {
                create: false,
                retrieve: false,
                update: false,
                remove: false,
                browse: false
            }
        }));
    });

    it('should return 403 on a get request', function() {
        return request('http://localhost:' + C.port + '/somerandomid')
            .should.be.rejected
            .then(function(err) {
                expect(err.statusCode).to.equal(403);
            });
    });

    it('should return 403 on an update request', function() {
        return request.post('http://localhost:' + C.port + '/somerandomid')
            .should.be.rejected
            .then(function(err) {
                expect(err.statusCode).to.equal(403);
            });
    });

    it('should return 403 on an delete request', function() {
        return request.del('http://localhost:' + C.port + '/somerandomid')
            .should.be.rejected
            .then(function(err) {
                expect(err.statusCode).to.equal(403);
            });
    });

    it('should return 403 on an create request', function() {
        return request.post('http://localhost:' + C.port + '/')
            .should.be.rejected
            .then(function(err) {
                expect(err.statusCode).to.equal(403);
            });
    });

    it('should return 403 on a browse request', function() {
        return request('http://localhost:' + C.port + '/')
            .should.be.rejected
            .then(function(err) {
                expect(err.statusCode).to.equal(403);
            });
    });
});
