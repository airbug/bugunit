//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Require('bugunit.BugUnitCli')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugUnitCli =    bugpack.require('bugunit.BugUnitCli');


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

var targetModulePath = process.argv[2];
if (!targetModulePath) {
    throw new Error("Must specify the module to install and test");
}
targetModulePath = path.resolve(targetModulePath);

//TODO BRN: Add ability to target specific test OR a test suite.

BugUnitCli.start(targetModulePath, function(error) {
    if (error) {
        console.log(error);
        console.log(error.stack);
        process.exit(1);
    }
});
