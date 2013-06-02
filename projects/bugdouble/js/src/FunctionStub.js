//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugdouble')

//@Export('FunctionStub')

//@Require('Class')
//@Require('Obj')
//@require('bugdouble.FunctionSpy')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class           = bugpack.require('Class');
var Obj             = bugpack.require('Obj');
var FunctionSpy     = bugpack.require('bugdouble.FunctionSpy');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var FunctionStub = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(targetFunction, stubFunction) {

        this._super();


        //-------------------------------------------------------------------------------
        // Declare Variables
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {function()}
         */
        this.stubFunction = stubFunction;

        /**
         * @private
         * @type {Object}
         */
        this.targetFunction = targetFunction;
    },


    //-------------------------------------------------------------------------------
    // Getters and Setters
    //-------------------------------------------------------------------------------

    /**
     * @return {function()}
     */
    getStubFunction: function() {
        return this.stubFunction
    },

    /**
     * @return {function()}
     */
    getTargetFunction: function() {
        return this.targetFunction;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    stub: function() {
        return (new FunctionSpy(this.stubFunction)).spy();
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugdouble.FunctionStub', FunctionStub);
