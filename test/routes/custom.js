describe('adding custom routes', function() {

    describe('route with the :id param', function() {

        it('should have the doc in the request', function() {

            // create em router and add custom route with :id and intercept()
            var router = em(Model, {});
            router.get('/:id/test', router.em.intercept(), function(req, res, next) {
                expect(req.doc).to.be.instanceof(Object);
                res.send('it worked!');
            });
            app.use(router);

            return request.post('http://localhost:' + C.port + '/')
            .should.be.fulfilled
            .then(JSON.parse)
            .then(function(data) {
                return request('http://localhost:' + C.port + '/' + data._id + '/test');
            })
            .should.be.fulfilled
            .then(function(data) {
                expect(data).to.equal('it worked!');
            });
        });
    });

    describe('throwing errors from a custom route', function() {

        it('should catch the error and return the proper type', function() {
            var router = em(Model, {});
            router.get('/test/path', function(req, res, next) {
                next(em.notImplemented(req));
            });
            app.use(router);

            return request('http://localhost:' + C.port + '/test/path').should.be.rejected
            .then(function(err) {
                expect(err.statusCode).to.equal(501);
            });
        });
    });
});
