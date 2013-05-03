//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('Test')

//@Require('Class')
//@Require('Event')
//@Require('EventDispatcher')
//@Require('HashUtil')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugunit.AssertionResult')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Event = bugpack.require('Event');
var EventDispatcher = bugpack.require('EventDispatcher');
var HashUtil = bugpack.require('HashUtil');
var Obj = bugpack.require('Obj');
var TypeUtil = bugpack.require('TypeUtil');

var AssertionResult = bugpack.require('bugunit.AssertionResult');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var Test = Class.extend(EventDispatcher, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(name, testObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {boolean}
         */
        this.completed = false;

        /**
         * @private
         * @type {boolean}
         */
        this.errorOccurred = false;

        /**
         * @private
         * @type {string}
         */
        this.name = name;

        /**
         * @private
         * @type {{async: boolean, setup: function(Object), test: function(Object), tearDown: function(Object)}}
         */
        this.testObject = testObject;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {string}
     */
    getName: function() {
        return this.name;
    },


    //-------------------------------------------------------------------------------
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {*} value1
     * @param {*} value2
     * @param {string} message
     */
    assertEqual: function(value1, value2, message) {
        var equal = this.areEqual(value1, value2);
        if (equal) {
            this.dispatchAssertionResultEvent(true,
                "[SUCCESS] " + message + " - Assert [equal] - expected:" + value2 + " given:" + value1);
        } else {
            this.dispatchAssertionResultEvent(false,
                "[FAIL] " + message + " - Assert [equal] - expected:" + value2 + " given:" + value1);
        }
    },

    /**
     * @param {*} value1
     * @param {*} value2
     * @param {string} message
     */
    assertNotEqual: function(value1, value2, message) {
        var notEqual = !this.areEqual(value1, value2);
        if (notEqual) {
            this.dispatchAssertionResultEvent(true,
                "[SUCCESS] " + message + " - Assert [not equal] - expected:" + value2 + " given:" + value1);
        } else {
            this.dispatchAssertionResultEvent(false,
                "[FAIL] " + message + " - Assert [not equals] - expected:" + value2 + " given:" + value1);
        }
    },

    /**
     * @param {boolean} value
     * @param {string} message
     */
    assertTrue: function(value, message) {
        if (value) {
            this.dispatchAssertionResultEvent(true,
                "[SUCCESS] " + message + " - Assert [true] - result:" + value);
        } else {
            this.dispatchAssertionResultEvent(false,
                "[FAIL] " + message + " - Assert [true] - result:" + value);
        }
    },

    /**
     *
     * @param {boolean} value
     * @param {string} message
     */
    assertFalse: function(value, message) {
        if (!value) {
            this.dispatchAssertionResultEvent(true,
                "[SUCCESS] " + message + " - Assert [false] - result:" + value);
        } else {
            this.dispatchAssertionResultEvent(false,
                "[FAIL] " + message + " - Assert [false] - result:" + value);
        }
    },

    //TODO BRN: For now this is just a simple function to assert an error is thrown. We should add the capability to
    // assert for specific error types.

    /**
     * @param {string} message
     */
    assertThrows: function(func, message) {
        var caughtError = undefined;
        try {
            func();
        } catch (error) {
            caughtError = error;
        }
        if (caughtError !== undefined) {
            this.dispatchAssertionResultEvent(true,
                "[SUCCESS] " + message + " - Assert [throws] - error thrown:" + caughtError.message);
        } else {
            this.dispatchAssertionResultEvent(false,
                "[FAIL] " + message + " - Assert [throws] -  no error thrown");
        }
    },

    /**
     * @param {string} message
     */
    assertNotThrows: function(func, message) {
        var caughtError = undefined;
        try {
            func();
        } catch (error) {
            caughtError = error;
        }
        if (caughtError === undefined) {
            this.dispatchAssertionResultEvent(true,
                "[SUCCESS] " + message + " - Assert [not throws] - no error thrown" );
        } else {
            this.dispatchAssertionResultEvent(false,
                "[FAIL] " + message + " - Assert [not throws] -  error thrown:" + caughtError.message);
        }
    },

    /**
     *
     */
    complete: function() {
        if (!this.completed) {
            this.completed = true;
            this.tearDown();
            if (!this.errorOccurred) {
                this.dispatchTestCompleteEvent();
            }
        }
    },

    /**
     * @param {Error} error
     */
    error: function(error) {
        if (!this.errorOccurred) {
            this.errorOccurred = true;
            this.dispatchTestErrorEvent(error);
        }
    },


    //-------------------------------------------------------------------------------
    // PrivateClass Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     */
    runTest: function() {
        this.setup();
        try {
            this.test();
        } catch(error) {
            this.error(error);
        } finally {
            if (!this.testObject.async || this.errorOccurred) {
                this.complete();
            }
        }
    },

    /**
     * @private
     * @param {boolean} valid
     * @param {string} message
     */
    dispatchAssertionResultEvent: function(valid, message) {
        var assertionResult = new AssertionResult(valid, message);
        this.dispatchEvent(new Event(Test.EventType.ASSERTION_RESULT, assertionResult));
    },

    /**
     * @private
     * @param {Error} error
     */
    dispatchTestErrorEvent: function(error) {
        this.dispatchEvent(new Event(Test.EventType.TEST_ERROR, error));
    },

    /**
     * @private
     */
    dispatchTestCompleteEvent: function() {
        this.dispatchEvent(new Event(Test.EventType.TEST_COMPLETE));
    },

    /**
     * This test uses the exact comparison operator (===) to test for equality.
     * @private
     * @param {*} value1
     * @param {*} value2
     */
    areEqual: function(value1, value2) {
        return Obj.equals(value1, value2);
    },

    /**
     * @private
     */
    setup: function() {
        if (TypeUtil.isFunction(this.testObject.setup)) {
            this.testObject.setup(this);
        }
    },

    /**
     * @private
     */
    test: function() {
        if (TypeUtil.isFunction(this.testObject.test)) {
            this.testObject.test(this);
        } else {
            throw new Error("Missing test function for test '" + this.name + "'");
        }
    },

    /**
     * @private
     */
    tearDown: function() {
        if (TypeUtil.isFunction(this.testObject.tearDown)) {
            this.testObject.tearDown();
        }
    }
});


//-------------------------------------------------------------------------------
// Static Event Types
//-------------------------------------------------------------------------------

Test.EventType = {
    ASSERTION_RESULT: 'assertion_result',
    TEST_ERROR: 'test_error',
    TEST_COMPLETE: 'test_complete'
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.Test", Test);
