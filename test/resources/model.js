var mongoose = require('mongoose');

var schema = mongoose.Schema({
    string: {type: String, default: "test"},
    number: {type: Number, default: 10},
    docArray: {type: [{
        a: {type: String, default: 'test'},
        b: {type: Number, default: 10}
    }]},

    object: {
        a: {type: String, default: 'test'},
        b: {type: Number, default: 10}
    }
});

module.exports = mongoose.model('Model', schema);
