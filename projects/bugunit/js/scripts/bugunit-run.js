var path = require('path');
var bugunit = require('../lib/bug-unit-module');

// Find the module that bugunit has been installed to

var modulePath = path.resolve(path.dirname(module.filename), "../../..");
bugunit.loadAndScanTestFilesFromNodeModule(modulePath);
var reportCard = bugunit.runTests(true);

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

