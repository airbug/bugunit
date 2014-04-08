//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.Test')

//@Require('Bug')
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

var bugpack             = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Bug                 = bugpack.require('Bug');
var Class               = bugpack.require('Class');
var Event               = bugpack.require('Event');
var EventDispatcher     = bugpack.require('EventDispatcher');
var HashUtil            = bugpack.require('HashUtil');
var Obj                 = bugpack.require('Obj');
var TypeUtil            = bugpack.require('TypeUtil');
var AssertionResult     = bugpack.require('bugunit.AssertionResult');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {EventDispatcher}
 */
var Test = Class.extend(EventDispatcher, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} name
     * @param {{
     *      async: boolean,
     *      setup: function(Object),
     *      test: function(Object),
     *      tearDown: function(Object)
     * }} testObject
     */
    _constructor: function(name, testObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {boolean}
         */
        this.completedSetup     = false;

        /**
         * @private
         * @type {boolean}
         */
        this.completedTearDown  = false;

        /**
         * @private
         * @type {boolean}
         */
        this.completedTest      = false;

        /**
         * @private
         * @type {boolean}
         */
        this.errorOccurred      = false;

        /**
         * @private
         * @type {string}
         */
        this.name               = name;

        /**
         * @private
         * @type {{async: boolean, setup: function(Object), test: function(Object), tearDown: function(Object)}}
         */
        this.testObject         = testObject;
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
    // Convenience Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {boolean}
     */
    isAsync: function() {
        return this.testObject.async;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
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

    /**
     * @param {string} message
     * @return {Throwable}
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
        return caughtError;
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
    completeSetup: function() {
        if (!this.completedSetup) {
            this.completedSetup = true;
            if (!this.errorOccurred) {
                this.dispatchSetupCompleteEvent();
            }
        } else {
            throw new Bug("AlreadySetup", {}, "Test setup already complete");
        }
    },

    /**
     *
     */
    completeTearDown: function() {
        if (!this.completedTearDown) {
            this.completedTearDown = true;
            if (!this.errorOccurred) {
                this.dispatchTearDownCompleteEvent();
            }
        } else {
            throw new Bug("AlreadyTornDown", {}, "Test tear down already complete");
        }
    },

    /**
     *
     */
    completeTest: function() {
        if (!this.completedTest) {
            this.completedTest = true;
            if (!this.errorOccurred) {
                this.dispatchTestCompleteEvent();
            }
        } else {
            throw new Bug("AlreadyCompletedTest", {}, "Test already complete");
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

    /**
     *
     */
    setup: function() {
        if (TypeUtil.isFunction(this.testObject.setup)) {
            this.testObject.setup(this);
            if (!this.isAsync() || this.errorOccurred) {
                this.completeSetup();
            }
        } else {
            this.completeSetup();
        }
    },

    /**
     *
     */
    tearDown: function() {
        if (TypeUtil.isFunction(this.testObject.tearDown)) {
            this.testObject.tearDown();
            if (!this.isAsync() || this.errorOccurred) {
                this.completeTearDown();
            }
        } else {
            this.completeTearDown();
        }
    },

    /**
     *
     */
    test: function() {
        if (TypeUtil.isFunction(this.testObject.test)) {
            this.testObject.test(this);
            if (!this.isAsync() || this.errorOccurred) {
                this.completeTest();
            }
        } else {
            throw new Bug("IllegalState", {}, "Missing test function for test '" + this.name + "'");
        }
    },


    //-------------------------------------------------------------------------------
    // Private Methods
    //-------------------------------------------------------------------------------

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
     * @param {boolean} valid
     * @param {string} message
     */
    dispatchAssertionResultEvent: function(valid, message) {
        var assertionResult = new AssertionResult(valid, message);
        this.dispatchEvent(new Event(Test.EventType.ASSERTION_RESULT, assertionResult));
    },

    /**
     * @private
     */
    dispatchSetupCompleteEvent: function() {
        this.dispatchEvent(new Event(Test.EventType.SETUP_COMPLETE));
    },

    /**
     * @private
     */
    dispatchTearDownCompleteEvent: function() {
        this.dispatchEvent(new Event(Test.EventType.TEAR_DOWN_COMPLETE));
    },

    /**
     * @private
     */
    dispatchTestCompleteEvent: function() {
        this.dispatchEvent(new Event(Test.EventType.TEST_COMPLETE));
    },

    /**
     * @private
     * @param {Error} error
     */
    dispatchTestErrorEvent: function(error) {
        this.dispatchEvent(new Event(Test.EventType.TEST_ERROR, error));
    }
});


//-------------------------------------------------------------------------------
// Static Properties
//-------------------------------------------------------------------------------

/**
 * @static
 * @enum {string}
 */
Test.EventType = {
    ASSERTION_RESULT: "Test:AssertionResult",
    SETUP_COMPLETE: "Test:SetupComplete",
    TEAR_DOWN_COMPLETE: "Test:TearDownComplete",
    TEST_COMPLETE: "Test:TestComplete",
    TEST_ERROR: "Test:TestError"
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.Test", Test);
