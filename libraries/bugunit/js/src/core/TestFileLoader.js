/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestFileLoader')

//@Require('Class')
//@Require('Exception')
//@Require('Flows')
//@Require('Obj')
//@Require('Set')
//@Require('buganno.BugAnno')
//@Require('bugfs.FileFinder')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var Exception   = bugpack.require('Exception');
    var Flows       = bugpack.require('Flows');
    var Obj         = bugpack.require('Obj');
    var Set         = bugpack.require('Set');
    var BugAnno     = bugpack.require('buganno.BugAnno');
    var FileFinder  = bugpack.require('bugfs.FileFinder');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var $parallel   = Flows.$parallel;
    var $series     = Flows.$series;
    var $task       = Flows.$task;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var TestFileLoader = Class.extend(Obj, {

        _name: "bugunit.TestFileLoader",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Path} modulePath
         */
        _constructor: function(modulePath) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {BugAnno}
             */
            this.bugAnno        = new BugAnno();

            /**
             * @private
             * @type {Path}
             */
            this.modulePath     = modulePath;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {function(Throwable=)} callback
         */
        load: function(callback) {
            var _this                       = this;
            var fileFinder                  = new FileFinder([".*\\.js"], [".*node_modules$"]);
            var filePaths                   = null;
            var annotationRegistryLibrary   = null;
            $series([
                $parallel([
                    $task(function(flow) {
                        fileFinder.scan([_this.modulePath], function(throwable, _filePaths) {
                            if (!throwable) {
                                filePaths = _filePaths;
                            }
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        _this.bugAnno.initialize(function(throwable) {
                            flow.complete(throwable);
                        });
                    })
                ]),
                $task(function(flow) {
                    _this.bugAnno.parse(filePaths, function(throwable, returnedAnnotationRegistryLibrary) {
                        if (!throwable) {
                            annotationRegistryLibrary = returnedAnnotationRegistryLibrary;
                        }
                        flow.complete(throwable);
                    });
                }),
                $parallel([
                    $task(function(flow) {
                        _this.bugAnno.deinitialize(function(throwable) {
                            flow.complete(throwable);
                        });
                    }),
                    $task(function(flow) {
                        _this.findAndLoadTestFiles(annotationRegistryLibrary, function(throwable) {
                            flow.complete(throwable);
                        });
                    })
                ])
            ]).execute(callback);
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {AnnotationRegistryLibrary} annotationRegistryLibrary
         * @param {function(Throwable=)} callback
         */
        findAndLoadTestFiles: function(annotationRegistryLibrary, callback) {
            var testFiles       = this.findTestFiles(annotationRegistryLibrary);
            this.loadTestFiles(testFiles, callback);
        },

        /**
         * @private
         * @param {AnnotationRegistry} annotationRegistry
         * @return {boolean}
         */
        findTestFileAnnotation: function(annotationRegistry) {
            var annotationList = annotationRegistry.getAnnotationList();
            for (var i = 0, size = annotationList.getCount(); i < size; i++) {
                var annotation = annotationList.getAt(i);
                var type = annotation.getAnnotationType();
                if (type === "TestFile") {
                    return true;
                }
            }
            return false;
        },

        /**
         * @private
         * @param {AnnotationRegistryLibrary} annotationRegistryLibrary
         * @return {Array.<string>}
         */
        findTestFiles: function(annotationRegistryLibrary) {
            var _this           = this;
            var testFiles       = [];
            annotationRegistryLibrary.getAnnotationRegistryList().forEach(function(annotationRegistry) {
                var isTestFile = _this.findTestFileAnnotation(annotationRegistry);
                if (isTestFile) {
                    testFiles.push(annotationRegistry.getFilePath().getAbsolutePath());
                }
            });
            return testFiles;
        },

        /**
         * @private
         * @param {Array.<string>} testFiles
         * @param {function(Throwable=)} callback
         */
        loadTestFiles: function(testFiles, callback) {
            var targetContext       = require('bugpack').context(this.modulePath);
            targetContext.loadSources(testFiles, function(error) {
                if (!error) {
                    callback();
                } else {
                    callback(new Exception("BugPackError", {}, "An error occurred in teh bugpack system", [error]));
                }
            });
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugunit.TestFileLoader", TestFileLoader);
});
