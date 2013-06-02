//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugdouble')

//@Export('ObjectStub')

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugdouble.FunctionStub')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


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

var ObjectStub = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(targetObject, stubDeclaration) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Map.<string, FunctionStub>}
         */
        this.functionStubs = new Map();

        /**
         * @private
         * @type {Object}
         */
        this.stubDeclaration = stubDeclaration;

        /**
         * @private
         * @type {Object}
         */
        this.targetObject = targetObject;
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
    // Public Class Methods
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
