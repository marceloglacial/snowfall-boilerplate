// Load Gulp packages from package.json
const gulpPackages = require('./package.json');
const gulpDependencies = Object.keys(gulpPackages.devDependencies);
for (const key in gulpDependencies) {
    if (gulpDependencies.hasOwnProperty(key)) {
        const element = gulpDependencies[key];
        let str = element.replace('gulp-', '').replace('-', '_') + ' = require("' + element + '");';
        eval(str);
    }
}

// Paths
const frontend = new function () {
    this.root = './front-end/';
    this.all = this.root + '**/*.*';
    this.src = this.root + 'src/';
    this.dist = this.root + 'dist/';
    this.css = this.src + 'assets/css/';
    this.sass = this.src + 'assets/sass/**/*.scss';
    this.js = this.src + 'assets/js/**/*.js';
    this.images = this.src + 'assets/img/**/*.*';
};
const backend = new function () {
    this.url = 'https://wordpress.org';
    this.version = 'latest.zip';
    this.proxy = 'http://localhost:8888';
    this.root = './back-end/';
    this.src = this.root + 'src/';
    this.dist = this.root + 'dist/';
    this.server = this.root + 'server/';
    this.tmp = this.root + 'tmp/';
    this.themeName = gulpPackages.name;
    this.themeFolder = this.server + 'wp-content/themes/' + this.themeName;
};

// ===================================================
// 1. Front-end
// ===================================================

// 1.1 - Minify CSS with SASS
function styles() {
    return (
        gulp
        .src(frontend.sass)
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .on('error', sass.logError)
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(frontend.css))
        .pipe(browser_sync.stream())
    );
};
exports.styles = styles

// 1.2 - Minify JavaScript
function scripts() {
    return (
        gulp
        .src(frontend.js, {
            sourcemaps: true
        })
        .pipe(uglify())
        .pipe(gulp.dest(frontend.dist + '/assets/js/'))
    );
};
exports.scripts = scripts

// 1.3 - Minify Images
function images() {
    return (
        gulp
        .src(frontend.src + '/**/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest(frontend.dist))
    )
};
exports.images = images

// 1.4 - Minify HTML 
function html() {
    return (
        gulp
        .src(frontend.src + '/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true
        }))
        .pipe(gulp.dest(frontend.dist))
    )
};
exports.html = html

// 1.5 - Live Server
function frontendReload() {
    browser_sync.reload();
}

function frontendWatch() {
    browser_sync.init({
        server: {
            baseDir: frontend.src
        }
    });
    gulp.watch(frontend.sass).on('change', styles);
    gulp.watch(frontend.src + '**/*.*').on('change', frontendReload);
}

// 1.6 - Build
const frontendBuild = gulp.series(() => del(frontend.dist), styles, images, scripts, html)

// 1.7 - Commands
gulp.task('frontend:build', frontendBuild)
gulp.task('frontend:start', frontendWatch)

//
// ===================================================
// 2. Back-end
// ===================================================
//
// Fisrt steps:
// * Start PHP and MySQL servers 
// * Create a WordPress database
//

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

// 2.5 - browser_sync 
function wpLive() {
    return (
        gulp
        .src(backend.src + '**/*.*')
        .pipe(gulp.dest(backend.themeFolder))
        .pipe(browser_sync.stream())
    )
};
exports.wpLive = wpLive

// 2.6 - Start server
function wpStart() {
    browser_sync.init({
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
gulp.task('frontend:deploy', gulp.series('frontend:build', function (cb) {
    ftpDeploy(frontend.dist)
    cb();
}));
gulp.task('backend:deploy', gulp.series('backend:build', function (cb) {
    ftpDeploy(backend.dist)
    cb();
}));