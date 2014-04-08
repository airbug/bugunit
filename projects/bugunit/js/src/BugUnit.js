//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.BugUnit')

//@Require('Class')
//@Require('Obj')
//@Require('Set')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')
//@Require('bugunit.ReportCard')
//@Require('bugunit.TestFileLoader')
//@Require('bugunit.TestRunner')
//@Require('bugunit.TestScan')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack                 = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var Obj                     = bugpack.require('Obj');
var Set                     = bugpack.require('Set');
var BugFlow                 = bugpack.require('bugflow.BugFlow');
var BugFs                   = bugpack.require('bugfs.BugFs');
var ReportCard              = bugpack.require('bugunit.ReportCard');
var TestFileLoader          = bugpack.require('bugunit.TestFileLoader');
var TestRunner              = bugpack.require('bugunit.TestRunner');
var TestScan                = bugpack.require('bugunit.TestScan');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $forEachParallel        = BugFlow.$forEachParallel;
var $series                 = BugFlow.$series;
var $task                   = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var BugUnit = Class.extend(Obj, {

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
         * @type {Set.<Test>}
         */
        this.registeredTestSet  = new Set();

        /**
         * @private
         * @type {ReportCard}
         */
        this.reportCard         = new ReportCard();
        
        /**
         * @private
         * @type {Set.<TestRunner>}
         */
        this.testRunnerSet      = new Set();
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
     * @return {Set.<TestRunner>}
     */
    getTestRunnerSet: function() {
        return this.testRunnerSet;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------


    /**
     * @param {Test} test
     */
    registerTest: function(test) {
        if (!this.registeredTestSet.contains(test)) {
            this.registeredTestSet.add(test);
        }
    },

    /**
     * @param {(string | Path)} testPath
     * @param {function(Throwable, ReportCard=)} callback
     */
    start: function(testPath, callback) {
        testPath        = BugFs.path(testPath);
        var _this       = this;
        var reportCard  = null;
        $series([
            $task(function(flow) {
                _this.loadAndScanTestFilesFromTestPath(testPath, function(throwable) {
                    flow.complete(throwable);
                });
            }),
            $task(function(flow) {
                _this.runTests(true, function(throwable, returnedReportCard) {
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
                var testScan    = new TestScan(testPath, _this);
                try {
                    testScan.scan();
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
     * @param {boolean} logResults
     * @param {function(Throwable, ReportCard=)} callback
     */
    runTests: function(logResults, callback) {
        var _this = this;
        $forEachParallel(this.registeredTestSet.getValueArray(), function(flow, registeredTest) {
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
        }).execute(function(throwable) {
            if (!throwable) {
                callback(null, _this.reportCard);
            } else {
                callback(throwable);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnit', BugUnit);
