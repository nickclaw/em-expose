var express = require('express'),
    _ = require('underscore'),
    util = require('./util.js'),
    path = require('path');

module.exports = function(Model, options) {
    var router = express.Router(
        strict: options.strict,
        caseSensitive: options.caseSensitive
    );

    router.use(function(req, res, next) {
        req.Model = Model;
        next();
    });

    //
    // Create route
    //
    var create = options.methods.create;
    if (create) {
        router.post(
            create.path,
            protect(create),
            create.pre,
            function(req, res) {
                var doc = new Model(req.body);
                doc.save(function(err, doc) {
                    if (err) return next(err);
                    res.send(doc);
                });
            }
        )
    }

    //
    // Retrieve route
    //
    var retrieve = options.methods.retrieve;
    if (retrieve) {
        router.get(
            protect(retrieve),
            retrieve.pre,
            intercept(true),
            function(req, res) {
                var
            }
        )
    }



    //
    // Closures
    //
    function protect(opts) {
        var priv = util.flatten(opts.private ? opts.private : options.private),
            prot = util.flatten(opts.protected ? opts.protected : options.protected),
            omit = priv.concat(prot);

        return function(req, res, next) {
            req.body = util.omit(req.body, omit);
            next();
        }
    }

    function censor(opts) {
        var priv = util.flatten(opts.private ? options.private : options.private);
    }
}

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
        req.Model = Model;
        var oldSend = res.send;
        res.send = function(object, type) { //TODO make it match express send
            if (type && options.custom[type]) {
                options.custom[type].post(object);
            }
            oldSend.call(res, omit(object, type));
        }

        next();
    });

    /**
     * Create a document
     */
    if (exposed('create')) {
        router.post('/',
            protect('create'),
            options.custom.create.pre,
            function(req, res, next) {
                var doc = new Model(req.body);
                doc.save(function(err, doc) {
                    if (err) return next(err);
                    res.send(doc, 'create'); });
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
                res.send(req.doc, 'retrieve'); }
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
                    res.send(doc, 'update'); });
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
                    res.send(doc, 'delete');
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
        var priv = type && options.custom[type].private.length ? options.custom[type].private : options.private,
            prot = type && options.custom[type].protected.length ? options.custom[type].protected : options.protected,
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
        var priv = type && options.custom[type].private.length ? options.custom[type].private: options.private;
        return util.deepOmit(doc.toObject ? doc.toObject() : doc, priv);
    }
}
