module.exports = function(grunt) {

	grunt.initConfig({

		watch: {
			javascript: {
				files: [
					'app/**/*.js'
				],
				tasks: ['template', 'jsbeautifier']
			},
			less: {
				files: [
					'app/**/*.less'
				],
				tasks: ['less']
			}
		},

		jsbeautifier: {
			files : ['dist/m4n.js']
		},

		less: {
			default: {
				options: {
					cleancss: true
				},
				files: { "dist/style.css": "app/less/main.less" }
			}
		},

		template: {
			default: {
				template: "app/js/main.js",
				dest: "dist/m4n.js"
			}
		},

		uglify: {
			options: {
				report: 'gzip'
			},
			default: {
				files: {
					'dist/m4n.min.js': ['dist/m4n.js']
				}
			}
		},

		copy: {
			default: {
				files: [
					{
						expand: true,
						cwd: 'include/',
						src: '**',
						dest: 'dist/'
					},
					{
						src: 'readme.txt',
						dest: 'dist/'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-template");
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['template', 'jsbeautifier', 'less', 'watch']);
	grunt.registerTask('production', ['template', 'jsbeautifier', 'uglify', 'less', 'copy']);
};
