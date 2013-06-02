//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugdouble')

//@Export('BugDouble')

//@Require('bugdouble.FunctionSpy')
//@Require('bugdouble.FunctionStub')
//@Require('bugdouble.ObjectSpy')
//@Require('bugdouble.ObjectStub')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpack = require('bugpack').context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var FunctionSpy     = bugpack.require('bugdouble.FunctionSpy');
var FunctionStub    = bugpack.require('bugdouble.FunctionStub');
var ObjectSpy       = bugpack.require('bugdouble.ObjectSpy');
var ObjectStub      = bugpack.require('bugdouble.ObjectStub');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var BugDouble = {};


//-------------------------------------------------------------------------------
// Static Methods
//-------------------------------------------------------------------------------

/**
 * @static
 * @param {function()} targetFunction
 * @return {function()}
 */
BugDouble.spyOnFunction = function(targetFunction) {
    return (new FunctionSpy(targetFunction)).spy();
};

/**
 * @static
 * @param {Object} targetObject
 * @return {ObjectSpy}
 */
BugDouble.spyOnObject = function(targetObject) {
    var objectSpy = new ObjectSpy(targetObject);
    objectSpy.spy();
    return objectSpy;
};

/**
 * @static
 * @param {function()} targetFunction
 * @param {function()} stubFunction
 * @return {function()}
 */
BugDouble.stubFunction = function(targetFunction, stubFunction) {
    return (new FunctionStub(targetFunction, stubFunction)).stub();
};

/**
 * @static
 * @param {Object} targetObject
 * @param {Object} stubDeclaration
 * @return {ObjectStub}
 */
BugDouble.stubObject = function(targetObject, stubDeclaration) {
    var objectStub = new ObjectStub(targetObject, stubDeclaration);
    objectStub.stub();
    return objectStub;
};


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export('bugdouble.BugDouble', BugDouble);
