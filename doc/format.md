# Dictionary format

* [Load Data vs Load Dictionary](#load-data-vs-load-dictionary)
  * [Dictionary](#dictionary)
    * [context](#context)
  * [Data](#data)
    * [context](#context-1)


[Back to main page](../README.md)


## Load Data vs Load Dictionary

There are currently two possible formats to load the translations sentences.
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

