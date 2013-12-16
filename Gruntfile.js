module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		concat:{
			qnml:{
				src:['src/index.js','src/lib/*.js','src/language/*.js'],
				dest:'dest/qnml.js'
			}
		},
		uglify:{
			options:{
				banner:'/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build:{
				src:'dest/qnml.js',
				dest:'dest/qnml.min.js'
			}
		},
		watch:{
			files:['src/*.js','src/language/*.js','src/lib/*.js'],
			tasks:['concat','uglify']
		}
	});
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default',['concat','uglify']);
}