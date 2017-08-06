# API

* [i18n()](#i18n)
* [i18n.parse()](#i18nparse)
* [i18n.context()](#i18ncontext)
* [i18n.n()](#i18nn)
* [i18n.loadFormatter()](#i18nloadformatter)
* [i18n.getRules()](#i18ngetrules)
* [i18n.html()](#i18nhtml)
* [i18n.configuration()](#i18nconfiguration)
  * [change default configuration](#change-default-configuration)
* [i18n.setLocale()](#i18nsetlocale)
* [i18n.getLocale()](#i18ngetlocale)
* [i18n.getLocales()](#i18ngetlocales)
* [i18n.clearData()](#i18ncleardata)
* [i18n.getData()](#i18ngetdata)
* [i18n.addItem()](#i18nadditem)
* [i18n.addCtxItem()](#i18naddctxitem)
* [Load Data vs Load Dictionary](#load-data-vs-load-dictionary)
  * [Dictionary](#dictionary)
  * [Data](#data)


[Back to main page](../README.md)

## i18n()

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


## i18n.parse()

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


## i18n.context()

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


## i18n.n()
#### will be available in version 0.3

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


## i18n.loadFormatter()

An inner formatter is provided but must be loaded.

It is possible to add several formatter and they will be all called.


This method is to add a new formatter to the i18n API.

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

#### sprintf support

src/wrapperSprintf.js contains a simple method to handle Sprintf API as a formatter for i18n API.

If _i18n_config.doNotLoadFormatter is set to true, the sprintf formatter is not automatically added to i18n but you can load the function "callSprintf" manually with the options you want.

## i18n.getRules()

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


## i18n.html()

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


## i18n.setLocale()

Set the current locale globally or in current scope.

	// set locale to french
	i18n.setLocale('fr');
	i18n.setLocale('fr-FR');

	// set locale depending of browser context
	i18n.setLocale(); //equivalent to i18n.setLocale(navigator.language);

Note: if you have put a storage system (cookie, localStorage), i18n.setLocale() will use the last locale used in the browser.


## i18n.getLocale()

Get the current locale from current scope or globally.

	i18n.setLocale('fr');
	i18n.getLocale(); // 'fr'
	i18n.getLocale({locale: true}); // 'fr'
	i18n.getLocale({key: true}); // 'fr'
	i18n.getLocale({name: true}); // 'Français'
	i18n.getLocale({locale: true, name: true}); // {locale: 'fr', name: 'Français'}
	i18n.getLocale({key: true, name: true}); // {key: 'fr', name: 'Français'}
	i18n.getLocale({data: 'hello'}); // 'salut'


## i18n.getLocales()

Returns a whole catalog optionally based on current scope and locale.

	i18n.getLocales(); // ['en', 'fr', 'de']
	i18n.getLocales({locale: true}) // ['en', 'fr', 'de']
	i18n.getLocales({key: true}) // ['en', 'fr', 'de']
	i18n.getLocales({name: true}) // ['English', 'Français', 'Deutsch']
	i18n.getLocales({data: 'hello'}) // ['hello', 'salut', 'hallo']
	i18n.getLocales({locale: true, name: true, data:'hello'}) // [{locale: 'en', name: 'English', data: 'hello'}, {locale: 'fr', name: 'Français', data: 'salut'}, {locale: 'de', name: 'Deutsch', data: 'hallo'}]


## i18n.clearData()

Clear all dictionary data

	i18n.clearData('fr'); // clear data of the french dictionary only
	i18n.clearData(); // clear data of all dictionaries


## i18n.getData()

It is possible to retrieve the current loaded data with getData.

	i18n.getData(); // returns all data in data format
	i18n.getData({format: 'dictionary'}); // returns all data in dictionary format
	i18n.getData('en'); // returns all data of English language in data format
	i18n.getData({locale: 'en', format: 'dictionary'}); // returns all data of English language in dictionary format


## i18n.addItem()

It is possible to add new entry in the data.

	i18n.addItem('new sentence to add', {
		en: 'the English version',
		fr: 'the French version'
	});


## i18n.addCtxItem()

Same as addItem but add a context to the sentence

	i18n.addCtxItem('Some context','new sentence to add', {
		en: 'the English version',
		fr: 'the French version'
	});



## Load Data vs Load Dictionary

There are two possible formats to load the translations sentences.
For both it is possible to load it in raw (by passing an object) or to load it via AJAX (with JSON format).

### Dictionary

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

#### context

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

### Data

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

#### context

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

