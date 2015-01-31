emme [![Build Status](https://travis-ci.org/nickclaw/emme.svg?branch=master)](https://travis-ci.org/nickclaw/emme)
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

var app = express();
app.use(bodyParser());

// expose user model
app.use('/user', em(UserModel, {

    // these fields wont be viewable
    private: {
        'auth.password': true, // flatten paths
        'createdAt': true,
        'metadata': {
            'awards': true // or keep them expanded
        },
        'comments._id': true // filter items in collections
    },

    // these fields wont be editable
    protected: {
        'username': true,
    },

    // custom CRUD
    methods: {
        remove: false // in this case don't let them be deleted
    }
}));

// The following routes are now exposed
// /user         GET(browse), POST(create)
// /user/:id     GET(get), POST(save)
```
# Documentation

## Exposer


### expose(Model, options) `require(em-expose)(Model, options)`
Builds an Express router that exposes the Mongoose model.

#### Arguments
* `Model` - a Mongoose model
* `options`
    * `private` - Object of paths that are not shown or editable.
    * `protected` - Object of paths that are shown but not editable.
    * `methods` - Object to override individual method settings
        * `browse`, `create`, `retrieve`, `update`, and/or `delete`
            * `private` - Override the object of paths that are not shown or editable.
            * `protected` - Override the object of paths that are shown but not editable. (only matters on `create` and `update`)
            * `preModel` - `function(req, res, nex)` - Express style function, called before model is requested
            * `postModel` - `function(req, res, next)` - Express style function, called after/if model has been found (access it with `req.doc`)
            * `preSend` - `function(req, res, next)` -  Express style function, called just before sending the model
