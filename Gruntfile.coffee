module.exports = (grunt) ->
  grunt.initConfig {
    clean : ['dest']
    coffee : 
      node :
        expand : true
        cwd : 'src'
        src : ['*.coffee']
        dest : 'dest'
        ext : '.js'
    jshint :
      all : ['dest/*.js']
      options : 
        eqnull : true
  }

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-clean'

  grunt.registerTask 'gen', ['clean', 'coffee:node', 'jshint']
  grunt.registerTask 'default', ['gen']