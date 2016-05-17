var gulp = require("gulp");
var inject = require("gulp-inject");
var concat = require("gulp-concat");

var bowerFiles = require("gulp-main-bower-files");

var sources = {
	js: ["public/javascripts/external/**/*.js", 
			"public/javascripts/**/*.js"],
	test: ["public/javascripts/external/**/*.js", 
			"tests/frontend/dependencies/**/*.js",
			"public/javascripts/**/*.js", 
			'tests/frontend/**/*.js']
}; 



gulp.task("dependency:link", ["depency:external:copy"], function() {
	var dependencies = gulp.src(sources.js);
		
	return gulp.src("public/index.html")
		.pipe(inject(dependencies, {
			ignorePath: 'public',
			addRootSlash: false
		}))
		.pipe(gulp.dest("public"))
});

function dependencyCopy(outDir, outFile, options) {
	return gulp.src("bower.json")
	    .pipe(bowerFiles(options || {}))
	    .pipe(concat(outFile))
		.pipe(gulp.dest(outDir));
}

gulp.task("dependency:test:copy", function() {
	return dependencyCopy("tests/frontend/dependencies", "test-dependencies.js", {includeDev: true});
});

gulp.task("dependency:external:copy", function() {
	return dependencyCopy("public/javascripts/external", "dependencies.js");
});

gulp.task("karma:dependency:link", ["dependency:external:copy", "dependency:test:copy"], function() {
	var dependencies = gulp.src(sources.test);
		
	return gulp.src("karma.conf.js")
		.pipe(inject(dependencies, {
			starttag: "files: [",
			endtag: "],",
			transform: function(path, file, index, total) {
				return '"' + path + '"' + (index + 1 < total ? "," : "");
			},
			addRootSlash: false
		}))
		.pipe(gulp.dest("."))
});