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
	},
	versioned: ['./package.json']
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

//
// RELEASE
//
// usages:
//  gulp release --type=patch
//  gulp release --type=minor
//  gulp release --type=major
//  gulp release --version=2.3.6
//
// Beware that in order to execute this task you must have a GitHub API token Generate it in https://github.com/settings/tokens/new Then set it as environment variable
//
//      export CONVENTIONAL_GITHUB_RELEASER_TOKEN=221231r392r939wef9d
//

const minimist = require('minimist')

const options = minimist(process.argv.slice(2))

const conventionalChangelog = require('gulp-conventional-changelog')
const bump = require('gulp-bump')
const git = require('gulp-git')
const conventionalGithubReleaser = require('conventional-github-releaser');
const commitConvention = 'jquery'
const runSequence = require('run-sequence')
const gutil = require('gulp-util')
const fs = require('fs')

gulp.task('changelog', function() {
	return gulp.src('CHANGELOG.md', { buffer: false })
		.pipe(conventionalChangelog({ preset: commitConvention }))
		.pipe(gulp.dest('./'))
})
gulp.task('bump-version', function() {
	if (!options.type && !options.version)
		throw new Error('You must provide either a --type major/minor/patch or --version x.x.x option')
	return gulp.src(sources.versioned)
		.pipe(bump(options).on('error', gutil.log))
		.pipe(gulp.dest('./'))
})

gulp.task('commit-changes', function() {
	const version = getPackageJsonVersion()
	return gulp.src('.')
		.pipe(git.add())
		.pipe(git.commit('[Prerelease] Preparing to release ' + version))
})

gulp.task('push-changes', function(cb) {
	getBranchName(function(branch) {
		git.push('origin', branch, cb)
	})
})

gulp.task('create-new-tag', function(cb) {
	const version = getPackageJsonVersion();
    getBranchName(function(branch) {
        git.tag('v' + version, 'Releasing version: ' + version, function(error) {
            if (error) { return cb(error) }
            git.push('origin', branch, {args: '--tags'}, cb)
        })
    })
})

gulp.task('github-release', function(done) {
	checkReleaseRequirements()
	conventionalGithubReleaser({
            type: 'oauth',
            token: process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN
    }, {
        preset: commitConvention
    }, done)
})

gulp.task('release', function(callback) {
	checkReleaseRequirements()
	runSequence(
	'bump-version',
	'changelog',
	'commit-changes',
	'push-changes',
	'create-new-tag',
	'github-release',
    function(error) {
        if (error) {
            console.log(error.message);
        } else {
            console.log('RELEASE FINISHED SUCCESSFULLY');
        }
        callback(error)
    })
})

function checkReleaseRequirements() {
	if (!options.type && !options.version)
		throw new Error('You must provide either a --type major/minor/patch or --version x.x.x option')
	if (!process.env.CONVENTIONAL_GITHUB_RELEASER_TOKEN)
		throw new Error('In order create releases in GitHub you must have the env variable CONVENTIONAL_GITHUB_RELEASER_TOKEN set with a token')
}

// helper functions
function getBranchName(cb) {
	git.revParse({args: '--abbrev-ref HEAD', cwd: __dirname}, function(err, branch) {
		if (err) throw new Error('Error while getting currrent branch name', err)
		cb(branch)
	})
}

function getPackageJsonVersion() { return JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')).version }

