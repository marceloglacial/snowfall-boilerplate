const gulp = require('gulp');
const del = require('del');
const download = require('gulp-download');
const decompress = require('gulp-decompress');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const htmlmin = require('gulp-htmlmin');
const zip = require('gulp-zip');

// Paths
const paths = {
    wordpress: {
        url: 'https://wordpress.org',
        version: 'latest.zip',
        themeName: 'iceberg-boilerplate',
        proxy: 'http://localhost:8888',
        server: 'server',
        tmp: 'tmp'
    },
    project: {
        all: './src/**/*.*',
        src: './src/',
        dist: './dist/',
        deploy: './deploy/'
    },
    styles: {
        src: './src/assets/css/src/*.*',
        dest: './src/assets/css/',
    },
    scripts: {
        src: './src/assets/js/src/*.js',
        dest: './src/assets/js/',
    },
    images: {
        src: './src/assets/img/*.*',
        dest: './dist/assets/img/',
    }
};


// Download Wordpress
function wpDownload() {
    return (
        download(paths.wordpress.url + '/' + paths.wordpress.version)
        .pipe(gulp.dest(paths.wordpress.tmp))
    )
}
exports.wpDownload = wpDownload

// Decompress Wordpress and add to server folder
function wpUnzip() {
    return (
        gulp
            .src(paths.wordpress.tmp + '/*.{tar,tar.bz2,tar.gz,zip}')
            .pipe(decompress({ strip: 1 }))
            .pipe(gulp.dest(paths.wordpress.server))
    )
}
exports.wpUnzip = wpUnzip

// Copy file from work folder to server folder
function wpCopy() {
    return (
        gulp
            .src(paths.project.all)
            .pipe(gulp.dest(paths.wordpress.server + '/wp-content/themes/' + paths.wordpress.themeName))
    )
}
exports.wpCopy = wpCopy

// Delete WordPress files
function wpClean() {
    return (
        del([paths.wordpress.tmp, paths.wordpress.server])
    )
}
exports.wpClean = wpClean

// Install project
const install = gulp.series(wpClean, wpDownload, wpUnzip, wpCopy, () => del(paths.wordpress.tmp), start)
gulp.task('install', install)

// Minify CSS with SASS
function styles() {
    return (
        gulp
            .src(paths.styles.src)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .on('error', sass.logError)
            .pipe(postcss([autoprefixer(), cssnano()]))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(paths.styles.dest))
    );
}
exports.styles = styles

// Minify JavaScript
function scripts() {
    return (
        gulp
            .src(paths.scripts.src, {
                sourcemaps: true
            })
            .pipe(uglify())
            .pipe(concat('main.min.js'))
            .pipe(gulp.dest(paths.scripts.dest))
    );
}
exports.scripts = scripts

// Minify Images
function images() {
    return (
        gulp
            .src(paths.images.src)
            .pipe(imagemin())
            .pipe(gulp.dest(paths.images.dest))
    ) 
};
exports.images = images

// Minify HTML 
function html() {
    return (
        gulp
            .src(paths.project.src + '/**/*.php')
            .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true }))
            .pipe(gulp.dest(paths.project.dist))
    )
}
exports.html = html


// BrowserSync with new file
function live() {
    return (
        gulp
            .src(paths.project.all)
            .pipe(gulp.dest(paths.wordpress.server + '/wp-content/themes/' + paths.wordpress.themeName))
            .pipe(browserSync.stream())
    )
}
exports.live = live


// Watch Files
function watch() {
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.project.all, live)
}
exports.watch = watch

// Start server
function start() {
    browserSync.init({
        proxy: paths.wordpress.proxy + '/' + paths.wordpress.themeName + '/' + paths.wordpress.server
    });
    watch()
}
exports.start = start

// Build 
function copy() {
    return (
        gulp
            .src(paths.project.all)
            .pipe(gulp.dest(paths.project.dist))
    )
}
exports.copy = copy

const build = gulp.series(() => del(paths.project.dist), styles, scripts, copy, images, html)
gulp.task('build', build)

// Deploy
function zipfiles() {
    return (
        gulp
            .src(paths.project.dist + '/**/*')
            .pipe(zip(paths.wordpress.themeName + '.zip'))
            .pipe(gulp.dest(paths.project.deploy))
    )
}
exports.zipfiles = zipfiles

const deploy = gulp.series(() => del(paths.project.dist), build, zipfiles)
gulp.task('deploy', deploy)


// !!!! DANGER !!!! 
// =======================================
const reset = gulp.series(wpClean, () => del(['node_modules', paths.project.deploy, paths.project.dist, paths.wordpress.tmp, paths.wordpress.server]))
gulp.task('reset', reset)
// =======================================