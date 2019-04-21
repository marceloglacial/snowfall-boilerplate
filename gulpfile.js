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
    imagemin = require('gulp-imagemin'),
    pug = require('gulp-pug'),
    rename = require('gulp-rename'),
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


// 2.5 - Complie templates
// ------------------------------
function templates(templates, dest, pretty) {
    return gulp.src(templates)
        .pipe(pug({
            pretty: pretty
        }))
        .pipe(gulp.dest(dest))
};

// 2.6 - Copy
// ------------------------------
function copy(src, dest) {
    return gulp.src(src)
        .pipe(gulp.dest(dest));
};


// 2.7 - Start server
// ------------------------------
function liveServer(path, proxy) {
    let options = proxy ? {
        proxy: backend.proxy
    } : {
        server: {
            baseDir: path
        }
    };
    browserSync.init(options);
    gulp.watch(frontend.src).on('change', gulp.series('frontend:develop', liveReload));
    gulp.watch(backend.src).on('change', gulp.series('backend:develop', liveReload));
};


// 2.8 - Reload page
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
    this.templates = this.src + 'templates/*.pug';
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

// 3.7 - Templates
// ------------------------------
gulp.task('frontend:templates', () => templates(frontend.templates, frontend.dist));

// 3.8 - HTML
// ------------------------------
gulp.task('frontend:html', () => html(frontend.dist + '/**/*.html', frontend.dist));

// 3.9 - Clean build files
// ------------------------------
gulp.task('frontend:clean', () => clean(frontend.dist));

// 3.10 - Build
// ------------------------------
gulp.task('frontend:build',
    gulp.series(
        'frontend:clean',
        'frontend:assets',
        'frontend:vendors',
        'frontend:styles',
        'frontend:scripts',
        'frontend:images',
        'frontend:templates'
    )
);

// 3.11 - Develop
// ------------------------------
gulp.task('frontend:develop',
    gulp.series(
        'frontend:clean',
        'frontend:assets',
        'frontend:vendors',
        'frontend:styles',
        'frontend:scripts',
        () => copy(frontend.images, frontend.dist + 'assets/img/'),
        () => templates(frontend.templates, frontend.dist, true)
    )
);

// 3.12 - Start Server
// ------------------------------
gulp.task('frontend:server', gulp.series('frontend:develop', () => liveServer(frontend.dist)));
gulp.task('frontend:start', gulp.series('frontend:server'));



// =============================================================
// 4. Back-end
// =============================================================

// 4.1 - Backend paths
const backend = new function () {
    this.root = 'back-end/';
    this.src = this.root + 'src/';
    this.dist = this.root + 'dist/' + projectConfig.name;
    this.proxy = 'http://localhost:8000';
};

// 4.2 - Rename index files to php
// ------------------------------
function backendRename() {
    let path = backend.src

    gulp.src(path + '/**/*.html')
        .pipe(rename(function (file) {
            file.extname = ".php";
        }))
        .pipe(gulp.dest(path))

    return del(path + '**/*.html')
};

// 4.3 - Backed Install 
// ------------------------------
gulp.task('backend:install', gulp.series(
    'frontend:develop',
    () => copy(frontend.dist + '/**/*.*', backend.src),
    backendRename,
    () => copy(backend.src + '/**/*.*', backend.dist),
));

// 4.5 - Start Backend
// ------------------------------
gulp.task('backend:start', gulp.series(
    () => liveServer(backend.dist, backend.proxy),
));

// 4.6 - Start Develop
// ------------------------------
gulp.task('backend:develop', gulp.series(
    () => copy(backend.src + '/**/*.*', backend.dist),
));

// 4.7 - Clean build files
// ------------------------------
gulp.task('backend:clean', () => clean(backend.dist));


// =============================================================
// 5. FTP Deploy
// =============================================================
//
// Please fill info and rename credentials-sample.json
// to credentials.json
//
// NOTE: 
// Due sensitive information,
// this file WILL NOT BE on version control.


function ftpDeploy(local, remote) {
    let credentials = require('./credentials.json');
    var conn = vinyl_ftp.create({
        host: credentials.host,
        user: credentials.user,
        password: credentials.password,
        parallel: credentials.parallel,
        log: credentials.log
    });
    console.log('Uploading ' + local + ' files ...');
    let globs = [
        local + '**/*.*',
    ];
    var options = {
        buffer: false
    }
    let remoteFolder = remote ? credentials.remoteFolder + remote : credentials.remoteFolder
    return gulp.src(globs, options)
        .pipe(conn.newer(remoteFolder)) // only upload newer files
        .pipe(conn.dest(remoteFolder));
}
gulp.task('frontend:deploy', gulp.series('frontend:build', () => ftpDeploy(frontend.dist)));
gulp.task('backend:deploy', gulp.series(() => ftpDeploy(backend.dist, '/wp-content/themes')));