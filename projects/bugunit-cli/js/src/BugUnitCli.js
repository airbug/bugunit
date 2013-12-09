//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('BugUnitCli')

//@Require('Bug')
//@Require('bugflow.BugFlow')
//@Require('bugfs.BugFs')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack         = require('bugpack').context(module);
var child_process   = require('child_process');
var fs              = require('fs');
var path            = require('path');
var tar             = require('tar');
var zlib            = require('zlib');


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Bug             = bugpack.require('Bug');
var BugFlow         = bugpack.require('bugflow.BugFlow');
var BugFs           = bugpack.require('bugfs.BugFs');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $if             = BugFlow.$if;
var $series         = BugFlow.$series;
var $task           = BugFlow.$task;


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
 * @param {string} targetModulePath
 * @param {function(Error)} callback
 */
BugUnitCli.start = function(targetModulePath, callback) {
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
            var bugunitRunScriptPath = path.join(targetModuleInstalledPath, "scripts/bugunit-run.js");
            BugFs.exists(bugunitRunScriptPath, function(exists) {
                if (exists) {
                    flow.complete();
                } else {
                    flow.error(new Error("Target test module must include bugunit scripts and classes in order to " +
                        "run unit tests. Could not find bugunit-run script at '" + bugunitRunScriptPath + "'"));
                }
            });
        }),
        $task(function(flow) {
            var childProcess = child_process.spawn('node', [targetModuleInstalledPath + '/scripts/bugunit-run.js'], {cwd: targetModuleInstalledPath, env: process.env});
            childProcess.stdout.setEncoding('utf8');
            childProcess.stdout.on('data', function (data) {
                console.log(data);
            });
            childProcess.stderr.setEncoding('utf8');
            childProcess.stderr.on('data', function (data) {
                console.log(data);
            });
            childProcess.on('close', function (code) {
                if (code !== 0) {
                    flow.error(new Bug("BugUnit completed with an error"));
                } else {
                    flow.complete();
                }
            });
        })
    ]).execute(function(throwable) {
        if (callback) {
            callback(throwable);
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
 * @param {function(Throwable, Object)=} callback
 */
BugUnitCli.installNodeModule = function(modulePath, installPath, callback) {
    BugUnitCli.getModuleData(modulePath, function(throwable, moduleData) {
        if (!throwable) {
            var npmDirname = path.dirname(require.resolve('npm'));
            var npmBin = path.resolve(npmDirname, "../..", ".bin/npm");

            //TODO BRN: Change out this call for child_process.spawn. this will prevent buffer overflow errors.

            var child = child_process.spawn(npmBin, ['install', modulePath], {cwd: installPath, env: process.env});
            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function (data) {
                console.log(data);
            });
            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function (data) {
                console.log(data);
            });
            child.on('close', function (code) {
                //tEST
                console.log("EXIT CODE - code:", code);
                if (code !== 0) {
                    callback(new Bug("InstallError", {}, "An error occurred during install of module '" + modulePath + "'"));
                } else {
                    var installedPath = BugFs.joinPaths([installPath, "node_modules", moduleData.name]).getAbsolutePath();
                    var data = {
                        installedPath: installedPath,
                        name: moduleData.name,
                        version: moduleData.version
                    };
                    callback(null, data);
                }
            });
        } else {
            callback(throwable);
        }
    });
};

/**
 * @private
 * @param {string} modulePathString
 * @param {function(Error, {
 *      name: string,
 *      version: string
 * })} callback
 */
BugUnitCli.getModuleData = function(modulePathString, callback) {
    var modulePath = BugFs.path(modulePathString);
    var moduleData = null;
    $if (function(flow) {
            modulePath.isDirectory(function(error, result) {
                if (!error) {
                    flow.assert(result);
                } else {
                    flow.error(error);
                }
            });
        },
        $task(function(flow) {
            BugUnitCli.getModuleDataFromFolder(modulePath, function(error, data) {
                if (!error) {
                    moduleData = data;
                    flow.complete();
                } else {
                    flow.error(error);
                }
            });
        })
    ).$elseIf (function(flow) {
            modulePath.isFile(function(error, result) {
                if (!error) {
                    flow.assert(result);
                } else {
                    flow.error(error);
                }
            });
        },
        $task(function(flow) {
            var ext = BugFs.path(modulePath).getExtName();
            if (ext === ".tgz") {
                BugUnitCli.getModuleDataFromTarball(modulePath, function(error, data) {
                    if (!error) {
                        moduleData = data;
                        flow.complete();
                    } else {
                        flow.error(error);
                    }
                });
            } else {
                flow.error(new Error("Not a module '" + modulePath.getAbsolutePath() + "'"));
            }
        })
    ).$else (
        $task(function(flow) {
            flow.error(new Error("Cannot open module '" + modulePath.getAbsolutePath() + "' because it is an " +
                "unknown type."));
        })
    ).execute(function(error) {
        callback(error, moduleData);
    });
};

/**
 * @private
 * @param {Path} modulePath
 * @param {function(Error, {
 *     name: string,
 *     version: string
 * })} callback
 */
BugUnitCli.getModuleDataFromFolder = function(modulePath, callback) {
    var packageJsonPath = BugFs.joinPaths(modulePath, "package.json");
    var moduleData = {};
    $if (function(flow) {
            packageJsonPath.isFile(function(error, result) {
                if (!error) {
                    flow.assert(result);
                } else {
                    flow.error(error);
                }
            });
        },
        $task(function(flow) {
            //TODO BRN: retrieve the name and version data from the package.json file
        })
    ).$else (
        $task(function(flow) {
            flow.error(new Error("Cannot get module data from '" + modulePath.getAbsolutePath() + "' because " +
                "the package.json file cannot be found"));
        })
    ).execute(function(error) {
        if (!error) {
            callback(null, moduleData);
        } else {
            callback(error);
        }
    });
};

/**
 * @private
 * @param {Path} modulePath
 * @param {function(Error, {
 *     name: string,
 *     version: string
 * })} callback
 */
BugUnitCli.getModuleDataFromTarball = function(modulePath, callback) {
    var moduleData = null;
    var packageJsonFound = false;
    var readStream = fs.createReadStream(modulePath.getAbsolutePath());
    readStream.pipe(zlib.createGunzip()).pipe(tar.Parse())
        .on("entry", function (entry) {
            if (entry.props.path === "package/package.json") {
                packageJsonFound = true;
                var jsonString = "";
                entry.on("data", function (c) {
                    jsonString += c.toString();
                });
                entry.on("end", function () {
                    moduleData = JSON.parse(jsonString);

                    //TODO BRN: No need to look any further

                    //readStream.destroy();
                });
            }
        })
        .on("end", function() {
            readStream.destroy();
            if (!packageJsonFound) {
                callback(new Error("Could not find package.json in file '" + modulePath.getAbsolutePath() + "'"));
            } else {
                callback(null, moduleData);
            }
        });
};

//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugunit.BugUnitCli', BugUnitCli);
