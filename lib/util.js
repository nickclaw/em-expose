var _ = require('underscore');

module.exports = {

    /**
     * Omit paths from an object
     * based off of https://gist.github.com/dtsn/7098527
     * @param {Object} obj
     * @param {Array.<String>} paths
     * @return {Object}
     */
    deepOmit: function(obj, paths) {

        /**
         * Recursive function to navigate deep object
         * @param {String} past
         * @param {Object} object
         * @return {Object}
         */
        function step(past, object) {
            if(object._bsontype) {
                return object.toString();
            } else if (_.isArray(object)) {
                return _.map(object, function(value) {
                    return step(past, value);
                });
            } else if (_.isObject(object)) {
                return _.reduce(object, function(copy, value, key) {
                    if (paths.indexOf(past + (past?'.':'') + key) === -1) {
                        copy[key] = step(past + (past?'.':'') + key, value);
                    }
                    return copy
                }, {});
            } else {
                return object;
            }

        }

        return step('', obj);
    },

    /**
     * Deep extends an object
     * This is not a very well made function, but it's useful to parse options
     * TODO make better
     * @param {Object} default
     * @param {Object} obj
     */
    deepExtend: function step(obj, extend) {
        _.each(extend, function(value, key) {
            if (
                _.isArray(value) ||
                _.isString(value) ||
                _.isBoolean(value) ||
                _.isFunction(value)  ||
                _.isNumber(value) ||
                _.isNull(value) ||
                _.isUndefined(value)
            ){
                obj[key] = value;
            } else {
                obj[key] = step(obj[key], value);
            }
        });

        return obj;
    },

    /**
     * Noooooooope...
     * with support for async Nooooooooope...
     */
    noop: function() {
        var next = arguments[arguments.length - 1];
        return typeof next === 'function' ? next() : undefined;
    }
}
