'use strict'
const gulp = require('gulp');
const del = require('del');
const tinypng = require('gulp-tinypng');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const cleanCSS = require('gulp-clean-css');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync');

let status = process.env.STATUS || 'development';
let isDevelopment = status === 'development';
let isProduction = status === 'production';

let path = {
  src: {
    base: 'src/',
    img: 'src/img/**/*.*',
    font: 'src/fonts/**/*.*',
    ttfFont: 'src/fonts/**/*.ttf',
    html: ['src/index.html', 'src/pages/**/*.html'],
    style: 'src/styles/main.scss',
    jsVendor: 'src/js/vendor/**/*.*',
    jsBase: 'src/js/*.*'
  },
  out: {
    root: 'public/',
    img: 'public/img',
    font: 'public/font',
    html: 'public/',
    css: 'public/',
    js: 'public/'
  },
  watch: {
    style: 'src/styles/**/*.*',
    js: 'src/js/**/*.*'
  }
}
let config = {
  outputCssMinName: 'bundle.min.css',
  outputCssName: 'bundle.css',
  outputJsMinName: 'bundle.min.js',
  outputJsName: 'bundle.js',
}

gulp.task('clean', function () {
  return del(path.out.root);
});

gulp.task('asset:img', function () {
  return gulp.src(path.src.img)
    .pipe(gulpIf(isProduction, tinypng('API Key'))) // https://tinypng.com/dashboard/api
    .pipe(rename({
      dirname: path.out.img
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('font:ttf2woff', function () {
  return gulp.src(path.src.ttfFont)
    .pipe(ttf2woff())
    .pipe(rename({
      dirname: path.out.font + '/woff'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('font:ttf2woff2', function () {
  return gulp.src(path.src.ttfFont)
    .pipe(ttf2woff2())
    .pipe(rename({
      dirname: path.out.font + '/woff2'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('font:fontsSendDest', function () {
  return gulp.src(path.src.font)
    .pipe(rename({
      dirname: path.out.font
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('asset:fonts', gulp.parallel('font:ttf2woff', 'font:ttf2woff2'));

gulp.task('asset:html', function () {
  return gulp.src(path.src.html, {
      base: path.src.base
    })
    .pipe(gulp.dest(path.out.html));
});

gulp.task('assets', gulp.parallel('asset:img', 'asset:fonts', 'asset:html'));

gulp.task('styles', function () {
  return gulp.src(path.src.style)
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          message: "Error: <%= error.message %>",
          title: "Styles error"
        };
      })
    }))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(gulpIf(isDevelopment, concat(config.outputCssName), concat(config.outputCssMinName)))
    .pipe(autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe(gulpIf(isProduction, cleanCSS({
      compatibility: 'ie8'
    })))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(path.out.css))
    .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  return gulp.src([path.src.jsVendor, path.src.jsBase])
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(gulpIf(isDevelopment, concat(config.outputJsName), concat(config.outputJsMinName)))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(path.out.js));
});

gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'assets', 'scripts')));

gulp.task('watch', function () {
  gulp.watch(path.src.img, gulp.series('asset:img'));
  gulp.watch(path.src.font, gulp.series('asset:fonts'));
  gulp.watch(path.src.html, gulp.series('asset:html'));
  gulp.watch(path.watch.style, gulp.series('styles'));
  gulp.watch(path.watch.js, gulp.series('scripts'));
});

gulp.task('serve', function () {
  browserSync.init({
    server: path.out.root
  });
  browserSync.watch(path.out.root).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'serve')));