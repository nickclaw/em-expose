var _ = require('lodash');

module.exports = {

    /**
     * Get a value down a path
     * @param {Object} obj
     * @param {String} path - period delimited
     */
    'get': function get(obj, path) {
        var parts = path.split('.'),
            prop = parts[0];

        if (obj === null || undefined) return undefined;
        if (parts.length > 1) {
            return get(obj[prop], parts.slice(1).join('.'));
        }
        return obj[prop];
    },

    /**
     * @param {Object} obj
     */

        return obj;
    },

    /**
     * Noooooooope...
     * with support for async Nooooooooope...
     */
    'noop': function() {
        var next = arguments[arguments.length - 1];
        return typeof next === 'function' ? next() : undefined;
    }
}
