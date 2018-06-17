const gulp = require('gulp');
const run = require('run-sequence');
const rename = require('gulp-rename');
const cache = require('gulp-cache');
const del = require('del');

const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const flexbugsfixes = require('postcss-flexbugs-fixes');
const csso = require('gulp-csso');

const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const jsmin = require('gulp-uglyfly');
const concat = require('gulp-concat');

const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');

const plumber = require('gulp-plumber');
const server = require('browser-sync').create();

gulp.task('html', () => gulp.src('src/*.html')
    .pipe(plumber())
    .pipe(gulp.dest('build/'))
    .pipe(server.stream()));

gulp.task('style', () => gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
        flexbugsfixes,
        autoprefixer({
            browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 11',
            ],
            flexbox: 'no-2009',
        }),
    ]))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream()));

gulp.task('script', () => gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env'],
    }))
    .pipe(jsmin())
    .pipe(concat('script.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js')));

gulp.task('images', () => gulp.src('src/img/**/*')
    .pipe(plumber())
    .pipe(cache(imagemin([
        imagemin.optipng({
            optimizationLevel: 3,
        }),
        imagemin.jpegtran({
            rogressive: true,
        }),
        imagemin.svgo(),
    ])))
    .pipe(gulp.dest('build/img'))
    .pipe(server.stream()));

gulp.task('webp', () => gulp.src('src/img/**/*.{png,jpg,jpeg,gif}')
    .pipe(plumber())
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest('build/img')));

gulp.task('sprite', () => gulp.src('build/img/sprite-*.svg')
    .pipe(plumber())
    .pipe(svgstore({
        inlineSvg: true,
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img')));

gulp.task('serve', () => {
    server.init({
        server: 'build/',
    });

    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/sass/**/*.{scss,sass}', ['style']);
    gulp.watch('src/js/**/*.js', ['script']);
    gulp.watch('src/img/**/*', ['images', 'webp']);
});

gulp.task('clear', () => del('build'));

gulp.task('cache-clear', () => cache.clearAll());

gulp.task('build', (done) => {
    run(
        'clear',
        'style',
        'images',
        'webp',
        'sprite',
        'html',
        'script',
        done,
    );
});
