var gulp = require("gulp");
var inject = require("gulp-inject");
var htmlmin = require("gulp-htmlmin");

var sources = {
	js: "public/javascripts/**/*.js"
}; 

gulp.task("internal:dep:link", function() {
	var dependencies = gulp.src(sources.js);
		
	gulp.src("public/index.html")
		.pipe(inject(dependencies, {
			ignorePath: 'public',
			addRootSlash: false
		}))
		//.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest("public"))
});

gulp.task("watcheala", function() {
	gulp.watch(sources.js, ["internal:dep:link"]);
});
