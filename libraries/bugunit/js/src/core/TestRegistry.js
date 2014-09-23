/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * bugunit may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugunit.TestRegistry')

//@Require('ArgumentBug')
//@Require('Class')
//@Require('Collections')
//@Require('Exception')
//@Require('Obj')
//@Require('TypeUtil')
//@Require('bugunit.Test')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var ArgumentBug     = bugpack.require('ArgumentBug');
    var Class           = bugpack.require('Class');
    var Collections     = bugpack.require('Collections');
    var Exception       = bugpack.require('Exception');
    var Obj             = bugpack.require('Obj');
    var TypeUtil        = bugpack.require('TypeUtil');
    var Test            = bugpack.require('buganno.Test');


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var TestRegistry = Class.extend(Obj, {

        _name: "bugunit.TestRegistry",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         */
        _constructor: function() {

            this._super();


            //-------------------------------------------------------------------------------
            // Private Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {Map.<string, Test>}
             */
            this.testNameToTestMap     = Collections.map();
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {string} testName
         * @return {Test}
         */
        getTestByName: function(testName) {
            var test = this.testNameToTestMap.get(testName);
            if (!test) {
                throw new Exception("TestNotFound", {}, "Could not find test by the name '" + testName + "'");
            }
            return test;
        },

        /**
         * @param {(Array.<string> | ICollection.<string>)} testNames
         * @return {ICollection.<Test>}
         */
        getTestsByName: function(testNames) {
            var _this = this;
            return Collections.ensureStreamable(testNames)
                .stream()
                .map(function(testName) {
                    return _this.getTestByName(testName);
                })
                .collectSync(Collections.collection());
        },

        /**
         * @return {ICollection.<Test>}
         */
        getAllTests: function() {
            return this.testNameToTestMap.getValueCollection();
        },

        /**
         * @param {Test} test
         */
        registerTest: function(test) {
            if (!Class.doesExtend(test, Test)) {
                throw new ArgumentBug(ArgumentBug.ILLEGAL, "test", test, "parameter must extend Test");
            }
            if (!TypeUtil.isString(test.getName())) {
                throw new ArgumentBug(ArgumentBug.ILLEGAL, "test", test, "Test must have name property set");
            }
            this.testNameToTestMap.put(test.getName(), test);
        }
    });


    //-------------------------------------------------------------------------------
    // Exports
    //-------------------------------------------------------------------------------

    bugpack.export('bugunit.TestRegistry', TestRegistry);
});
