"use strict"

const gulp = require('gulp')
const sass = require('gulp-sass')
const gutil = require('gulp-util')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

// var jsFiles = 'public/js/*.js',
//     jsDest = 'public/js'
//
// gulp.task('scripts', function() {
//     return gulp.src(jsFiles)
//         .pipe(concat('frontend.js'))
//         .pipe(gulp.dest(jsDest));
// });

gulp.task('sass', function(){
  return gulp.src('./public/stylesheets/sass/*.sass')
        .pipe(sass({style: 'compressed'}))
        .pipe(postcss([ autoprefixer() ]))
        .on('error', gutil.log)
        .pipe(gulp.dest('./public/stylesheets/css'))
})

gulp.task('watch', function(){
  gulp.watch('public/stylesheets/sass/*.sass', ['sass'])
  // gulp.watch('public/js/*.js', ['scripts'])
})

gulp.task('default', ['watch', 'sass'])
