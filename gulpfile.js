// =============================================================
// 1. Configuration
// =============================================================

// 1.1 - Gulp Packages
// ------------------------------
const projectConfig = require('./package.json');
const gulp = require('gulp'),
    browserSync = require('browser-sync'),
    del = require('del'),
    autoprefixer = require('gulp-autoprefixer'),
    decompress = require('gulp-decompress'),
    download = require('gulp-download'),
    htmlmin = require('gulp-htmlmin'),
    imagemin = require('gulp-imagemin'),
    handlebars = require('gulp-compile-handlebars'),
    multi_dest = require('gulp-multi-dest'),
    rename = require('gulp-rename');
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    vinyl_ftp = require('vinyl-ftp');


// 1.2 - Global Paths
// ------------------------------
const all = '**/*.*',
    folders = '**/*'


// ==============================================================
// 2. Functions
// ==============================================================

// 2.1 - Clean folder
// ------------------------------
function clean(path) {
    return del(path);
};


// 2.2 - Complie SASS
// ------------------------------
function styles(src, dest) {
    return gulp
        .src(src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .on('error', sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 3 versions'],
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dest))
};


// 2.3 - Minimize Scripts
// ------------------------------
function scripts(src, dist) {
    return (
        gulp
        .src(src, {
            sourcemaps: true
        })
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dist))
    );
};


// 2.4 - Optmize images
// ------------------------------
function images(src, dest) {
    return (
        gulp
        .src(src)
        .pipe(imagemin())
        .pipe(gulp.dest(dest))
    )
};


// 2.5 - Complie Handlebars templates
// ------------------------------
function templates(templates, partials, dest) {
    var templateData = {},
        options = {
            ignorePartials: true,
            batch: [partials]
        }
    return gulp.src(templates)
        .pipe(handlebars(templateData, options))
        .pipe(rename(function (path) {
            path.extname = '.html';
        }))
        .pipe(gulp.dest(dest))
};

// 2.6 - HTML
// ------------------------------
function html(src, dest) {
    return (
        gulp
        .src(src)
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(gulp.dest(dest))
    )
};

// 2.7 - Copy
// ------------------------------
function copy(src, dest) {
    return gulp.src(src)
        .pipe(gulp.dest(dest));
};


// 2.8 - Start server
// ------------------------------
function liveServer(path) {
    browserSync.init({
        server: {
            baseDir: path
        }
    });
    gulp.watch(frontend.src).on('change', gulp.series('frontend:develop', liveReload));
    // gulp.watch(backend.all).on('change', gulp.series('build', liveReload));
};


// 2.9 - Reload page
// ------------------------------
function liveReload() {
    browserSync.reload();
};


// =============================================================
// 3. Front-end
// =============================================================

// 3.1 - Paths
// ------------------------------
const frontend = new function () {
    this.root = 'front-end/';
    this.all = this.root + all;
    this.src = this.root + 'src/';
    this.dist = this.root + 'dist/';
    this.assets = this.src + 'assets/' + folders;
    this.vendors = this.src + 'vendors/' + folders;
    this.styles = this.src + 'styles/**/*.scss';
    this.scripts = this.src + 'scripts/**/*.js';
    this.images = this.src + 'images/' + folders;
    this.templates = this.src + 'templates/*.hbs';
    this.partials = this.src + 'templates/partials';
};

// 3.2 - Assets
// ------------------------------
gulp.task('frontend:assets', () => copy(frontend.assets, frontend.dist));

// 3.3 - Vendors
// ------------------------------
gulp.task('frontend:vendors', () => copy(frontend.vendors, frontend.dist + 'assets/'));

// 3.4 - Styles
// ------------------------------
gulp.task('frontend:styles', () => styles(frontend.styles, frontend.dist + 'assets/css/'));

// 3.5 - Scripts
// ------------------------------
gulp.task('frontend:scripts', () => scripts(frontend.scripts, frontend.dist + '/assets/js/'));

// 3.6 - Images
// ------------------------------
gulp.task('frontend:images', () => images(frontend.images, frontend.dist + 'assets/img/'));

// 2.7 - Templates
// ------------------------------
gulp.task('frontend:templates', () => templates(frontend.templates, frontend.partials, frontend.dist));

// 2.8 - HTML
// ------------------------------
gulp.task('frontend:html', () => html(frontend.dist + '/**/*.html', frontend.dist));

// 2.8 - HTML
// ------------------------------
gulp.task('frontend:clean', () => clean(frontend.dist));

// 2.10 - Build
// ------------------------------
gulp.task('frontend:build', 
    gulp.series(
        'frontend:clean', 
        'frontend:assets', 
        'frontend:vendors', 
        'frontend:styles', 
        'frontend:scripts', 
        'frontend:images', 
        'frontend:templates', 
        'frontend:html'
    )
);

// 2.11 - Develop
// ------------------------------
gulp.task('frontend:develop', 
    gulp.series(
        'frontend:clean', 
        'frontend:assets', 
        'frontend:vendors', 
        'frontend:styles', 
        'frontend:scripts', 
        () => copy(frontend.images, frontend.dist + 'assets/img/'), 
        'frontend:templates', 
        'frontend:html'
    )
);

// 2.11 - Start Server
// ------------------------------
gulp.task('frontend:server', () => liveServer(frontend.dist));

// // =============================================================
// // 2. Back-end
// // =============================================================
// //
// // Fisrt steps:
// // * Start PHP and MySQL servers 
// // * Create a WordPress database
// //

// const backend = new function () {
//     this.url = 'https://wordpress.org';
//     this.version = 'latest.zip';
//     this.proxy = 'http://localhost:8888';
//     this.root = './back-end/';
//     this.src = this.root + 'src/';
//     this.dist = this.root + 'dist/';
//     this.server = this.root + 'server/';
//     this.tmp = this.root + 'tmp/';
//     this.themeName = projectConfig.name;
//     this.themeFolder = this.server + 'wp-content/themes/' + this.themeName;
// };

// // 2.1 - Download Wordpress
// function wpDownload() {
//     return (
//         download(backend.url + '/' + backend.version)
//         .pipe(gulp.dest(backend.tmp))
//     )
// };
// exports.wpDownload = wpDownload

// // 2.2 - Decompress Wordpress and add to server folder
// function wpUnzip() {
//     return (
//         gulp
//         .src(backend.tmp + '/*.{tar,tar.bz2,tar.gz,zip}')
//         .pipe(decompress({
//             strip: 1
//         }))
//         .pipe(gulp.dest(backend.server))
//     )
// };
// exports.wpUnzip = wpUnzip

// // 2.3 - Copy files from Front-end to Back-end workfolder and server folder
// // 2.3.1 -  Copy files 
// function backendCopyToTemp() {
//     return (
//         gulp
//         .src(frontend.src + '/**/*.*')
//         .pipe(gulp.dest(backend.tmp))
//     )
// }
// exports.backendCopyToTemp = backendCopyToTemp

// // 2.3.2 - Rename index files to php
// function backendRename() {
//     return (
//         gulp
//         .src(backend.tmp + '/**/*.html')
//         .pipe(ext_replace('.php'))
//         .pipe(gulp.dest(backend.tmp))
//     )
// }
// exports.backendRename = backendRename

// // 2.3.3 -  Delete html files 
// function backendClean() {
//     return (
//         gulp
//         .src(backend.tmp + '/**/*.html')
//         .pipe(clean())
//     )
// }
// exports.backendClean = backendClean

// // 2.3.4 -  Copy files to workfolder and server
// function backendCopyToWork() {
//     return (
//         gulp
//         .src(backend.tmp + '/**/*.*')
//         .pipe(multi_dest([backend.src, backend.themeFolder]))
//     )
// }
// exports.backendCopyToWork = backendCopyToWork


// // 2.3.5 - Run all tasks in series 
// const wpCopy = gulp.series([backendCopyToTemp, backendRename, backendClean, backendCopyToWork, () => del(backend.tmp)]);
// gulp.task('wpCopy', wpCopy)


// // 2.4 - Delete WordPress files
// function wpClean() {
//     return (
//         del([backend.tmp, backend.server])
//     )
// };
// exports.wpClean = wpClean

// // 2.5 - browserSync 
// function wpLive() {
//     return (
//         gulp
//         .src(backend.src + '**/*.*')
//         .pipe(gulp.dest(backend.themeFolder))
//         .pipe(browserSync.stream())
//     )
// };
// exports.wpLive = wpLive

// // 2.6 - Start server
// function wpStart() {
//     browserSync.init({
//         proxy: backend.proxy + '/' + backend.themeName + '/' + backend.server
//     });
//     wpWatch()
// };
// exports.wpStart = wpStart

// // 2.7 - Watch
// function wpWatch() {
//     gulp.watch(backend.src).on('change', wpLive);
// };
// exports.wpWatch = wpWatch

// // 2.8 - Build
// function wpBuild() {
//     return gulp
//         .src(backend.src + '**/*.*')
//         .pipe(gulp.dest(backend.dist + 'wp-content/themes/' + backend.themeName))
// };
// exports.wpBuild = wpBuild

// // 2.9 - Back-end commands 
// const wpInstall = gulp.series(wpClean, wpDownload, wpUnzip, () => del(backend.tmp), wpCopy)
// gulp.task('backend:install', wpInstall)
// gulp.task('backend:start', wpStart)
// gulp.task('backend:build', wpBuild)



// //
// // =============================================================
// // 3. Global Taks
// // =============================================================
// //

// // 3.1 - FTP Deploy
// // Please fill info and rename credentials-sample.json
// // to credentials.json
// //
// // NOTE: 
// // Due sensitive information,
// // this file WILL NOT BE on version control.
// //

// // 3.1 - Clean
// // ------------------------------
// function clean() {
//     return del(frontend.dist);
// }
// exports.clean = clean;


// function ftpDeploy(param) {
//     let credentials = require('./credentials.json');
//     var conn = vinyl_ftp.create({
//         host: credentials.host,
//         user: credentials.user,
//         password: credentials.password,
//         parallel: credentials.parallel,
//         log: credentials.log
//     });
//     console.log('Uploading ' + param + ' files ...');
//     let globs = [
//         param + '**/*.*',
//     ];
//     var options = {
//         buffer: false
//     }
//     return gulp.src(globs, options)
//         .pipe(conn.newer(credentials.remoteFolder)) // only upload newer files
//         .pipe(conn.dest(credentials.remoteFolder));
// }
// gulp.task('frontend:deploy', gulp.series('frontend-build', function (cb) {
//     ftpDeploy(frontend.dist)
//     cb();
// }));
// gulp.task('backend:deploy', gulp.series('backend:build', function (cb) {
//     ftpDeploy(backend.dist)
//     cb();
// }));