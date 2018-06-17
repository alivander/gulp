'use strict';

const gulp = require('gulp');
const run = require('run-sequence');
const rename = require('gulp-rename');
const del = require('del');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const csso = require('gulp-csso');

const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const jsmin = require('gulp-uglyfly');
const concat = require('gulp-concat');

const plumber = require('gulp-plumber');
const server = require('browser-sync').create();

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(plumber())
        .pipe(gulp.dest('build/'))
        .pipe(server.stream());
});

gulp.task('style', function () {
    return gulp.src('src/scss/style.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            require('postcss-flexbugs-fixes'),
            autoprefixer({
                browsers: [
                    '>1%',
                    'last 4 versions',
                    'Firefox ESR',
                    'not ie < 11',
                ],
                flexbox: 'no-2009',
            })
        ]))
        .pipe(csso())
        .pipe(rename('style.min.css'))
        .pipe(gulp.dest('build/css'))
        .pipe(server.stream());
});

gulp.task('script', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(jsmin())
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('build/js'))
});

gulp.task('serve', function() {
    server.init({
        server: 'build/'
    });

    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/sass/**/*.{scss,sass}', ['style']);
    gulp.watch('src/js/**/*.js', ['script']);
});

gulp.task('clean', function () {
    return del('build');
});

gulp.task('build', function (done) {
    run(
        'clean',
        'style',
        'html',
        'script',
        done
    );
});
