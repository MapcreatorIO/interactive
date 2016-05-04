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

		jsbeautifier: {
			files : ['dist/m4n.js', 'prod/m4n.js']
		},

		less: {
			dev: {
				options: {
					cleancss: true
				},
				files: { "dist/style.css": "app/less/main.less" }
			},
			prod: {
				options: {
					cleancss: true
				},
				files: { "prod/style.css": "app/less/main.less" }
			}
		},

		template: {
			dev: {
				template: "app/js/main.js",
				dest: "dist/m4n.js"
			},
			prod: {
				template: "app/js/main.js",
				dest: "prod/m4n.js"
			}
		},

		uglify: {
			default: {
				files: {
					'prod/m4n.min.js': ['prod/m4n.js']
				}
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-template");
	grunt.loadNpmTasks("grunt-jsbeautifier");
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('default', ['template:dev', 'jsbeautifier', 'less:dev', 'watch']);
	grunt.registerTask('production', ['template:prod', 'jsbeautifier', 'uglify', 'less:prod']);
};