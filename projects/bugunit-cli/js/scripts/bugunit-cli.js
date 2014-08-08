/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Script
//-------------------------------------------------------------------------------

require("bugpack").loadContext(module, function(error, bugpack) {
    if (!error) {
        bugpack.loadExport("bugunit.BugUnitCli", function(error) {
            if (!error) {

                //-------------------------------------------------------------------------------
                // Common Modules
                //-------------------------------------------------------------------------------

                var path        = require('path');

                var BugUnitCli  = bugpack.require('bugunit.BugUnitCli');
                var targetModulePath = process.argv[2];
                if (!targetModulePath) {
                    throw new Error("Must specify the module to install and test");
                }
                targetModulePath = path.resolve(targetModulePath);

                //TODO BRN: Add ability to target specific test OR a test suite.

                BugUnitCli.start(targetModulePath, {checkCoverage: true}, function(error) {
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
