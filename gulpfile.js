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
    frontend: {
        root: './front-end/',
        all: './front-end/**/*.*',
        src: './front-end/src/',
        dist: './front-end/dist/',
        css: './front-end/src/assets/css/',
        sass: './front-end/src/assets/sass/**.*',
        js: './front-end/src/assets/js/**.js',
        images: './front-end/src/assets/img/**.*'
    },
    wordpress: {
        url: 'https://wordpress.org',
        version: 'latest.zip',
        themeName: 'iceberg-boilerplate',
        proxy: 'http://localhost:8888',
        server: 'server',
        tmp: 'tmp'
    },
};

// ===================================================
// Front-end
// ===================================================

// Minify CSS with SASS
function styles() {
    return (
        gulp
            .src(paths.frontend.sass)
            .pipe(sourcemaps.init())
            .pipe(sass())
            .on('error', sass.logError)
            .pipe(postcss([autoprefixer(), cssnano()]))
            .pipe(sourcemaps.write('./maps'))
            .pipe(gulp.dest(paths.frontend.css))
    );
}
exports.styles = styles

// Minify JavaScript
function scripts() {
    return (
        gulp
            .src(paths.frontend.js, {
                sourcemaps: true
            })
            .pipe(uglify())
            // .pipe(concat('main.min.js'))
            .pipe(gulp.dest(paths.frontend.dist + '/assets/js/'))
    );
}
exports.scripts = scripts

// Minify Images
function images() {
    return (
        gulp
            .src(paths.frontend.src + '/**/*.*')
            .pipe(imagemin())
            .pipe(gulp.dest(paths.frontend.dist))
    )
};
exports.images = images

// Minify HTML 
function html() {
    return (
        gulp
            .src(paths.frontend.src + '/**/*.html')
            .pipe(htmlmin({ collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: true }))
            .pipe(gulp.dest(paths.frontend.dist))
    )
}
exports.html = html

// Live Server
function frontendServer() {
    browserSync.init({
        server: {
            baseDir: paths.frontend.src
        }
    });
    frontendWatch();
}
exports.frontendServer = frontendServer

// Watch
function frontendWatch() {
    gulp.watch(paths.frontend.sass, styles)
    gulp.watch(paths.frontend.all).on('change', browserSync.reload);
}
exports.frontendWatch = frontendWatch

// Build and Deploy
const frontendDeploy = gulp.series(() => del(paths.frontend.dist), styles, images, scripts, html)

// Commands
gulp.task('frontend-deploy', frontendDeploy)
gulp.task('frontend-start', frontendServer)


// ===================================================
// Back-end
// ===================================================

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


// ===================================================
// Global
// ===================================================

// Watch Files
function watch() {
    gulp.watch(paths.frontend.sass, styles)
    gulp.watch(paths.frontend.all, live)
}
exports.watch = watch




// !!!! DANGER !!!! 
// =======================================
const reset = gulp.series(wpClean, () => del(['node_modules', paths.project.deploy, paths.project.dist, paths.wordpress.tmp, paths.wordpress.server]))
gulp.task('reset', reset)
// =======================================