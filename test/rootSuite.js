var mongoose = require('mongoose'),
express = require('express');

global.app;
var server;

before(function(done) {
    mongoose.connect(C.connection, {
        user: C.username,
        pass: C.password
    }, done);
});

beforeEach(function(done) {
    global.app = express();
    server = app.listen(C.port, done);
});

afterEach(function() {
    server.close();
    server = null;
    global.app = null;
});

after(function() {
    mongoose.connection.close();
    model = null;
});
