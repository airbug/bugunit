/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
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
});
