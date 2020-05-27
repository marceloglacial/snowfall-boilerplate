// =============================================================
// 1. Configuration
// =============================================================

// 1.1 - Gulp Packages
// ------------------------------
const gulp = require('gulp'),
  browserSync = require('browser-sync'),
  del = require('del'),
  autoprefixer = require('gulp-autoprefixer'),
  imagemin = require('gulp-imagemin'),
  handlebars = require('gulp-compile-handlebars'),
  rename = require('gulp-rename'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  babel = require('gulp-babel'),
  uglify = require('gulp-uglify'),
  purgecss = require('gulp-purgecss'),
  concat = require('gulp-concat'),
  htmlmin = require('gulp-htmlmin');

// ==============================================================
// 2. Functions
// ==============================================================

// 2.1 - Clean folder
// ------------------------------
function clean(path) {
  return del(path);
}

// 2.2 - Complie SASS
// ------------------------------
function styles(src, dest, minify) {
  if (minify) {
    let options = {
      outputStyle: 'compressed',
    };
    return gulp
      .src(src + '**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass(options))
      .on('error', sass.logError)
      .pipe(autoprefixer())
      .pipe(concat('main.min.css'))
      .pipe(gulp.dest(dest + 'css/'));
  } else {
    return gulp
      .src(src + '**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass())
      .on('error', sass.logError)
      .pipe(autoprefixer())
      .pipe(concat('main.min.css'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest(dest + 'css/'));
  }
}

function purge(dest) {
  return gulp
    .src(dest + 'css/**/*.css')
    .pipe(
      purgecss({
        content: [dest + '**/*.html'],
      })
    )
    .pipe(gulp.dest(dest + 'css/'));
}

// 2.3 - Minimize Scripts
// ------------------------------
function scripts(src, dist) {
  return gulp
    .src(src + '**/*.js', {
      sourcemaps: true,
    })
    .pipe(
      babel({
        presets: ['@babel/env'],
      })
    )
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest(dist + 'js/'));
}

// 2.4 - Optmize images
// ------------------------------
function images(src, dest) {
  return gulp
    .src(src + folders)
    .pipe(
      imagemin({
        interlaced: true,
        progressive: true,
        optimizationLevel: 5,
        svgoPlugins: [
          {
            removeViewBox: true,
          },
        ],
      })
    )
    .pipe(gulp.dest(dest));
}

// 2.5 - Complie templates
// ------------------------------
function templates(templates, partials, dest) {
  var templateData = {},
    options = {
      ignorePartials: true,
      batch: [partials],
    };
  return gulp
    .src(templates + '*.html')
    .pipe(handlebars(templateData, options))
    .pipe(gulp.dest(dest));
}

// 2.6 - Copy
// ------------------------------
function copy(src, dest) {
  return gulp.src(src).pipe(gulp.dest(dest));
}

// 2.7 - Start server
// ------------------------------
function liveServer(path, proxy) {
  let options = proxy
    ? {
        proxy: backend.proxy,
      }
    : {
        server: {
          baseDir: path,
        },
      };
  browserSync.init(options);
  gulp
    .watch(frontend.src)
    .on('change', gulp.series('frontend:develop', liveReload));
  gulp
    .watch(backend.src)
    .on('change', gulp.series('backend:develop', liveReload));
}

// 2.8 - Reload page
// ------------------------------
function liveReload() {
  browserSync.reload();
}

// 2.9 - Minify Html
// ------------------------------
function html(src, dest) {
  return gulp
    .src([src + '**/*.html'])
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(gulp.dest(dest));
}

// =============================================================
// 3. Front-end
// =============================================================

// 3.1 - Paths
// ------------------------------
const all = '**/*.*',
  folders = '**/*';

const frontend = new (function () {
  this.root = 'front-end/';
  this.all = this.root + all;
  this.src = this.root + 'src/';
  this.dist = this.root + 'dist/';
  this.assets = this.src + 'assets/' + folders;
  this.components = this.src + 'components/';
})();

// 3.2 - Templates
// ------------------------------
gulp.task('frontend:templates', () =>
  templates(frontend.src, frontend.components, frontend.dist)
);

// 3.3 - Assets
// ------------------------------
gulp.task('frontend:assets', () => copy(frontend.assets, frontend.dist));

// 3.4 - Styles
// ------------------------------
gulp.task('frontend:styles', () => styles(frontend.components, frontend.dist));
gulp.task('frontend:styles-build', () =>
  styles(frontend.components, frontend.dist, 'minify')
);
gulp.task('frontend:purgecss', () => purge(frontend.dist));

// 3.5 - Scripts
// ------------------------------
gulp.task('frontend:scripts', () =>
  scripts(frontend.components, frontend.dist)
);

// 3.6 - Images
// ------------------------------
gulp.task('frontend:images', () => images(frontend.dist, frontend.dist));

// 3.7 - HTML
// ------------------------------
gulp.task('frontend:html', () => html(frontend.dist, frontend.dist));

// 3.8 - Clean build files
// ------------------------------
gulp.task('frontend:clean', () => clean(frontend.dist));

// 3.9 - Develop
// ------------------------------
gulp.task(
  'frontend:develop',
  gulp.series(
    'frontend:clean',
    'frontend:assets',
    'frontend:styles',
    'frontend:scripts',
    'frontend:templates'
    // 'frontend:purgecss',
  )
);

// 3.10 - Build
// ------------------------------
gulp.task(
  'frontend:build',
  gulp.series(
    'frontend:clean',
    'frontend:assets',
    'frontend:styles-build',
    'frontend:scripts',
    'frontend:templates',
    // 'frontend:purgecss',
    'frontend:html',
    'frontend:images'
  )
);

// 3.11 - Start Server
// ------------------------------
// 3.12 - Start Server
// ------------------------------
gulp.task(
  'frontend:server',
  gulp.series('frontend:develop', () => liveServer(frontend.dist))
);
gulp.task('frontend:start', gulp.series('frontend:server'));

// =============================================================
// 4. Back-end
// =============================================================

// 4.1 - Backend paths
const projectConfig = require('./package.json');
const backend = new (function () {
  this.root = 'back-end/';
  this.src = this.root + 'src/';
  this.dist = this.root + 'dist/themes/' + projectConfig.name;
  this.proxy = 'http://localhost:8000';
})();

// 4.2 - Rename index files to php
// ------------------------------
function backendRename() {
  let path = backend.src;

  gulp
    .src(path + '/**/*.html')
    .pipe(
      rename(function (file) {
        file.extname = '.php';
      })
    )
    .pipe(gulp.dest(path));

  return del(path + '**/*.html');
}

// 4.3 - Backed Install
// ------------------------------
gulp.task(
  'backend:install',
  gulp.series(
    () => copy(frontend.dist + '/**/*.*', backend.src),
    () => copy(backend.src + '/**/*.*', backend.dist),
    () => del(backend.src + '/**/*.html')
  )
);

// 4.5 - Start Backend
// ------------------------------
gulp.task(
  'backend:start',
  gulp.series('backend:install', () => liveServer(backend.dist, backend.proxy))
);

// 4.6 - Start Develop
// ------------------------------
gulp.task(
  'backend:develop',
  gulp.series(() => copy(backend.src + '/**/*.*', backend.dist))
);

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

function ftpDeploy(param) {
  let credentials = require('./credentials.json');
  var conn = vinyl_ftp.create({
    host: credentials.host,
    user: credentials.user,
    password: credentials.password,
    parallel: credentials.parallel,
    log: credentials.log,
  });
  console.log('Uploading ' + param + ' files ...');
  let globs = [param + '**/*.*'];
  var options = {
    buffer: false,
  };
  return gulp
    .src(globs, options)
    .pipe(conn.newer(credentials.remoteFolder)) // only upload newer files
    .pipe(conn.dest(credentials.remoteFolder));
}
gulp.task(
  'frontend:deploy',
  gulp.series('frontend:build', () => ftpDeploy(frontend.dist))
);
gulp.task(
  'backend:deploy',
  gulp.series(() => ftpDeploy(backend.dist))
);
