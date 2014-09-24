/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestResult')

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
     * @constructs
     * @extends {Obj}
     */
    var TestResult = Class.extend(Obj, {

        _name: "bugunit.TestResult",


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
             * @type {boolean}
             */
            this.completed                  = false;

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
         * @return {boolean}
         */
        getCompleted: function() {
            return this.completed;
        },

        /**
         * @param {boolean} completed
         */
        setCompleted: function(completed) {
            this.completed = completed;
        },

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
        didTestComplete: function() {
            return this.completed;
        },

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
});
