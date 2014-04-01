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
// Declare Properties
//-------------------------------------------------------------------------------

buildProperties({
    packageJson: {
        name: "bugunit",
        version: "0.0.14",
        main: "./lib/bug-unit-cli-module.js",
        private: true,
        bin: "bin/bugunit",
        scripts: {
            start: "node ./scripts/bugunit-cli-start.js"
        },
        dependencies: {
            npm: "1.2.x",
            tar: "0.1.x",
            bugpack: "https://s3.amazonaws.com/deploy-airbug/bugpack-0.0.5.tgz"
        }
    },
    sourcePaths: [
        "../bugjs/projects/bugjs/js/src",
        "../bugjs/projects/bugfs/js/src",
        "../bugjs/projects/bugflow/js/src",
        '../bugjs/projects/bugtrace/js/src',
        "./projects/bugunit-cli/js/src"
    ],
    scriptPaths: [
        "./projects/bugunit-cli/js/scripts"
    ],
    binPaths: [
        "./projects/bugunit-cli/bin"
    ]
});


//-------------------------------------------------------------------------------
// Declare Tasks
//-------------------------------------------------------------------------------


//-------------------------------------------------------------------------------
// Declare Flows
//-------------------------------------------------------------------------------

// Clean Flow
//-------------------------------------------------------------------------------

buildTarget("clean").buildFlow(
    targetTask("clean")
);


// Local Flow
//-------------------------------------------------------------------------------

buildTarget("local").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we"re not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        targetTask("createNodePackage", {
            properties: {
                packageJson: buildProject.getProperty("packageJson"),
                sourcePaths: buildProject.getProperty("sourcePaths"),
                binPaths: buildProject.getProperty("binPaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask("packNodePackage", {
            properties: {
                packageName: buildProject.getProperty("packageJson.name"),
                packageVersion: buildProject.getProperty("packageJson.version")
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version"));
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


// Prod Flow
//-------------------------------------------------------------------------------

buildTarget("prod").buildFlow(
    series([

        // TODO BRN: This "clean" task is temporary until we"re not modifying the build so much. This also ensures that
        // old source files are removed. We should figure out a better way of doing that.

        targetTask("clean"),
        targetTask("createNodePackage", {
            properties: {
                packageJson: buildProject.getProperty("packageJson"),
                sourcePaths: buildProject.getProperty("sourcePaths")
            }
        }),
        targetTask('generateBugPackRegistry', {
            init: function(task, buildProject, properties) {
                var nodePackage = nodejs.findNodePackage(
                    buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version")
                );
                task.updateProperties({
                    sourceRoot: nodePackage.getBuildPath()
                });
            }
        }),
        targetTask("packNodePackage", {
            properties: {
                packageName: buildProject.getProperty("packageJson.name"),
                packageVersion: buildProject.getProperty("packageJson.version")
            }
        }),
        targetTask("s3PutFile", {
            init: function(task, buildProject, properties) {
                var packedNodePackage = nodejs.findPackedNodePackage(buildProject.getProperty("packageJson.name"),
                    buildProject.getProperty("packageJson.version"));
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