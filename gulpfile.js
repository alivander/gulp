'use strict';

const gulp = require('gulp');
const run = require('run-sequence');
const del = require('del');

const plumber = require('gulp-plumber');
const server = require('browser-sync').create();

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('build/'))
        .pipe(server.stream());
});

gulp.task('serve', function() {
    server.init({
        server: 'build/'
    });

    gulp.watch('src/*.html', ['html']);
});

gulp.task('clean', function () {
    return del('build');
});

gulp.task('build', function (done) {
    run(
        'clean',
        'html',
        done
    );
});
