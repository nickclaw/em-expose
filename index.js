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
        }),
        select = options.private ? '-' + options.private.join(' -') : '';

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
                .select(select)
                .lean()
                .exec(function(err, docs) {
                    if (err) return next(err);
                    if (!docs) return next(new Error('uhoh browse'));
                    res.send(docs);
                });
        })

        /**
         * Create a document
         */
        .post('/', function(req, res, next) {

        })
        .route('/:id')

            /**
             * Retrieve a document
             */
            .get(intercept(true), function(req, res, next) {
                return req._doc.toObject();
            })

            /**
             * Update a document
             */
            .put(intercept(false), function(req, res, next) {
                req._doc.update(req.body, function(err, doc) {
                    if (err) return next(err);
                    res.send(doc);
                });
            })

            /**
             * Delete a document
             */
            .delete(function(req, res, next) {
                model.findByIdAndRemove(req.params.body, function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error('uhoh'));
                    res.send(doc);
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
            model.findById(req.params.id, select)
                .lean(lean)
                .exec(function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error('uhoh'));
                    req._doc = doc;
                    next();
                });
        }
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
