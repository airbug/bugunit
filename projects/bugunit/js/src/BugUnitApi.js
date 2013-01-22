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
 *
 */
BugUnitApi.start = function() {
    BugUnitApi.loadAndScanTestFilesFromNodeModule(module);
    var reportCard = BugUnitApi.runTests(true);

    console.log("Number of PASSED tests: " + reportCard.numberPassedTests());
    console.log("Number of FAILED tests: " + reportCard.numberFailedTests());

    reportCard.getFailedTestResultList().forEach(function(testResult) {
        console.log("Test '" + testResult.getTest().getName() + "' FAILED with " + testResult.numberFailedAssertions() + " of " +
            testResult.numberAssertions() + " failed assertions.");
        testResult.getFailedAssertionResultList().forEach(function(assertionResult) {
            console.log(assertionResult.getMessage());
        });
        if (testResult.errorOccurred()) {
            console.log("An error occurred while running this test.");
            console.log(testResult.getError().stack);
        }
    });
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
 * @return {ReportCard}
 */
BugUnitApi.runTests = function(logResults) {
    return BugUnit.runTests(logResults);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnitApi', BugUnitApi);
