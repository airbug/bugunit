//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestScan')

//@Require('Class')
//@Require('Obj')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.Test')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

var bugpackApi      = require('bugpack');
var bugpack         = bugpackApi.context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Obj             = bugpack.require('Obj');
var Test            = bugpack.require('bugunit.Test');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

/**
 * @class
 * @extends {Obj}
 */
var TestScan = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    /**
     * @constructs
     * @param {string} modulePath
     * @param {BugUnit} bugUnit
     */
    _constructor: function(modulePath, bugUnit) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {BugUnit}
         */
        this.bugUnit        = bugUnit;

        /**
         * @private
         * @type {string}
         */
        this.modulePath     = modulePath;
    },


    //-------------------------------------------------------------------------------
    // Public Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    scan: function() {
        var _this = this;
        var targetContext   = bugpackApi.context(this.modulePath);

        //NOTE BRN: We must pull BugMeta from the modules context. Otherwise the BugMeta that we pull will not
        //have any meta info registered.

        var BugMeta         = targetContext.require('bugmeta.BugMeta');
        var bugmeta         = BugMeta.context();
        var testAnnotations = /** @type {List.<TestAnnotation>} */(bugmeta.getAnnotationsByType("Test"));
        if (testAnnotations) {
            testAnnotations.forEach(function(annotation) {
                var testObject  = annotation.getAnnotationReference();
                var testName    = annotation.getTestName();
                var test        = new Test(testName, testObject);
                _this.bugUnit.registerTest(test);
            });
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.TestScan", TestScan);
