
const gulp = require('gulp');
//scss转css
const sass = require('gulp-sass');
gulp.task('dev:scss', function () {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./src/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});
//less转css
const less = require('gulp-less');
gulp.task('dev:less', function() {
    return gulp.src('./src/less/**/*.less')
    .pipe(less())
    .pipe(gulp.dest('./src/css'));
});
//自动刷新
const browserSync = require('browser-sync');
gulp.task('dev:browserSync', function () {
    browserSync.init({
        server: {
            baseDir: "./src"
        }
    });
});
//检测js
const jshint = require('gulp-jshint');
const stylish = require('jshint-stylish');
gulp.task('dev:jslint', function() {
    return gulp.src('./src/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish))
        .pipe(browserSync.reload({
            stream: true
        }));
});
//es6转es5
const babel = require('gulp-babel');
const webpack = require('webpack-stream');
const name = require('vinyl-named');
gulp.task('dev:jses6', function() {
    gulp.src('./src/es6/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('./src/js')) //es6转为es5，输入到js文件夹下面
        .pipe(name()) //不改变js文件名
        .pipe(webpack()) //将es6高级部分（组件化等）转为es5
        .pipe(gulp.dest('./src/js')) //输入到js文件夹下面
        .pipe(browserSync.reload({ 
            stream: true
        }));
});
//给css自动添加前缀
const autoprefixer = require('gulp-autoprefixer');
gulp.task('dev:autoprefixer',function() {
    gulp.src('./src/css/*.css')
      .pipe(autoprefixer({
        browsers:['last 2 versions', 'Android >= 4.0'],
        cascade:true,
        remove:true
      }))
      .pipe(gulp.dest('./src/css'));
});
//先scss转css，然后给css加前缀
const runSequence = require('run-sequence');
gulp.task('dev:scss_runsequence',function(callback){
    runSequence('dev:scss','dev:autoprefixer',callback);
});
//先less转css，然后给css加前缀
gulp.task('dev:less_runsequence',function(callback){
    runSequence('dev:less','dev:autoprefixer',callback);
});


//开发任务--dev
//gulp dev
gulp.task('dev', ['dev:browserSync'], function() {
	//scss
	gulp.watch('./src/scss/**/*.scss', ['dev:scss_runsequence']);
    //less
    gulp.watch('./src/less/**/*.less', ['dev:less_runsequence']);
	//html
	gulp.watch('./src/**/*.html',browserSync.reload);
    //images
    gulp.watch('./src/images/*',browserSync.reload);
    //json-server
    //js
	gulp.watch('./src/js/**/*.js',['dev:jslint']);
});

gulp.task('dev:es6', ['dev:browserSync'], function() {
    //scss
    gulp.watch('./src/scss/**/*.scss', ['dev:scss_runsequence']);
    //less
    gulp.watch('./src/less/**/*.less', ['dev:less_runsequence']);
    //html
    gulp.watch('./src/**/*.html',browserSync.reload);
    //images
    gulp.watch('./src/images/*',browserSync.reload);
    //json-server
    //js-es6
    gulp.watch('./src/es6/**/*.js',['dev:jses6']);
});






//合并js、css&&压缩js、css
const useref = require('gulp-useref'); //合并js、css
const uglify = require('gulp-uglify'); //压缩js
const gulpif = require('gulp-if'); //判断css文件还是js文件
const minifyCss = require('gulp-clean-css'); //压缩css
const filter = require('gulp-filter'); //过滤文件 
const rev = require("gulp-rev"); //加md5
const revReplace = require("gulp-rev-replace"); //给html替换加过md5戳的文件
gulp.task('build:useref', function () {

    var indexHtmlFilter = filter(['**/*', '!**/*.html'], { restore: true });

    return gulp.src('./src/**/*.html')
        .pipe(useref()) //合并
        .pipe(indexHtmlFilter) //加md5时候排除html文件
        .pipe(rev()) //加css和js加md5
        .pipe(indexHtmlFilter.restore) //不移除html文件
        .pipe(revReplace()) //css/js改名字
        .pipe(gulpif('*.js', uglify())) //js压缩
        .pipe(gulpif('*.css', minifyCss())) //css压缩
        .pipe(gulp.dest('./dist'))
        .pipe(rev.manifest()) //生成json文件
        .pipe(gulp.dest('./dist/rev/cssjs'));
});
//压缩图片
const imagemin = require('gulp-imagemin');
gulp.task('build:imagemin', function () {
    return gulp.src('./src/images/*')
        .pipe(imagemin()) //压缩图片
        .pipe(rev()) //加md5
        .pipe(gulp.dest('./dist/images')) //将图片拷贝进生产/图片文件夹
        .pipe(rev.manifest()) //生成json文件
        .pipe(gulp.dest('./dist/rev/images')) //将生成的json文件放入生产/图片文件夹
});
//压缩html
//再根据json文件替换html中image路径
const htmlmin = require('gulp-htmlmin');
const revCollector = require('gulp-rev-collector');
gulp.task('build:htmlmin', function() {
    return gulp.src(['./dist/rev/images/*.json', './dist/**/*.html'])
        .pipe(revCollector())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist'));
});
//再根据json文件替换css中image路径
gulp.task('build:css_images_md5',function() {
    return gulp.src(['./dist/rev/images/*.json', './dist/**/*.css'])
        .pipe(revCollector())
        .pipe(gulp.dest('./dist'));
});
//删除打包文件夹
const del = require('del');
gulp.task('build:clean_dist', function(){
    //只保留images文件夹
    //return del(['dist/css','dist/js','dist/**/*.html']);
    //删除dist文件
    return del(['./dist/**/*']);
});




//删除dist
//合并压缩css/js && 给css/js加md5戳
//压缩图片 && 给图片加md5戳
//压缩html && 替换md5图片
//css文件 && 替换md5图片
gulp.task('build',function(callback){
    runSequence('build:clean_dist', 'build:useref','build:imagemin', 'build:htmlmin', 'build:css_images_md5', callback);
});