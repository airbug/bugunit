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

//@Export('bugdouble.ObjectStub')

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugdouble.FunctionStub')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class           = bugpack.require('Class');
    var Map             = bugpack.require('Map');
    var Obj             = bugpack.require('Obj');
    var TypeUtil        = bugpack.require('TypeUtil');
    var FunctionStub    = bugpack.require('bugdouble.FunctionStub');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var ObjectStub = Class.extend(Obj, {

        _name: "bugdouble.ObjectStub",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {Object} targetObject
         * @param {Object} stubDeclaration
         */
        _constructor: function(targetObject, stubDeclaration) {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Map.<string, FunctionStub>}
             */
            this.functionStubs      = new Map();

            /**
             * @private
             * @type {Object}
             */
            this.stubDeclaration    = stubDeclaration;

            /**
             * @private
             * @type {Object}
             */
            this.targetObject       = targetObject;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {Object}
         */
        getTargetObject: function() {
            return this.targetObject;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         *
         */
        restore: function() {
            var _this = this;
            this.functionStubs.getKeyArray().forEach(function(functionName) {
                var functionStub = _this.functionStubs.get(functionName);
                _this.getTargetObject()[functionName] = functionStub.getTargetFunction();
            });
        },

        /**
         *
         */
        stub: function() {
            for (var functionName in this.stubDeclaration) {
                if (!TypeUtil.isFunction(this.targetObject[functionName])) {
                    throw new Error("Cannot stub '" + functionName + "' because it is not a function on the target object");
                }
                if (!TypeUtil.isFunction(this.stubDeclaration[functionName])) {
                    throw new Error("Stub is not a function '" + functionName + "'");
                }
                var functionStub = new FunctionStub(this.targetObject[functionName], this.stubDeclaration[functionName]);
                this.functionStubs.put(functionName, functionStub);
                this.targetObject[functionName] = functionStub.stub();
            }
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugdouble.ObjectStub', ObjectStub);
});
