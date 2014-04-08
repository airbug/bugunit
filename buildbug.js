//-------------------------------------------------------------------------------
// Requires
//-------------------------------------------------------------------------------

var buildbug            = require("buildbug");


//-------------------------------------------------------------------------------
// Simplify References
//-------------------------------------------------------------------------------

var buildProject        = buildbug.buildProject;
var buildProperties     = buildbug.buildProperties;
var buildTarget         = buildbug.buildTarget;
var enableModule        = buildbug.enableModule;
var series              = buildbug.series;
var targetTask          = buildbug.targetTask;


//-------------------------------------------------------------------------------
// Enable Modules
//-------------------------------------------------------------------------------

var aws                 = enableModule("aws");
var bugpack             = enableModule("bugpack");
var core                = enableModule("core");
var nodejs              = enableModule("nodejs");


//-------------------------------------------------------------------------------
// Values
//-------------------------------------------------------------------------------

var version             = "0.1.0";
var dependencies        = {
    bugpack: "0.1.5",
    npm: "1.2.x",
    tar: "0.1.x"
};


//-------------------------------------------------------------------------------
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    node: {
        packageJson: {
            name: "bugunit",
            version: version,
            main: "./lib/bug-unit-cli-module.js",
            private: true,
            bin: "bin/bugunit",
            scripts: {
                start: "node ./scripts/bugunit-cli-start.js"
            },
            dependencies: dependencies
        },
        sourcePaths: [
            "../bugcore/projects/bugcore/js/src",
            "../bugflow/projects/bugflow/js/src",
            "../bugfs/projects/bugfs/js/src",
            '../bugtrace/projects/bugtrace/js/src',
            "./projects/bugunit-cli/js/src"
        ],
        scriptPaths: [
            "./projects/bugunit-cli/js/scripts",
            "./projects/bugunit/js/scripts"
        ],
        binPaths: [
            "./projects/bugunit-cli/bin"
        ]
    }
});


//-------------------------------------------------------------------------------
// Declare BuildTasks
//-------------------------------------------------------------------------------

// Clean BuildTask
//-------------------------------------------------------------------------------

buildTarget("clean").buildFlow(
    targetTask("clean")
);


// Local BuildTask
//-------------------------------------------------------------------------------

buildTarget("local").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we"re not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        targetTask("createNodePackage", {
            properties: {
                binPaths: buildProject.getProperty("node.binPaths"),
                packageJson: buildProject.getProperty("node.packageJson"),
                scriptPaths: buildProject.getProperty("node.scriptPaths"),
                sourcePaths: buildProject.getProperty("node.sourcePaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask("packNodePackage", {
            properties: {
                packageName: "{{node.packageJson.name}}",
                packageVersion: "{{node.packageJson.version}}"
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: "public-read",
                        encrypt: true
                    }
                });
            },
            properties: {
                bucket: "{{local-bucket}}"
            }
        })
    ])
).makeDefault();


// Prod BuildTask
//-------------------------------------------------------------------------------

buildTarget("prod").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we"re not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        targetTask("createNodePackage", {
            properties: {
                binPaths: buildProject.getProperty("node.binPaths"),
                packageJson: buildProject.getProperty("node.packageJson"),
                scriptPaths: buildProject.getProperty("node.scriptPaths"),
                sourcePaths: buildProject.getProperty("node.sourcePaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask("packNodePackage", {
            properties: {
                packageName: buildProject.getProperty("node.packageJson.name"),
                packageVersion: buildProject.getProperty("node.packageJson.version")
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("node.packageJson.name"),
                    buildProject.getProperty("node.packageJson.version"));
                task.updateProperties({
                    file: packedNodePackage.getFilePath(),
                    options: {
                        acl: "public-read",
                        encrypt: true
                    }
                });
            },
            properties: {
                bucket: "{{prod-deploy-bucket}}"
            }
        })
    ])
);