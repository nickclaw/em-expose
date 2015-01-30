var _ = require('lodash'),
    path = require('path'),
    util = require('./util.js'),
    express = require('express');

var adapters =  {
    mongoose: require('./adapters/mongoose')
}

module.exports = function expose(Model, options) {

    // create full options object
    options = util.deepExtend({}, DEFAULT_OPTIONS, options);

    var adapter = adapters[options.type];

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
            create.preModel,
            function(req, res, next) {
                adapter.create(Model, req.body, function(err, doc) {
                    if (err) return next(err);
                    req.doc = doc;
                    next();
                });
            },
            create.postModel,
            create.preSend,
            send(create)
        );
    }

    //
    // Retrieve route
    //
    var retrieve = options.methods.retrieve;
    if (retrieve) {
        router[retrieve.method](retrieve.path,
            retrieve.preModel,
            intercept(true),
            retrieve.postModel,
            retrieve.preSend,
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
            update.preModel,
            intercept(false),
            update.postModel,
            function(req, res, next) {
                adapter.update(req.doc, req.body, function(err, doc) {
                    if (err) return next(err);
                    req.doc = doc;
                    next();
                });
            },
            update.preSend,
            send(update)
        );
    }

    //
    // Delete route
    //
    var remove = options.methods.remove;
    if (remove) {
        router[remove.method](remove.path,
            remove.preModel,
            intercept(false),
            remove.postModel,
            function(req, res, next) {
                adapter.remove(req.doc, function(err, doc) {
                    if (err) return next(err);
                    next();
                });
            },
            remove.preSend,
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
                res.send(501, 'not implemented');
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
            req.body = util.omit(req.body, paths);
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
            adapter.retrieve(Model, id, function(err, doc) {
                if (err) return next(err);
                if (!doc) return res.send(404, "not found");
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
        var paths = util.paths(opts.priv ? opts.priv : options.private);

        return function(req, res) {
            if (!req.doc) {
                res.send(404);
            }

            var obj = util.omit(req.doc.toJSON ? req.doc.toJSON() : req.doc, paths);
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

    private: null,
    protected: null,

    methods: {
        'create': {
            path: '/',
            method: 'post',
            private: null,
            protected: null,
            preModel: util.noop,
            postModel: util.noop,
            preSend: util.noop
        },
        'retrieve': {
            path: '/:id',
            method: 'get',
            private: null,
            protected: null,
            preModel: util.noop,
            postModel: util.noop,
            preSend: util.noop
        },
        'update': {
            path: '/:id',
            method: 'put',
            private: null,
            protected: null,
            preModel: util.noop,
            postModel: util.noop,
            preSend: util.noop
        },
        'remove': {
            path: '/:id',
            method: 'delete',
            private: null,
            protected: null,
            preModel: util.noop,
            postModel: util.noop,
            preSend: util.noop
        },
        'browse': {
            path: '/',
            method: 'get',
            private: null,
            protected: null,
            preModel: util.noop,
            postModel: util.noop,
            preSend: util.noop
        }
    }
};
