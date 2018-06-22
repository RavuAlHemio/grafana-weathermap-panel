module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({

        clean: ["dist"],

        copy: {
            dist_js: {
                expand: true,
                cwd: 'src',
                src: ['**/*.ts'],
                dest: 'dist/'
            },
            dist_statics: {
                expand: true,
                flatten: true,
                src: ['src/plugin.json', 'src/**/*.html'],
                dest: 'dist/'
            }
        },

        ts: {
            build: {
                src: ['dist/**/*.ts', "!**/*.d.ts"],
                dest: 'dist/',
                options: {
                    module: 'system',
                    target: 'es5',
                    rootDir: 'dist/',
                    declaration: true,
                    emitDecoratorMetadata: true,
                    experimentalDecorators: true,
                    sourceMap: true,
                    noImplicitAny: false,
                }
            },
        },
    });

    grunt.registerTask('default', [
        'clean',
        'copy:dist_js',
        'ts:build',
        'copy:dist_statics',
    ]);
};
