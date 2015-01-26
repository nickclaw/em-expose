var _ = require('lodash'),
    util = require('./util.js'),
    buildRouter = require('./buildRouter.js');

// export Exposer class
module.exports = expose;


//
// Constants
//

var DEFAULT_EXPOSER_OPTIONS = {
    type: 'mongoose',

    caseSensitive: false,
    strict: false,

    private: [],
    protected: [],
    pre: util.noop,
    post: util.noop,

    methods: {
        'create': {
            path: '/',
            private: [],
            protected: [],
            pre: util.noop,
            handler: null,
            post: util.noop
        },
        'retrieve': {
            path: '/',
            private: [],
            protected: [],
            pre: util.noop,
            handler: null,
            post: util.noop
        },
        'update': {
            path: '/',
            private: [],
            protected: [],
            pre: util.noop,
            handler: null,
            post: util.noop
        },
        'delete': {
            path: '/',
            private: [],
            protected: [],
            pre: util.noop,
            handler: null,
            post: util.noop
        }
    }
};


function expose(Model, options) {
    options = util.deepExtend({}, DEFAULT_EXPOSE_OPTIONS, options);
    return buildRouter(Model, options);
}
