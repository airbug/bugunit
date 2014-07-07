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

//@Export('bugdouble.FunctionSpy')

//@Require('ArgUtil')
//@Require('Class')
//@Require('List')
//@Require('Obj')
//@Require('Proxy')
//@Require('bugdouble.FunctionCall')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var ArgUtil         = bugpack.require('ArgUtil');
    var Class           = bugpack.require('Class');
    var List            = bugpack.require('List');
    var Obj             = bugpack.require('Obj');
    var Proxy           = bugpack.require('Proxy');
    var FunctionCall    = bugpack.require('bugdouble.FunctionCall');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var FunctionSpy = Class.extend(Obj, {

        _name: "bugdouble.FunctionSpy",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {function(...):*} targetFunction
         */
        _constructor: function(targetFunction) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {List.<FunctionCall>}
             */
            this.functionCallList   = new List();

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
        getTargetFunction: function() {
            return this.targetFunction;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @return {number}
         */
        getCallCount: function() {
            return this.functionCallList.getCount();
        },

        /**
         * @return {function(...):*}
         */
        spy: function() {
            var _this = this;
            var spy = function() {
                /** @type {Array.<*>} */
                var args = ArgUtil.toArray(arguments);
                var functionCall = new FunctionCall(args);
                _this.functionCallList.add(functionCall);
                return _this.targetFunction.apply(this, args);
            };
            Proxy.proxy(spy, _this, [
                "getCallCount",
                "wasCalled",
                "wasNotCalled"
            ]);
            return spy;
        },

        /**
         * @return {boolean}
         */
        wasCalled: function() {
            return this.functionCallList.getCount() > 0;
        },

        /**
         * @return {boolean}
         */
        wasNotCalled: function() {
            return this.functionCallList.getCount() === 0;
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugdouble.FunctionSpy', FunctionSpy);
});
