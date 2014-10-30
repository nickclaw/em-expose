var _ = require('lodash');

var util = module.exports = {

    /**
     * Get a value down a path
     * @param {Object} obj
     * @param {String} path - period delimited
     */
    'get': function(obj, path) {
        var parts = path.split('.'),
            newParts = maxPath(obj, parts);

        if (parts.length !== newParts.length) return undefined;
        return get(obj, parts);
    },

    /**
     * Sets a value down a path, creating objects as needed
     * @param {Object} obj
     * @param {String} path - period delimted
     * @param {*} value
     */
    'set': function set(obj, path, value) {
        var parts = path.split('.'),
            newParts = maxPath(obj, parts),
            i = 0;

        for (;i < newParts.length; i++) {
            obj = obj[newParts[i]];
        }

        for (;i < parts.length - 1; i++) {
            obj = obj[parts[i]] = {};
        }

        return obj[parts[i]] = value;
    },

    /**
     * Deletes a value down a path
     * @param {Object} obj
     * @param {String} path - period delimited
     */
    'remove': function remove(obj, path) {
        var parts = path.split('.'),
            prop = parts[0];

        if (parts.length === 1 || obj[prop] === undefined || obj[prop] === null) return delete obj[prop];
        if (parts.length > 1) return remove(obj[prop], parts.slice(1).join('.'));
    },

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
     * Noooooooope...
     * with support for async Nooooooooope...
     */
    'noop': function noop() {
        var next = arguments[arguments.length - 1];
        return typeof next === 'function' ? next() : undefined;
    }
}

/**
 * Follow the path as far as possible
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
