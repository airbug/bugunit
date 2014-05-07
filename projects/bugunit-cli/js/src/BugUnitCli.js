/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.BugUnitCli')

//@Require('Bug')
//@Require('Class')
//@Require('Obj')
//@Require('Proxy')
//@Require('bugflow.BugFlow')
//@Require('npm.Npm')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // Common Modules
    //-------------------------------------------------------------------------------

    var child_process   = require('child_process');


    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug             = bugpack.require('Bug');
    var Class           = bugpack.require('Class');
    var Obj             = bugpack.require('Obj');
    var Proxy           = bugpack.require('Proxy');
    var BugFlow         = bugpack.require('bugflow.BugFlow');
    var Npm             = bugpack.require('npm.Npm');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $series         = BugFlow.$series;
    var $task           = BugFlow.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BugUnitCli = Class.extend(Obj, {

        _name: "bugunit.BugUnitCli",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {string}
             */
            this.installPath    = process.cwd() + "/.bugunit";

            /**
             * @private
             * @type {Npm}
             */
            this.npm            = new Npm();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * NOTE BRN: This code accomplishes the following steps
         * 1) Creates a new directory '.bugunit' in the directory that 'bugunit' was run
         * 2) Installs the target module specified in the command line to ./.bugunit/node_modules
         * 3) Installs bugunit in to the target module after the target module has been specified
         * 4) Calls node ./.bugunit/node_modules/[targetModule]/node_modules/bugunit/scripts/bugunit-run.js to start the tests
         * @param {string} targetModulePath
         * @param {{
         *      checkCoverage: boolean
         * }} options
         * @param {function(Throwable=)} callback
         */
        start: function(targetModulePath, options, callback) {
            var _this               = this;
            var checkCoverage       = options.checkCoverage || false;
            var targetModuleInstalledPath = null;
            $series([
                $task(function(flow) {
                    _this.npm.createInstallDir(_this.installPath, function(throwable) {
                        flow.complete(throwable);
                    });
                }),
                $task(function(flow) {
                    _this.npm.installNodeModule(targetModulePath, _this.installPath, function(throwable, data) {
                        if (!throwable) {
                            targetModuleInstalledPath = data.installedPath;
                            flow.complete();
                        } else {
                            flow.error(throwable);
                        }
                    });
                }),
                $task(function(flow) {
                    var childProcess = null;
                    if (checkCoverage) {
                        //TODO BRN: This binary coverage is a bit hacky. Doesn't protect from version change and not very easy to extract results.
                        var args = [];
                        args.push("cover");
                        args.push("--root");
                        args.push(targetModuleInstalledPath + "/lib");
                        args.push("--dir");
                        args.push(_this.installPath);
                        args.push(targetModuleInstalledPath + "/scripts/bugunit-run.js");
                        childProcess = child_process.spawn('istanbul', args, {cwd: targetModuleInstalledPath, env: process.env});
                    } else {
                        childProcess = child_process.spawn('node', [targetModuleInstalledPath + "/scripts/bugunit-run.js"], {cwd: targetModuleInstalledPath, env: process.env});
                    }
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
                            flow.error(new Bug("BugUnitError", {}, "BugUnit completed with an error"));
                        } else {
                            flow.complete();
                        }
                    });
                })
            ]).execute(callback);
        }
    });


    //-------------------------------------------------------------------------------
    // Private Static Variables
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @private
     * @type {BugUnitCli}
     */
    BugUnitCli.instance = null;


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {BugUnitCli}
     */
    BugUnitCli.getInstance = function() {
        if (BugUnitCli.instance === null) {
            BugUnitCli.instance = new BugUnitCli();
        }
        return BugUnitCli.instance;
    };


    //-------------------------------------------------------------------------------
    // Static Proxy
    //-------------------------------------------------------------------------------

    Proxy.proxy(BugUnitCli, Proxy.method(BugUnitCli.getInstance), [
        "start"
    ]);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugunit.BugUnitCli', BugUnitCli);
});
