em-expose [![Build Status](https://travis-ci.org/nickclaw/em-expose.svg?branch=master)](https:/travis-ci.org/nickclaw/em-expose)
-------------

Quickly and easily expose your Mongoose models to the world with an
easy to customize API built on top of Express.

```javascript
    var express = require('express'),
        mongoose = require('mongoose'),
        exposer = require('em-expose'),
        bodyParser = require('body-parser');

    var UserModel = require('./models/User.js'),
        CommentModel = require('./models/Comment.js');

    exposer
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
    app.use('/api', exposer.middleware());

    // The following routes are now exposed
    // /api/account         GET(browse), POST(create)
    // /api/account/:id     GET(get), PUT(save), DELETE
    // /api/comment         GET(browse), POST(create)
    // /api/comment/:id     yeah yeah we get it..
```

### Documentation coming soon...
