/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.BugUnit')

//@Require('Class')
//@Require('Flows')
//@Require('Obj')
//@Require('Proxy')
//@Require('bugfs.BugFs')
//@Require('bugunit.TestBatch')
//@Require('bugunit.TestBatchProcessor')
//@Require('bugunit.TestFileLoader')
//@Require('bugunit.TestRegistry')
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
    var Flows               = bugpack.require('Flows');
    var Obj                 = bugpack.require('Obj');
    var Proxy               = bugpack.require('Proxy');
    var BugFs               = bugpack.require('bugfs.BugFs');
    var TestBatch           = bugpack.require('bugunit.TestBatch');
    var TestBatchProcessor  = bugpack.require('bugunit.TestBatchProcessor');
    var TestFileLoader      = bugpack.require('bugunit.TestFileLoader');
    var TestRegistry        = bugpack.require('bugunit.TestRegistry');
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
    var BugUnit = Class.extend(Obj, {

        _name: "bugunit.BugUnit",


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
             * @type {TestRegistry}
             */
            this.testRegistry       = new TestRegistry();
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {TestRegistry}
         */
        getTestRegistry: function() {
            return this.testRegistry;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {(string | Path)} testPath
         * @param {function(Throwable, ReportCard=)} callback
         */
        startAllTestsOnPath: function(testPath, callback) {
            testPath        = BugFs.path(testPath);
            var _this       = this;
            var reportCard  = null;
            $series([
                $task(function(flow) {

                    //TODO BRN: Improve this so that we can load tests from a path and then store them in memory for repeat calls to test a path

                    _this.loadAndScanTestFilesFromTestPath(testPath, function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.runTests(_this.testRegistry.getAllTests(), true, function(throwable, returnedReportCard) {
                        if (!throwable) {
                            reportCard = returnedReportCard;
                        }
                        flow.complete(throwable);
                    });

                })
            ]).execute(function(throwable) {
                if (!throwable) {
                    callback(null, reportCard);
                } else {
                    callback(throwable);
                }
            });
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Path} testPath
         * @param {function(Error=)} callback
         */
        loadAndScanTestFilesFromTestPath: function(testPath, callback) {
            console.log("Running bug unit tests on path '" + testPath.getAbsolutePath() + "'");
            var _this           = this;
            var testFileLoader  = new TestFileLoader(testPath);
            testFileLoader.load(function(throwable) {
                if (!throwable) {
                    var targetContext   = require('bugpack').context(testPath);

                    //NOTE BRN: We must pull BugMeta from the modules context. Otherwise the BugMeta that we pull will not
                    //have any meta info registered.

                    var BugMeta         = targetContext.require('bugmeta.BugMeta');
                    var metaContext     = BugMeta.context();
                    var testTagScan     = new TestTagScan(metaContext, new TestTagProcessor(_this.testRegistry));
                    try {
                        testTagScan.scanAll();
                    } catch(caughtThrowable) {
                        throwable = caughtThrowable;
                    }
                    callback(throwable);
                } else {
                    callback(throwable);
                }
            });
        },

        /**
         * @private
         * @param {ICollection.<Test>} testCollection
         * @param {boolean} logResults
         * @param {function(Throwable, ReportCard=)} callback
         */
        runTests: function(testCollection, logResults, callback) {
            var testBatch           = this.factoryTestBatch(testCollection);
            var testBatchProcessor  = this.factoryTestBatchProcessor(testBatch);
            $series([
                $task(function(flow) {
                    testBatchProcessor.processTestBatch(logResults,  function(throwable) {
                        flow.complete(throwable);
                    });
                })
            ]).execute(function(throwable) {
                if (!throwable) {
                    callback(null, testBatchProcessor.getReportCard());
                } else {
                    callback(throwable);
                }
            });
        },


        //-------------------------------------------------------------------------------
        // Factory Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {(Array.<Test> | ICollection.<Test>)} tests
         * @return {TestBatch}
         */
        factoryTestBatch: function(tests) {
            return new TestBatch(tests);
        },

        /**
         * @private
         * @param {TestBatch} testBatch
         * @return {TestBatchProcessor}
         */
        factoryTestBatchProcessor: function(testBatch) {
            return new TestBatchProcessor(testBatch);
        }
    });


    //-------------------------------------------------------------------------------
    // Private Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {BugUnit}
     */
    BugUnit.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {BugUnit}
     */
    BugUnit.getInstance = function() {
        if (BugUnit.instance === null) {
            BugUnit.instance = new BugUnit();
        }
        return BugUnit.instance;
    };


    //-------------------------------------------------------------------------------
    // Static Proxy
    //-------------------------------------------------------------------------------

    Proxy.proxy(BugUnit, Proxy.method(BugUnit.getInstance), [
        "startAllTestsOnPath"
    ]);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugunit.BugUnit', BugUnit);
});
