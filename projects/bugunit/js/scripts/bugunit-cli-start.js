//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var child_process = require('child_process');
var path = require('path');

var bugunit = require('../lib/bug-unit-module');


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var BugFlow =   bugpack.require('bugflow.BugFlow');
var BugFs =     bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $series = BugFlow.$series;
var $task = BugFlow.$task;


//-------------------------------------------------------------------------------
// Bootstrap
//-------------------------------------------------------------------------------

targetModulePath = process.argv[2];
if (!targetModulePath) {
    throw new Error("Must specify the module to install and test");
}
targetModulePath = path.resolve(targetModulePath);

//TODO BRN: Add ability to target specific test OR a test suite.

//NOTE BRN: This code accomplishes the following steps
// 1) Creates a new directory '.bugunit' in the directory that 'bugunit' was run
// 2) Installs the target module specified in the command line to ./.bugunit/node_modules
// 3) Installs bugunit in to the target module after the target module has been specified
// 4) Calls node ./.bugunit/node_modules/[targetModule]/node_modules/bugunit/scripts/bugunit-run.js to start the tests

var installPath = process.cwd() + "/.bugunit";
var bugunitPath = path.resolve(path.dirname(module.filename), "..");
var targetModuleInstalledPath = null;
var installedBugUnitPath = null;
$series([
    $task(function(flow) {
        createInstallDir(installPath, function(error) {
            flow.complete(error);
        });
    }),
    $task(function(flow) {
        installNodeModule(targetModulePath, installPath, function(error, data) {
            if (!error) {
                targetModuleInstalledPath = data.installedPath;
                flow.complete();
            } else {
                flow.error(error);
            }
        });

    }),
    $task(function(flow) {
        installNodeModule(bugunitPath, targetModuleInstalledPath, function(error, data) {
            if (!error) {
                installedBugUnitPath = data.installedPath;
                flow.complete();
            } else {
                flow.error(error);
            }
        });
    }),
    $task(function(flow) {
        child_process.exec('node ' + installedBugUnitPath + '/scripts/bugunit-run.js', {cwd: installedBugUnitPath, env: process.env},
            function (error, stdout, stderr) {
                console.log(stdout);
                if (!error) {
                    flow.complete();
                } else {
                    console.log(stderr);
                    flow.error(error);
                }
            }
        );
    })
]).execute(function(error) {
    if (error) {
        console.log(error);
        console.log(error.stack);
        process.exit(1);
    }
});

/**
 * @param {string} installPath
 * @param {function(Error)} callback
 */
function createInstallDir(installPath, callback) {
    BugFs.createDirectory(installPath + "/node_modules", callback);
}

/**
 * @private
 * @param {string} modulePath
 * @param {string} installPath
 * @param {function(Error, Object)} callback
 */
function installNodeModule(modulePath, installPath, callback) {
    var child = child_process.exec('npm install "' + modulePath + '"', {cwd: installPath, env: process.env},
        function (error, stdout, stderr) {
            if (!error) {
                console.log(stdout);
                var lines = stdout.split("\n");
                var parts = lines[0].split(" ");
                var nameAndVersion = parts.shift();
                var nameAndVersionParts = nameAndVersion.split("@");
                var installedPath = path.resolve(path.join(installPath, parts.join(" ")));
                var data = {
                    installedPath: installedPath,
                    name: nameAndVersionParts[0],
                    version: nameAndVersionParts[1]
                };
                callback(null, data);
            } else {
                console.log(stderr);
                callback(error);
            }
        }
    );
}
