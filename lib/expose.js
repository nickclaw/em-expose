var _ = require('lodash'),
    path = require('path'),
    util = require('./util.js'),
    express = require('express');

module.exports = function expose(Model, options) {

    // create full options object
    options = _.extend({}, DEFAULT_OPTIONS, options);

    _.each(options.methods, function(method, name) {
        options.methods[name] = _.extend({}, ROUTE_OPTIONS, method);
    });

    // create express router
    var router = express.Router({
        strict: options.strict,
        caseSensitive: options.caseSensitive
    });

    // intercept all requests to add metadata
    router.use(function(req, res, next) {
        req.Model = Model;
        next();
    });

    //
    // Create route
    //
    var create = options.methods.create;
    if (create) {
        router[create.method](create.path,
            protect(create),
            create.pre,
            function(req, res) {
                var doc = new Model(req.body);
                doc.save(function(err, doc) {
                    if (err) return next(err);
                    req.doc = doc;
                    next();
                });
            },
            send(create)
        );
    }

    //
    // Retrieve route
    //
    var retrieve = options.methods.retrieve;
    if (retrieve) {
        router[retrieve.method](retrieve.path,
            retrieve.pre,
            intercept(true),
            send(retrieve)
        );
    }

    //
    // Update route
    //
    var update = options.methods.update;
    if (update) {
        router[update.method](update.path,
            protect(update),
            update.pre,
            intercept(false),
            function(req, res, next) {
                req.doc.set(req.body);
                req.doc.save(function(err, doc) {
                    if (err) return next(err);
                    req.doc = doc;
                });
            },
            send(update)
        );
    }

    //
    // Delete route
    //
    var remove = options.methods.remove;
    if (remove) {
        router[remove.method](remove.path,
            remove.pre,
            intercept(true),
            function(req, res, next) {
                req.doc.remove(function(err, doc) {
                    if (err) return next(err);
                });
            },
            send(remove)
        );
    }

    //
    // Browse route
    //
    var browse = options.methods.browse;
    if (browse) {
        router[browse.method](browse.path,
            function(req, res) {
                res.sendStatus(501, 'not implemented');
            }
        );
    }

    // finally return the router
    return router;


    //
    // Closures
    //

    /**
     * Returns a middleware function that removes protected and private
     * paths from req.body
     *
     * @param {Object} opts
     * @return {Function} middleware
     */
    function protect(opts) {

        // build list of paths to omit
        var priv = util.paths(opts.private ? opts.private : options.private),
            prot = util.paths(opts.protected ? opts.protected : options.protected),
            paths = priv.concat(prot);

        return function(req, res, next) {
            req.body = util.deepOmit(req.body, paths);
            next();
        }
    }

    /**
     * Returns a middleware function that converts an id to an object
     * @param {Boolean} lean
     * @return {Function} middleware
     */
    function intercept(lean) {

        return function(req, res, next) {
            var id = req.params.id !== undefined ? req.params.id : req.body.id;
            if (id === undefined) return next(new Error());
            Model.findById(id)
                .lean(lean)
                .exec(function(err, doc) {
                    if (err) return next(err);
                    if (!doc) return next(new Error());
                    req.doc = doc;
                    next();
                });
        }
    }

    /**
     * Returns a middleware function to safely send a document
     * @param {Object} opts
     * @return {Function} middleware
     */
    function send(opts) {
        var paths = util.paths(opts.priv);

        return function(req, res) {
            if (!req.doc) {
                res.sendStatus(404);
            }

            var obj = util.omit(req.doc, paths);
            opts.post(obj);
            res.send(obj);
        }
    }
}


//
// Constants
//

var DEFAULT_OPTIONS = {
    type: 'mongoose',

    caseSensitive: false,
    strict: false,

    private: [],
    protected: [],
    pre: util.noop,
    post: util.noop,

    methods: {}
};

var ROUTE_OPTIONS = {
    path: '/',
    method: 'post',
    private: [],
    protected: [],
    pre: util.noop,
    post: util.noop
}
