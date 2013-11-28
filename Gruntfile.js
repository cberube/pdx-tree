/**
 * Created by nackjicholson on 11/28/13.
 */

module.exports = function(grunt) {
    var port = 8981;

    grunt.initConfig({
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
            }
        },
        watch: {
            karma: {
                files: ['src/**/*.js', 'test/unit/**/*.js'],
                tasks: ['karma:unit:run']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('dev', ['karma:unit', 'watch']);
};
