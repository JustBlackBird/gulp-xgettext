var gutil = require('gulp-util'),
    through = require('through2'),
    PoFile = require('pofile'),
    lodash = require('lodash'),
    exec = require('child_process').exec;

/**
 * Builds shell command for GNU xgettext according to specified options.
 *
 * @param {Object} opt List of options.
 * @returns {String} Shell command with all needed flags.
 */
var buildCommand = function(opt) {
    var opt = opt || {};
    var command = opt.bin || 'xgettext';

    command += ' --force-po -o -';

    if (opt.language) {
        command += ' --language="' + opt.language + '"';
    }

    if (opt.keywords) {
        for (var i = 0, l = opt.keywords.length; i < l; i++) {
            var keyword = opt.keywords[i],
                args = [];
            if (!keyword.name || (typeof keyword.name !== 'string')) {
                throw new gutil.PluginError('gulp-xgettext', 'Name of a keyword must be a not empty string')
            }

            if (keyword.singular) {
                args.push(keyword.singular);
            }

            if (keyword.plural) {
                if (keyword.singular) {
                    throw new gutil.PluginError('gulp-xgettext', '"plural" cannot be set without "singular"');
                }

                args.push(keyword.plural);
            }

            if (keyword.context) {
                if (keyword.singular) {
                    throw new gutil.PluginError('gulp-xgettext', '"context" cannot be set without "singular"');
                }

                args.push(keyword.context + 'c');
            }

            command += ' --keyword="'
                + keyword.name + (args.length ? (':' + args.join(',')) : '')
                + '"';
        }
    }

    // Use STDIN as input
    command += ' -';

    return command;
}

var xgettextPlugin = function(options) {
    return through.obj(function(file, enc, callback) {
        var stream = this;

        if (file.isNull()) {
            stream.push(file);
            callback();

            return;
        }

        if (file.isStream()) {
            stream.emit('error', new gutil.PluginError('gulp-xgettext', 'Streams are not supported'));
            callback();

            return;
        }

        // Run xgettext
        var xgettext = exec(buildCommand(options), function(error, stdout, stderr) {
            var po = PoFile.parse(stdout);

            // Remove file level comments
            po.comments = [];
            // Provide an ability to override headers.
            po.headers = lodash.merge(po.headers, (options.headers || {}));

            // Use relative path instead of "standart input" string in reference
            // comments.
            for (var i = 0; i < po.items.length; i++) {
                var matches,
                    updatedReferences = [],
                    lineRegExp = /[^:]+:(\d+)/g;

                for (var j = 0; j < po.items[i].references.length; j++) {
                    // "pofile" module does not support more than one reference
                    // per line. Thus we must deal with it manually.
                    while (matches = lineRegExp.exec(po.items[i].references[j])) {
                        updatedReferences.push(file.relative + ':' + matches[1]);
                    }
                }

                po.items[i].references = updatedReferences;
            }

            // Update file contents
            file.contents = new Buffer(po.toString());
            stream.push(file);
            callback();
        });

        // Pass content of the file as STDIN to xgettext
        xgettext.stdin.write(file.contents);
        xgettext.stdin.end();
    });
}

module.exports = xgettextPlugin;
