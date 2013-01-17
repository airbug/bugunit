//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var bugunit = require('../lib/bug-unit-module');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var modulePath = process.cwd();
if (process.argv.length >= 2) {
    modulePath = process.argv[2];
}

//TODO BRN: Add ability to target specific test OR a test suite.

bugunit.loadAndScanTestFilesFromNodeModule(modulePath);
bugunit.runTests(true);
