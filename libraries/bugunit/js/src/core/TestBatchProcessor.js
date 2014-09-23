/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestBatchProcessor')

//@Require('Class')
//@Require('Collections')
//@Require('Exception')
//@Require('Flows')
//@Require('Obj')
//@Require('Set')
//@Require('bugunit.ReportCard')
//@Require('bugunit.TestFileLoader')
//@Require('bugunit.TestRegistry')
//@Require('bugunit.TestRunner')
//@Require('bugunit.TestTagProcessor')
//@Require('bugunit.TestTagScan')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class               = bugpack.require('Class');
    var Collections         = bugpack.require('Collections');
    var Exception           = bugpack.require('Exception');
    var Flows               = bugpack.require('Flows');
    var Obj                 = bugpack.require('Obj');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var ReportCard          = bugpack.require('bugunit.ReportCard');
    var TestFileLoader      = bugpack.require('bugunit.TestFileLoader');
    var TestRegistry        = bugpack.require('bugunit.TestRegistry');
    var TestRunner          = bugpack.require('bugunit.TestRunner');
    var TestTagProcessor    = bugpack.require('bugunit.TestTagProcessor');
    var TestTagScan         = bugpack.require('bugunit.TestTagScan');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $iterableParallel   = Flows.$iterableParallel;
    var $series             = Flows.$series;
    var $task               = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var TestBatchProcessor = Class.extend(Obj, {

        _name: "bugunit.TestBatchProcessor",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {TestBatch} testBatch
         */
        _constructor: function(testBatch) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {boolean}
             */
            this.processed          = false;

            /**
             * @private
             * @type {boolean}
             */
            this.processing         = false;

            /**
             * @private
             * @type {ReportCard}
             */
            this.reportCard         = new ReportCard();

            /**
             * @private
             * @type {TestBatch}
             */
            this.testBatch          = testBatch;

            /**
             * @private
             * @type {Set.<TestRunner>}
             */
            this.testRunnerSet      = Collections.set();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {ReportCard}
         */
        getReportCard: function() {
            return this.reportCard;
        },

        /**
         * @return {TestBatch}
         */
        getTestBatch: function() {
            return this.testBatch;
        },

        /**
         * @return {Set.<TestRunner>}
         */
        getTestRunnerSet: function() {
            return this.testRunnerSet;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {boolean} logResults
         * @param {function(Throwable)} callback
         */
        processTestBatch: function(logResults, callback) {
            var _this   = this;
            if (!this.processing && !this.processed) {
                this.processing     = true;
                this.setupProcessor();
                $series([
                    $task(function (flow) {
                        _this.runTests(true, function (throwable) {
                            flow.complete(throwable);
                        });
                    })
                ]).execute(function (throwable) {
                    _this.processing    = false;
                    _this.processed     = true;
                    callback(throwable);
                });
            } else {
                callback(new Exception("IllegalState", {}, "Test batch is already processing"));
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         */
        forceFinalizeTests: function() {
            var _this = this;
            this.testRunnerSet.forEach(function(testRunner) {
                if (!testRunner.isCompleted()) {
                    testRunner.forceFinalizeTest();
                }
            });
        },

        /**
         * @private
         * @param {boolean} logResults
         * @param {function(Throwable, ReportCard=)} callback
         */
        runTests: function(logResults, callback) {
            var _this = this;
            $iterableParallel(this.testBatch.getTestSet(), function(flow, registeredTest) {
                var testRunner = new TestRunner(registeredTest, logResults);
                _this.testRunnerSet.add(testRunner);
                testRunner.runTest(function(throwable, testResult) {
                    if (!throwable) {
                        _this.reportCard.addTestResult(testResult);
                        flow.complete();
                    } else {
                        flow.error(throwable);
                    }
                });
            }).execute(callback);
        },

        /**
         * @private
         */
        setupProcessor: function() {
            var _this = this;
            process.on('exit', function() {
                _this.forceFinalizeTests();
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugunit.TestBatchProcessor', TestBatchProcessor);
});
