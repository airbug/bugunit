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

//@Export('bugunit.TestTagProcessor')

//@Require('Class')
//@Require('Obj')
//@Require('bugmeta.ITagProcessor')
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
    var ITagProcessor   = bugpack.require('bugmeta.ITagProcessor');
    var Test            = bugpack.require('bugunit.Test');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     * @implements {ITagProcessor}
     */
    var TestTagProcessor = Class.extend(Obj, {

        _name: "bugunit.TestTagScan",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {BugUnit} bugUnit
         */
        _constructor: function(bugUnit) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {BugUnit}
             */
            this.bugUnit        = bugUnit;
        },


        //-------------------------------------------------------------------------------
        // ITagProcessor Implementation
        //-------------------------------------------------------------------------------

        /**
         * @param {Tag} tag
         */
        process: function(tag) {
            this.processTestTag(/** @type {TestTag} */(tag));
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {string} testName
         * @param {{}} testObject
         * @return {Test}
         */
        factoryTest: function(testName, testObject) {
            return new Test(testName, testObject);
        },

        /**
         * @private
         * @param {TestTag} testTag
         */
        processTestTag: function(testTag) {
            var testObject  = testTag.getTagReference();
            var testName    = testTag.getTestName();
            var test        = this.factoryTest(testName, testObject);
            this.bugUnit.registerTest(test);
        }
    });


    //-------------------------------------------------------------------------------
    // Implement Interfaces
    //-------------------------------------------------------------------------------

    Class.implement(TestTagProcessor, ITagProcessor);


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugunit.TestTagProcessor", TestTagProcessor);
});
