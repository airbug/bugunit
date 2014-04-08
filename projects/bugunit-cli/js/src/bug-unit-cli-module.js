//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

var bugpackApi              = require("bugpack");
var bugpack                 = bugpackApi.loadContextSync(module);
bugpack.loadExportSync("bugunit.BugUnitCli");
var BugUnitCli              = bugpack.require("bugunit.BugUnitCli");


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

module.exports = BugUnitCli;
