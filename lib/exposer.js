var mongoose = require('mongoose'),
    express = require('express'),
    _ = require('underscore'),
    util = require('./util.js');

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
    }, options);

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
 * @return {Router}
 */
Exposer.prototype.getPath = function(path) {
    if (!this._paths[path]) return null;
    return this._paths[path];
}



/**
 * Builds a CRUD router for a Model. The heart of the beast...
 * Also contains some closures at the bottom, if you're wondering
 * where some of these functions are coming from...
 *
 * @param {Model} model
 * @param {Object?} options same as expose function
 * @return {Router}
 */
function buildRouter(Model, options) {
    var router = express.Router({
        strict: options.strict,
        caseSensitive: options.caseSensitive
    });

    /**
     * Browse for documents
     * @query {Number} limit defaults to 15
     * @query {Number} offset defaults to 0
     * @query {String} sort path to sort by
     * @query {String|Number} order asc/desc or 1/-1
     */
    exposed('browse') && router.get('/', function(req, res, next) {
        var sort = {};
        sort[req.query.sort || '_id'] = req.query.order || 'asc';

        Model.find()
            .limit(req.query.limit || 15)
            .skip(req.query.offset || 0)
            .sort(sort)
            .lean(true)
            .exec(function(err, docs) {
                if (err) return next(err);
                res.send(docs.map(function(doc) {
                    return omit(doc);
                }));
            });
    });

    /**
     * Create a document
     */
    exposed('create') && router.post('/', function(req, res, next) {
        var model = new Model(protect(req.body));

        model.save(function(err, doc) {
            if (err) return next(err);
            res.send(omit(doc));
        });
    });

    var route = router.route('/:id');

    /**
     * Retrieve a document
     * Intercept just JSON because that's all we need
     */
    exposed('retrieve') && route.get(intercept(true), function(req, res, next) {
        res.send(omit(req._doc));
    });

    /**
     * Update a document
     * Intercept Model because we need to apply validation and update it
     */
    exposed('update') && route.put(intercept(false), function(req, res, next) {
        req._doc.set(protect(req.body));
        req._doc.save(function(err, doc) {
            if (err) return next(err);
            res.send(omit(doc));
        });
    });

    /**
     * Delete a document
     */
    exposed('delete') && route.delete(function(req, res, next) {
        Model.findByIdAndRemove(req.params.id, function(err, doc) {
            if (err) return next(err);
            if (!doc) return next(new Error('Not found.'));
            res.send(omit(doc));
        });
    });


    /**
     * Catch everything else...
     */
    router.use(function(req, res, next) {
        next(new Error("404 not found."));
    });

    /**
     * Handle errors
     */
    router.use(function(err, req, res, next) {
        res.send(404, {
            message: err.message,
            errors: err.errors // for mongoose validation errors
        });
    });

    return router;


    /* These closures 'like' having access to some of their
     * parent functions variables like 'Model', and 'options'
     * I could move them elsewhere but, meh..
     */

    /**
     * Reusable middleware to convert the :id param to an object
     * @param {Boolean} lean
     * @return {Function} middleware
     */
    function intercept(lean) {
        return function(req, res, next) {
            Model.findById(req.params.id)
                .lean(lean)
                .exec(function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error('Not found.'));
                    req._doc = doc;
                    next();
                });
        }
    }

    /**
     * Remove all protected/private paths from an object
     * before we try to create/update an actual Model.
     * Typically used on req.body.
     *
     * @param {Object} object
     * @return {Object}
     */
    function protect(object) {
        return util.deepOmit(object, options.protected.concat(options.private));
    }

    /**
     * Remove all private paths we don't want to include
     * when we send this object across the interwebs.
     * @param {Model} doc
     * @return {Object}
     */
    function omit(doc) {
        return util.deepOmit(doc.toObject ? doc.toObject() : doc, options.private);
    }

    function exposed(type) {
        return options.methods.indexOf(type) >= 0;
    }
}
