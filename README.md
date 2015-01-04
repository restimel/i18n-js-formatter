# i18n formater

A simple translation module with dynamic json storage which helps to format strings quickly and easily.

## Install

	TODO but it will be only some JS scripts to load

## Test

	Jasmine tests, located in /test/mainTest.html

## Configure

TODO

### list of configuration options

	TODO


## API

### $$()

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
