//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('BugUnitApi')

//@Require('bugunit.BugUnit')
//@Require('bugunit.TestScan')
//@Require('bugunit.TestFileLoader')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugUnit =           bugpack.require('bugunit.BugUnit');
var TestScan =          bugpack.require('bugunit.TestScan');
var TestFileLoader =    bugpack.require('bugunit.TestFileLoader');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugUnitApi = {};


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {function(Error)} callback
 */
BugUnitApi.start = function(callback) {
    BugUnitApi.loadAndScanTestFilesFromNodeModule(module);
    try {
        BugUnitApi.runTests(true, function(error, reportCard) {
            if (!error) {
                console.log("Number of PASSED tests: " + reportCard.numberPassedTests());
                console.log("Number of FAILED tests: " + reportCard.numberFailedTests());

                var errorOccurred = false;
                var testsFailed = false;
                reportCard.getFailedTestResultList().forEach(function(testResult) {
                    testsFailed = true;
                    console.log("Test '" + testResult.getTest().getName() + "' FAILED with " + testResult.numberFailedAssertions() + " of " +
                        testResult.numberAssertions() + " failed assertions.");
                    testResult.getFailedAssertionResultList().forEach(function(assertionResult) {
                        console.log(assertionResult.getMessage());
                    });
                    if (testResult.errorOccurred()) {
                        errorOccurred = true;
                        console.log("An error occurred while running this test.");
                        console.log(testResult.getError().stack);
                    }
                });
                if (errorOccurred) {
                    callback(new Error("Error occurred while running tests."));
                } else if (testsFailed) {
                    callback(new Error("Some tests failed while running the tests"));
                } else {
                    callback();
                }
            } else {
                callback(error);
            }
        });

    } catch(error) {
        callback(error);
    }
};

/**
 * @param {string} modulePath
 */
BugUnitApi.loadAndScanTestFilesFromNodeModule = function(modulePath) {
    console.log("Running bug unit tests on module '" + modulePath + "'");
    var testFileLoader = new TestFileLoader(modulePath);
    testFileLoader.load();
    var testScan = new TestScan(modulePath);
    testScan.scan();
};

/**
 * @param {Test} test
 */
BugUnitApi.registerTest = function(test) {
    BugUnit.registerTest(test);
};

/**
 * @param {boolean} logResults
 * @param {function(Error, ReportCard)} callback
 */
BugUnitApi.runTests = function(logResults, callback) {
    BugUnit.runTests(logResults, callback);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnitApi', BugUnitApi);
