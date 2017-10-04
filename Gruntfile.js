module.exports = function (grunt) {
    grunt.initConfig({
        ts: {
            default: {
                src: ['src/**/*.ts'],
                outDir: 'dist',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
                    rootDir: 'src',
                    sourceMap: true,
                    declaration: true,
                    lib: ["es2017", "dom"],
                    allowSyntheticDefaultImports: true
                }
            }
        },
        copy: {
            main: {
                files: [
                    // makes all src relative to cwd
                    {
                        expand: true,
                        cwd: "src/",
                        src: ['lib/jquery-3.2.1.js', 'config/log4js.json', 'lib/lodash.js'],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        src: ['package.json'],
                        dest: 'dist/'
                    }
                ]
            }
        }
    });

    //加载typescript编译插件
    grunt.loadNpmTasks('grunt-ts');

    //复制图片这类的静态资源
    grunt.loadNpmTasks('grunt-contrib-copy');


    //执行的任务列表
    grunt.registerTask('default', ['ts', 'copy']);
};

