//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Require('bugunit.BugUnit')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugUnit = bugpack.require('bugunit.BugUnit');


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

var reportCardReceived = false;
var bugUnit = new BugUnit();
bugUnit.start(function(error, reportCard) {
    if (!error) {
        reportCardReceived = true;

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
                console.log(testResult.getError());
                console.log(testResult.getError().stack);
            }
        });
        if (errorOccurred) {
            error = new Error("Error occurred while running tests.");
        } else if (testsFailed) {
            error = new Error("Some tests failed while running the tests");
        }
    }

    if (error) {
        console.error(error);
        console.error(error.stack);
        process.exit(1);
    }
});

process.on('exit', function() {

    //TODO BRN: Improve this find to find the tests that did not complete

    if (!reportCardReceived) {
        console.error("Tests never completed. This is likely an async test that is not completing.");
        bugUnit.getTestRunnerSet().forEach(function(testRunner) {
            if (!testRunner.isCompleted()) {
                console.log("Test '" + testRunner.getTest().getName() + "' did not complete");
            }
        });
        process.exit(1);
    }
});
