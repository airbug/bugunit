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

//@Export('bugunit.TestScan')

//@Require('Class')
//@Require('Obj')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.Test')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

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

        _name: "bugunit.TestScan",


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
            var targetContext   = require('bugpack').context(this.modulePath);

            //NOTE BRN: We must pull BugMeta from the modules context. Otherwise the BugMeta that we pull will not
            //have any meta info registered.

            var BugMeta         = targetContext.require('bugmeta.BugMeta');
            var bugmeta         = BugMeta.context();
            var testTags = /** @type {List.<TestTag>} */(bugmeta.getTagsByType("Test"));
            if (testTags) {
                testTags.forEach(function(annotation) {
                    var testObject  = annotation.getTagReference();
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
});
