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

//@Export('bugunit.TestAnnotation')

//@Require('Class')
//@Require('bugmeta.Annotation')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Annotation      = bugpack.require('bugmeta.Annotation');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Annotation}
     */
    var TestAnnotation = Class.extend(Annotation, {

        _name: "bugunit.TestAnnotation",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super("Test");


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {string}
             */
            this.testName = "";
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {string}
         */
        getTestName: function() {
            return this.testName;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} testName
         */
        name: function(testName) {
            this.testName = testName;
            return this;
        }
    });


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @return {TestAnnotation}
     */
    TestAnnotation.test = function() {
        return new TestAnnotation();
    };


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export("bugunit.TestAnnotation", TestAnnotation);
});
