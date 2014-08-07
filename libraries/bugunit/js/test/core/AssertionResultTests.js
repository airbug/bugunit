/*
 * Copyright (c) 2014 airbug inc. http://airbug.com
 *
 * bugcore may be freely distributed under the MIT license.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@TestFile

//@Require('Class')
//@Require('bugmeta.BugMeta')
//@Require('bugunit.AssertionResult')
//@Require('bugunit.TestTag')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Class       = bugpack.require('Class');
    var BugMeta     = bugpack.require('bugmeta.BugMeta');
    var AssertionResult      = bugpack.require('bugunit.AssertionResult');
    var TestTag     = bugpack.require('bugunit.TestTag');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var bugmeta     = BugMeta.context();
    var test        = TestTag.test;


    //-------------------------------------------------------------------------------
    // Declare Tests
    //-------------------------------------------------------------------------------

    /**
     * This tests
     * 1) Instantiation of a new AssertionResult
     */
    var assertionResultInstantiationTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testPassed             = true;
            this.testMessage            = "testMessage";
            this.testAssertionResult    = new AssertionResult(this.testPassed, this.testMessage);
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertTrue(Class.doesExtend(this.testAssertionResult, AssertionResult),
                "Assert instance of AssertionResult");
            test.assertEqual(this.testAssertionResult.getMessage(), this.testMessage,
                "Assert AssertionResult.message was set correctly");
            test.assertEqual(this.testAssertionResult.getPassed(), this.testPassed,
                "Assert AssertionResult.passed was set correctly");
        }
    };

    /**
     * This tests
     * 1) AssertionResult#disAssertionPass test for true value
     * e) AssertionResult#disAssertionPass test for false value
     */
    var assertionResultDidAssertionPassTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testPassedAssertionResult    = new AssertionResult(true, "testMessage");
            this.testNotPassedAssertionResult    = new AssertionResult(false, "testMessage");
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertEqual(this.testPassedAssertionResult.didAssertionPass(), true,
                "Assert AssertionResult#didAssertionPass returns true for passed assertion");
            test.assertEqual(this.testNotPassedAssertionResult.didAssertionPass(), false,
                "Assert AssertionResult#didAssertionPass returns false for NOT passed assertion");
        }
    };

    /**
     * This tests
     * 1) AssertionResult#disAssertionFail test for true value
     * e) AssertionResult#disAssertionFail test for false value
     */
    var assertionResultDidAssertionFailTest = {

        // Setup Test
        //-------------------------------------------------------------------------------

        setup: function() {
            this.testPassedAssertionResult    = new AssertionResult(true, "testMessage");
            this.testNotPassedAssertionResult    = new AssertionResult(false, "testMessage");
        },


        // Run Test
        //-------------------------------------------------------------------------------

        test: function(test) {
            test.assertEqual(this.testPassedAssertionResult.didAssertionFail(), false,
                "Assert AssertionResult#didAssertionFail returns false for passed assertion");
            test.assertEqual(this.testNotPassedAssertionResult.didAssertionFail(), false,
                "Assert AssertionResult#didAssertionFail returns true for NOT passed assertion");
        }
    };


    //-------------------------------------------------------------------------------
    // BugMeta
    //-------------------------------------------------------------------------------

    bugmeta.tag(assertionResultInstantiationTest).with(
        test().name("AssertionResult - instantiation test")
    );
    bugmeta.tag(assertionResultDidAssertionPassTest).with(
        test().name("AssertionResult - #didAssertionPass test")
    );
    bugmeta.tag(assertionResultDidAssertionFailTest).with(
        test().name("AssertionResult - #didAssertionFail test")
    );
});
