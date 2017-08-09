# i18n JS formatter

A simple translation module with dynamic json storage which helps to format strings quickly and easily.

Formatter can be extended with your own formatters.

It can be used in any JavaScript application (web, worker, NodeJS, ...).

You can play with the API at: https://restimel.github.io/i18n-js-formatter/demo/index.html

## Version 0.2.3

*If you want you can help me to improve it. Fork the project and pull request your change.*

Keep tune for further update I am working on it.

## Goal

i18n-js-formatter's mission is to provide to the end-user the best output (translated, formatted, secured) in an easy way to build it with JavaScript.

## quick usage example

configuration:

	i18n.configuration({
		locales: ['en', 'fr'],
		dictionary: 'dictionary.json'
	});

Changing locale:

	i18n.setLocale('fr');

Using strings which have to be translated

	i18n('hello'); //returns 'salut'
	i18n('Hello %s!', 'Jim'); //returns 'Salut Jim!'

Format number depending on locale

	i18n('%f sentences', 1234567.8);
		//returns '1,234,567.8 sentences' (en)
		//returns '1 234 567,8 phrases' (fr)
		//returns '1.234.567,8 Sätze' (de)

Contextualize your sentence to make difference from same sentence or to give more context.

	i18n.context('computer key', 'Give the correct key'); // should be translated in French 'Donnez la bonne touche'
	i18n.context('door key', 'Give the correct key'); // should be translated in French 'Donnez la bonne clef'

	i18n.context('time unit: minute', 'min');
	i18n.context('abbreviation: minimum', 'min');

To give plural translations (this should be done in version 0.3)

	i18n.n('a cat', '%s cats', 1); // in German: 'eine Katze'
	i18n.n('a cat', '%s cats', 3); // in German: '3 Katzen'

To escape string easily depending on context (mainly to avoid user entries to create unexpected issues)

	i18n('quotes: %{esc:html}s', 'I <b>cannot</b> hack your site');
		// in English: 'quotes: I &lt;b&gt;cannot&lt;/b&gt; hack your site'
	i18n('http://my_site.com/?search=%{esc:uric}s&limit=10', 'foo bar&baz=42');
		// returns 'http://my_site.com/?search=foo%20bar%26baz%3D42&limit=10'


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
* **defaultFormat**: {Object} rules which are applied by default (these rules are not dependent of locale).
	* **string**: {Object} rules for displaying strings. Attributes are **escape** (see formatter section for more details)
* **formatRules**: {Object} rules for some output format depending of locales.
					For each locale keys, an object contains the rules.
	* **number**: {Object} rules for displaying numbers. Attributes are **thousandSeparator**, **decimalSeparator**, **exponentialSeparator**, **SIsuffix** (see formatter section for more details)
	* **string**: {Object} rules for displaying string. Attributes are **lowerChars**, **upperChars** (see formatter section for more details)
* **localeSet**:	{Object} define all options at one for defined locales. It replaces locales defined with options "locales".
	* *key*:	{String} [Required] the locale to define.
	* *name*:	{String} the locale pretty name.
	* *data*:	{Object|String|Function} the data of the locale.
	* *secondary*: {String} the secondary locale to use if the sentence is not translated in the current locale

## API

### i18n()

Translates a single expression. Returns translated parsed and substituted string. If the translation is not found it returns the expression given.

	// example 1:
	// (locale == 'fr')
	i18n('Hello'); // Salut

	// example 2:
	// give context (locale == 'fr')
	i18n({str: 'Hello', context: 'phone greeting'}); // Allo
	i18n.context('phone greeting', 'Hello'); // Allo

	// example 3:
	// give an object (locale == 'fr')
	i18n({
		en: 'Hello',
		fr: 'Salut'
	}); // Salut

	// example 4:
	// passing specific locale
	i18n({str: 'Hello', locale: 'fr'}); // Salut

When giving an object to match an existing sentence (example 2 or 4), you must specify the string property (which can be either "string" or "str"), otherwise it will try to find a sentence from this object (example 3).

Properties:
* **string** or **str**: the sentence to look for and translate
* **context** or **ctx** or **c**: the context (see context section for more explanation).
* **parse**: if true, it does not translate the string (see parse section for more explanation)
* **locale** or **lng**: force a specific locale (and not use the default one).


### i18n.parse()

It is possible to parse a single string in order to format it.
Example:

	i18n.parse('Hello %s', 'Restimel'); // Hello Restimel
	i18n.parse('Hello %(name)s', { name: 'Restimel' }); // Hello Restimel

The formatters are also called on each translation string:

	i18n.setLocale('fr');
	i18n('Hello %s', 'Restimel'); // Salut Restimel
	i18n('Hello %(name)s', { name: 'Restimel' }); // Salut Restimel

Note: calling directly i18n.parse will not prompt warning log if the key string is not in data dictionary. So for short string where only formatting is expected i18n.parse() is better than i18n().

WARNING:
By default, no formatter are loaded. You must load a formatter (with i18n.loadFormatter()) in order to do the parsing.

An inner formatter is provided but must be loaded.

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


### i18n.context()

Context allows to give more details to some strings and helps to translate it correctly.
Some people also call it namespace.

This is also very usefull for all abreviations.

For example, if you use a string 'min', is it stand for 'minute' or 'minimum' or something else? It is not easy to translate this correctly when you see only the string. This is why the context is for.

Usage:
The first argument is the context (this one won't be translated) and the second argument is the string to be translated. All other arguments are for formatting.

	i18n.context('computer key', 'Give the correct key'); // should be translated in French 'Donnez la bonne touche'
	i18n.context('door key', 'Give the correct key'); // should be translated in French 'Donnez la bonne clef'

	i18n.context('computer key', 'key %s', keyValue); // The result will be "key A" if keyValue is worth 'A'

It is also possible to call it with method **c**. It's an alias of method context

	i18n.c('minimum', 'min');

The entry in dictionary are different from string without contextual.

Note:
Using method context (or c), is equivalent of calling i18n with obect containing property *context*.


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


### i18n.getRules()

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


### i18n.html()

Change text of all HTML nodes which have a `data-i18n` attribute. It uses it as key and replace the text content by the translation.

This feature allows to change language without rerendering everything. This also helps when using HTML template library.

Usage:
The first argument is the root node to look for all nodes which have a data-i18n atrribute. If no argument is given, the root node is `document`.

	<section>
		<header data-i18n="hello"></header>
		<p>not changed text</p>
		<p data-i18n="a text"></p>
	</section>

After using `i18n.html(document.querySelector('section'))` it renders like (translated in french):

	<section>
		<header data-i18n="hello">salut</header>
		<p>not changed text</p>
		<p data-i18n="a text">un texte</p>
	</section>

Be careful, this feature may remove any child nodes. The data-i18n attribute should be located on leaf nodes to avoid any lose.

This feature requires that browser supports dataset API.

Currently, it supports only static strings (no formating).


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
			data: 'dictionary-fr.json',
			formatRules: {
				number: {
					thousandSeparator: ' ',
					decimalSeparator: ','
				}
			}
		},
		{
			key: 'fr-be',
			name: 'Belge',
			data: 'dictionary-be.json',
			formatRules: {
				number: {
					thousandSeparator: ' ',
					decimalSeparator: ','
				}
			}
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

##### context

In dictionary contextual sentence are grouped inside the same context key. A context key is prefixed by "_ctx:"

	dictionary: {
		'_ctx:main panel': {
			'close': {
				en: 'close',
				de: 'schließen',
				fr: 'fermer'
			},
			'open': {
				en: 'open',
				de: 'öffnen',
				fr: 'ouvrir'
			}
		},
		'_ctx:range estimation': {
			'close': {
				en: 'close',
				de: 'nah',
				fr: 'proche'
			}
		}
	}

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

##### context

In data format contextual sentence are grouped inside the same context key. A context key is prefixed by "_ctx:"

	data: {
		'en': {
			'_ctx:main panel':
				'close': 'close',
				'open': 'open'
				},
			'_ctx:range estimation': {
				'close': 'close'
			}
		},
		'de': {
			'_ctx:main panel':
				'close': 'schließen',
				'open': 'öffnen'
				},
			'_ctx:range estimation': {
				'close': 'nah'
			}
		},
		'fr': {
			'_ctx:main panel':
				'close': 'fermer',
				'open': 'ouvrir'
				},
			'_ctx:range estimation': {
				'close': 'proche'
			}
		}
	}


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


### addCtxItem()

Same as addItem but add a context to the sentence

	i18n.addCtxItem('Some context','new sentence to add', {
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
	* 7015: item "%s" for locale "%s" is %s instead of string: %s (details: [sentence, locale key, type of value, the value received])
	* 7020: data received from "%s" is not in a valid JSON ("%s") (details: [the url sent, the response])
	* 7100: Translation is not possible due to an unsupported type (%s): %s (details: [typeof given argument, the argument])
	* 7200: Formatter %s can not be added because it is not a function. (details: [formatter name])
	* 7300: Browser does not support feature "%s". (details: [name of the unsupported feature])
	* 8400 → 8599: http request issue (details: [the url sent]). It uses the http code prefixed by '2'


## i18n formatter

A formatter is provided with the i18n-js-formatter library but as many wants to use their own formatters (like sprintf), this formatter is not loaded by default.

To load it, you must include the script "script/s_formatter.js".
If you have set _i18n_config.doNotLoadFormatter to true, then you should load it into the i18n manager explicitely:

	i18n.loadFormatter(s_formatter);

### formatter usage

#### Summary

| Code | output | result in English with example: '98765.43' |
|:----:| ------ | ------ |
| %% | % | - |
| %f | locale formatted number | 98,765.43 |
| %D | locale formatted number with suffix | 98.765k |
| %d | locale formatted integer number | 98,765 |
| %e | locale formatted number in scientific notation | 9.877e+4 |
| %i | locale formatted integer number | 98,765 |
| %F | raw number | 98765.43 |
| %s | string | 98765.43 |
| %t | duration | 1min 38s 765ms 430µs |
| %T | date | 1/1/1970 00:01:39 AM |

#### Usage

A formatting tag starts with a '%' and ends with a character to indicates the kind of output.

	"%s" will display the value as a string
	"%f" will display the value as a number

It is possible to give more information to format it better. The full syntax is **%(position){variation}k**

* *(position)*: [optional]
	If position is a number, it reads the value of the given arguments (starting at 1). Example: i18n('%(2)s %(1)s', 'alpha', 'bravo') => 'bravo alpha'
	If position is a string, it reads the property value of the first argument. Example: i18n('%(foo)s %(bar)s', {foo: 'alpha', bar: 'bravo'}) => 'alpha bravo'
	By default, it refers to the N argument where N is the number of formatting replacement. i18n('%s %s', 'a', 'b') is equivalent to i18n('%(1)s %(2)s', 'a', 'b')
* *{variation}*: [optional]
	Depending to the output format, it allows to change the display (see below for more details). For example, i18n('%{.2}F', 1.2345) => '1.23'
	Many rules can be added, they must be separated by comma. For example, i18n('%{p2, .2, d2}F', 1.2345) => '01.23'
* *k*: the kind of out output, it defines how the output must be interpreted.
	It is composed with a single letter.

#### special character

**%%** it displays a single %.

Note: if the format does not follow `%(position){variation}k` then it is not necessary to "escape" the '%'.

#### string format (s)

It converts the value to string.
The kind character is "*s*".

Possible variations:

* **case**: convert string to lower case
* **CASE**: convert string to upper case
* **Case**: convert string to lower case except the first character which is upper case
* **CasE**: The first character is set to upper case. Others are stay unchanged.
* **esc:STR**: (STR must be a string of one below) escape the string sequence to be safely inserted in the context defined.
	* **html**: escape string to be safely inserted in HTML. Characters `"<>&` are escaped to &#Unicode; equivalent.
	* **js**: escape string to be evaluated as string in js eval.
	* **regex**: escape special characters to insert the string in a regexp like a simple string.
	* **json**: escape string to be safely added in a JSON as a string. Characters `\"` are escaped to \char; equivalent. Special character are converted to unicode equivalent.
	* **url**: escape string to be safely used as url. Latin characters, numbers and  `-_.!~*'();,/?:@&=+$#` are not escaped. Others are escaped to %Hex equivalent.
	* **uri**: alias of url.
	* **uri6**: escape string to be safely used as url in IP v6 (RFC 3986). Latin characters, numbers and  `-_.!~*'();,/?:@&=+$#[]` are not escaped. Others are escaped to %Hex equivalent.
	* **urlc**: escape string to be safely used as url. Latin characters, numbers and  `-_.!~*'()` are not escaped. Others are escaped to %Hex equivalent.
	* **uric**: alias of urlc.
	* **no**, **raw**: do not escape the string.

##### Default configuration

The default escaping rule is "no" but it can be changed in configuration. This is the default rule which is applied if no escape rule are given.

	i18n.configuration({
		defaultFormat: {
			string: {
				escape: 'html'
			}
		}
	});
	i18n('hey<script>alert("ho")</script>'); //hey&lt;script&gt;alert(&quot;ho&quot;)&lt;/script&gt;

##### Conversion configuration

To manage some conversion from lower case to upper case (and reciprocally), it is possible define how characters must be converted. This is useful for some language.

	i18n.configuration({
		formatRules: {
			tr: {
				string: {
					lowerChars: 'iı',
					upperChars: 'İI'
				}
			}
		}
	});

Parameters are:

* **lowerChars**: {String} Used to define the lower chars for this locale which must be converted to specific chars. Conversion values are taken from upperChars (characters must be in the same order). Example: i18n('%{case}s', 'BİRLEŞIK') => 'birleşik'
	Default value: ''
* **upperChars**: {String} Used to define the upper chars for this locale which must be converted to specific chars. Conversion values are taken from lowerChars (characters must be in the same order). Example: i18n('%{case}s', 'birleşik') => 'BİRLEŞIK'
	Default value: ''

Note: whithout these parameters the lower/upper conversion will change i←→I and not i←→İ and ı←→I

#### number format (d, D, e, f, F, i)

It converts the value to number.
The kind character can be either **d**, **D**, **e**, **f**, **F**, **i**.

* **F**: displays a float number as it is in JavaScript whatever is the language. Example: i18n('%F', 1234.56) => '1234.56'
* **f**: displays a float number formatted depending to the locale. Example: i18n('%f', 1234.56) => '1,234.56' (en) or '1 234,56' (fr) (see number parameter options below).
* **D**: displays a float number with suffix. Example: i18n('%D', 1234.56) => '1.23k' | i18n('%D', 0.0123) => '12.3m' (by default, number are rounded to 3 decimals)
* **d**: displays an integer number formatted depending to the locale. Example: i18n('%d', 1234.56) => '1,234' (en) or '1 234' (fr)
* **i**: displays an integer number formatted depending to the locale. Example: i18n('%f', 1234.56) => '1,234' (en) or '1 234' (fr)
* **e**: displays a number in scientific format. Example: i18n('%e', 1234.56) => '1.23456e+3' | i18n('%e', 0.0123) => '1.23e-2'

It supports huge number (higher than 2^53) without rounding the value if the value comes from a string (otherwise JavaScript will round it to the closest writable number by the matrice).

Possible variations:

* **.N**: (N must be a number) it rounds the number to N decimals. Example: i18n('%{.1}F', 1.234) => '1.2'
* **pN**: (N must be a number) The integer part must have at least N digits. It adds 0 before digits to have the right number of digits. Example: i18n('%{p3}F', 12) => '012'
* **dN**: (N must be a number) The decimal part must have at least N digits. It adds 0 after digits to have the right number of digits. Example: i18n('%{d3}F', 1.2) => '1.20'

##### Separator configuration

To manage some parameters it is possible to change some separator depending on the locale.

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

* **thousandSeparator**: {String} Used to separate thousand digits. Example: i18n('%f', 1234567) => '1,234,567'
	Default value: ','
* **decimalSeparator**: {String} Used to separate integer part from decimal part. Example: i18n('%f', 123.456) => '123.456' (if separator is '.'), i18n('%f', 123.456) => '123,456' (if separator is ',')
	Default value: '.'
* **exponentialSeparator**: {String} Used by scientific notation. Example: i18n('%e', 1234567) => '1.234567e+6' (if separator is 'e'), i18n('%e', 1234567) => '1.234567 10^+6' (if separator is ' 10^')
	Default value: 'e'
* **SIsuffix**: {Object[]} list of SI suffix and their multipler. The object contain the suffix character (property suffix) and the multipler value (property multiple).
Example: [{suffix: 'M', multiple: 1000000}, {suffix: 'k', multiple: 1000}]
Default value is the list of SI suffixes for all thousand from 10^-15 to 10^15.

#### date format (T) {not implemented yet :'( }

It converts the value to a date.
The kind character is **T**.

* **T**: displays a date from a timestamp. The default unit of the timestamp is milliseconds but it can be set to a different unit with variation. By default it displays like locale JavaScript Date. Example: i18n('%T', 1453129200000) => '1/18/2016, 4:00:00 PM' (en) or '18/1/2016 16:00:00' (fr) or '18.1.2016, 16:00:00' (de) (for a browser in timezone GMT+1).

Be careful the result can depend on the local timezone offset of the browser. To avoid such difference use the variation _{o:N}_ (see below).

The timestamp origin is on 1/1/1970, 1:00:00 AM.

Possible variations:

* **u:S**: (S must be a string) defines the unit of the timestamp. Example: i18n('%{u:s}T', 1453129200) => '1/18/2016, 4:00:00 PM' (en)
S values can be:
	* **µs** for microseconds
	* **ms** for milliseconds (default value)
	* **s** for seconds
	* **min** for minutes
	* **h** for hours
	* **d** for days
	* **m** for months
	* **y** for years

* **o:N**: (N must be a number) displays the date from the given timezone. The number can be preceded by a + or a - (0 is for GMT). Example: i18n('%{o:0}T', 1453129200000) => '1/18/2016, 3:00:00 PM' (en), i18n('%{o:-6}T', 1453129200000) => '1/18/2016, 9:00:00 AM' (en) The result is no more depending of the browser local timezone.
* **$U** or **$UTC**: preset format to display UTC Time
* **f:"S"**: (S must be a string) format the output. Example: i18n('%{f:"%M:%s"}T', 1453130145000) => '15:45', i18n('%{f:"%Mmin %ss"}T', 1453130145000) => '15min 45s'
The formating token are the same recognized by strftime (cf bellow to have the full details).
**f:%"S"**: (S must be a string) format the output. This is the same as f:"S" except that token are not preceded by %. Example: i18n('%{f:%"M:s"}T', 1453130145000) => '15:45' (it is not possible to have the same result as with %{f:"%Mmin %ss"}T )

##### strftime format

Examples are based on date 2016/01/03 02:34:56 PM (which was on Sunday).

| Code | Meaning | Range | Example |
|:----:| ------- | ----- | ------- |
|| *Year* |||
| %Y | The full year with 4 digits | 0000 → 9999 | 2016 |
| %y | Year without century (2 digits) | 00 → 99 | 16 |
| %C | The century (2 digits) | 00 → 99 | 20 |
| %G | Week-based year (ISO-8601) with century (4 digits) | 0000 → 9999 | 2015 |
| %g | Week-based year (ISO-8601) without century (2 digits) | 00 → 99 | 15 |
|| *Month* |||
| %m | Month number (2 digits) | 00 → 12 | 01 |
| %B | Month name (depends on locale) | - | January |
| %b | Abbreviated month name (depends on locale) | - | Jan |
| %h | Abbreviated month name (Alias of %b) | - | Jan |
|| *Week* |||
| %U | Week number (counting the number of Sunday in the year) | 00 → 53 | 01 |
| %W | Week number (counting the number of Monday in the year) | 00 → 53 | 00 |
| %V | Week number (ISO-8601) | 01 → 53 | 53 |
|| *Day* |||
| %d | Day of the month (2 digits) | 01 → 31 | 03 |
| %e | Day of the month (leading 0 is a space) | 1 → 31 |  3 |
| %j | Day of the year (3 digits) | 001 → 366 | 003 |
| %u | Day of the week ISO-8601 (week starts at Monday) | 1 → 7 | 7 |
| %w | Day of the week (week starts at Sunday) | 0 → 6 | 0 |
| %A | Textual day of the week (depends on locale) | - | Sunday |
| %a | Abbreviated textual day of the week (depends on locale) | - | Sun |
|| *Hour* |||
| %H | Hour in 24h format (2 digits) | 00 → 23 | 14 |
| %k | Hour in 24h format (leading 0 is a space) | 0 → 23 | 14 |
| %I | Hour in 12h format (2 digits) | 01 → 12 | 02 |
| %l | Hour in 12h format (leading 0 is a space) | 1 → 12 | 2 |
| %P | lower case 'am'/'pm' | - | pm |
| %p | upper case 'AM'/'PM' | - | PM |
|| *Minute* |||
| %M | Minute (2 digits) | 00 → 59 | 34 |
|| *Second* |||
| %S | Second (2 digits) | 00 → 59 | 56 |
| %s | Number of second since the Epoch (1970-01-01 00:00:00) | - | 1451831696 |
|| *Millisecond* |||
| | nothing standard :'( | | |
|| *Preset code* |||
| %r | equivalent to "%I:%M:%S %p" | - | 02:34:56 PM |
| %R | equivalent to "%H:%M" | - | 14:34 |
| %T | equivalent to "%H:%M:%S" | - | 14:34:56 |
| %D | equivalent to "%m/%d/%y" | - | 01/03/2016 |
| %F | equivalent to "%Y-%m-%d" (ISO 8601 date format) | - | 2016-01-03 |
|| *Special characters* |||
| %% | print a percentage ('%') | % | % |
| %n | print a line feed ('\n') | \n | \n |
| %t | print a tabulation ('\t') | \t | \t |
|| *Not implemented code* |||
| %z | Time zone offset, +hhmm  or  -hhmm  numeric  timezone from UTC | - | - |
| %Z | Time zone name abbreviation (GMT, UTC, EST) | - | - |
| %x | preferred date | - | - |
| %X | preferred time | - | - |
| %c | preferred date and time | - | - |

##### Textual configuration

To manage some parameters it is possible to change textual values depending on the locale.

	i18n.configuration({
		formatRules: {
			en: {
				date: {
					months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				}
			}
		}
	});

It is also possible to use the LocaleSet parameter.

	i18n.configuration({
		LocaleSet: [{
			key: 'en',
			formatRules: {
				date: {
					days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
					shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
				}
			}
		}
	});

Parameters are:

* **months**: {String[]} List of month names
* **shortMonths**: {String[]} List of month abbreviated names
* **days**: {String[]} List of day names (starting from Sunday)
* **shortDays**: {String[]} List of day abbreviated names


#### duration format (t)

It converts the value to a duration.
The kind character is **t**.

* **t**: displays a duration. The default unit of the value is milliseconds but it can be set to a different unit with variation. By default it displays the most precise unit. Example: i18n('%t', 45123) => '45s 123ms', i18n('%t', 105000) => '1min 45s'.

Possible variations:

* **u:S**: (S must be a string) defines the unit of the value. Example: i18n('%{u:s}t', 4200) => '1h 10min'
S values can be:
	* **µs** for microseconds
	* **ms** for milliseconds (default value)
	* **s** for seconds
	* **m** or **min** for minutes
	* **h** for hours
	* **d** for days
	* **M** or **month** for months
	* **y** for years
* **min:S**: (S must be a string) defines the minimal unit to display (value is floored if it is more precise). Example: i18n('%{min:s}t', 45123) => '45s'
* **max:S**: (S must be a string) defines the maximal unit to display. Example: i18n('%{max:s}t', 105123) => '105s 123ms'
* **n:N**: (N must be a number) defines the maximum number of unit to display. Example: i18n('%{n:1}t', 105123) => '1min', i18n('%{n:2}t', 105123) => '1min 45s', i18n('%{n:10}t', 105123) => '1min 45s 123ms'
* **f:"S"**: (S must be a string) defines the output format. This output is static and the display is no more dynamic regarding the value. Code for describing unit is defined below. These code starts with $. Example: i18n('%{f:"$hh $mmin $ss $ims"}t', 3705123) => '1h 1min 45s 123ms', i18n('%{f:"$h:$m:$s"}t', 3705123) => '1:1:45', i18n('%{f:"$m min"}t', 3705123) => '61 min', i18n('%{f:"$d day $h hour $m min"}t', 3705123) => '0 day 1 hour 1 min', i18n('%{f:"$d day $h hour $s seconds"}t', 3705123) => '0 day 1 hour 105 seconds'
code can be:
| code | meaning | value |
|:----:| ------- | ----- |
|$µ|microseconds||
|$i|milliseconds| = 1000$µ |
|$s|seconds| = 1000$i |
|$m|minutes| = 60$s |
|$h|hours| = 60$m |
|$d|days| = 24$h |
|$M|months| = 30$d |
|$y|years| = 365$d |

Be careful number of months is always computed on 30 days which is not obviously the right number of months.
In the same way number of years is computed on 365 days which is wrong for bissextil years.


##### Textual configuration

To manage some parameters it is possible to change textual values depending on the locale.

	i18n.configuration({
		formatRules: {
			en: {
				duration: {
					µs: 'µs',
					ms: 'ms',
					s: 's',
					min: 'min',
					h: 'h',
					d: 'd',
					month: 'M',
					y: 'y'
				}
			}
		}
	});

It is also possible to use the LocaleSet parameter.

	i18n.configuration({
		LocaleSet: [{
			key: 'en',
			formatRules: {
				duration: {
					µs: 'µs',
					ms: 'ms',
					s: 's',
					min: 'min',
					h: 'h',
					d: 'd',
					month: 'M',
					y: 'y'
				}
			}
		}
	});

Parameters are:

* **ms**: milliseconds unit
* **s**: seconds unit
* **min**: minutes unit
* **h**: hours unit
* **d**: days unit
* **month**: months unit
* **y**: years unit
