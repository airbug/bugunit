//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestFileLoader')

//@Require('Class')
//@Require('Exception')
//@Require('Obj')
//@Require('Set')
//@Require('buganno.BugAnno')
//@Require('bugflow.BugFlow')
//@Require('bugfs.FileFinder')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpackApi              = require('bugpack');
var bugpack                 = bugpackApi.context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class                   = bugpack.require('Class');
var Exception               = bugpack.require('Exception');
var Obj                     = bugpack.require('Obj');
var Set                     = bugpack.require('Set');
var BugAnno                 = bugpack.require('buganno.BugAnno');
var BugFlow                 = bugpack.require('bugflow.BugFlow');
var FileFinder              = bugpack.require('bugfs.FileFinder');


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var $iterableParallel       = BugFlow.$iterableParallel;
var $parallel               = BugFlow.$parallel;
var $series                 = BugFlow.$series;
var $task                   = BugFlow.$task;


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var TestFileLoader = Class.extend(Obj, {

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
        var fileFinder                  = new FileFinder([".*\\.js"], []);
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
        var targetContext       = bugpackApi.context(this.modulePath);
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
