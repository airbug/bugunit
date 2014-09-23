/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

//TODO BRN: Update this file to use process message passing to send back any error that might occur.

require('bugpack').loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExports(["Tracer", "bugunit.BugUnit"], function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // Common Modules
                //-------------------------------------------------------------------------------

                var path        = require('path');


                //-------------------------------------------------------------------------------
                // BugPack
                //-------------------------------------------------------------------------------

                var Tracer    = bugpack.require('Tracer');
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
                    if (reportCard.numberIncompleteTests() > 0) {
                        console.log("Number of INCOMPLETE tests: " + reportCard.numberIncompleteTests());
                        console.log("Some tests never completed. This is likely an async test that is not completing.");
                    }

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

                    reportCard.getIncompleteTestResultList().forEach(function (testResult) {
                        console.log("Test '" + testResult.getTest().getName() + "' did not complete");
                        var stack = Tracer.getNamedStack(testResult.getTest().getName());
                        if (stack) {
                            console.log("Last stack: ", stack);
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

                BugUnit.startAllTestsOnPath(process.cwd(), function(throwable, reportCard) {
                    if (!throwable) {
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
