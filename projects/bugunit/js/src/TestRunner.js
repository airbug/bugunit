//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('TestRunner')

//@Require('Class')
//@Require('List')
//@require('Obj')
//@Require('Test')
//@Require('TestResult')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var List        = bugpack.require('List');
var Obj         = bugpack.require('Obj');
var Test        = bugpack.require('bugunit.Test');
var TestResult  = bugpack.require('bugunit.TestResult');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var TestRunner = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(test, logResults) {

        this._super();


        //-------------------------------------------------------------------------------
        // Instance Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {*}
         */
        this.callback   = undefined;

        /**
         * @private
         * @type {boolean}
         */
        this.completed  = false;

        /**
         * @private
         * @type {boolean}
         */
        this.logResults = logResults;

        /**
         * @private
         * @type {Test}
         */
        this.test       = test;

        /**
         * @private
         * @type {TestResult}
         */
        this.testResult = new TestResult(test);
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Test}
     */
    getTest: function() {
        return this.test;
    },

    /**
     * @return {boolean}
     */
    isCompleted: function() {
        return this.completed;
    },


    //-------------------------------------------------------------------------------
    // Public Instance Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Error, TestResult)} callback
     */
    runTest: function(callback) {
        this.callback = callback;
        this.test.addEventListener(Test.EventType.ASSERTION_RESULT, this.hearAssertionResult, this);
        this.test.addEventListener(Test.EventType.TEST_ERROR, this.hearTestError, this);
        this.test.addEventListener(Test.EventType.TEST_COMPLETE, this.hearTestComplete, this);
        if (this.logResults) {
            console.log("Running test [" + this.test.getName() + "]");
        }
        this.test.runTest();
    },


    //-------------------------------------------------------------------------------
    // Private Instance Methods
    //-------------------------------------------------------------------------------

    /**
     * @private
     */
    complete: function() {
        this.completed = true;
        this.callback(null, this.testResult);
    },

    /**
     * @private
     */
    removeListeners: function() {
        this.test.removeEventListener(Test.EventType.ASSERTION_RESULT, this.hearAssertionResult, this);
        this.test.removeEventListener(Test.EventType.TEST_ERROR, this.hearTestError, this);
        this.test.removeEventListener(Test.EventType.TEST_COMPLETE, this.hearTestComplete, this);
    },


    //-------------------------------------------------------------------------------
    // Event Listeners
    //-------------------------------------------------------------------------------

    /**
     * @private
     * @param {Event} event
     */
    hearAssertionResult: function(event) {
        var assertionResult = event.getData();
        if (this.logResults) {
            console.log(assertionResult.getMessage());
        }
        this.testResult.addAssertionResult(assertionResult);
    },

    /**
     * @private
     * @param {Event} event
     */
    hearTestComplete: function(event) {
        if (this.logResults) {
            console.log("Completed test [" + this.test.getName() + "]");
        }
        this.removeListeners();
        this.complete();
    },

    /**
     * @private
     * @param {Event} event
     */
    hearTestError: function(event) {
        var error = event.getData();
        if (this.logResults) {
            console.log("Error occurred - message:" + error.message);
        }
        if (this.logResults) {
            console.log("Aborted test [" + this.test.getName() + "]");
        }
        this.testResult.setError(error);
        this.removeListeners();
        this.complete();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.TestRunner", TestRunner);
