const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
const cssmin = require("gulp-cssmin");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync");
const cleanCSS = require("gulp-clean-css");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const size = require("gulp-size");
const notify = require("gulp-notify");
const babel = require("gulp-babel");
const strip = require("gulp-strip-comments");
const concat = require('gulp-concat');

const handleError = function(err) {
  console.log(err);
  this.emit("end");
};

gulp.task("browserSync", function() {
  browserSync.init({
    server: "./Assets",
    notify: false
  });
});
//============================================
// Sass tasks
//============================================
gulp.task("sass", function() {
  var s = size();
  return gulp
    .src("Assets/sass/style.scss")
    .pipe(
      plumber({
        //dodaje obsługę błędów
        errorHandler: handleError
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "compressed"
      })
    )
    .pipe(autoprefixer({ browsers: ["> 1%"] }))
    .pipe(cleanCSS())
    .pipe(s)
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("Assets/css"))
    .pipe(browserSync.stream({ match: "**/*.css" }))
    .pipe(
      notify({
        onLast: true,
        message: function() {
          return "Total CSS size: " + s.prettySize;
        }
      })
    );
});
//============================================
// JavaScript tasks
//============================================
gulp.task("js", function() {
  var s = size();
  return gulp
    .src(["Assets/js/app/**/*.js", "!Assets/js/app/min/**/*.js"])
    .pipe(babel())
    .pipe(
      plumber({
        errorHandler: handleError
      })
    )
    .pipe(sourcemaps.init())
    .pipe(strip())
    .pipe(uglify())
    .pipe(s)
    .pipe(
      rename({
        suffix: ".min"
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("Assets/js/app/min"))
    .pipe(browserSync.stream({ match: "**/*.js" }))
    .pipe(
      notify({
        onLast: true,
        message: function() {
          return "Total JS size " + s.prettySize;
        }
      })
    );
});
//============================================
// JavaScript tasks for libs
//============================================
gulp.task("js-lib", function() {
  var s = size();
  return gulp
    .src([
      // jQuery Librarires
      "./Assets/js/libs/jquery-3.2.1.js",
      // Polyfill: ES6 PromiseJs
      "./Assets/js/libs/es6-promise.js",
      // Bootstrap components
      "./Assets/js/libs/bootstrap.js"
    ])
    .pipe(
      plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
    )
    .pipe(concat("scripts.min.js"))
    .pipe(uglify())
    .pipe(s)
    .pipe(gulp.dest("./Assets/js/libs/min"))
    .pipe(
      notify({
        onLast: true,
        message: function() {
          return "Total JS size " + s.prettySize;
        }
      })
    );
});
//============================================
// Images optimization
//============================================
gulp.task("images", function() {
  return gulp
    .src("./Assets/img/**/*.{jpg,png}")
    .pipe(
      smushit({
        verbose: true
      })
    )
    .pipe(gulp.dest("./Assets/img"));
});

//============================================
// Gulp watch
//============================================
gulp.task("watch", function() {
  gulp
    .watch(["Assets/js/app/**/*.js", "Assets/js/libs/**/*.js", "!Assets/js/libs/min/**/*.js", "!Assets/js/app/min/**/*.js"], ["js"])
    .on("change", browserSync.reload);
  gulp
    .watch("Assets/sass/**/*.scss", ["sass"])
    .on("change", browserSync.reload);
  gulp.watch("**/*.html").on("change", browserSync.reload);
});

gulp.task("default", ["js-lib", "js", "sass", "browserSync", "watch"]);
gulp.task("build", ["js-lib", "images", "js", "sass", "browserSync", "watch"]);
