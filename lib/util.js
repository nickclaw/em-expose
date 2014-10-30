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
     * Sets a value down a path, creating objects as needed
     * @param {Object} obj
     * @param {String} path - period delimted
     * @param {*} value
     */
    'set': function set(obj, path, value) {
        var parts = path.split('.'),
            prop = parts[0],
            curr = obj[prop];

        if (parts.length === 1) return obj[prop] = value;
        if (obj[prop] === null || obj[prop] === undefined) obj[prop] = {};
        return set(obj[prop], parts.slice(1).join('.'), value);
    },

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
