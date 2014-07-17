/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
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
