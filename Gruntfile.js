module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		concat:{
			qnml:{
				src:['src/index.js','src/lib/*.js','src/language/*.js'],
				template:['template/highlight.tpl'],
				dest:'dest/qnml.js'
			}
		},
		uglify:{
			options:{
				banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			qnml:{
				src:'dest/qnml.js',
				dest:'dest/qnml.min.js'
			}
		},
		watch:{
			files:['template/~.tpl','src/~.js'],
			tasks:['concat','uglify']
		}
	});
	grunt.loadNpmTasks('grunt-qc-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-qc-watch');

	grunt.registerTask('default',['concat','uglify']);
}
