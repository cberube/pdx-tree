/**
 * Created by nackjicholson on 11/28/13.
 */

module.exports = function(grunt) {
    var port = 8981;

    grunt.initConfig({
        "pkg": grunt.file.readJSON('package.json'),
        concat: {
            options: {
                'stripBanners': true
            },
            dist: {
                src: [
                    'src/pdx-tree.js',
                    'src/services/child-strategy/PdxTreeNestedImplementation.js',
                    'src/services/child-strategy/PdxTreeSiblingImplementation.js',
                    'src/services/PdxTreeChildManagerService.js',
                    'src/services/PdxTreeDomService.js',
                    'src/directives/PdxTree.js',
                    'src/directives/PdxTreeItem.js',
                    'src/directives/PdxTreeChildren.js',
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        connect: {
            server: {
                options: {
                    port: port,
                    base: '.'
                }
            }
        },
        karma: {
            unit: {
                configFile: 'config/karma.conf.js',
                background: true
            },
            "unit-dist": {
                configFile: 'config/karma-dist.conf.js',
                singleRun: true,
                background: false,
                browsers: ['PhantomJS']
            },
            "unit-dist-min": {
                configFile: 'config/karma-dist-min.conf.js',
                singleRun: true,
                background: false,
                browsers: ['PhantomJS']
            },
            travis: {
                configFile: 'config/karma-travis.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        watch: {
            karma: {
                files: ['src/**/*.js', 'test/unit/**/*.js'],
                tasks: ['karma:unit:run']
            }
        },
        "uglify": {
            "dist": {
                "files": {
                    "dist/<%= pkg.name %>.min.js": ["<%= concat.dist.dest %>"]
                }
            },
            "options": {
                "mangle": false
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('dev', ['karma:unit', 'watch']);
    grunt.registerTask('test', ['karma:travis']);
    grunt.registerTask('example', ['connect:server:keepalive']);
    grunt.registerTask('dist', ['concat', 'uglify', 'karma:unit-dist', 'karma:unit-dist-min']);
};
