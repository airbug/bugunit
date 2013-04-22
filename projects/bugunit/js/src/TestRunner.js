//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('TestRunner')

//@Require('Class')
//@Require('List')
//@Require('Test')
//@Require('TestResult')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var List = bugpack.require('List');

var Test = bugpack.require('bugunit.Test');
var TestResult = bugpack.require('bugunit.TestResult');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

//TODO BRN: Merge this back in to BugUnit
var TestRunner = {};


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {Test} test
 * @param {boolean} logResults
 * @param {function(Error, TestResult)} callback
 */
TestRunner.runTest = function(test, logResults, callback) {
    var testResult = new TestResult(test);
    var hearAssertionResult = function(event) {
        var assertionResult = event.getData();
        if (logResults) {
            console.log(assertionResult.getMessage());
        }
        testResult.addAssertionResult(assertionResult);
    };
    test.addEventListener(Test.EventType.ASSERTION_RESULT, hearAssertionResult);
    var hearTestError = function(event) {
        var error = event.getData();
        if (logResults) {
            console.log("Error occurred - message:" + error.message);
        }
        if (logResults) {
            console.log("Aborted test [" + test.getName() + "]");
        }
        testResult.setError(error);
        test.removeEventListener(Test.EventType.ASSERTION_RESULT, hearAssertionResult);
        test.removeEventListener(Test.EventType.TEST_ERROR, hearTestError);
        test.removeEventListener(Test.EventType.TEST_COMPLETE, hearTestComplete);
        callback(null, testResult);
    };
    test.addEventListener(Test.EventType.TEST_ERROR, hearTestError);
    var hearTestComplete = function(event) {
        if (logResults) {
            console.log("Running test [" + test.getName() + "]");
        }
        if (logResults) {
            console.log("Completed test [" + test.getName() + "]");
        }
        test.removeEventListener(Test.EventType.ASSERTION_RESULT, hearAssertionResult);
        test.removeEventListener(Test.EventType.TEST_ERROR, hearTestError);
        test.removeEventListener(Test.EventType.TEST_COMPLETE, hearTestComplete);
        callback(null, testResult);
    };
    test.addEventListener(Test.EventType.TEST_COMPLETE, hearTestComplete);
    test.runTest();
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.TestRunner", TestRunner);
