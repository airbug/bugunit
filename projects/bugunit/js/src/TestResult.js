//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestResult')

//@Require('Class')
//@Require('List')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var List        = bugpack.require('List');
var Obj         = bugpack.require('Obj');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @constructs
 * @extends {Obj}
 */
var TestResult = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {Test} test
     */
    _constructor: function(test) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {List.<AssertionResult>}
         */
        this.assertionResultList        = new List();

        /**
         * @private
         * @type {Throwable}
         */
        this.error                      = null;

        /**
         * @private
         * @type {List.<AssertionResult>}
         */
        this.failedAssertionResultList  = new List();

        /**
         * @private
         * @type {Test}
         */
        this.test                       = test;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {Throwable}
     */
    getError: function() {
        return this.error;
    },

    /**
     * @param {Error} error
     */
    setError: function(error) {
        this.error = error;
    },

    /**
     * @return {List.<AssertionResult>}
     */
    getFailedAssertionResultList: function() {
        return this.failedAssertionResultList;
    },

    /**
     * @return {Test}
     */
    getTest: function() {
        return this.test;
    },


    //-------------------------------------------------------------------------------
    // Convenience Methods
    //-------------------------------------------------------------------------------

    /**
     * @return {boolean}
     */
    errorOccurred: function() {
        return this.error !== null;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {AssertionResult} assertionResult
     */
    addAssertionResult: function(assertionResult) {
        this.assertionResultList.add(assertionResult);
        if (assertionResult.didAssertionFail()) {
            this.failedAssertionResultList.add(assertionResult);
        }
    },

    /**
     * @return {boolean}
     */
    didTestFail: function() {
        return !this.didTestPass();
    },

    /**
     * @return {boolean}
     */
    didTestPass: function() {
        return (this.numberFailedAssertions() === 0 && !this.errorOccurred());
    },

    /**
     * @return {number}
     */
    numberAssertions: function() {
        return this.assertionResultList.getCount();
    },

    /**
     * @return {number}
     */
    numberFailedAssertions: function() {
        return this.failedAssertionResultList.getCount();
    },

    /**
     * @return {number}
     */
    numberPassedAssertions: function() {
        return (this.assertionResultList.getCount() - this.failedAssertionResultList.getCount());
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.TestResult", TestResult);
