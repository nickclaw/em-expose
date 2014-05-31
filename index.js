var flat = require('flat'),
    mongoose = require('mongoose'),
    express = require('express');

module.exports = {
    _router = express.Router();

    /**
     * Expose a mongoose model
     * @param {Model} model
     * @param {Object?} options
     * @param {String?} options.path    subpath this module is exposed under
     * @param {Array|Object?} options.private    paths that aren't exposed
     * @param {Array|Object?} options.protected    paths that aren't editable
     */
    expose: function(model, options) {
        options.path = options.path || model.modelName.toLowerCase();

        options.caseSensitive = options.caseSensitive || false;
        options.strict = options.strict || false;
        options.private = options.private || [];
        options.protected = options.protected || [];

        this._router.use(options.path, buildRouter(model, options));
    },


    /**
     * Allow em-expose to be used by express `app.use()`
     * @return {Router} express middleware
     */
    middleware: function() {
        return this._router;
    }
}

/**
 * Builds a CRUD router for a model
 * @param {Model} model
 * @param {Object?} options same as expose function
 */
function buildRouter(model, options) {
}
