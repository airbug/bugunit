//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpackApi  = require("bugpack");
var path        = require('path');


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

bugpackApi.loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExport("buganno.AnnotationParserProcess", function(error) {
            if (!error) {
                var BugUnitCli  = bugpack.require('bugunit.BugUnitCli');
                var targetModulePath = process.argv[2];
                if (!targetModulePath) {
                    throw new Error("Must specify the module to install and test");
                }
                targetModulePath = path.resolve(targetModulePath);

                //TODO BRN: Add ability to target specific test OR a test suite.

                BugUnitCli.start(targetModulePath, function(error) {
                    if (error) {
                        console.log(error.message);
                        console.log(error.stack);
                        process.exit(1);
                    }
                });

            } else {
                console.error(error.message);
                console.error(error.stack);
                process.exit(1);
            }
        });
    } else {
        console.error(error.message);
        console.error(error.stack);
        process.exit(1);
    }
});
