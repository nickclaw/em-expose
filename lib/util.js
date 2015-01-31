var _ = require('lodash'),
    dotty = require('dotty');

var util = module.exports = {

    /**
     * Get a value down a path
     * @param {Object} obj
     * @param {String} path - period delimited
     */
    'get': dotty.get,

    /**
     * Sets a value down a path, creating objects as needed
     * @param {Object} obj
     * @param {String} path - period delimted
     * @param {*} value
     */
    'set': dotty.put,

    /**
     * Deletes a value down a path
     * @param {Object} obj
     * @param {String} path - period delimited
     */
    'remove': dotty.remove,

    /**
     * Deep omit an object
     * @param {Object} obj
     * @param {Array.<String>} paths
     * @return {Object} - not necessarily new
     */
    'omit': function omit(obj, paths) {

        _.each(paths, function(path) {
            util.remove(obj, path);
        });

        return obj;
    },

    /**
     * Deep whitelist an object
     * @param {Object} obj
     * @param {Array.<String>} paths
     * @return {Object} - not necessarily new
     */
    'whitelist': function whitelist(obj, paths) {
        var newObj = {};

        _.each(paths, function(path) {
            var parts = path.split('.'),
                newParts = maxPath(obj, parts);

            if (parts.length === newParts.length) {
                util.set(newObj, path, get(obj, parts))
            }
        });

        return newObj;
    },

    /**
     * Flatten an object into an array of paths
     * @param {Object} obj
     * @return {Array.<String>}
     */
    'paths': function(obj) {
        var keys = [];

        function step(target, prev) {

            _.each(target, function(child, key) {
                if (prev !== undefined) key = prev + '.' + key;
                if (child && child.__proto__ === Object.prototype) return step(child, key);
                keys.push(key);
            });
        }

        step(obj)

        return keys;
    },

    /**
     * Noooooooope...
     * with support for async Nooooooooope...
     */
    'noop': function noop() {
        var next = arguments[arguments.length - 1];
        return typeof next === 'function' ? next() : undefined;
    },

    'deepExtend': function deepExtend(mainObj) {
        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i],
                paths = util.paths(obj);

            _.each(paths, function(path) {
                util.set(mainObj, path, util.get(obj, path));
            });
        }

        return mainObj;
    }
}



/**
 * Follow the path as far as possible
 *
 * @private
 * @param {Object} obj
 * @param {Array.<String>} path
 * @return {Array.<String>} - real path
 */
function maxPath(obj, parts) {
    var newParts = [];

    for (var i = 0; i < parts.length; i++) {
        obj = obj[parts[i]];
        if (obj === undefined || obj === null) break;
        newParts.push(parts[i]);
    }

    return newParts;
}

/**
 * Util-util function for getting a value
 * Assumes the path exists
 *
 * @private
 * @param {Object} obj
 * @param {Array.<String>} parts
 */
function get(obj, parts) {
    while(parts.length) {
        obj = obj[parts.shift()];
    }

    return obj;
}
