//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('TestScan')

//@Require('Class')
//@Require('Obj')
//@Require('annotate.Annotate')
//@Require('bugunit.BugUnit')
//@Require('bugunit.Test')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpackApi = require('bugpack');
var bugpack = bugpackApi.context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class = bugpack.require('Class');
var Obj = bugpack.require('Obj');
var BugUnit = bugpack.require('bugunit.BugUnit');
var Test = bugpack.require('bugunit.Test');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var TestScan = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(modulePath) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.modulePath = modulePath;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    scan: function() {
        var targetContext = bugpackApi.context(this.modulePath);

        //NOTE BRN: We must pull Annotate from the modules context. Otherwise the Annotate that we pull will not
        //have any annotations registered.

        var Annotate = targetContext.require('annotate.Annotate');
        var testAnnotations = Annotate.getAnnotationsByType("Test");
        if (testAnnotations) {
            testAnnotations.forEach(function(annotation) {
                var testObject = annotation.getReference();
                var testName = annotation.getName();
                var test = new Test(testName, testObject);
                BugUnit.registerTest(test);
            });
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.TestScan", TestScan);
