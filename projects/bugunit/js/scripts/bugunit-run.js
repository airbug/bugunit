//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Require('bugunit.BugUnitApi')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var path = require('path');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugUnitApi = bugpack.require('bugunit.BugUnitApi');


BugUnitApi.start(function(error) {
    if (error) {
        console.error(error);
        console.error(error.stack);
        process.exit(1);
    }
});
