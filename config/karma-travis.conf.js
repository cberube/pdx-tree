module.exports = function(config){
    config.set({
        basePath : '../',

        files : [
            'bower_components/angular/angular.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'dist/pdx-tree.min.js',
            'test/unit/**/*.js'
        ],

        exclude : [
            'bower_components/angular-scenario/angular-scenario.js'
        ],

        autoWatch : false,

        frameworks: ['jasmine'],

        browsers : ['Chrome'],

        plugins : [
            'karma-junit-reporter',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }
    })};
