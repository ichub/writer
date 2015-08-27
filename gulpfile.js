var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('sass', function () {
    gulp.src('./styles/stylus/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./styles/stylus'));
});

gulp.task('default', ['sass'], function () {

});

