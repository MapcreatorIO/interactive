module.exports = function(grunt) {

	// All tasks required for 1 build
	var task = ['template', 'jsbeautifier', 'less', 'uglify'];

	grunt.initConfig({

		watch: {
			default: {
				files: [
					'app/**/*.js',
					'app/**/*.less'
				],
				tasks: task
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

	grunt.registerTask('default', task.concat('watch'));
};