//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack     = require('bugpack');
var path        = require('path');


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

//TODO BRN: Update this file to use process message passing to send back any error that might occur.

bugpack.loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["bugtrace.BugTrace", "bugunit.BugUnit"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var BugTrace    = bugpack.require('bugtrace.BugTrace');
                var BugUnit     = bugpack.require('bugunit.BugUnit');


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
                bugUnit.start(process.cwd(), function(throwable, reportCard) {
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
                        processReportCard(reportCard, function(throwable) {
                            if (!throwable) {
                                console.log("Some tests never completed. This is likely an async test that is not completing.");
                                bugUnit.getTestRunnerSet().forEach(function (testRunner) {
                                    if (!testRunner.isCompleted()) {
                                        console.log("Test '" + testRunner.getTest().getName() + "' did not complete");
                                        var stack = BugTrace.getNamedStack(testRunner.getTest().getName());
                                        if (stack) {
                                            console.log("Last stack: ", stack);
                                        }
                                    }
                                });
                                process.exit(1);
                            } else {
                                console.log(throwable.message);
                                console.log(throwable.stack);
                                process.exit(1);
                            }
                        });
                    }
                });

            } else {
                console.log(error.message);
                console.log(error.stack);
                process.exit(1);
            }
        });
    } else {
        console.log(error.message);
        console.log(error.stack);
        process.exit(1);
    }
});
