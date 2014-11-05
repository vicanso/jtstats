var gulp = require('gulp');
var jshint = require('gulp-jshint');

gulp.task('jshint', function() {
  return gulp.src('./lib/*.js')
    .pipe(jshint({
      predef : ['require', 'module'],
      node : true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('default', ['jshint']);