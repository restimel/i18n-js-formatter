# i18n formater

A simple translation module with dynamic json storage which helps to format strings quickly and easily.

## Version 0.0.1

**This library is still under developement and is still not usable right now. I hope this can be done soon.**

*If you want you can help me to improve it. Fork the project and pull request your change.*

Keep tune for further update I am working on it.

## quick usage example

	i18n.configure({
		locales: ['en', 'fr'],
		dictonary: 'dictionary.json'
	});
	i18n.setLocale('fr');

	i18n('hello'); //returns 'salut'
	i18n('Hello %s!', 'Jim'); //returns 'Salut Jim!'

## Installation

You only have to insert the i18n-js-formatter.js file in your web page.

	<script src="i18n-js-formatter.js"></script>

## Test

Jasmine tests are provided in folder `spec`.
Run tests with mainTest.html (located in the root folder) to assert it works well: https://restimel.github.io/i18n-js-formatter/mainTest.html

## Configure

There are 2 ways to configure the library.

The first way is to define an object with wanted options (cf below) in variable _i18n_config before running the i18n-js-formatter script.
For some options, this is the only way to set them.

The second possibility is to use the configuration method available in the library API.

### list of configuration options

* **doNotAliasi18n**: {Boolean} if true it does not create a variable i18n in the global context.
			This is to avoid variable conflicts with other library.
			This option is only available with _i18_config configuration (at start).
			/!\ if you use this variable you must also use 'alias' to bind the API to a variable.
* **alias**:	{String} allow to save the function to another global variable.
			example: i18n.configuration({alias: '$$'}); // now you can use the variable $$ to access the API
* **locales**:	{String[]} list of locale keys.
			example: i18n.configuration({locale: ['en', 'fr']}; // handle only english and french
* **localeName**: {String{}} give a pretty name to locale.
			example: i18n.configuration({localeName: {en: 'English', fr: 'Français'}});

## API

### i18n()

Translates a single expression. Returns translated parsed and substituted string. If the translation is not found it returns the expression given.

	// (this.locale == 'fr')
	$$('Hello'); // Salut
	$$('Hello %s', 'Restimel'); // Salut Restimel
	$$('Hello {{name}}', { name: 'Restimel' }); // Salut Restimel

	// give context (this.locale == 'fr')
	$$({str: 'Hello', context: 'phone greating'}); // Allo

	// passing specific locale (needed?)
	$$({str: 'Hello', locale: 'fr'}); // Salut

#### sprintf support

#### number format support

#### date support

### $$.n()

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

	// template and global (this.locale == 'de')
	$$.n("%s cat", "%s cats", 1); // 1 Katze
	$$.n("%s cat", "%s cats", 3); // 3 Katzen

### $$.configuration()

Change default configuration

	$$.configuration({locales: ['en', 'fr', 'de']}); // accepted locales are only 'en', 'fr' and 'de'
	$$.configuration({localeName: {'en': 'English', 'fr': 'Français'}}); // set name for locales (this could also been set when loading translated strings)

### $$.setLocale()

Set the current locale globally or in current scope.

	// set locale to french
	$$.setLocale('fr');
	$$.setLocale('fr-FR');

	// set locale depending of browser context
	$$.setLocale(); //equivalent to $$.setLocale(navigator.language);

### getLocale()

Get the current locale from current scope or globally.

	$$.setLocale('fr');
	$$.getLocale(); // 'fr'
	$$.getLocale({locale: true}); // 'fr'
	$$.getLocale({name: true}); // 'French'
	$$.getLocale({locale: true, name: true}); // {locale: 'fr', name: 'French'}

### getLocales()

Returns a whole catalog optionally based on current scope and locale.
	$$.getLocales(); // ['en', 'fr', 'de']
	$$.getLocales({locale: true}) // ['en', 'fr', 'de']
	$$.getLocales({name: true}) // ['English', 'Français', 'Deutsh']
	$$.getLocales({locale: true, name: true}) // [{locale: 'en', name: 'English'}, {locale: 'fr', name: 'Français'}, {locale: 'de', name: 'Deutsh'}]

## Optionally manual attaching helpers for different template engines
