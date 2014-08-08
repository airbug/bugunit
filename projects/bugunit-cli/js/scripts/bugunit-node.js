/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


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
