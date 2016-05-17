var gulp  = require('gulp');
var gutil = require('gulp-util');
var server = require('gulp-express');


gulp.task('default', function() {
    return gutil.log('Gulp is running!')
});

var config = {
    backend : {
        src : {
            main : ['config', 'models', 'routes', 'views'].map(all('js')),
            test : ['tests'].map(all('js'))
        }
    }
}

function all(extension) {
    return function(folder) {
        return folder + '/**/*.' + extension
    }
}

gulp.task('server', function () {
    server.run(['bin/www']);

    gulp.watch(config.backend.src.main, [server.run]);

    //gulp.watch(['app.js', 'routes/**/*.js'], [server.run]);
});
