//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Package('bugunit')

//@Export('TestFileLoader')

//@Require('Class')
//@Require('Obj')


//-------------------------------------------------------------------------------
// Common Modules
//-------------------------------------------------------------------------------

var bugpackApi  = require('bugpack');
var bugpack     = bugpackApi.context();


//-------------------------------------------------------------------------------
// BugPack
//-------------------------------------------------------------------------------

var Class       = bugpack.require('Class');
var Obj         = bugpack.require('Obj');


//-------------------------------------------------------------------------------
// Declare Class
//-------------------------------------------------------------------------------

var TestFileLoader = Class.extend(Obj, {

    //-------------------------------------------------------------------------------
    // Constructor
    //-------------------------------------------------------------------------------

    _constructor: function(modulePath) {

        this._super();


        //-------------------------------------------------------------------------------
        // Private Properties
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @type {string}
         */
        this.modulePath = modulePath;
    },


    //-------------------------------------------------------------------------------
    // Public Class Methods
    //-------------------------------------------------------------------------------

    /**
     *
     */
    load: function() {
        var targetContext = bugpackApi.context(this.modulePath);
        var registry = targetContext.getRegistry();
        var registryEntries = registry.getRegistryEntries();
        registryEntries.forEach(function(registryEntry) {
            var annotations = registryEntry.getAnnotations();
            for (var i = 0, size = annotations.length; i < size; i++) {
                var annotation = annotations[i];
                if (annotation.name === "TestFile") {
                    var bugPackSource = registryEntry.getBugPackSource();
                    bugPackSource.loadSync();
                    break;
                }
            }
        });
    }
});


//-------------------------------------------------------------------------------
// Exports
//-------------------------------------------------------------------------------

bugpack.export("bugunit.TestFileLoader", TestFileLoader);
