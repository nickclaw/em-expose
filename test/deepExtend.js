var deepExtend = require('../lib/util.js').deepExtend,
    expect = require('chai').expect;

describe('deepDefault', function() {

    it('should work on a shallow object', function() {
        var defaults = {
            one: true,
            two: true
        };
        var obj = {
            two: true,
            three: true
        };

        expect(deepExtend(defaults, obj)).to.deep.equal({
            one: true,
            two: true,
            three: true
        });
    });

    it('should work on deep objects', function() {
        var defaults = {
            one: {
                one: {
                    one: true,
                    two: true,
                    three: true
                },
                two: {
                    one: true,
                    two: true,
                    three: true
                },
                three: {
                    one: true,
                    two: true,
                    three: true
                }
            }
        };
        var obj = {
            one: {
                one: {
                    one: true,
                    two: false
                },
                two: {
                    one: false,
                    two: true
                },
            }
        };

        expect(deepExtend(defaults, obj)).to.deep.equal({
            one: {
                one: {
                    one: true,
                    two: false,
                    three: true
                },
                two: {
                    one: false,
                    two: true,
                    three: true
                },
                three: {
                    one: true,
                    two: true,
                    three: true
                }
            }
        });
    });

    it('should work with functions', function() {
        function a(){};
        expect(a).to.equal(a);
        var options = {
            private: ['__v', 'upvotes', 'downvotes'],
            protected: ['_id', 'owner', 'authors', 'root'],

            custom: {
                update: {
                    pre: a,
                    post: "HII"
                },
                delete: {
                    pre: a
                },
                create: {
                    pre: a
                }
            }
        }

        expect(deepExtend({
            // sub path to expose under
            path: '/path',
            // subroutes to expose
            methods: ['create', 'retrieve', 'update', 'delete', 'browse'],

            // passed to express.Router()
            caseSensitive: this.caseSensitive,
            strict: this.strict,

            // global settings
            private: [],    // not exposed
            protected: [],  // not editable/setable
            pre: null, // passed in req.body & next
            post: null,// passed in document & next

            custom: {
                create: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                },
                retrieve: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                },
                update: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                },
                delete: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                },
                browse: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                }
            }
        }, options)).to.deep.equal({

            // sub path to expose under
            path: '/path',
            // subroutes to expose
            methods: ['create', 'retrieve', 'update', 'delete', 'browse'],

            // passed to express.Router()
            caseSensitive: this.caseSensitive,
            strict: this.strict,

            // global settings
            private: ['__v', 'upvotes', 'downvotes'],
            protected: ['_id', 'owner', 'authors', 'root'],
            pre: null, // passed in req.body & next
            post: null,// passed in document & next

            custom: {
                create: {
                    private: [],
                    protected: [],
                    pre: a,
                    post: null
                },
                retrieve: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                },
                update: {
                    private: [],
                    protected: [],
                    pre: a,
                    post: "HII"
                },
                delete: {
                    private: [],
                    protected: [],
                    pre: a,
                    post: null
                },
                browse: {
                    private: [],
                    protected: [],
                    pre: null,
                    post: null
                }
            }
        });
    });
});
