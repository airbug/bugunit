//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('BugUnit')

//@Require('Class')
//@Require('Obj')
//@Require('Set')
//@Require('bugflow.BugFlow')
//@Require('bugunit.ReportCard')
//@Require('bugunit.TestFileLoader')
//@Require('bugunit.TestRunner')
//@Require('bugunit.TestScan')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Obj             = bugpack.require('Obj');
var Set             = bugpack.require('Set');
var BugFlow         = bugpack.require('bugflow.BugFlow');
var ReportCard      = bugpack.require('bugunit.ReportCard');
var TestFileLoader  = bugpack.require('bugunit.TestFileLoader');
var TestRunner      = bugpack.require('bugunit.TestRunner');
var TestScan        = bugpack.require('bugunit.TestScan');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $forEachParallel = BugFlow.$forEachParallel;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

//TODO BRN: Add domain error support to this library

var BugUnit = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Instance Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Set.<Test>}
         */
        this.registeredTestSet  = new Set();

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
     * @return {Set.<TestRunner>}
     */
    getTestRunnerSet: function() {
        return this.testRunnerSet;
    },


    //-------------------------------------------------------------------------------
    // Public Instance Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {function(Error, ReportCard)} callback
     */
    start: function(callback) {
        this.loadAndScanTestFilesFromNodeModule(module);
        try {
            this.runTests(true, function(error, reportCard) {
                if (!error) {
                    callback(null, reportCard);
                } else {
                    callback(error);
                }
            });
        } catch(error) {
            callback(error);
        }
    },

    /**
     * @param {string} modulePath
     */
    loadAndScanTestFilesFromNodeModule: function(modulePath) {
        console.log("Running bug unit tests on module '" + modulePath + "'");
        var testFileLoader = new TestFileLoader(modulePath);
        testFileLoader.load();
        var testScan = new TestScan(modulePath, this);
        testScan.scan();
    },

    /**
     * @param {Test} test
     */
    registerTest: function(test) {
        if (!this.registeredTestSet.contains(test)) {
            this.registeredTestSet.add(test);
        }
    },

    /**
     * @param {boolean} logResults
     * @param {function(Error, ReportCard)} callback
     */
    runTests: function(logResults, callback) {
        var _this = this;
        var reportCard = new ReportCard();
        $forEachParallel(this.registeredTestSet.getValueArray(), function(flow, registeredTest) {
            var testRunner = new TestRunner(registeredTest, logResults);
            _this.testRunnerSet.add(testRunner);
            testRunner.runTest(function(error, testResult) {
                if (!error) {
                    reportCard.addTestResult(testResult);
                    flow.complete();
                } else {
                    flow.error(error);
                }
            });
        }).execute(function(error) {
            if (!error) {
                callback(null, reportCard);
            } else {
                callback(error);
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnit', BugUnit);
