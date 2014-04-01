module.exports = (grunt) ->
  grunt.initConfig {
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

  grunt.registerTask 'gen', ['coffee:node', 'jshint']