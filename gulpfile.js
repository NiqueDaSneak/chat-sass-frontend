"use strict"

const gulp = require('gulp')
const sass = require('gulp-sass')
const gutil = require('gulp-util')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('sass', function(){
  return gulp.src('./public/stylesheets/sass/styles.sass')
  .pipe(sass({style: 'compressed'}))
  .pipe(postcss([ autoprefixer() ]))
  .pipe(rename('styles.css'))
  .on('error', gutil.log)
  .pipe(gulp.dest('./public/prod'))
})

gulp.task('websiteSass', () => {
  return gulp.src('./public/stylesheets/sass/website.sass')
  .pipe(sass({style: 'compressed'}))
  .pipe(postcss([ autoprefixer() ]))
  .pipe(rename('website.css'))
  .on('error', gutil.log)
  .pipe(gulp.dest('./public/prod'))
})

gulp.task('commerceSass', () => {
  return gulp.src('./public/stylesheets/sass/commerce/commerce.sass')
  .pipe(sass({style: 'compressed'}))
  .pipe(postcss([ autoprefixer() ]))
  .pipe(rename('commerce.css'))
  .on('error', gutil.log)
  .pipe(gulp.dest('./public/prod'))
})


gulp.task('watch', function(){
  gulp.watch('public/stylesheets/sass/*.sass', ['sass','websiteSass'])
  gulp.watch('public/stylesheets/sass/commerce/*.sass', ['commerceSass'])
})

gulp.task('default', ['watch', 'sass', 'websiteSass', 'commerceSass'])
