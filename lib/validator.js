var iz = require('iz'),
    are = iz.are,
    validators = iz.validators;

module.exports = {

    validate: function(doc, options) {
        this.validator(options, doc.Model)(doc)
    },

    validator: function(Model, options) {
        var rules = are(options);

        return function(doc) {
            if (!rules.validFor(doc)) {
                return rules.getInvalidFields();
            }
            return {};
        }
    },

    parseRequirements: function(Model) {
        console.log(Model);
    },

    // expose ways to create errors
    error: function(message, data) {
        return new ValidationError(message, data);
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
