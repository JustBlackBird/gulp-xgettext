# gulp-xgettext [![NPM version](https://badge.fury.io/js/gulp-xgettext.png)](https://www.npmjs.org/package/gulp-xgettext)

> Gulp plugin for running [GNU xgettext](http://www.gnu.org/software/gettext/manual/gettext.html#xgettext-Invocation).


## Install

1. Install the plugin with the following command:

	```shell
	npm install gulp-xgettext --save-dev
	```

2. Install GNU xgettext


## Usage

```js
var gulp = require('gulp');
var xgettext = require('gulp-xgettext');

gulp.task('default', function () {
    return gulp.src(['src/**/*.cpp'])
        .pipe(xgettext({
            language: 'C++',
            keywords: [
                {name: 'get_local'}
            ]
        }))
        .pipe(gulp.dest('release'));
});
```


## API

### xgettext(options)

#### options.bin

Type: `String`

Default: `'xgettext'`

GNU xgettext executable.

#### options.language

Type: `String`

A language that should be used to parse the files. By default xgettext will try to determine a language by file extension.

#### options.keywords

Type: `Array`

List of keywords that should be checked. Each keyword is an object with the following properties:

- `name`: string, name of a localization function to search.
- `singular`: integer, number of argument that represents singular form of a string.
- `plural`: integer, number of argument that represents plural form of a string.
- `context`: integer, number of argument that represents context of a string.

All properties, except `name` are optional. Arguments counting starts from one.

#### options.headers

Type: `Object`

A list of headers that will be used in the resulting .po file. The list of available
headers with their descriptions can be found [here](https://www.gnu.org/software/gettext/manual/html_node/Header-Entry.html#Header-Entry).
If a header is not specified an appropriate `xgettext` value will be used.


## License

[MIT](http://opensource.org/licenses/MIT) © Dmitriy Simushev
