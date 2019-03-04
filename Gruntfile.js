module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({

        clean: [
            "dist",
            "dist_genwmap"
        ],

        copy: {
            dist_js: {
                expand: true,
                cwd: 'src',
                src: ['**/*.ts', '**/*.js'],
                dest: 'dist/'
            },
            dist_js_genwmap: {
                expand: true,
                cwd: 'src',
                src: ['**/*.ts', '**/*.js'],
                dest: 'dist_genwmap/'
            },
            dist_js_genwmap_specific: {
                expand: true,
                cwd: 'src_genwmap',
                src: ['**/*.ts', '**/*.js'],
                dest: 'dist_genwmap/'
            },
            dist_statics: {
                expand: true,
                flatten: true,
                src: ['src/plugin.json', 'src/**/*.html', 'src/**/*.svg'],
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
                    strictNullChecks: true,
                    noImplicitAny: false,
                    paths: {
                        "*": [
                            "*",
                            "node_modules/*",
                        ]
                    }
                }
            },
            build_genwmap: {
                src: ['dist_genwmap/**/*.ts', "!**/*.d.ts"],
                dest: 'dist_genwmap/',
                options: {
                    module: 'CommonJS',
                    target: 'es5',
                    rootDir: 'dist_genwmap/',
                    declaration: true,
                    emitDecoratorMetadata: true,
                    experimentalDecorators: true,
                    sourceMap: true,
                    strictNullChecks: true,
                    noImplicitAny: false,
                    paths: {
                        "*": [
                            "*",
                            "node_modules/*",
                        ]
                    }
                }
            },
        },
    });

    grunt.registerTask('default', [
        'clean',
        'copy:dist_js',
        'copy:dist_js_genwmap',
        'copy:dist_js_genwmap_specific',
        'ts:build',
        'ts:build_genwmap',
        'copy:dist_statics',
    ]);
};
