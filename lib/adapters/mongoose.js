
module.exports = {};

module.exports.create = function get(Model, data, callback) {
    var doc = new Model(data);
    doc.save(callback);
};

module.exports.retrieve = function(Model, id, callback) {
    Model.findById(id, callback);
};

module.exports.update = function update(doc, data, callback) {
    doc.set(data);
    doc.save(callback);
};

module.exports.remove = function remove(doc, callback) {
    doc.remove(callback);
};

module.exports.browse = function browse(Model, data, callback) {

};
