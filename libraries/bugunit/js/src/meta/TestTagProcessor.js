/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
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
         * @param {TestRegistry} testRegistry
         */
        _constructor: function(testRegistry) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {TestRegistry}
             */
            this.testRegistry        = testRegistry;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {TestRegistry}
         */
        getTestRegistry: function() {
            return this.testRegistry;
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
            this.testRegistry.registerTest(test);
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
