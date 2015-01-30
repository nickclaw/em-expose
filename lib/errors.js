var errorFactory = require('error-factory');


//
// 403
//
var NotAllowedError =
module.exports.NotAllowedError =
errorFactory('NotAllowedError', ['message', 'path']);

module.exports.notAllowed = function notAllowed(req) {
    return new NotAllowedError("Not allowed", req.originalUrl);
}

//
// 404
//
var NotFoundError =
    module.exports.NotFoundError =
    errorFactory('NotFoundError', ['message', 'path']);

module.exports.notFound = function notFound(req) {
    return new NotFoundError("Not found", req.originalUrl);
}

//
// 501
//
var NotImplementedError =
    module.exports.NotImplementedError =
    errorFactory('NotImplementedError', ['message', 'path']);


module.exports.notImplemented = function notImplemented(req) {
    return new NotImplementedError('not implemented', req.originalUrl);
}
