var mongoose = require('mongoose'),
    express = require('express'),
    _ = require('underscore'),
    util = require('./lib/util.js');

function Exposer(options) {
    this.setOptions(options);
    this.router = express.Router();
}

/**
 * Sets the options
 * We include this because we create an Exposer object
 * on `require`, meaning the user doesn't have an opportunity
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
 * @param {Function?} options.validate    validate data before applying to doc
 * @return {Exposer} this
 */
Exposer.prototype.expose = function(Model, options) {
    options = _.defaults(_.clone(options), {
        path: '/' + Model.modelName.toLowerCase(),
        caseSensitive: this.caseSensitive,
        strict: this.strict,

        private: [],
        protected: [],
        validate: util.noop
    });
    this.router.use(options.path, buildRouter(Model, options));

    return this;
}

/**
 * Returns a Router object for use with Express app.use()
 * @return {Router}
 */
Exposer.prototype.middleware = function() {
    return this.router;
}

module.exports = new Exposer();
module.exports.Exposer = Exposer; // so we can make more than one


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

    router

        /**
         * Browse for documents
         */
        .get('/', function(req, res, next) {
            var sort = {};
            sort[req.query.sort || '_id'] = req.query.order || 'asc';

            Model.find()
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
            Model.create(protect(req.body), function(err, doc) {
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
                res.send(omit(req._doc));
            })

            /**
             * Update a document
             * Intercept Model because we need to apply validation and update it
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
                Model.findByIdAndRemove(req.params.id, function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error('uhoh'));
                    res.send(omit(doc));
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
                    if (!doc) return next(new Error('uhoh'));
                    req._doc = doc;
                    next();
                });
        }
    }

    /**
     * Remove all protected paths from an object
     * before we try to create/update an actual Model
     * @param {Object} object
     * @return {Object}
     */
    function protect(object) {
        return util.deepOmit(object, options.protected);
    }

    /**
     * Remove all private paths we don't want to include
     * when we send this object across the interwebs
     * @param {Model} doc
     * @return {Object}
     */
    function omit(doc) {
        return util.deepOmit(doc.toObject ? doc.toObject() : doc, options.private);
    }
}
