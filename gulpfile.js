const gulp = require('gulp');
const gulpif = require('gulp-if');
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
const uglyfly = require('gulp-uglyfly');
const concat = require('gulp-concat');

const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const favicons = require('favicons').stream;

const plumber = require('gulp-plumber');
const server = require('browser-sync').create();

const prodMode = /production/.test(process.env.NODE_ENV);

// Assembling tasks

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
    .pipe(gulpif(prodMode, csso()))
    .pipe(gulp.dest('build/css'))
    .pipe(server.stream()));

gulp.task('script', () => gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env'],
    }))
    .pipe(gulpif(prodMode, uglyfly()))
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
    .pipe(cache(webp({ quality: 90 })))
    .pipe(gulp.dest('build/img')));

gulp.task('sprite', () => gulp.src('build/img/sprite-*.svg')
    .pipe(plumber())
    .pipe(svgstore({
        inlineSvg: true,
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img')));

gulp.task('copy-static', () => {
    gulp.src('src/fonts/*.{woff,woff2}')
        .pipe(plumber())
        .pipe(gulp.dest('build/fonts'));

    gulp.src('src/favicons/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('build/'));
});

gulp.task('serve', () => {
    server.init({
        server: 'build/',
    });

    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/sass/**/*.{scss,sass}', ['style']);
    gulp.watch('src/js/**/*.js', ['script']);
    gulp.watch('src/img/**/*', ['images', 'webp']);
    gulp.watch('src/fonts/*.{woff,woff2}', ['fonts']);
});

gulp.task('clear', () => del('build'));

gulp.task('build', done => run(
    'clear',
    'style',
    'images',
    'webp',
    'sprite',
    'html',
    'script',
    'copy-static',
    done,
));

// Individual tasks

gulp.task('cache-clear', () => cache.clearAll());

gulp.task('create-favicon', () => gulp.src('src/favicon.png')
    .pipe(plumber())
    .pipe(favicons({
        background: 'rgba(255, 255, 255, 0)',
        version: 1.0,
        logging: false,
        html: 'index.html',
        pipeHTML: true,
        replace: true,
        icons: {
            android: true,
            appleIcon: true,
            appleStartup: true,
            coast: false,
            favicons: true,
            firefox: true,
            opengraph: false,
            twitter: false,
            yandex: false,
            windows: false,
        },
    }))
    .pipe(gulp.dest('src/favicons/')));
