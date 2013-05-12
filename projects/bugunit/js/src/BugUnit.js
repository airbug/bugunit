//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('BugUnit')

//@Require('Set')
//@Require('bugflow.BugFlow')
//@Require('bugunit.ReportCard')
//@Require('bugunit.TestRunner')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Set =           bugpack.require('Set');
var BugFlow =       bugpack.require('bugflow.BugFlow');
var ReportCard =    bugpack.require('bugunit.ReportCard');
var TestRunner =    bugpack.require('bugunit.TestRunner');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $foreachParallel = BugFlow.$foreachParallel;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugUnit = {};


//-------------------------------------------------------------------------------
// Static Variables
//-------------------------------------------------------------------------------

/**
 * @private
 * @type {Set<Test>}
 */
BugUnit.registeredTestSet = new Set();


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {Test} test
 */
BugUnit.registerTest = function(test) {
    if (!BugUnit.registeredTestSet.contains(test)) {
        BugUnit.registeredTestSet.add(test);
    }
};

/**
 * @param {boolean} logResults
 * @param {function(Error, ReportCard)} callback
 */
BugUnit.runTests = function(logResults, callback) {
    var reportCard = new ReportCard();
    $foreachParallel(BugUnit.registeredTestSet.getValueArray(), function(flow, registeredTest) {
        TestRunner.runTest(registeredTest, logResults, function(error, testResult) {
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
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnit', BugUnit);
