var gulp = require('gulp');
var ts = require('gulp-typescript');
var start = require('gulp-start-process');

gulp.task('build', function() {
	return gulp.src('src/*.ts')
    .pipe(ts({
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task('run', ['build'], function(cb) {
	return start('(node dist/writer.js example.hbs meta.json; open compiled.pdf)', cb);
});

gulp.task('default', ['run'], function() {

});