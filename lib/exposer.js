var mongoose = require('mongoose'),
    express = require('express'),
    _ = require('underscore'),
    util = require('./util.js'),
    buildRouter = require('./buildRouter.js');

/**
 * Exposer
 */
var Exposer = module.exports = function(options) {
    this.setOptions(options);
    this._paths = {};
}


/**
 * Sets the options
 * We include this because we create an Exposer object
 * on `requxire`, meaning the user doesn't have an opportunity
 * to create an Exposer with their own options.
 * Now they can do it after the fact!
 *
 * @param {Object} options
 * @return {Exposer} this
 */
Exposer.prototype.setOptions = function(options) {
    this.options = _.defaults(_.clone(options || {}), {
        caseSensitive: false,
        strict: false
    });
}


/**
 * Expose a mongoose model
 * @param {Model} model
 * @param {Object?} options
 * @param {String?} options.path    subpath this module is exposed under
 * @param {Array|Object?} options.private    paths that aren't exposed
 * @param {Array|Object?} options.protected    paths that aren't editable
 * @return {Exposer} this
 */
Exposer.prototype.expose = function(Model, options) {
    options = util.deepExtend({

        // sub path to expose under
        path: '/' + Model.modelName.toLowerCase(),
        // subroutes to expose
        methods: ['create', 'retrieve', 'update', 'delete', 'browse'],

        // passed to express.Router()
        caseSensitive: this.caseSensitive,
        strict: this.strict,

        // global settings
        private: [],    // not exposed
        protected: [],  // not editable/setable
        pre: util.noop, // passed in req.body & next
        post: util.noop,// passed in document & next

        custom: {
            create: {
                private: [],
                protected: [],
                pre: util.noop,
                post: util.noop
            },
            retrieve: {
                private: [],
                protected: [],
                pre: util.noop,
                post: util.noop
            },
            update: {
                private: [],
                protected: [],
                pre: util.noop,
                post: util.noop
            },
            delete: {
                private: [],
                protected: [],
                pre: util.noop,
                post: util.noop
            },
            browse: {
                private: [],
                protected: [],
                pre: util.noop,
                post: util.noop
            }
        }
    }, options || {});

    this._paths[options.path] = buildRouter(Model, options);
    return this;
}


/**
 * Returns a Router object for use with Express app.use()
 * @return {Router}
 */
Exposer.prototype.middleware = function() {
    var router = express.Router();
    _.map(this._paths, function(route, path) {
        router.use(path, route);
    });

    /**
     * Handle all errors
     */
    router.use(function(err, req, res, next) {
        res.send(err.code || 404, {
            message: err.message,
            errors: err.errors
        });
    });
    return router;
}

/**
 * Returns a path/router hash of all paths
 * @return {Object.<String, Router>}
 */
Exposer.prototype.getPaths = function() {
    return this._paths;
}

/**
 * Returns the router for a given path or null
 * @param {String} path
 * @return {Router|null}
 */
Exposer.prototype.getPath = function(path) {
    if (!this._paths[path]) return null;
    return this._paths[path];
}
