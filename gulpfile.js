// ===================================================
// 1. Configuration
// ===================================================


// 1.1 - Gulp Packages
// ---------------------------------------------------
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
// ---------------------------------------------------
const all = '**/*.*',
    folders = '**/*'


// ===================================================
// 2. Front-end
// ===================================================


// 2.1 - Paths
// ---------------------------------------------------
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


// 2.2 - Assets
// ---------------------------------------------------
function assets() {
    return gulp.src(frontend.assets)
        .pipe(gulp.dest(frontend.dist))
};
exports.assets = assets;


// 2.3 - Vendors
// ---------------------------------------------------
function vendors() {
    return gulp.src(frontend.vendors)
        .pipe(gulp.dest(frontend.dist + 'assets/'))
};
exports.vendors = vendors;


// 2.4 - Styles
// ---------------------------------------------------
function styles() {
    return (
        gulp
        .src(frontend.styles)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .on('error', sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(frontend.dist + 'assets/css/'))
        .pipe(browserSync.stream())
    );
};
exports.styles = styles;


// 2.5 - Scripts
// ---------------------------------------------------
function scripts() {
    return (
        gulp
        .src(frontend.scripts, {
            sourcemaps: true
        })
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(frontend.dist + '/assets/js/'))
    );
};
exports.scripts = scripts;

// 2.6 - Images
// ---------------------------------------------------
function images() {
    return (
        gulp
        .src(frontend.images)
        .pipe(imagemin())
        .pipe(gulp.dest(frontend.dist + 'assets/img/'))
    )
};
exports.images = images;

// 2.7 - Templates
// ---------------------------------------------------
function templates() {
    var templateData = {},
        options = {
            ignorePartials: true,
            batch: [frontend.partials]
        }
    return gulp.src(frontend.templates)
        .pipe(handlebars(templateData, options))
        .pipe(rename(function (path) {
            path.extname = '.html';
        }))
        .pipe(gulp.dest(frontend.dist))
};
exports.templates = templates;


// 2.8 - HTML
// ---------------------------------------------------
function html() {
    return (
        gulp
        .src(frontend.dist + '/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(gulp.dest(frontend.dist))
    )
};
exports.html = html;


// 2.8 - Build
// ---------------------------------------------------
const frontBuild = gulp.series(clean, assets, vendors, styles, scripts, images, templates, html);
gulp.task('frontend-build', frontBuild);


// 1.5 - Live Server
function frontendReload() {
    browserSync.reload();
}

const frontReload = gulp.series(frontBuild, frontendReload);

function frontendWatch() {
    browserSync.init({
        server: {
            baseDir: frontend.dist
        }
    });
    gulp.watch(frontend.src + '**/*.*').on('change', frontReload);
};
gulp.task('frontend-start', frontendWatch);

//
// ===================================================
// 2. Back-end
// ===================================================
//
// Fisrt steps:
// * Start PHP and MySQL servers 
// * Create a WordPress database
//

const backend = new function () {
    this.url = 'https://wordpress.org';
    this.version = 'latest.zip';
    this.proxy = 'http://localhost:8888';
    this.root = './back-end/';
    this.src = this.root + 'src/';
    this.dist = this.root + 'dist/';
    this.server = this.root + 'server/';
    this.tmp = this.root + 'tmp/';
    this.themeName = projectConfig.name;
    this.themeFolder = this.server + 'wp-content/themes/' + this.themeName;
};

// 2.1 - Download Wordpress
function wpDownload() {
    return (
        download(backend.url + '/' + backend.version)
        .pipe(gulp.dest(backend.tmp))
    )
};
exports.wpDownload = wpDownload

// 2.2 - Decompress Wordpress and add to server folder
function wpUnzip() {
    return (
        gulp
        .src(backend.tmp + '/*.{tar,tar.bz2,tar.gz,zip}')
        .pipe(decompress({
            strip: 1
        }))
        .pipe(gulp.dest(backend.server))
    )
};
exports.wpUnzip = wpUnzip

// 2.3 - Copy files from Front-end to Back-end workfolder and server folder
// 2.3.1 -  Copy files 
function backendCopyToTemp() {
    return (
        gulp
        .src(frontend.src + '/**/*.*')
        .pipe(gulp.dest(backend.tmp))
    )
}
exports.backendCopyToTemp = backendCopyToTemp

// 2.3.2 - Rename index files to php
function backendRename() {
    return (
        gulp
        .src(backend.tmp + '/**/*.html')
        .pipe(ext_replace('.php'))
        .pipe(gulp.dest(backend.tmp))
    )
}
exports.backendRename = backendRename

// 2.3.3 -  Delete html files 
function backendClean() {
    return (
        gulp
        .src(backend.tmp + '/**/*.html')
        .pipe(clean())
    )
}
exports.backendClean = backendClean

// 2.3.4 -  Copy files to workfolder and server
function backendCopyToWork() {
    return (
        gulp
        .src(backend.tmp + '/**/*.*')
        .pipe(multi_dest([backend.src, backend.themeFolder]))
    )
}
exports.backendCopyToWork = backendCopyToWork


// 2.3.5 - Run all tasks in series 
const wpCopy = gulp.series([backendCopyToTemp, backendRename, backendClean, backendCopyToWork, () => del(backend.tmp)]);
gulp.task('wpCopy', wpCopy)


// 2.4 - Delete WordPress files
function wpClean() {
    return (
        del([backend.tmp, backend.server])
    )
};
exports.wpClean = wpClean

// 2.5 - browserSync 
function wpLive() {
    return (
        gulp
        .src(backend.src + '**/*.*')
        .pipe(gulp.dest(backend.themeFolder))
        .pipe(browserSync.stream())
    )
};
exports.wpLive = wpLive

// 2.6 - Start server
function wpStart() {
    browserSync.init({
        proxy: backend.proxy + '/' + backend.themeName + '/' + backend.server
    });
    wpWatch()
};
exports.wpStart = wpStart

// 2.7 - Watch
function wpWatch() {
    gulp.watch(backend.src).on('change', wpLive);
};
exports.wpWatch = wpWatch

// 2.8 - Build
function wpBuild() {
    return gulp
        .src(backend.src + '**/*.*')
        .pipe(gulp.dest(backend.dist + 'wp-content/themes/' + backend.themeName))
};
exports.wpBuild = wpBuild

// 2.9 - Back-end commands 
const wpInstall = gulp.series(wpClean, wpDownload, wpUnzip, () => del(backend.tmp), wpCopy)
gulp.task('backend:install', wpInstall)
gulp.task('backend:start', wpStart)
gulp.task('backend:build', wpBuild)



//
// ===================================================
// 3. Global Taks
// ===================================================
//

// 3.1 - FTP Deploy
// Please fill info and rename credentials-sample.json
// to credentials.json
//
// NOTE: 
// Due sensitive information,
// this file WILL NOT BE on version control.
//

// 3.1 - Clean
// ---------------------------------------------------
function clean() {
    return del(frontend.dist);
}
exports.clean = clean;


function ftpDeploy(param) {
    let credentials = require('./credentials.json');
    var conn = vinyl_ftp.create({
        host: credentials.host,
        user: credentials.user,
        password: credentials.password,
        parallel: credentials.parallel,
        log: credentials.log
    });
    console.log('Uploading ' + param + ' files ...');
    let globs = [
        param + '**/*.*',
    ];
    var options = {
        buffer: false
    }
    return gulp.src(globs, options)
        .pipe(conn.newer(credentials.remoteFolder)) // only upload newer files
        .pipe(conn.dest(credentials.remoteFolder));
}
gulp.task('frontend:deploy', gulp.series('frontend-build', function (cb) {
    ftpDeploy(frontend.dist)
    cb();
}));
gulp.task('backend:deploy', gulp.series('backend:build', function (cb) {
    ftpDeploy(backend.dist)
    cb();
}));