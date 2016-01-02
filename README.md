# i18n JS formater

A simple translation module with dynamic json storage which helps to format strings quickly and easily.

Formatter can be extended with your own formatters.

It can be used in any JavaScript application (web, worker, NodeJS, ...).

You can try it at: https://restimel.github.io/i18n-js-formatter/demo/demo.html

## Version 0.0.2

*If you want you can help me to improve it. Fork the project and pull request your change.*

Keep tune for further update I am working on it.

## Goal

i18n-js-formater's mission is to provide to the end-user the best output (translated, formatted, secured) in an easy way to build it with JavaScript.

## quick usage example

configuration:

	i18n.configuration({
		locales: ['en', 'fr'],
		dictonary: 'dictionary.json'
	});

Changing locale:

	i18n.setLocale('fr');

Using strings which have to be translated

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

## Licence

Creative Commons Attribution 3.0 Unported License: You are free to use, share, modify it while you keep credit to author and contributors (http://creativecommons.org/licenses/by/3.0/)

## Installation

You only have to insert the i18n-js-formatter.js file in your web page.

	<script src="i18n-js-formatter.js"></script>

It supports AMD module, nodeJS module and ES6 module.

## Test

Jasmine tests are provided in folder `spec`.
Run tests with mainTest.html (located in the root folder) to assert it works well: https://restimel.github.io/i18n-js-formatter/mainTest.html

## Configuration

There are 2 ways to configure the library.

The first way is to define an object with wanted options (cf below) in variable _i18n_config before running the i18n-js-formatter script.
For some options, this is the only way to set them.

The second possibility is to use the configuration method available in the library API (cf section bellow).

### list of configuration options

* **doNotAliasi18n**: {Boolean} if true it does not create a variable i18n in the global context.
			This is to avoid variable conflicts with other library.
			This option is only available with _i18_config configuration (at start).
			/!\ if you use this variable you must also use 'alias' to bind the API to a variable.
* **doNotLoadFormatter**: {Boolean} if true wrappers does not load formatter.
			The formatter have to be load later. This allow to load them with different configuration.
			This option is only available with _i18_config configuration (at start).
* **alias**:	{String} allow to save the function to another global variable.
			example: i18n.configuration({alias: '$$'}); // now you can use the variable $$ to access the API
* **locales**:	{String[]} list of locale keys.
			example: i18n.configuration({locale: ['en', 'fr']}; // handle only english and french
* **localeName**: {String{}} give a pretty name to locale.
			example: i18n.configuration({localeName: {en: 'English', fr: 'Français'}});
* **defaultLocale**: {String} the default local value (if no one are selected from storage). If the value is not a string the default value is the best from navigator.languages
* **secondary**: {String{}} set a fallback to another locale if the sentence is not translated in the current locale
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
* **formatRules**: {Object} rules for some output format depending of locales.
					For each locale keys, an object contains the rules.
	* **number**: {Object} rules for displaying numbers. Attributes are **thousandSeparator**, **decimalSeparator**, **exponentialSeparator** (see formatter section for more details)
* **localeSet**:	{Object} define all options at one for defined locales. It replaces locales defined with options "locales".
	* *key*:	{String} [Required] the locale to define.
	* *name*:	{String} the locale pretty name.
	* *data*:	{Object|String|Function} the data of the locale.
	* *secondary*: {String} the secondary locale to use if the sentence is not translated in the current locale

## API

### i18n()

Translates a single expression. Returns translated parsed and substituted string. If the translation is not found it returns the expression given.

	// (locale == 'fr')
	i18n('Hello'); // Salut

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

### i18n.parse()

It is possible to parse a single string in order to format it.
Example:

	i18n.parse('Hello %s', 'Restimel'); // Hello Restimel
	i18n.parse('Hello {{name}}', { name: 'Restimel' }); // Hello Restimel

The formatters are also called on each translation string:

	i18n.setLocale('fr');
	i18n('Hello %s', 'Restimel'); // Salut Restimel
	i18n('Hello {{name}}', { name: 'Restimel' }); // Salut Restimel

Note: calling directly i18n.parse will not prompt warning log if the key string is not in data dictionary. So for short string where only formatting is expected i18n.parse() is better than i18n().

WARNING:
By default, no formatter are loaded. You must load a formatter (with i18n.loadFormatter()) in order to do the parsing.

An inner formatter will be added soon.

It is possible to add several formatter and they will be all called.

#### i18n.loadFormatter

This is to add a new formatter to the i18n API.

	i18n.loadFormatter(formatterFunction);

The formatter function will be called with 3 arguments:

* text {String}: this is the raw text which must be parsed
* args {Any[]}: this is the list of arguments given to replace wildcards.
* sv {Object}: this is an object containing all locale information. sv.currentLocale is the current Locale.

It must return a string.

It is possible to add several formatters and order them with the weight attribute:

	i18n.loadFormatter({
		formatter: formatterFunction,
		weight: 150
	});

By default weight is 100. If the weight is higher than another formatter, the formatter will be called before.

#### i18n.getRules

It retrieves the current formatting rules or the one specified by the first argument.

	i18n.getRules('fr') =>	{
								number: {
									thousandSeparator: ' ',
									decimalSeparator: ',',
									exponentialSeprator: 'e'
								}
							}

	// in locale (en)
	i18n.getRules() =>	{
							number: {
								thousandSeparator: ',',
								decimalSeparator: '.',
								exponentialSeprator: 'e'
							}
						}

See formatter section to get more details about Rules values

#### sprintf support

src/wrapperSprintf.js contains a simple method to handle Sprintf API as a formatter for i18n API.

If _i18n_config.doNotLoadFormatter is set to true, the sprintf formatter is not automatically added to i18n but you can load the function "callSprintf" manually with the options you want.

### i18n.context() [version 0.2]

### i18n.n() [version 0.3]

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

#### Change default configuration

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
	i18n.getLocale({key: true}); // 'fr'
	i18n.getLocale({name: true}); // 'Français'
	i18n.getLocale({locale: true, name: true}); // {locale: 'fr', name: 'Français'}
	i18n.getLocale({key: true, name: true}); // {key: 'fr', name: 'Français'}
	i18n.getLocale({data: 'hello'}); // 'salut'

### getLocales()

Returns a whole catalog optionally based on current scope and locale.

	i18n.getLocales(); // ['en', 'fr', 'de']
	i18n.getLocales({locale: true}) // ['en', 'fr', 'de']
	i18n.getLocales({key: true}) // ['en', 'fr', 'de']
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

## Managing Errors

The API give several feed back when issues occurs. There are splitted in 3 kinds: info, warning and error.

It is possible to listen on these messages with "log".

	i18n.configuration({
		log: {
			info: function(code, message, details) {},
			warn: function(code, message, details) {},
			error: function(code, message, details) {}
		}
	});

Arguments are:
* **code** {Number}:. The goal of this "code" is to handle issues in a easy way.
* **message** {String}: information message to express the issue. The message is in English.
* **details** {Array}: some details depending of the issue. 

Here are code details:
* 0 → 999: reserved for future usage
* 1000 → 3999: info
* 4000 → 6999: warning
	* 4030: The secondary fallback of "%s" cannot be set to "%s" because it is out of locales scope. This setting has been ignored. (details: [locale key, the secondary given])
	* 4031: The secondary fallback of "%s" cannot be of type "%s". It must be a string or false. This setting has been ignored. (details: [locale key, typeof secondary given])
	* 4050: The configuration option %s is badly set because there is no valid key defined. This setting has been ignored. (details: [option name])
	* 4100: The sentence "%s" is not translated for language "%s". (details: [sentence without translation, current locale])
	* 4101: It is not possible to translate object (%s) to language "%s". (details: [object stringified, current locale, the object])
	* 4200: 'Formatter "%s" has thrown an issue: %s' (details: [formatter name, detail thrown by formatter])
* 7000 → 9999: error
	* 7010: dictionary is in a wrong format (%s): %s (details: [type of dictionary, the value received]) called if not possible to load dictionary.
	* 7011: item is in a wrong format (%s while object is expected): %s (details: [type of dictionary, the value received])
	* 7012: data is in a wrong format (%s): %s (details: [type of data, the value received]) called if not possible to load data.
	* 7013: data with key "%s" is in a wrong format (%s): %s (details: [locale key, type of data, the value received])
	* 7014: data for key "%s" can not be loaded due to wrong format (%s while object is expected): %s (details: [locale key, type of data, the value received])
	* 7020: data received from "%s" is not in a valid JSON ("%s") (details: [the url sent, the response])
	* 7100: Translation is not possible due to an unsupported type (%s): %s (details: [typeof given argument, the argument])
	* 7200: Formatter %s can not be added because it is not a function. (details: [formatter name])
	* 8400 → 8599: http request issue (details: [the url sent]). It uses the http code prefixed by '2'

## i18n formatter

A formatter is provided with the i18n-js-formatter library but as many wants to use their own formatters (like sprintf), this formatter is not loaded by default.

To load it, you must include the script "script/s_formatter.js".
If you have set _i18n_config.doNotLoadFormatter to true, then you should load it into the i18n manager explicitely:

	i18n.loadFormatter(s_formatter);

### formatter usage

A formatting tag starts with a '%' and ends with a character to indicates the kind of output.

	"%s" will display the value as a string
	"%d" will display the value as a number

It is possible to give more information to format it better. The full syntax is %(position){variation}k

	* (position): [optional]
		If position is a number, it reads the value of the given arguments (starting at 1). Example: i18n('%(2)s %(1)s', 'alpha', 'bravo') => 'bravo alpha'
		If position is a string, it reads the property value of the first argument. Example: i18n('%(foo)s %(bar)s', {foo: 'alpha', bar: 'bravo'}) => 'alpha bravo'
		By default, it refers to the N argument where N is the number of formatting replacement. i18n('%s %s', 'a', 'b') is equivalent to i18n('%(1)s %(2)s', 'a', 'b')
	* {variation}: [optional]
		Depending to the output format, it allows to change the display (see below for more details). For example, i18n('%{.2}f', 1.2345) => '1.23'
		Many rules can be added, they must be separated by comma. For example, i18n('%{p2, .2, d2}f', 1.2345) => '01.23'
	* k: the kind of out output, it defines how the output must be interpreted.
		It is composed with a single letter.

#### special character

*%%* it displays a single %.

Note: if the format does not follow `%(position){variation}k` then it is not necessary to "escape" the '%'.

#### string format support (s)

It converts the value to string.
The kind character is "*s*".

Possible variations:

* *case*: convert string to lower case
* *CASE*: convert string to upper case
* *Case*: convert string to lower case except the first charcter which is upper case
* *CasE*: The first character is set to upper case. Others are stay unchanged.

#### number format support (d, D, e, f, i)

It converts the value to number.
The kind character can be either *d*, *D*, *e*, *f*, *i*.

* *f*: display a float number as it is in JavaScript whatever is the language. Example: i18n('%f', 1234.56) => '1234.56'
* *d*: display a float number formatted depending to the locale. Example: i18n('%d', 1234.56) => '1,234.56' (en) or '1 234,56' (fr) (see number parameter options below).
* *D*: display a float number with suffix. Example: i18n('%D', 1234.56) => '1.23k' | i18n('%f', 0.0123) => '12.3m'
* *i*: display an integer number formatted depending to the locale. Example: i18n('%d', 1234.56) => '1,234' (en) or '1 234' (fr)
* *e*: display a number in scientific format. Example: i18n('%e', 1234.56) => '1.23456e+3' | i18n('%f', 0.0123) => '1.23e-2'

oxb ?

Possible variations:

* *.N*: (N must be a number) it rounds the number to N decimals. Example: i18n('%{.1}f', 1.234) => '1.2'
* *pN*: (N must be a number) The integer part must have at least N digits. It adds 0 before digits to have the right number of digits. Example: i18n('%{p3}f', 12) => '012'
* *dN*: (N must be a number) The decimal part must have at least N digits. It adds 0 after digits to have the right number of digits. Example: i18n('%{d3}f', 1.2) => '1.20'

##### Separator configuration

To manage some parameters it is possible to change some separator depending to the locale.

	i18n.configuration({
		formatRules: {
			en: {
				number: {
					thousandSeparator: ',',
					decimalSeparator: '.'
				}
			}
		}
	});

It is also possible to use the LocaleSet parameter.

	i18n.configuration({
		LocaleSet: [{
			key: 'en',
			formatRules: {
				number: {
					thousandSeparator: ',',
					decimalSeparator: '.'
				}
			}
		}
	});

Parameters are:

* *thousandSeparator*: Used to separate thousand digits. Example: i18n('%d', 1234567) => '1,234,567'
	Default value: ','
* *decimalSeparator*: Used to separate integer part from decimal part. Example: i18n('%d', 123.456) => '123.456' (if separator is '.'), i18n('%d', 123.456) => '123,456' (if separator is ',')
	Default value: '.'
* *exponentialSeparator*: Used by scientific notation. Example: i18n('%e', 1234567) => '1.234567e+6' (if separator is 'e'), i18n('%d', 1234567) => '1.234567 10^+6' (if separator is ' 10^')
	Default value: 'e'

#### date support

%T