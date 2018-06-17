const gulp = require('gulp');
const gulpif = require('gulp-if');
const run = require('run-sequence');
const rename = require('gulp-rename');
const cache = require('gulp-cache');
const del = require('del');

const pug = require('gulp-pug');
const topug = require('gulp-html2pug');

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

gulp.task('views', () => gulp.src('src/pug/views/**/*.pug')
    .pipe(plumber())
    .pipe(pug())
    .pipe(gulp.dest('build/'))
    .pipe(server.stream()));

gulp.task('styles', () => gulp.src('src/scss/style.scss')
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

gulp.task('scripts', () => gulp.src('src/js/scripts/**/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['env'],
    }))
    .pipe(gulpif(prodMode, uglyfly()))
    .pipe(concat('script.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js')));

gulp.task('libs', () => gulp.src('src/js/lib/**/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(gulpif(prodMode, uglyfly()))
    .pipe(concat('lib.js'))
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
    gulp.src('src/fonts/**/*')
        .pipe(plumber())
        .pipe(gulp.dest('build/fonts'));

    gulp.src('src/favicons/**/*.{png,ico,json,webapp}')
        .pipe(plumber())
        .pipe(gulp.dest('build/favicons'));
});

gulp.task('serve', () => {
    server.init({
        server: 'build/',
    });

    gulp.watch('src/pug/**/*', ['views']);
    gulp.watch('src/scss/**/*', ['styles']);
    gulp.watch('src/js/**/*', ['scripts']);
    gulp.watch('src/img/**/*', ['images', 'webp']);
    gulp.watch('src/fonts/**/*', ['copy-static']);
});

gulp.task('clear', () => del('build'));

gulp.task('build', done => run(
    'clear',
    [
        'copy-static',
        'views',
        'styles',
        'images',
        'webp',
        'libs',
        'scripts',
    ],
    'sprite',
    done,
));

// Individual tasks

gulp.task('cache-clear', () => cache.clearAll());

gulp.task('favicon-clear', () => del('src/favicons'));

gulp.task('favicon-generate', () => gulp.src('src/favicon.png')
    .pipe(plumber())
    .pipe(favicons({
        path: 'favicons',
        background: 'rgba(255, 255, 255, 0)',
        version: 1.0,
        logging: false,
        html: 'favicons.html',
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

gulp.task('favicon-to-pug', () => gulp.src('src/favicons/favicons.html')
    .pipe(topug())
    .pipe(gulp.dest('src/favicons/')));

gulp.task('favicon-del', () => del('src/favicons/favicons.html'));

gulp.task('create-favicon', done => run(
    'favicon-clear',
    'favicon-generate',
    'favicon-to-pug',
    'favicon-del',
    done,
));
