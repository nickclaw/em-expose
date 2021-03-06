var path = require('path'),
    util = require('./util.js'),
    errors = require('./errors'),
    express = require('express'),
    _ = require('lodash');

var adapters =  {
    mongoose: require('./adapters/mongoose')
};

module.exports = function expose(Model, options) {

    // create full options object
    options = util.deepExtend({}, DEFAULT_OPTIONS, options);

    var adapter = adapters[options.type];

    // create express router
    var router = express.Router({
        strict: options.strict,
        caseSensitive: options.caseSensitive
    });

    // expose util closures to public
    router.em = {
        protect: protect,
        intercept: intercept,
        send: send
    };

    //
    // Create route
    //
    var create = options.methods.create;
    if (create) {
        router[create.method](create.path,
            protect(create),
            create.preModel,
            function(req, res, next) {
                log('info', ['Creating model with: ', req.body]);
                adapter.create(Model, req.body, function(err, doc) {
                    if (err) return next(err);
                    req.doc = doc;
                    log('info', ['Created model']);
                    next();
                });
            },
            create.postModel,
            create.preSend,
            send(create, 201)
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
            browse.preModel,
            function(req, res, next) {
                adapter.search(Model, req.query || {}, function(err, docs) {
                    if (err) return next(err);
                    req.doc = docs;
                    next();
                });
            },
            browse.postModel,
            browse.preSend,
            send(browse)
        );
    }

    //
    // error handler
    //

    // add these on the next event loop so
    // that users have a chance to attach their own
    // sub-routes to the router.
    setImmediate(function() {
        //
        // catchall
        //
        router.use(
            // TODO some event catcher
            function(req, res, next) {
                next(errors.NotAllowedError());
            }
        );

        router.use(function(err, req, res, next) {
            log('warn', ['Routing error:', err.message, err]);
            options.onError(err, req, res, function() {
                if (err instanceof errors.NotAllowedError) return res.send(403, err.message);
                if (err instanceof errors.NotFoundError) return res.send(404, err.message);
                if (err instanceof errors.NotImplementedError) return res.send(501, err.message);

                log('error', ['Routing error:', err.stack]);
                res.send(500, err.message);
            });
        });
    });

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
        var priv = util.paths(opts && opts.private ? opts.private : options.private),
            prot = util.paths(opts && opts.protected ? opts.protected : options.protected),
            paths = priv.concat(prot);

        return function(req, res, next) {
            req.body = util.omit(req.body, paths);
            next();
        };
    }

    /**
     * Returns a middleware function that converts an id to an object
     * @return {Function} middleware
     */
    function intercept() {

        return function(req, res, next) {
            var id = req.params.id !== undefined ? req.params.id : req.body.id;
            if (id === undefined) return next(em.notFound(req));
            log('info', ['Looking for model with id: %s', id]);
            adapter.retrieve(Model, id, function(err, doc) {
                if (err) return next(err);
                if (!doc) return next(errors.notFound(req));
                req.doc = doc;
                log('info', ['Found model with id: %s', id]);
                next();
            });
        };
    }

    /**
     * Returns a middleware function to safely send a document
     * @param {Object} opts
     * @param {Integer?} status code defaults to 200
     * @return {Function} middleware
     */
    function send(opts, status) {
        var paths = util.paths(opts && opts.priv ? opts.priv : options.private);

        return function(req, res, next) {
            if (!req.doc) return next(errors.notFound(req));

            var obj = util.omit(req.doc.toJSON ? req.doc.toJSON() : req.doc, paths);
            res.send(status || 200, obj);
        };
    }

    /**
     * Try to log, does nothing if a logger wasn't given
     * @param {String} types - Logger  e.g. functions info, warning, error, etc..
     * @param {Array} arguments to pass to functions
     */
    function log(type, args) {
        options.logger && options.logger[type] && options.logger[type].apply(options.logger, args);
    }
};

//
// Constants
//

var DEFAULT_OPTIONS = {
    type: 'mongoose',

    caseSensitive: false,
    strict: false,

    private: null,
    protected: null,

    onError: util.noop,
    logger: null,

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
            method: 'post',
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
