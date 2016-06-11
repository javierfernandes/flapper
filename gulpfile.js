var gulp = require("gulp");
var inject = require("gulp-inject");
var concat = require("gulp-concat");

var bowerFiles = require("gulp-main-bower-files");

var mocha = require("gulp-mocha");
var protractor = require("gulp-protractor").protractor;
var KarmaServer = require("karma").Server;

var sources = {
	js: ["public/javascripts/external/**/*.js", 
			"public/javascripts/**/*.js"],
	test: {
		frontend: ["tests/frontend/dependencies/**/*.js",
			"public/javascripts/**/*.js", 
			'tests/frontend/**/*.js'],
		backend: ["tests/backend/**/*.js"],
		e2e: ["tests/e2e/**/*.js"]
	}
}; 



gulp.task("dependency:link", ["dependency:external:copy"], function() {
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

//TODO: Antes de esto deberia limpiarse
gulp.task("dependency:test:copy", function() {
	return dependencyCopy("tests/frontend/dependencies", "test-dependencies.js", {includeDev: true});
});

//TODO: Antes de esto deberia limpiarse
gulp.task("dependency:external:copy", function() {
	return dependencyCopy("public/javascripts/external", "dependencies.js");
});

gulp.task("karma:dependency:link", ["dependency:external:copy", "dependency:test:copy"], function() {
	var dependencies = gulp.src(sources.test.frontend);
		
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

gulp.task("test:backend", function() {
	return gulp.src(sources.test.backend)
		.pipe(mocha());
});

gulp.task("test:frontend", ["karma:dependency:link"], function(done) {
	new KarmaServer({
		configFile: __dirname + "/karma.conf.js",
		singleRun: true
	}).start(done);
});

gulp.task("test:e2e", ["build"], function() {
	return gulp.src(sources.test.e2e)
		.pipe(protractor({configFile: "protractor.conf.js"}));
});

gulp.task("build", ["dependency:link"]);

//TODO: Revisar porque e2e queda corriendo en background
gulp.task("test:light", ["test:backend", "test:frontend"]);
gulp.task("test:all", ["test:light", "test:e2e"]);

gulp.task("auto:tests", function() {
	gulp.watch(["models/**/*.js", "routes/**/*.js"], ["test:backend"]);
	gulp.watch(["public/modules/**/*.js", "exampleApp.js"], ["test:frontend"]);
});

