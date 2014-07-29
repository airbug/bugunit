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

//@Export('bugdouble.FunctionStub')

//@Require('Class')
//@Require('Obj')
//@Require('bugdouble.FunctionSpy')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Obj             = bugpack.require('Obj');
    var FunctionSpy     = bugpack.require('bugdouble.FunctionSpy');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var FunctionStub = Class.extend(Obj, {

        _name: "bugdouble.FunctionStub",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {function(...):*} targetFunction
         * @param {function(...):*} stubFunction
         */
        _constructor: function(targetFunction, stubFunction) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {function(...):*}
             */
            this.stubFunction       = stubFunction;

            /**
             * @private
             * @type {function(...):*}
             */
            this.targetFunction     = targetFunction;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {function(...):*}
         */
        getStubFunction: function() {
            return this.stubFunction
        },

        /**
         * @return {function(...):*}
         */
        getTargetFunction: function() {
            return this.targetFunction;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {function(...):*}
         */
        stub: function() {
            return (new FunctionSpy(this.stubFunction)).spy();
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugdouble.FunctionStub', FunctionStub);
});
