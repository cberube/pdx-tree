/**
 * Created by nackjicholson on 11/28/13.
 */

module.exports = function(grunt) {
    var port = 8981;

    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'src/pdx-tree.js',
                    'src/services/PdxTreeChildManagerService.js',
                    'src/directives/PdxTree.js',
                    'src/directives/PdxTreeBranch.js',
                    'src/directives/PdxTreeItem.js'
                ],
                dest: 'pdx-tree.js'
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
            travis: {
                configFile: 'config/karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        watch: {
            karma: {
                files: ['src/**/*.js', 'test/unit/**/*.js'],
                tasks: ['karma:unit:run']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('dev', ['karma:unit', 'watch']);
    grunt.registerTask('test', ['karma:travis']);
    grunt.registerTask('example', ['connect:server:keepalive']);
};
