const gulp = require('gulp');
const del = require('del');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const cleanCSS = require('gulp-clean-css');
const gulpIf = require('gulp-if');
const gulplog = require('gulplog');
const browserSync = require('browser-sync');
const webpackStream = require('webpack-stream');
const named = require('vinyl-named');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const status = process.env.STATUS || 'development';
const isDevelopment = status === 'development';
const isProduction = status === 'production';

const path = {
  src: {
    base: 'src/',
    img: 'src/img/**/*.*',
    font: 'src/fonts/**/*.*',
    html: ['src/index.html', 'src/pages/**/*.html'],
    style: 'src/styles/main.scss',
    jsVendor: 'src/js/vendor/**/*.*',
    jsBase: 'src/js/*.*',
  },
  out: {
    root: 'public/',
    img: 'public/img',
    font: 'public/font',
    html: 'public/',
    css: 'public/',
    js: 'public/',
  },
  watch: {
    style: 'src/styles/**/*.*',
    js: 'src/js/**/*.*',
  },
};

const config = {
  outputCssMinName: 'bundle.min.css',
  outputCssName: 'bundle.css',
  outputJsMinName: 'bundle.min.js',
  outputJsName: 'bundle.js',
};

function clean() {
  return del(path.out.root);
}

function assetImg() {
  return gulp.src(path.src.img)
    .pipe(rename({ dirname: path.out.img }))
    .pipe(gulp.dest('.'));
}

function assetFont() {
  return gulp.src(path.src.font)
    .pipe(rename({ dirname: path.out.font }))
    .pipe(gulp.dest('.'));
}

function assetHtml() {
  return gulp.src(path.src.html, { base: path.src.base })
    .pipe(gulp.dest(path.out.html));
}

function styles() {
  return gulp.src(path.src.style)
    .pipe(plumber({
      errorHandler: notify.onError(() => {
        const notifyErrorTemplate = {
          title: 'Styles error',
          message: 'Error: <%= error.message %>',
        };
        return notifyErrorTemplate;
      }),
    }))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(sass())
    .pipe(gulpIf(isDevelopment, concat(config.outputCssName), concat(config.outputCssMinName)))
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
    }))
    .pipe(gulpIf(isProduction, cleanCSS({ compatibility: 'ie8' })))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest(path.out.css))
    .pipe(browserSync.stream());
}

function webpack(callback) {
  let firstBuildReady = false;

  function done(err, stats) {
    firstBuildReady = true;
    if (err) {
      return;
    }
    gulplog[stats.hasErrors() ? 'error' : 'info'](stats.toString({
      colors: true,
    }));
  }

  const conf = {
    mode: status,
    // Setting for dynamic module loader by required
    // output: {
    //   publicPath: path.out.js,
    // },
    watch: isDevelopment,
    watchOptions: {
      aggregateTimeout: 100,
    },
    devtool: isDevelopment ? 'source-map' : false,
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
      ],
    },
    optimization: {
      minimizer: [new UglifyJsPlugin()],
      noEmitOnErrors: true,
    },
  };

  return gulp.src([path.src.jsVendor, path.src.jsBase])
    .pipe(plumber({
      errorHandler: notify.onError(() => {
        const notifyErrorTemplate = {
          title: 'Webpack error',
          message: 'Error: <%= error.message %>',
        };
        return notifyErrorTemplate;
      }),
    }))
    .pipe(named())
    .pipe(webpackStream(conf, null, done))
    .pipe(gulp.dest(path.out.js))
    .on('data', () => {
      if (firstBuildReady) {
        callback();
      }
    });
}

function watch() {
  gulp.watch(path.src.img, gulp.series(assetImg));
  gulp.watch(path.src.font, gulp.series(assetFont));
  gulp.watch(path.src.html, gulp.series(assetHtml));
  gulp.watch(path.watch.style, gulp.series(styles));
}

function serve() {
  browserSync.init({
    server: path.out.root,
  });
  browserSync.watch(path.out.root).on('change', browserSync.reload);
}

exports.clean = clean;
exports.assetImg = assetImg;
exports.assetFont = assetFont;
exports.assetHtml = assetHtml;

const assets = gulp.parallel(assetImg, assetFont, assetHtml);
exports.assets = assets;

exports.styles = styles;
exports.webpack = webpack;

const build = gulp.series(clean, gulp.parallel(assets, styles, webpack));
exports.build = build;

exports.watch = watch;
exports.serve = serve;

exports.default = gulp.series(build, gulp.parallel(watch, serve));
