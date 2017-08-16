# i18n JS formatter

A simple translation module with dynamic json storage which helps to format strings quickly and easily. It works with template litterals strings.

Formatter can be extended with your own formatters.

It can be used in any JavaScript application (web, worker, NodeJS, ...).

You can play with the API at: https://restimel.github.io/i18n-js-formatter/demo/index.html


## Goal

i18n-js-formatter's mission is to provide to the end-user the best output (translated, formatted, secured) in an easy way to build it with JavaScript.

## Documentation

Watch following links for more information:

* [Download and Installation](doc/installation.md)
* [i18n API](doc/API.md)
* [Configuration](doc/configuration.md)
* [Errors management](errors.md)
* [Dictionary and Data format](doc/format.md)
* [Formatter API](doc/formatter.md)

## Quick usage examples

configuration:

```javascript
i18n.configuration({
	locales: ['en', 'fr'],
	dictionary: 'dictionary.json'
});
```

Changing locale:

```javascript
i18n.setLocale('fr');
```

Using strings which have to be translated

```javascript
i18n('hello'); //returns 'salut'
i18n('Hello %s!', 'Jim'); //returns 'Salut Jim!'
i18n`Hello ${'Kate'}%s!`; //returns 'Salut Kate!'
```

Format number depending on locale

```javascript
i18n('%f sentences', 1234567.8);
	//returns '1,234,567.8 sentences' (en)
	//returns '1 234 567,8 phrases' (fr)
	//returns '1.234.567,8 Sätze' (de)
```

Contextualize your sentence to make difference from same sentence or to give more context.

```javascript
i18n.context('computer key', 'Give the correct key'); // should be translated in French 'Donnez la bonne touche'
i18n.context('door key', 'Give the correct key'); // should be translated in French 'Donnez la bonne clef'

i18n.context('time unit: minute', 'min');
i18n.context('abbreviation: minimum', 'min');
```

To give plural translations (this should be done in version 0.4)

```javascript
i18n.n('a cat', '%s cats', 1); // in German: 'eine Katze'
i18n.n('a cat', '%s cats', 3); // in German: '3 Katzen'
```

To escape string easily depending on context (mainly to avoid user entries to create unexpected issues)

```javascript
i18n('quotes: %{esc:html}s', 'I <b>cannot</b> hack your site');
	// in English: 'quotes: I &lt;b&gt;cannot&lt;/b&gt; hack your site'
i18n('http://my_site.com/?search=%{esc:uric}s&limit=10', 'foo bar&baz=42');
	// returns 'http://my_site.com/?search=foo%20bar%26baz%3D42&limit=10'
```


## Parsing

In order to parse all your strings from your code and translate them easily, you can use [i18n-js-parser](https://github.com/restimel/i18n-js-parser).

## Licence

Creative Commons Attribution 3.0 Unported License: You are free to use, share, modify it while you keep credit to author and contributors (http://creativecommons.org/licenses/by/3.0/)

## Download

Get the minified version of

[the i18n API](https://restimel.github.io/i18n-js-formatter/i18n-js-formatter.min.js)

[the full API (i18n API + formatter)](https://restimel.github.io/i18n-js-formatter/i18n-js-formatter.full.min.js)

Get source files:

[i18n library](https://restimel.github.io/i18n-js-formatter/i18n-js-formatter.js)

[sprintf wrapper](https://restimel.github.io/i18n-js-formatter/script/wrapperSprintf.js) (to load it as formatter) note: you must also load sprintf

[inner formatter](https://restimel.github.io/i18n-js-formatter/script/wrapperSprintf.js) (the one described below)

You don't need both sprintf wrapper and the inner formatter. Only one is enough ;)

## Test

Jasmine tests are provided in folder `spec`.
Run tests with mainTest.html (located in the root folder) to assert it works well: https://restimel.github.io/i18n-js-formatter/mainTest.html

Please note that some tests may fail depending of browsers. Mainly depending of support of locale string conversion (uppercase, lowercase) where some locale were not fully supported.

## Version 0.3.0

*If you want you can help me to improve it. Fork the project and pull request your change.*

Keep tune for further update I am working on it.
