//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('TestScan')

//@Require('Annotate')
//@Require('Class')
//@Require('Obj')
//@Require('bugunit.BugUnit')
//@Require('bugunit.Test')

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Annotate = bugpack.require('Annotate');
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

    _constructor: function() {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    scan: function() {
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
