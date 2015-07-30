# i18n JS formater

A simple translation module with dynamic json storage which helps to format strings quickly and easily.

Parser can be extended with your own parsers.

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

To give a context to help the translation (this should be done in version 0.2)

	i18n.context('computer key', 'give the correct key'); // should be translated in French 'Donnez la bonne touche'
	i18n.context('door key', 'give the correct key'); // should be translated in French 'Donnez la bonne clef'

	i18n.context('time unit: minute', 'min');
	i18n.context('abbreviation: minimum', 'min');

To give plural translations (this should be done in version 0.3)

	i18n.n('a cat', '%s cats', 1); // in German: 'eine Katze'
	i18n.n('a cat', '%s cats', 3); // in German: '3 Katzen'

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
* **defaultLocale**: {String} the default local value (if no one are selected from storage). If the value is not a string the default value is the best from navigator.languages
* **storage**:	{String|String[]} the ways to store the current locale on browser. If the value is an array, it uses the first accessible technology.
				Possible values are (%s must be replaced by wanted name for storage):
	* *cookie:%s*: to store the locale in cookie
	* *localStorage:%s*: to store the locale in localstorage
	* *none*: to not store the locale in browser.
* **onLocaleReady**: {Function} called each time the data for the current locale are ready to use. Arguments are:
	* *key*: {String} the locale key which is ready.
* **log**: {Object} to be notify when issues occurs. If not defined a message to console is sent.
	* *info*: {Function} a function called when an info has to be prompted.
	* *warn*: {Function} a function called when a warning issue has to be prompted (sentence where translation is missing).
	* *error*: {Function} a function called when an error has to be prompted (wrong configuration).
* **dictionary**: 	{Object|String|Function} load data in "dictionary" format (cf section Load Data vs Load Dictionary).
					If the value is an object it is loaded as it is
					If the value is a string, it should be an url to load data.
					If the value is a function. This function will be called when data must be (re)loaded.
* **data**: 		{Object|String|Function} load data in "data" format (cf section Load Data vs Load Dictionary).
					If the value is an object it is loaded as it is
					If the value is a string, it should be an url to load data.
					If the value is a function. This function will be called when data must be (re)loaded.
* **lazyLoading**:	{Boolean} If true, load json file only when locale is changed (it works only with data loading and not with dictionary loading).
					[Default value: true]
* **syncLoading**:	{Boolean} If true, the json file loading is done synchronously.
* **localeSet**:	{Object} define all options at one for defined locales. It replaces locales defined with options "locales".
	* *key*:	{String} [Required] the locale to define.
	* *name*:	{String} the locale pretty name.
	* *data*:	{Object|String|Function} the data of the locale.
	* *secondary*: {String} the secondary language to use if the sentence is not translated

## API

### i18n()

Translates a single expression. Returns translated parsed and substituted string. If the translation is not found it returns the expression given.

	// (locale == 'fr')
	i18n('Hello'); // Salut
	i18n('Hello %s', 'Restimel'); // Salut Restimel
	i18n('Hello {{name}}', { name: 'Restimel' }); // Salut Restimel

	// give context (locale == 'fr')
	i18n.context('phone greating', 'Hello'); // Allo
	i18n({str: 'Hello', context: 'phone greating'}); // Allo

	// give an object (locale == 'fr')
	i18n({
		en: 'Hello',
		fr: 'Salut'
	}); // Salut

	// passing specific locale (needed?)
	i18n({str: 'Hello', locale: 'fr'}); // Salut

#### sprintf support

#### number format support

#### date support

### i18n.context()

### i18n.n()

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

	// template and global (this.locale == 'de')
	i18n.n('%s cat', '%s cats', 1); // 1 Katze
	i18n.n('%s cat', '%s cats', 3); // 3 Katzen

	//using numeric values
	i18n.n({
		0: 'no cats',
		1: 'a cat',
		default: '%s cats'
	}, quantity);

### i18n.configuration()

Change default configuration

Define locale to use

	i18n.configuration({locales: ['en', 'fr', 'de']}); // accepted locales are only 'en', 'fr' and 'de'
	i18n.configuration({localeName: {'en': 'English', 'fr': 'Français'}}); // set name for locales

Define locale configuration at once

	i18n.configuration({localeSet: [
		{
			key: 'en',
			name: 'English',
			data: 'dictionary-en.json'
		},
		{
			key: 'fr',
			name: 'Français',
			data: 'dictionary-fr.json'
		},
		{
			key: 'fr-be',
			name: 'Belge',
			data: 'dictionary-be.json',

		}
	]});

Change the way to use the library

	i18n.configuration({alias: '_'}); // now it is possible to use _ instead of i18n
	_.setLocale('fr');
	_('cat'); // returns "chat"

### i18n.setLocale()

Set the current locale globally or in current scope.

	// set locale to french
	i18n.setLocale('fr');
	i18n.setLocale('fr-FR');

	// set locale depending of browser context
	i18n.setLocale(); //equivalent to i18n.setLocale(navigator.language);

Note: if you have put a storage system (cookie, localStorage), i18n.setLocale() will use the last locale used in the browser.

### getLocale()

Get the current locale from current scope or globally.

	i18n.setLocale('fr');
	i18n.getLocale(); // 'fr'
	i18n.getLocale({locale: true}); // 'fr'
	i18n.getLocale({name: true}); // 'French'
	i18n.getLocale({locale: true, name: true}); // {locale: 'fr', name: 'French'}
	i18n.getLocale({data: 'hello'}); // 'salut'

### getLocales()

Returns a whole catalog optionally based on current scope and locale.

	i18n.getLocales(); // ['en', 'fr', 'de']
	i18n.getLocales({locale: true}) // ['en', 'fr', 'de']
	i18n.getLocales({name: true}) // ['English', 'Français', 'Deutsch']
	i18n.getLocales({data: 'hello'}) // ['hello', 'salut', 'hallo']
	i18n.getLocales({locale: true, name: true, data:'hello'}) // [{locale: 'en', name: 'English', data: 'hello'}, {locale: 'fr', name: 'Français', data: 'salut'}, {locale: 'de', name: 'Deutsch', data: 'hallo'}]

### clearData()

Clear all dictionary data

	i18n.clearData('fr'); // clear data of the french dictionary only
	i18n.clearData(); // clear data of all dictionaries

### Load Data vs Load Dictionary

There are two possible formats to load the translations sentences.
For both it is possible to load it in raw (by passing an object) or to load it via AJAX (with JSON format).

#### Dictionary

The dictionary format is an object containing the sentence key which contains all its translations:

	dictionary: {
		'a sentence to translate': {
			en: 'the English version',
			fr: 'the French version',
			de: 'the German version'
		},
		'a second sentence to translate': {
			en: 'its English version',
			fr: 'its French version',
			de: 'its German version'
		}
	}

You can load it via configuration

	i18n.configuration({
		dictionary: {
			'a': {
				en: 'a',
				fr: 'un'
			}
		}
	});

	// To load it from a JSON
	i18n.configuration({
		dictionary: 'path/dictionary.json'
	});

#### Data

The data format is an object containning all locale keys which contains all the sentence and their translations.

	data: {
		en: {
			'a sentence to translate': 'the English version',
			'a second sentence to translate': 'its English version'
		},
		fr: {
			'a sentence to translate': 'the French version',
			'a second sentence to translate': 'its French version'
		},
		de: {
			'a sentence to translate': 'the German version',
			'a second sentence to translate': 'its German version'
		}
	}

You can load it via configuration.
You can load it globally (load all languages at once):

	i18n.configuration({
		data: {
			en: {
				'a': 'a'
			},
			fr: {
				'a': 'un'
			}
		}
	});

	// To load it from a JSON
	i18n.configuration({
		data: 'path/dictionary.json'
	});

It is also possible to load it language by language.

	i18n.configuration({
		data: {
			en: {
				'a': 'a'
			}
		}
	});
	i18n.configuration({
		data: {
			fr: {
				'a': 'un'
			}
		}
	});

	// To load them from JSON
	i18n.configuration({
		data: {
			en: 'path/dictionary-en.json',
			fr: 'path/dictionary-fr.json'
		}
	});

### getData()

It is possible to retrieve the current loaded data with getData.

	i18n.getData(); // returns all data in data format
	i18n.getData({format: 'dictionary'}); // returns all data in dictionary format
	i18n.getData('en'); // returns all data of English language in data format
	i18n.getData({locale: 'en', format: 'dictionary'}); // returns all data of English language in dictionary format

### addItem()

It is possible to add new entry in the data.

	i18n.addItem('new sentence to add', {
		en: 'the English version',
		fr: 'the French version'
	});

## Add optional plug-in to enhance helpers or support different template engines

TODO version 0.5
