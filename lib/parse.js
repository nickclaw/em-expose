/**
 * Parses Schema settings to iz rules
 * @param {Object} settings schema settings
 * @return {Object} rules
 */
var parser = module.exports = function(settings) {
    var type = settings.instance,
        rules = basics(settings);

    return rules;
}

/**
 * These functions do additional parsing
 * @param {Object} settings
 * @param {Array} rules
 * @return {Array} rules
 */
 /*
var types = {
    ObjectID: function(settings, rules) {

    },
    Number: function(settings, rules) {

    },
    String: function(settings, rules) {

    },
    Array: function(settings, rules) {

    },
    Date: function(settings, rules) {

    },
    Buffer: function(settings, rules) {

    },
    Mixed: function(settings, rules) {

    },
    Boolean: function(settings, rules) {

    },

    other: function(settings, rules) {

    }
}
 */

/**
 * Parses common schema options
 * @param {Object} settings
 * @return {Object} rules
 */
function basics(settings) {
    var rules = [];
    settings.validators.forEach(function(validator) {
        rules.push({
            rule: validator[0],
            error: validator[1]
        });
    });

    return rules;
}

/**
 * For when a schema type doesn't need any more parsing
 */
function noop(settings, rules) {
    return rules;
}
