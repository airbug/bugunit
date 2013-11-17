//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugdouble')

//@Export('ObjectSpy')

//@Require('Class')
//@Require('Map')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugdouble.FunctionSpy')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var Map         = bugpack.require('Map');
var Obj         = bugpack.require('Obj');
var TypeUtil    = bugpack.require('TypeUtil');
var FunctionSpy = bugpack.require('bugdouble.FunctionSpy');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var ObjectSpy = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(targetObject) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {Map.<string, FunctionSpy>}
         */
        this.functionSpies = new Map();

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
    // Class Methods
    //-------------------------------------------------------------------------------

    /**
     * @param {string} functionName
     * @return {FunctionSpy}
     */
    getSpy: function(functionName) {
        return this.functionSpies.get(functionName);
    },

    /**
     *
     */
    restore: function() {
        var _this = this;
        this.functionSpies.getKeyArray().forEach(function(functionName) {
            var functionSpy = _this.functionSpies.get(functionName);
            _this.object[functionName] = functionSpy.getTargetFunction();
        });
    },

    /**
     *
     */
    spy: function() {
        for (var propertyName in this.getTargetObject()) {
            var propertyValue = this.getTargetObject()[propertyName];
            if (TypeUtil.isFunction(propertyValue)) {
                var functionSpy = new FunctionSpy(propertyValue);
                this.functionSpies.put(propertyName, functionSpy);
                this.targetObject[propertyName] = functionSpy.spy();
            }
        }
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugdouble.ObjectSpy', ObjectSpy);
