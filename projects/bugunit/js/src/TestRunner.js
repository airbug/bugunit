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

//@Export('bugunit.TestRunner')

//@Require('Class')
//@Require('List')
//@Require('Obj')
//@Require('Tracer')
//@Require('bugunit.Test')
//@Require('bugunit.TestResult')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var domain      = require('domain');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var List        = bugpack.require('List');
    var Obj         = bugpack.require('Obj');
    var Tracer      = bugpack.require('Tracer');
    var Test        = bugpack.require('bugunit.Test');
    var TestResult  = bugpack.require('bugunit.TestResult');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $name       = Tracer.$name;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var TestRunner = Class.extend(Obj, {

        _name: "bugunit.TestRunner",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Test} test
         * @param {boolean} logResults
         */
        _constructor: function(test, logResults) {

            this._super();


            //-------------------------------------------------------------------------------
            // Instance Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {*}
             */
            this.callback       = null;

            /**
             * @private
             * @type {boolean}
             */
            this.completed      = false;

            /**
             * @private
             * @type {boolean}
             */
            this.logResults     = logResults;

            /**
             * @private
             * @type {Test}
             */
            this.test           = test;

            /**
             * @private
             * @type {TestResult}
             */
            this.testResult     = new TestResult(test);
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


        //-------------------------------------------------------------------------------
        // Convenience Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {boolean}
         */
        isCompleted: function() {
            return this.completed;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Error, TestResult)} callback
         */
        runTest: function(callback) {
            var _this = this;
            this.callback = callback;
            this.addTestListeners();
            if (this.logResults) {
                console.log("Running test [" + this.test.getName() + "]");
            }
            var d = domain.create();
            d.on('error', function(error) {
                _this.processError(error);
            });
            d.add(this.test);
            d.run(function() {
                _this.setupTest();
            });
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        addTestListeners: function() {
            this.test.addEventListener(Test.EventType.ASSERTION_RESULT, this.hearAssertionResult, this);
            this.test.addEventListener(Test.EventType.SETUP_COMPLETE, this.hearSetupComplete, this);
            this.test.addEventListener(Test.EventType.TEAR_DOWN_COMPLETE, this.hearTearDownComplete, this);
            this.test.addEventListener(Test.EventType.TEST_ERROR, this.hearTestError, this);
            this.test.addEventListener(Test.EventType.TEST_COMPLETE, this.hearTestComplete, this);
        },

        /**
         * @private
         */
        complete: function() {
            if (this.logResults) {
                console.log("Completed test [" + this.test.getName() + "]");
            }
            this.completed = true;
            this.callback(null, this.testResult);
        },

        /**
         * @private
         * @param {Error} error
         */
        processError: function(error) {
            this.testResult.setError(error);
            this.removeTestListeners();
            this.complete();
        },

        /**
         * @private
         */
        removeTestListeners: function() {
            this.test.removeEventListener(Test.EventType.ASSERTION_RESULT, this.hearAssertionResult, this);
            this.test.removeEventListener(Test.EventType.SETUP_COMPLETE, this.hearSetupComplete, this);
            this.test.removeEventListener(Test.EventType.TEAR_DOWN_COMPLETE, this.hearTearDownComplete, this);
            this.test.removeEventListener(Test.EventType.TEST_ERROR, this.hearTestError, this);
            this.test.removeEventListener(Test.EventType.TEST_COMPLETE, this.hearTestComplete, this);
        },

        /**
         * @private
         */
        setupTest: function() {
            try {
                $name(this.test.getName());
                this.test.setup();
            } catch(error) {
                this.test.error(error);
            }
        },

        /**
         * @private
         */
        testTest: function() {
            try {
                $name(this.test.getName());
                this.test.test();
            } catch(error) {
                this.test.error(error);
            }
        },

        /**
         * @private
         */
        tearDownTest: function() {
            try {
                this.test.tearDown();
            } catch(error) {
                this.test.error(error);
            }
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
        hearSetupComplete: function(event) {
            this.testTest();
        },

        /**
         * @private
         * @param {Event} event
         */
        hearTearDownComplete: function(event) {
            this.removeTestListeners();
            this.complete();
        },

        /**
         * @private
         * @param {Event} event
         */
        hearTestComplete: function(event) {
            this.tearDownTest();
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
            this.processError(error);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugunit.TestRunner", TestRunner);
});
