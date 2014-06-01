var parse = require('./parse.js'),
    iz = require('iz'),
    are = iz.are,
    validators = iz.validators;

module.exports = {

    /**
     * Validates a document against some rules
     * @param {Document} doc
     * @param {Object} options
     * @return {Object|Boolean}
     */
    validate: function(doc, options) {
        this.validator(options, doc.Model)(doc)
    },

    /**
     * Returns a function to validate a document
     * @param {Model} Model
     * @param {Object} options
     * @return {Function}
     */
    validator: function(Model, options) {
        var rules = are(options);

        /**
         * Validate a document
         * @param {Document} doc
         * @return {Object|Boolean}
         */
        return function(doc) {
            if (!rules.validFor(doc)) {
                return rules.getInvalidFields();
            }
            return false;
        }
    },

    /**
     * Parse Mongoose schema into iz rule object
     * @param {Model} Model
     * @return {Object}
     */
    parseRequirements: function(Model) {
        var paths = Model.schema.paths,
            copy = {};

        for (path in paths) {
            copy[path] = parse(paths[path]);
        }

        return copy;
    },

    /**
     * Throws a Validation error
     */
    error: function(message, data) {
        throw new ValidationError(message, data);
    },
    ValidationError: ValidationError
}


/**
 * A type of error that can hold json data from iz validation
 * extends the standard Error so it can be passed correctly through
 * other modules.
 * Taken from http://stackoverflow.com/a/8460753/2993423
 * @param {String} message
 * @param {Object|?} data
 */
function ValidationError(message, data) {
    this.constructor.prototype.__proto__ = Error.prototype // Make this an instanceof Error.
    Error.call(this) // Does not seem necessary. Perhaps remove this line?
    Error.captureStackTrace(this, this.constructor) // Creates the this.stack getter
    this.name = this.constructor.name; // Used to cause messages like "UserError: message" instead of the default "Error: message"
    this.message = message; // Used to set the message
    this.data = data;
}
