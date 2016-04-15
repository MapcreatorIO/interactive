module.exports = function(grunt) {

	grunt.initConfig({

		watch: {
			javascript: {
				files: [
					'app/**/*.js'
				],
				tasks: ['template', 'jsbeautifier', 'uglify']
			},
			less: {
				files: [
					'app/**/*.less'
				],
				tasks: ['less']
			}
		},

		less: {
			default: {
				options: {
					cleancss: true
				},
				files: { "dist/style.css": "app/less/main.less" }
			}
		},

		jsbeautifier: {
			files : ['dist/m4n.js']
		},

		template: {
			default: {
				template: "app/js/main.js",
				dest: "dist/m4n.js"
			}
		},

		uglify: {
			default: {
				files: {
					'dist/m4n.min.js': ['dist/m4n.js']
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-template");
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['template', 'jsbeautifier', 'uglify', 'less', 'watch']);
};