
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
            var copy = {},
                keys = Object.keys(object);

            // iterate over object key/values
            for (var i = 0, key = null, val = null; (val = object[key = keys[i]]) !== undefined; i++) {
                if (paths.indexOf(past + (past?'.':'') + key) == -1) {
                    copy[key] = val;

                    if (typeof val === 'object' && key !== '_id') {
                        copy[key] = step(past + (past?'.':'') + key, val);
                    }
                }
            }

            return copy;
        }

        return step('', obj);
    },

    /**
     * Noooooooope...
     * with support for async Nooooooooope...
     */
    noop: function() {
        var next = arguments[arguments.length - 1];
        return typeof next === 'function' ? next() : true;
    }
}
