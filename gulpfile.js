"use strict"

const gulp = require('gulp')
const sass = require('gulp-sass')
const gutil = require('gulp-util')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

gulp.task('sass', function(){
  return gulp.src('./public/stylesheets/sass/*.sass')
        .pipe(sass({style: 'compressed'}))
        .pipe(postcss([ autoprefixer() ]))
        .on('error', gutil.log)
        .pipe(gulp.dest('./public/stylesheets/css'))
});

gulp.task('watch', function(){
  gulp.watch('public/stylesheets/sass/*.sass', ['sass'])
});

gulp.task('default', ['watch', 'sass'])
