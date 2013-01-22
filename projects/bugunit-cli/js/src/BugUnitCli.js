//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('BugUnitCli')

//@Require('BugFlow')
//@Require('BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context(module);
var child_process = require('child_process');
var path = require('path');


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
// Declare Class
//-------------------------------------------------------------------------------

var BugUnitCli = {};


//-------------------------------------------------------------------------------
// Private Static Variables
//-------------------------------------------------------------------------------

/**
 * @private
 * @type {string}
 */
BugUnitCli.installPath = process.cwd() + "/.bugunit";


//-------------------------------------------------------------------------------
// Public Static Methods
//-------------------------------------------------------------------------------

/**
 * NOTE BRN: This code accomplishes the following steps
 * 1) Creates a new directory '.bugunit' in the directory that 'bugunit' was run
 * 2) Installs the target module specified in the command line to ./.bugunit/node_modules
 * 3) Installs bugunit in to the target module after the target module has been specified
 * 4) Calls node ./.bugunit/node_modules/[targetModule]/node_modules/bugunit/scripts/bugunit-run.js to start the tests
 */
BugUnitCli.start = function(targetModulePath) {
    var targetModuleInstalledPath = null;
    $series([
        $task(function(flow) {
            BugUnitCli.createInstallDir(BugUnitCli.installPath, function(error) {
                flow.complete(error);
            });
        }),
        $task(function(flow) {
            BugUnitCli.installNodeModule(targetModulePath, BugUnitCli.installPath, function(error, data) {
                if (!error) {
                    targetModuleInstalledPath = data.installedPath;
                    flow.complete();
                } else {
                    flow.error(error);
                }
            });
        }),
        $task(function(flow) {
            BugFs.exists(path.join(targetModuleInstalledPath, "scripts/bugunit-run.js"), function(exists) {
                if (exists) {
                    flow.complete();
                } else {
                    flow.error(new Error("Target test module must include bugunit scripts and classes in order to run unit tests"));
                }
            });
        }),
        $task(function(flow) {
            child_process.exec('node ' + targetModuleInstalledPath + '/scripts/bugunit-run.js', {cwd: targetModuleInstalledPath, env: process.env},
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
};


//-------------------------------------------------------------------------------
// Private Static Methods
//-------------------------------------------------------------------------------

/**
 * @param {string} installPath
 * @param {function(Error)} callback
 */
BugUnitCli.createInstallDir = function(installPath, callback) {
    BugFs.createDirectory(installPath + "/node_modules", callback);
};

/**
 * @private
 * @param {string} modulePath
 * @param {string} installPath
 * @param {function(Error, Object)} callback
 */
BugUnitCli.installNodeModule = function(modulePath, installPath, callback) {
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
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnitCli', BugUnitCli);
