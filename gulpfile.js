/*jshint node:true*/
'use strict';

var gulp = require('gulp'),
   jshint = require('gulp-jshint'),
   concat = require('gulp-concat'),
   mocha = require('gulp-mocha'),
   cover = require('gulp-coverage'),
   jscs = require('gulp-jscs'),
   beautify = require('gulp-beautify');

gulp.task('default', ['test']);

//gulp.task('test', ['jshint'], function() {
gulp.task('test', function() {
   console.log('Running unit tests');
   return gulp.src(['test/*unit-tests.js'], {
         read: false
      })
      .pipe(cover.instrument({
         pattern: ['lib/*.js'],
         debugDirectory: 'debug'
      }))
      .pipe(mocha({
         reporter: 'spec',
         globals: {}
      }))
      .pipe(cover.gather())
      .pipe(cover.format())
      .pipe(gulp.dest('reports'))
      .once('end', function() {
         process.exit();
      });
});

gulp.task('jshint', function() {
   console.log('Analyzing source with JSHint and JSCS');
   return gulp
      .src(['*.js', '!node_modules/**/*.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish', {
         verbose: true
      }))
      .pipe(jshint.reporter('fail'))
      .pipe(jscs());
});

gulp.task('beautify', function() {
   console.log('Beautifying source with indent level 3');
   return gulp
      .src(['*.js', '!node_modules/**/*.js'])
      .pipe(beautify({
         'indent_size': 3,
         'indent_char': ' ',
         'end_with_newline': true
      }))
      //
      // Replace the files in-place with the beautified versions.
      //
      .pipe(gulp.dest(function(vinylFile) {
         console.log('Beautifying \'' + vinylFile.path + '\'...');
         return vinylFile.base;
      }));
});
