var gulp           = require('gulp'),
		gutil          = require('gulp-util' ),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		pngquant = require('imagemin-pngquant'),
		cache          = require('gulp-cache'),
		rigger 	       = require('gulp-rigger'),
		autoprefixer   = require('gulp-autoprefixer'),
		ftp            = require('vinyl-ftp'),
		sourcemaps     = require('gulp-sourcemaps'),
		reload = browserSync.reload,
		notify         = require("gulp-notify");

var path = {
	build: { //Тут мы укажем куда складывать готовые после сборки файлы
		html: 'build/',
		js: 'build/js/',
		css: 'build/css/',
		img: 'build/img/',
		fonts: 'build/fonts/'
	},
	src: { //Пути откуда брать исходники
		html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
		js: 'src/js/common.js',//В стилях и скриптах нам понадобятся только main файлы
		style: 'src/style/main.sass',
		img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
		fonts: 'src/fonts/**/*.*',
		font_awesome: 'src/style/font-awesome/*.scss'
	},
	watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/style/**/*.sass',
		img: 'src/img/**/*.*',
		fonts: 'src/fonts/**/*.*'
	},
	clean: './build'
};
var config = {
	server: {
		baseDir: "./build"
	},
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend_Devil"
};
gulp.task('html:build', function () {
	gulp.src(path.src.html) //Выберем файлы по нужному пути
		.pipe(rigger()) //Прогоним через rigger
		.pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
		.pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});
gulp.task('js:build', function () {
	gulp.src(path.src.js) //Найдем наш main файл
		.pipe(rigger()) //Прогоним через rigger
		.pipe(sourcemaps.init()) //Инициализируем sourcemap
		.pipe(uglify()) //Сожмем наш js
		 .pipe(sourcemaps.write()) //Пропишем карты
		.pipe(gulp.dest(path.build.js)) //Выплюнем готовый файл в build
		.pipe(reload({stream: true})); //И перезагрузим сервер
});
gulp.task('style:build', function () {
	gulp.src(path.src.style) //Выберем наш main.scss
		.pipe(sourcemaps.init()) //То же самое что и с js
		.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS()) 
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(path.build.css)) //И в build
		.pipe(reload({stream: true}));
});
gulp.task('img:build', function () {
	gulp.src(path.src.img) //Выберем наши картинки
		.pipe(imagemin({ //Сожмем их
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()],
			interlaced: true
		}))
		.pipe(gulp.dest(path.build.img)) //И бросим в build
		.pipe(reload({stream: true}));
});
gulp.task('fonts:build', function() {
	gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts))
});
gulp.task("font-awesome:build",function(){
	gulp.src(path.src.font_awesome)
		.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS()) 
		.pipe(gulp.dest(path.build.css));
});
gulp.task('webserver', function () {
	browserSync(config);
});
gulp.task('build', [
	'html:build',
	'js:build',
	'style:build',
	'fonts:build',
	'img:build',
	'font-awesome:build'
]);
gulp.task('watch', function(){
	gulp.watch([path.watch.html], function(event, cb) {
		gulp.start('html:build');
	});
   gulp.watch([path.watch.style], function(event, cb) {
		gulp.start('style:build');
	});
	gulp.watch([path.watch.js], function(event, cb) {
		gulp.start('js:build');
	});
	gulp.watch([path.watch.img], function(event, cb) {
		gulp.start('img:build');
	});
	gulp.watch([path.watch.fonts], function(event, cb) {
		gulp.start('fonts:build');
	});
});
gulp.task('clean', function (cb) {
	rimraf(path.clean, cb);
});
gulp.task('default', ['build', 'webserver', 'watch']);

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});