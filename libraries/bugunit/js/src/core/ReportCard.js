/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.ReportCard')

//@Require('Class')
//@Require('List')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class   = bugpack.require('Class');
    var List    = bugpack.require('List');
    var Obj     = bugpack.require('Obj');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var ReportCard = Class.extend(Obj, {

        _name: "bugunit.ReportCard",


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
            this.failedTestResultList       = new List();

            /**
             * @private
             * @type {List.<TestResult>}
             */
            this.incompleteTestResultList   = new List();

            /**
             * @private
             * @type {List.<TestResult>}
             */
            this.testResultList             = new List();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {List.<TestResult>}
         */
        getFailedTestResultList: function() {
            return this.failedTestResultList;
        },

        /**
         * @return {List.<TestResult>}
         */
        getIncompleteTestResultList: function() {
            return this.incompleteTestResultList;
        },

        /**
         * @return {List.<TestResult>}
         */
        getTestResultList: function() {
            return this.testResultList;
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
            if (!testResult.didTestComplete()) {
                this.incompleteTestResultList.add(testResult);
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
        numberIncompleteTests: function() {
            return this.incompleteTestResultList.getCount();
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
});
