var express = require('express'),
    _ = require('underscore'),
    util = require('./util.js');

/**
 * Builds a CRUD router for a Model. The heart of the beast...
 * Also contains some closures at the bottom, if you're wondering
 * where some of these functions are coming from...
 *
 * @param {Model} model
 * @param {Object} options same as expose function
 * @return {Router}
 */
module.exports = function(Model, options) {
    var router = express.Router({
        strict: options.strict,
        caseSensitive: options.caseSensitive
    });

    router.use(function(req, res, next) {
        res._em_send = function(object, type) {
            options.custom[type].post(object);
            res.send(omit(object, type));
        }
        next();
    });

    /**
     * Browse for documents
     * @query {Number} limit defaults to 15
     * @query {Number} offset defaults to 0
     * @query {String} sort path to sort by
     * @query {String|Number} order asc/desc or 1/-1
     */
    if (exposed('browse')) {
        router.get('/',
            options.custom.browse.pre,
            function(req, res, next) {
                var sort = {};
                sort[req.query.sort || '_id'] = req.query.order || 'asc';

                Model.find()
                    .limit(req.query.limit || 15)
                    .skip(req.query.offset || 0)
                    .sort(sort)
                    .lean(true)
                    .exec(function(err, docs) {
                        if (err) return next(err);
                        res._em_send(docs, 'browse');
                    });
            }
        );
    }

    /**
     * Create a document
     */
    if (exposed('create')) {
        router.post('/',
            protect('create'),
            options.custom.create.pre,
            function(req, res, next) {
                var model = new Model(req.body);
                model.save(function(err, doc) {
                    if (err) return next(err);
                    res._em_send(doc, 'create');
                });
            }
        );
    }

    /**
     * Retrieve a document
     * Intercept just JSON because that's all we need
     */
    if (exposed('retrieve')) {
        router.get('/:id',
            intercept(false),
            options.custom.retrieve.pre,
            function(req, res, next) {
                res._em_send(req.doc, 'retrieve');
            }
        );
    }

    /**
     * Update a document
     * Intercept Model because we need to apply validation and update it
     */
    if (exposed('update')) {
        router.put('/:id',
            protect('update'),
            intercept(false),
            options.custom.update.pre,
            function(req, res, next) {
                req.doc.set(req.body);
                req.doc.save(function(err, doc) {
                    if (err) return next(err);
                    res._em_send(doc, 'update');
                });
            }
        );
    }

    /**
     * Delete a document
     */
    if (exposed('delete')) {
        router.delete('/:id',
            intercept(false),
            options.custom.delete.pre,
            function(req, res, next) {
                req.doc.remove(function(err, doc) {
                    res._em_send(doc, 'delete');
                });
            }
        );
    }


    /**
     * Catch everything else...
     */
    router.use(function(req, res, next) {
        next(new Error("404 not found."));
    });

    return router;



    /* These closures 'like' having access to some of their
     * parent variables like 'Model', and 'options'
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
                    req.doc = doc;
                    next();
                });
        }
    }

    /**
     * Returns a custom middleware function that removes protected
     * and private paths from req.body
     *
     * @param {String} type
     * @return {Function}
     */
    function protect(type) {
        var priv = options.custom[type].private.length ? options.custom[type].private : options.private,
            prot = options.custom[type].protected.length ? options.custom[type].protected : options.protected,
            paths = priv.concat(prot);

        return function(req, res, next) {
            req.body = util.deepOmit(req.body, paths);
            next();
        }
    }

    /**
     * Remove all private paths we don't want to include
     * when we send this object across the interwebs.
     * @param {Model} doc
     * @param {String} type
     * @return {Object}
     */
    function omit(doc, type) {
        var priv = options.custom[type].private.length ? options.custom[type].private: options.private;
        return util.deepOmit(doc.toObject ? doc.toObject() : doc, priv);
    }

    /**
     * A shortcut to see if a given type is allowed
     * @param {String} type
     * @return {Boolean}
     */
    function exposed(type) {
        return options.methods.indexOf(type) >= 0;
    }
}
