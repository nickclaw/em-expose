em-expose [![Build Status](https://travis-ci.org/nickclaw/em-expose.svg?branch=master)](https://travis-ci.org/nickclaw/em-expose)
-------------

Quickly and easily expose your Mongoose models to the world with an
easy to customize API built on top of Express.

```javascript
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    em = require('em-expose');

var UserModel = require('./models/User.js'),
    CommentModel = require('./models/Comment.js');

em
    .expose(UserModel, {
        path: '/account', // would default to /user
        protected: ['username', 'createdAt', 'updatedAt'], // not editable
        private: ['password', 'auth._google_id', 'auth._facebook._id', '__v'] // never visible
    })
    .expose(CommentModel, {
        protected: ['createdAt'],
        private: ['__v']
    });

var app = express();
app.use(bodyParser());
app.use('/api', em.middleware());

// The following routes are now exposed
// /api/account         GET(browse), POST(create)
// /api/account/:id     GET(get), PUT(save), DELETE
// /api/comment         GET(browse), POST(create)
// /api/comment/:id     yeah yeah we get it..
```
# Documentation

## Exposer

#### NOTE: `require('em-expose')` already returns an Exposer object. You will rarely need to create one yourself

### constructor(options)
Create an Exposer object.

#### Arguments
* options
    * `caseSensitive` - Does URL case matter? Defaults to false.
    * `strict` - Ignore trailing `/` in URLs? Defaults to false.

#### Example

```javascript
var Exposer = require('em-expose').Exposer;
var em = new Exposer({
    caseSensitive: true,
    strict: true
});
```

### expose(Model, options)
Builds an Express router that exposes the Mongoose model.

#### Arguments
* `Model` - a Mongoose model
* `options`
    * `path` - What subpath should the model be exposed under. Defaults to `'/' + Model.modelName.toLowerCase()`
    * `methods` - An Array of methods to expose. Defaults to `['browse', 'create', 'retrieve', 'update', 'delete']
    * `caseSensitive`- Passed to the router. Defaults to Exposer settings (usually false).
    * `strict` - Passed to the router. Defaults to Exposer settings (usually false).
    * `private` - Default Array of paths that are not shown or editable.
    * `protected` - Default Array of paths that are shown but not editable.
    * `custom` - Object to override individual method settings
        * `browse`, `create`, `retrieve`, `update`, and/or `delete`
            * `private` - Override the Array of paths that are not shown or editable.
            * `protected` - Override the Array of paths that are shown but not editable. (only matters on `create` and `update`)
            * `pre` - `function(req, res, nex)` - Express style middleware function, called before anything else.

#### Example
```javascript
em.expose(Model, {
    path: '/custom/PATH',
    methods: ['browse', 'create', 'retrieve', 'update'], // no deleting!
    caseSensitive: true,
    strict: false,
    private: ['__v', 'path.to.secret'], // awww yeah nested paths
    protected: ['name', 'data.text'],
    custom: {
        browse: {
            private: ['__v', 'path.to.secret', 'data'] // show less to save bandwidth
            // protected field would do nothing heree..
        },
        create: {
            private: []
            protected: [] // you can set all fields on creation now!
        }
        // more methods if you want...
    }
})
```

### middleware()
Returns a fully formed router. Make sure to call after

#### Example
```javascript
em.expose(Model, options);         // expose all models first
app.use(require('body-parser')()); // need this to parse requests
app.use(em.middleware());
// good to go!
```

### getPaths()
Returns an object containing all sub-Routers by path name.

### getPath(path)
Retrieve a sub-Router by pathname, returns null if no Router found.
