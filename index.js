var flat = require('flat'),
    mongoose = require('mongoose'),
    express = require('express');

module.exports = {
    _router: express.Router(),

    /**
     * Expose a mongoose model
     * @param {Model} model
     * @param {Object?} options
     * @param {String?} options.path    subpath this module is exposed under
     * @param {Array|Object?} options.private    paths that aren't exposed
     * @param {Array|Object?} options.protected    paths that aren't editable
     * @param {Function?} options.validate    validate data before applying to doc
     */
    expose: function(model, options) {
        options.path = options.path || '/' + model.modelName.toLowerCase();

        options.caseSensitive = options.caseSensitive || false;
        options.strict = options.strict || false;
        options.private = options.private || [];
        options.protected = options.protected || [];
        options.validate = options.validate || noop;

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
    var router = express.Router({
        strict: options.strict,
        caseSensitive: options.caseSensitive
    });

    router

        /**
         * Browse for documents
         */
        .get('/', function(req, res, next) {
            var sort = {};
            sort[req.query.sort || '_id'] = req.query.order || 'asc';

            model.find()
                .limit(req.query.limit || 15)
                .skip(req.query.offset || 0)
                .sort(sort)
                .lean()
                .exec(function(err, docs) {
                    if (err) return next(err);
                    if (!docs) return next(new Error('uhoh browse'));
                    res.send(docs.map(function(doc) {
                        return omit(doc);
                    }));
                });
        })

        /**
         * Create a document
         */
        .post('/', function(req, res, next) {
            model.create(protect(req.body), function(err, doc) {
                if (err) return next(err);
                res.send(omit(doc));
            });
        })
        .route('/:id')

            /**
             * Retrieve a document
             * Intercept just JSON because that's all we need
             */
            .get(intercept(true), function(req, res, next) {
                return omit(req._doc);
            })

            /**
             * Update a document
             * Intercept model because we need to apply validation and update it
             */
            .put(intercept(false), function(req, res, next) {
                req._doc.update(protect(req.body), function(err, doc) {
                    if (err) return next(err);
                    res.send(omit(doc));
                });
            })

            /**
             * Delete a document
             */
            .delete(function(req, res, next) {
                model.findByIdAndRemove(req.params.id, function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error('uhoh'));
                    res.send(omit(doc));
                });
            });

    return router;


    /**
     * Reusable middleware to convert the :id param to an object
     * @param {Boolean} lean
     * @return {Function} middleware
     */
    function intercept(lean) {
        return function(req, res, next) {
            model.findById(req.params.id)
                .lean(lean)
                .exec(function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error('uhoh'));
                    req._doc = doc;
                    next();
                });
        }
    }

    /**
     * Remove all protected paths from an object
     * before we try to create/update an actual model
     * @param {Object} object
     * @return {Object}
     */
    function protect(object) {
        return deepOmit(object, options.protected);
    }

    /**
     * Remove all private paths we don't want to include
     * when we send this object across the interwebs
     * @param {Model} model
     * @return {Object}
     */
    function omit(model) {
        return deepOmit(model.toJSON(), options.private);
    }
}

/**
 * Noooooooope...
 * with support for async Nooooooooope...
 */
function noop(){
    var next = arguments[arguments.length - 1];
    return typeof next === 'function' ? next() : true;
};


/**
 * Omit paths from an object
 * based off of https://gist.github.com/dtsn/7098527
 * @param {Object} obj
 * @param {Array.<String>} paths
 * @return {Object}
 */
function deepOmit(obj, paths) {

    /**
     * Recursive function to navigate deep object
     * @param {String} past
     * @param {Object} object
     * @return {Object}
     */
    function step(past, object) {
        var copy = {},
            keys = Object.keys(object);

        // iterate over object key/values
        for (var i = 0, key = null, val = null; val = object[key = keys[i]]; i++) {
            if (paths.indexOf(past + (past?'.':'') + key) !== 0) {
                copy[key] = val;

                if (typeof val === 'object') {
                    copy[key] = step(past + (past?'.':'') + key, val);
                }
            }
        }

        return copy;
    }

    return step('', obj);
}
