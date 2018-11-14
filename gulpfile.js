const gulp = require("gulp4");
const less = require('gulp-less');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const del = require('del');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync');

function clean() {
    return del(['build'])
};

gulp.task('clean', clean);

gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'app'
        },
    })
})


function styles() {
    return gulp.src('public/stylesheets/*.less')
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(gulp.dest('build/stylesheets/'))
        .pipe(browserSync.reload({
            stream: true
        }));
}


function js() {
    return gulp.src('public/javascripts/*.js')

        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(gulp.dest('build/javascripts/'))
        .pipe(browserSync.reload({
            stream: true
        }));
}

function image () {
    return gulp.src('public/images/*.*')
        .pipe(imagemin())
        .pipe(rename({
            suffix : '.min'
        }))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest('build/img/'))
        .pipe(browserSync.reload({
            stream: true
        }));
}

gulp.task('default', gulp.series(clean, gulp.parallel(styles, js, image)));

