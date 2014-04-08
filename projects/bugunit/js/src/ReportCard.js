//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.ReportCard')

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
 * @class
 * @extends {Obj}
 */
var ReportCard = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     */
    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {List.<TestResult>}
         */
        this.testResultList         = new List();

        /**
         * @private
         * @type {List.<TestResult>}
         */
        this.failedTestResultList   = new List();
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {List.<TestResult>}
     */
    getTestResultList: function() {
        return this.testResultList;
    },

    /**
     * @return {List.<TestResult>}
     */
    getFailedTestResultList: function() {
        return this.failedTestResultList;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {TestResult} testResult
     */
    addTestResult: function(testResult) {
        this.testResultList.add(testResult);
        if (testResult.didTestFail()) {
            this.failedTestResultList.add(testResult);
        }
    },

    /**
     * @return {number}
     */
    numberFailedTests: function() {
        return this.failedTestResultList.getCount();
    },

    /**
     * @return {number}
     */
    numberPassedTests: function() {
        return (this.testResultList.getCount() - this.failedTestResultList.getCount());
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.ReportCard", ReportCard);
