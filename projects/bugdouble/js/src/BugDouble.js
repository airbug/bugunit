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

//@Export('bugdouble.BugDouble')

//@Require('Class')
//@Require('Obj')
//@Require('bugdouble.FunctionSpy')
//@Require('bugdouble.FunctionStub')
//@Require('bugdouble.ObjectSpy')
//@Require('bugdouble.ObjectStub')


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
    var FunctionStub    = bugpack.require('bugdouble.FunctionStub');
    var ObjectSpy       = bugpack.require('bugdouble.ObjectSpy');
    var ObjectStub      = bugpack.require('bugdouble.ObjectStub');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var BugDouble = Class.extend(Obj, {
        _name: "bugdouble.BugDouble"
    });


    //-------------------------------------------------------------------------------
    // Static Methods
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @param {function(...):*} targetFunction
     * @return {function(...):*}
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
     * @param {function(...):*} targetFunction
     * @param {function(...):*} stubFunction
     * @return {function(...):*}
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
});
