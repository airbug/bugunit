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

/**
 * @param {ReportCard} reportCard
 * @param {function(Throwable=)} callback
 */
var processReportCard = function(reportCard, callback) {
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
            console.log(testResult.getError().message);
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
};

var reportCardReceived = false;
var bugUnit = new BugUnit();
bugUnit.start(function(throwable, reportCard) {
    if (!throwable) {
        reportCardReceived = true;
        processReportCard(reportCard, function(throwable) {
            if (throwable) {
                console.log(throwable.message);
                console.log(throwable.stack);
                process.exit(1);
            }
        });
    } else {
        console.log(throwable.message);
        console.log(throwable.stack);
        process.exit(1);
    }
});

process.on('exit', function() {

    //TODO BRN: Improve this find to find the tests that did not complete

    if (!reportCardReceived) {
        var reportCard = bugUnit.getReportCard();
        processReportCard(reportCard, function() {
            console.log("Some tests never completed. This is likely an async test that is not completing.");
            bugUnit.getTestRunnerSet().forEach(function(testRunner) {
                if (!testRunner.isCompleted()) {
                    console.log("Test '" + testRunner.getTest().getName() + "' did not complete");
                }
            });
            process.exit(1);
        });
    }
});
