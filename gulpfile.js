var gulp = require('gulp');
var gulpif = require('gulp-if');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var istanbul = require('gulp-istanbul');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var production = process.env.NODE_ENV === 'production';
var allJavaScriptFiles = ['client/src/**/*.js', 'client/test/**/*.js', 'server/src/**/*.js', 'server/test/**/*.js', '*.js'];
var istanbulReporters = production ? ['text'] : ['text-summary', 'lcov'];
var mochaReporter = production ? 'spec' : 'nyan';
var clientBundleLocation = 'client/bundle';

gulp.task('test', function (callback) {
  gulp.src(['client/test/**/*.js', 'server/test/**/*.js'])
    .pipe(istanbul({ includeUntested: true }))
    .pipe(istanbul.hookRequire())
    .on('finish', function () {
      gulp.src(['client/test/**/*.js', 'server/test/**/*.js'])
        .pipe(mocha({ reporter: mochaReporter }))
        .pipe(istanbul.writeReports({ reporters: istanbulReporters }))
        .pipe(istanbul.enforceThresholds({
          thresholds: {
            global: 85
          }
        }))
        .on('end', callback);
    });
});

gulp.task('lint', function() {
  return gulp.src(allJavaScriptFiles)
    .pipe(jshint({
      esversion: 6
    }))
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', function() {
  return gulp.src(['client/lib/*.js', 'client/src/*.js'])
    .pipe(concat('app.js'))
    .pipe(gulpif(production, uglify()))
    .pipe(gulp.dest(clientBundleLocation));
});

gulp.task('less', function() {
  return gulp.src('client/less/style.less')
    .pipe(less())
    .pipe(gulpif(production, minifyCss()))
    .pipe(gulp.dest(clientBundleLocation));
});

gulp.task('static', function() {
  return gulp.src('client/static/**/*')
    .pipe(gulp.dest(clientBundleLocation));
});

gulp.task('watch', function() {
  watchMode = true;

  gulp.watch(allJavaScriptFiles, ['test', 'lint']);
  gulp.watch('client/less/**/*.less', ['less']);
  gulp.watch('client/src/**/*.js', ['scripts']);
});

gulp.task('quality', ['test', 'lint']);
gulp.task('default', ['quality', 'scripts', 'less', 'static']);
