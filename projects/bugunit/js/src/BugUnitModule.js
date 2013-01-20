//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('BugUnitModule')

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

var BugUnitModule = {};


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {string} modulePath
 */
BugUnitModule.loadAndScanTestFilesFromNodeModule = function(modulePath) {
    console.log("Running bug unit tests on module '" + modulePath + "'");
    var testFileLoader = new TestFileLoader(modulePath);
    testFileLoader.load();
    var testScan = new TestScan(modulePath);
    testScan.scan();
};

/**
 * @param {Test} test
 */
BugUnitModule.registerTest = function(test) {
    BugUnit.registerTest(test);
};

/**
 * @param {boolean} logResults
 * @return {ReportCard}
 */
BugUnitModule.runTests = function(logResults) {
    return BugUnit.runTests(logResults);
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnitModule', BugUnitModule);
