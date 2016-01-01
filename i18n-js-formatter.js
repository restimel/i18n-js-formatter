/**
 * i18n API
 *
 * This work is licensed under a Creative Commons Attribution 3.0 Unported License
 * http://creativecommons.org/licenses/by/3.0/
 *
 * Author : Benoit Mariat
 * Date : 2015 - 07 - 12 (creation)
 *
 *
 * This script provides an i18n translation helper. It also helps to format strings.
 *
 * See Github project: https://github.com/restimel/i18n-js-formatter
 *
 **/

(function() {
	'use strict';

	var version = '0.0.2';

	/*
	 * 0 → 999: reserved for future usage
	 * 1000 → 3999: info
	 * 4000 → 6999: warning
	 * 7000 → 9999: error
	 */
	var _codeMessage = {
		/* warning */
		4030: 'The secondary fallback of "%s" cannot be set to "%s" because it is out of locales scope. This setting has been ignored.',
		4031: 'The secondary fallback of "%s" cannot be of type "%s". It must be a string or false. This setting has been ignored.',
		4050: 'The configuration option %s is badly set because there is no valid key defined. This setting has been ignored.',
		4100: 'The sentence "%s" is not translated for language "%s".',
		4101: 'It is not possible to translate object (%s) to language "%s".',
		4200: 'Parser "%s" has thrown an issue: %s',

		/* errors */
		7010: 'dictionary is in a wrong format (%s): %s',
		7011: 'item is in a wrong format (%s while object is expected): %s',
		7012: 'data is in a wrong format (%s): %s',
		7013: 'data with key "%s" is in a wrong format (%s): %s',
		7014: 'data for key "%s" can not be loaded due to wrong format (%s while object is expected): %s',
		7020: 'data recieved from "%s" is not in a valid JSON ("%s")',
		7030: 'The secondaries fallback create a circular loop (%s).',
		7100: 'Translation is not possible due to an unsupported type (%s): %s',
		7200: 'Parser %s can not be added because it is not a function.',
		8401: 'Unauthorized request: %s',
		8403: 'Request forbidden: %s',
		8404: 'Page not found: %s',
		8405: 'Method is not allowed: %s',
		8407: 'Proxy authentication required: %s',
		8408: 'Request timeout: %s',
		8418: 'Sorry, I cannot brew your coffee: %s',
		8500: 'Internal server error: %s',
		8501: 'Not implemented (server error): %s',
		8502: 'Bad Gateway: %s',
		8503: 'Service on server is unavailable: %s',
		8504: 'Gateway timeout: %s',
		8505: 'HTTP version is not supported by server: %s'
	};

	/* status variables */
	var sv;
	_reset();

	/* API methods */

	function i18n(sentence) {
		var text = _translation(sentence);
		var args = Array.prototype.slice.call(arguments, 1);

		text = _parse.apply(this, [text].concat(args));
		return text;
	}

	/**
	 * Configure the i18n
	 *
	 * Each parameter is optional
	 * @param [options.locales] {String[]} list of locale keys to manage. Other locales will be rejected. It reset previous configuration.
	 * @param [options.localeName] {Object} list of key/value to give to locale a pretty name.
	 * @param [options.secondary] {Object} list of secondary language to use if a sentence cannot be translated in the primary language.
	 * @param [options.alias] {string} attach the i18n function to the global variable described by alias.
	 * @param [options.defaultLocale] {string} the default locale key to use.
	 * @param [options.storage] {String|String[]} tell the way to store the locale for another session.
	 * @param [options.syncLoading] {Boolean} If true Ajax call are done synchronously.
	 * @param [options.lazyLoading] {Boolean} If true, Ajax and data function are called when needed.
	 * @param [options.onLocaleReady] {Function} called each time the data for the current locale are ready to use
	 * @param [options.dictionary] {Object|String|Function} add data to all language (formatted by sentences)
	 * @param [options.data] {Object|String|Function} add data to all language (formatted by languages)
	 * @param [options.log] {Function{}} functions to call when message have to be sent
	 *								-	 info: called for info message
	 *								-	 warn: called for warning message (missing translations, changing configuration but non blocking issue)
	 *								-	 error: called for error message  (wrong data format, http request issues)
	 */
	i18n.configuration = function(options) {
		options || (options = {});
		var needLoading = typeof options.dictionary !== 'undefined' || typeof options.data !== 'undefined';

		if (typeof options.log === 'object') {
			_each(options.log, _configureLog);
		}

		if (options.localeSet && options.localeSet instanceof Array) {
			needLoading = _configureLocaleSet(options) || needLoading;
		} else
		if (options.locales instanceof Array) {
			_configureLocales(options);
		} else
		if (typeof options.localeName === 'object') {
			_configurelocaleNames(options);
		}

		if (typeof options.secondary === 'object') {
			_configureSecondaries(options.secondary);
		}

		if (typeof options.alias === 'string') {
			_export(options.alias);
		}

		if (typeof options.onLocaleReady !== 'undefined') {
			sv.onLocaleReady = options.onLocaleReady;
		}

		if (typeof options.syncLoading === 'boolean') {
			sv.syncLoading = options.syncLoading;
		}

		if (typeof options.lazyLoading === 'boolean') {
			sv.lazyLoading = options.lazyLoading;
		}

		if (needLoading) {
			sv.status.callLocaleLoaded = true;
		}

		if (typeof options.dictionary !== 'undefined') {
			_loadDictionary(options.dictionary);
		}

		if (typeof options.data !== 'undefined') {
			_loadData(options.data);
		}

		if (typeof options.storage !== 'undefined') {
			_configureStorage(options.storage);
			if (!sv.useDfltLocale) {
				_setStorage(sv.currentLocale.key);
			}
		}

		if (typeof options.defaultLocale !== 'undefined') {
			sv.defaultKeyLocale = options.defaultLocale;
		}

		if (sv.useDfltLocale && sv.localeKeys.length) {
			sv.currentLocale = sv.locales[_getDefaultKey()];
		}

		if (needLoading && sv.lazyLoading) {
			_loadCurrentLocale();
		}
	};

	/**
	 * change the current locale.
	 * If the key is not in the available locales, it change to the closest key if any.
	 * For example, if key is 'en-us' and this locale does not exist. It will change to 'en'.
	 *
	 * @param key {String} the locale key to use as current
	 * @return {String|Boolean} the new key of the current locale. If the locale has not been changed, it returns false.
	 */
	i18n.setLocale = function(key) {
		var useDflt = typeof key === 'undefined';
		var saveChanged = true;

		if (useDflt) {
			key = _getDefaultKey();
		} else {
			key = _formatLocaleKey(key);
		}

		if (key === sv.currentLocale.key) {
			key = false;
		} else
		if (!sv.locales[key]) {
			key = false;
			saveChanged = false;
		} else {
			sv.currentLocale = sv.locales[key];
			_loadCurrentLocale();
		}

		if (saveChanged) {
			sv.useDfltLocale = useDflt;
			_setStorage(i18n.getLocale(), sv.useDfltLocale);
		}

		return key;
	};

	/**
	 * Retrieve the current locale
	 *
	 * @param [options.key] {Boolean} if true, the locale's key will be returned
	 * @param [options.name] {Boolean} if true, the locale's name will be returned
	 * @param [options.secondary] {Boolean} if true, the locale's key fallback will be returned
	 * @param [options.data] {String} if defined, the locale's translation will be returned
	 * @return [String|Object] If only one option is given, it return the value of this option
	 *						   If several options are given, it return an object with the key/value of wanted options.
	 */
	i18n.getLocale = function(options) {
		return _getLocale(sv.currentLocale, options);
	};

	/**
	 * Retrieve the informations of all locales
	 *
	 * @param [options.key] {Boolean} if true, the locales' key will be returned
	 * @param [options.name] {Boolean} if true, the locales' name will be returned
	 * @param [options.secondary] {Boolean} if true, the locales' key fallback will be returned
	 * @param [options.data] {String} if defined, the locales' translation will be returned
	 * @return [String[]|Object[]] If only one option is given, it return the value list of this option
	 *							   If several options are given, it return a list of object with the key/value of wanted options.
	 */
	i18n.getLocales = function(options) {
		return sv.localeKeys.map(function(key) {
			return _getLocale(sv.locales[key], options);
		});
	};

	/**
	 * Get the data of the specified locale
	 *
	 * @param [options] {Object|String} options to retrieve data. If a string it defines key.
	 * @param [options.key] {String} the locale's data to get. If not defined data of all locales are returned.
	 * @param [options.format] {String} the result format. Value can be 'dictionary' or 'data' (default is 'data').
	 * @param [options.locale] {String} is an alias for 'key'
	 * @return {Object} the data
	 */
	i18n.getData = function(options) {
		var opt = typeof options === 'object' ? options : {};
		var key = (typeof options === 'string' ? options : opt.key || opt.locale) || '';
		var format = opt.format || 'data';
		var rslt;
		var dico;

		key = _formatLocaleKey(key);
		dico = sv.data[key];

		if (format === 'dictionary') {
			rslt = {};
			_getCatalog().forEach(function(sentence) {
				rslt[sentence] = {};

				if (dico && dico[sentence]) {
					rslt[sentence][key] = dico[sentence];
				} else {
					sv.localeKeys.forEach(function(key) {
						if (sv.data[key] && sv.data[key][sentence]) {
							rslt[sentence][key] = sv.data[key][sentence];
						}
					});
				}
			});
		} else {
			if (key && typeof dico !== 'undefined') {
				rslt = dico;
			} else {
				rslt = sv.data;
			}
		}

		return rslt;
	};

	/**
	 * Add an item to data
	 *
	 * @param sentenceKey {String} the sentence which need to be translated
	 * @param values {String{}} the translation corresponding of each keys
	 */
	i18n.addItem = function(sentenceKey, values) {
		_addItem(values, sentenceKey);
	};

	/**
	 * Add a parser to the parser list
	 *
	 * @param options.parser {Function} a parser to call on string to parse
	 * @param [options.name] {String} the name of the parser (mainly useful for messages);
	 * @param [options.weight] {Number} the importance of the parser. The heigher the weight is the first the parser will be called.
	 */
	i18n.loadParser = function(options) {
		if (typeof options !== 'object') {
			options = {parser: options};
		}

		var parser = options.parser;
		var name = options.name || parser.name || '';
		var weight = options.weight;

		_addParser(parser, name, weight);
	};

	/**
	 * parse a string with 
	 *
	 * @param text {String} the string to parse
	 * @param [values] {Any...} The value to replace wildcards
	 */
	i18n.parse = _parse;

	/**
	 * Clear the data of the specified locale
	 *
	 * @param [key] {String} the locale's data to clear. If not defined all data are cleared.
	 */
	i18n.clearData = function(key) {
		if (typeof key === 'undefined') {
			sv.data = {};
			sv.localeKeys.forEach(_resetDataKey);
		} else {
			key = _formatLocaleKey(key);
			if (sv.data[key]) {
				_resetDataKey(key);
			}
		}
	};

	/**
	 * Retrieve the current version
	 * X.Y.Z
	 * X: major version (which can potentially break retro-compatibility)
	 * Y: minor version (stable version with new features, bug fix)
	 * Z: small change (some bug fix or some new feature)
	 *
	 * @return {String} the version
	 */
	i18n.version = function() {
		return version;
	};

	/** should be used for test only */
	i18n._reset = _reset;

	/*
	 * private functions
	 */

	function _reset() {
		sv = {
			locales: {},
			localeKeys: [],
			defaultKeyLocale: undefined,
			currentLocale: null,
			useDfltLocale: true,
			storage: {
				kind: 'none',
				name: ''
			},
			data: {},
			loadingMethod: {},
			syncLoading: false,
			lazyLoading: true,
			onLocaleReady: null,
			parser: [],
			status: {
				callLocaleLoaded: false
			},
			log: {
				info: null,
				warn: null,
				error: null
			}
		};
	}

	function _resetDataKey(key) {
		sv.data[key] = null;
	}

	function _createLocale(key, name) {
		var dflt, locale;

		key = key.toLowerCase();

		dflt = sv.locales[key] || {};
		locale = {
			key: key,
			name: _default(name, dflt.name),
			secondary: false
		};

		return locale;
	}

	function _cleanData() {
		_each(sv.data, function(value, key) {
			if (sv.localeKeys.indexOf(key) === -1) {
				delete sv.data[key];
			}
		});

		sv.localeKeys.forEach(function(key) {
			if (!sv.data[key]) {
				_resetDataKey(key);
			}
		});
	}

	function _configureLocaleSet(options) {
		var nextLocales = {};
		var needLoading = false;

		sv.localeKeys = [];

		options.localeSet.forEach(function(localeObj) {
			var key, name, secondary, dataDictionary;
			var locale;
			var data;

			if (typeof localeObj !== 'object') {
				return;
			}

			key = localeObj.localeKey || localeObj.key || localeObj.locale;
			name = localeObj.localeName || localeObj.name;
			secondary = localeObj.secondary;
			dataDictionary = localeObj.data;

			if (typeof key !== 'string') {
				_warning(4050, ['localeSet']);
				return;
			}

			if (!name && options.localeName) {
				name = options.localeName[key];
			}

			locale = _createLocale(key, name);
			key = locale.key;

			if (typeof secondary === 'string') {
				locale.secondary = secondary;
			}

			if (dataDictionary) {
				data = {};
				data[key] = dataDictionary;
				_loadData(data);
				needLoading = true;
			}

			if (!nextLocales[key]) {
				sv.localeKeys.push(key);
			}
			nextLocales[key] = locale;
		});

		_cleanData();

		sv.locales = nextLocales;

		return needLoading;
	}

	function _configureLocales(options) {
		var nextLocales = {};

		sv.localeKeys = [];

		options.locales.forEach(function(key) {
			var locale;

			if (typeof key !== 'string') {
				return;
			}

			locale = _createLocale(key, options.localeName && options.localeName[key]);
			key = locale.key;

			if (!nextLocales[key]) {
				sv.localeKeys.push(key);
			}
			nextLocales[key] = locale;
		});

		_cleanData();

		sv.locales = nextLocales;
	}

	function _configurelocaleNames(options) {
		_each(options.localeName, function(value, key) {
			key = _formatLocaleKey(key);

			if (sv.locales[key]) {
				sv.locales[key].name = value;
			}
		});
	}

	function _configureSecondaries(secondaries) {
		var preparationSecondaries = {};
		var errors = false;

		/* prepare the secondaries */
		_each(secondaries, function(origValue, key) {
			var value = origValue;
			key = _formatLocaleKey(key);

			if (sv.locales[key]) {
				if (typeof value !== 'string') {
					if (value === false || value === null) {
						value = false;
					} else {
						_warning(4031, [key, typeof value]);
						return;
					}
				} else {
					value = _formatLocaleKey(value);

					if (!value) {
						_warning(4030, [key, origValue]);
						return;
					}
				}

				preparationSecondaries[key] = value;
			}
		});

		/* check that secondaries does not loop */
		_each(preparationSecondaries, function(value, key) {
			var list = [key];

			while (value !== false && list.indexOf(value) === -1) {
				list.push(value);
				key = value;
				value = preparationSecondaries[key];

				if (typeof value === 'undefined') {
					value = sv.locales[key].secondary;
				}
			}

			if (value) {
				errors = [7030, [list.join(', ')]];
			}
		});

		if (errors) {
			_error.apply(this, errors);
			return;
		}

		/* copy secondaries */
		_each(preparationSecondaries, function(value, key) {
			sv.locales[key].secondary = value;
		});
	}

	function _configureLog(optLog, kind) {
		sv.log[kind] = optLog;
	}

	function _configureStorage(options) {
		var type = 'none';

		if (options instanceof Array) {
			options.some(function(opt) {
				var o = opt.replace(/:.*$/, '');
				switch (o) {
					case 'cookie':
						if (_mayUse.cookie()) {
							type = opt;
							return true;
						}
						break;
					case 'localStorage':
						if (_mayUse.localStorage()) {
							type = opt;
							return true;
						}
						break;
				}
			});
		} else {
			type = options;
		}

		type = type.split(':');
		sv.storage.kind = type[0];
		sv.storage.name = type[1];
	}

	function _setStorage(value, reset) {
		switch(sv.storage.kind) {
			case 'cookie':
				if (reset) {
					document.cookie = sv.storage.name + '=';
				} else {
					document.cookie = sv.storage.name + '=' + value;
				}
				break;
			case 'localStorage':
				if (reset) {
					self.localStorage.removeItem(sv.storage.name);
				} else {
					self.localStorage.setItem(sv.storage.name, value);
				}
				break;
		}
	}

	function _getStorage() {
		var value, srch;

		switch(sv.storage.kind) {
			case 'cookie':
				srch = sv.storage.name + '=';
				value = document.cookie.split(';').filter(function(str) {
					return str.indexOf(srch) === 0;
				})[0];
				if (value) {
					value = value.substr(srch.length + 1);
				}
				break;
			case 'localStorage':
				value = self.localStorage.getItem(sv.storage.name);
		}

		return value;
	}

	function _getLocale(locale, options) {
		var result, lastResult, nb;
		options || (options = {key: true});

		if (!locale) {
			return;
		}

		result = {};
		nb = 0;
		_each(options, function(value, attribute) {
			if (value) {
				switch (attribute) {
					case 'data':
						lastResult = sv.data[locale.key] && sv.data[locale.key][value];
						break;
					case 'localeKey':
					case 'locale':
						lastResult = locale.key;
						break;
					case 'localeName':
						lastResult = locale.name;
						break;
					default:
						lastResult = locale[attribute];
				}
				result[attribute] = lastResult;
				nb++;
			}
		});

		if (nb === 1) {
			result = lastResult;
		} else if (nb === 0) {
			result = locale.key;
		}

		return result;
	}

	function _getDefaultKey() {
		var key = _getStorage();

		if (!key && typeof sv.defaultKeyLocale === 'string') {
			key = _formatLocaleKey(sv.defaultKeyLocale);
		}

		if (!key) {
			self.navigator.languages.some(function(lng) {
				key = _formatLocaleKey(lng);
				return key;
			});

			if (!key) {
				key = sv.localeKeys[0];
			}
		}

		return key;
	}

	function _getCatalog() {
		var catalog = [];

		sv.localeKeys.forEach(function(key) {
			var dico = sv.data[key];
			if (dico) {
				_each(dico, function(v, sentence) {
					if (catalog.indexOf(sentence) === -1) {
						catalog.push(sentence);
					}
				});
			}
		});

		return catalog;
	}

	function _formatLocaleKey(key) {
		key = _default(key, '');
		key = key.toLowerCase();

		while (!sv.locales[key] && key) {
			key = key.replace(/(?:^|-)[^-]*$/, '');
		}

		return key;
	}

	function _addParser(parser, name, weight) {
		if (typeof parser !== 'function') {
			_error(7200, [name]);
			return;
		}

		if (typeof weight === 'undefined') {
			if (sv.parser.length) {
				weight = sv.parser[sv.parser.length - 1].w - 10;
			} else {
				weight = 100;
			}
		}

		sv.parser.push({
			f: parser,
			w: weight,
			name: name
		});

		sv.parser.sort(function(a, b) {
			return b.w - a.w;
		});
	}

	function _parse(text) {
		var txt, values;

		values = Array.prototype.slice.call(arguments, 1);

		txt = sv.parser.reduce(function (text, parser) {
			try {
				text = parser.f(text, values, sv);
			} catch(e) {
				_warning(4200, [parser.name, e.message]);
			}
			return text;
		}, text);

		return txt;
	}

	function _loadDictionary(dictionary) {
		switch(typeof dictionary) {
			case 'object':
				_addDictionary(dictionary);
				break;
			case 'function':
				_addDictionary(dictionary());
				break;
			case 'string':
				_ajax(dictionary, _addDictionary);
				break;
			default:
				_error(7010, [typeof dictionary, dictionary]);
		}
	}

	function _loadData(dictionary, key) {
		var addData = key ? _addDataWithKey : _addData;

		switch(typeof dictionary) {
			case 'object':
				addData(dictionary, key);
				break;
			case 'function':
				addData(dictionary(key), key);
				break;
			case 'string':
				_ajax(dictionary, addData, key);
				break;
			default:
				if (key) {
					_error(7013, [key, typeof dictionary, dictionary]);
				} else {
					_error(7012, [typeof dictionary, dictionary]);
				}
		}
	}

	function _loadCurrentLocale() {
		var key = sv.currentLocale.key;
		var method = sv.loadingMethod[key];
		var dictionary = sv.data[key];

		sv.status.callLocaleLoaded = true;

		if (!dictionary || typeof dictionary !== 'object') {
			switch(typeof method) {
				case 'function':
					_addDataWithKey(method(key), key);
					break;
				case 'string':
					_ajax(method, _addDataWithKey, key);
					break;
				case 'undefined':
					_localeReady();
					break;
				default:
					_error(7013, [key, typeof method, method]);
					_localeReady();
			}
		} else {
			_localeReady();
		}
	}

	function _addDictionary(dictionary) {
		_each(dictionary, _addItem);
		_localeReady();
	}

	function _addData(dictionary) {
		var loadData = sv.lazyLoading ? _saveData : _loadData;

		if (typeof dictionary !== 'object') {
			_error(7012, [typeof dictionary, dictionary]);
			return;
		}

		_each(dictionary, loadData);

		if (sv.status.callLocaleLoaded === true) {
			_localeReady();
		}
	}

	function _addDataWithKey(dico, key) {
		if (!dico) {
			return;
		}

		_addDataByKey(dico, key);

		if (sv.status.callLocaleLoaded === true) {
			_localeReady();
		}
	}

	function _saveData(dico, key) {
		if (!dico) {
			return;
		}

		if (typeof dico === 'object') {
			_addDataWithKey(dico, key);
		} else {
			sv.loadingMethod[key] = dico;
		}
	}

	function _addDataByKey(dico, key) {
		if (typeof dico[key] === 'object') {
			dico = dico[key];
		}

		if (typeof dico !== 'object') {
			_error(7014, [key, typeof dico, dico]);
			return;
		}

		_each(dico, function(value, sentenceKey) {
			var obj = {};
			obj[key] = value;
			_addItem(obj, sentenceKey);
		});
	}

	function _addItem(values, sentenceKey) {
		if (typeof values !== 'object') {
			_error(7011, [typeof values, values]);
			return;
		}

		_each(values, function(value, key) {
			var dico = sv.data[key];

			if (dico === null) {
				dico = sv.data[key] = {};
			}

			if (!dico) {
				return;
			}

			dico[sentenceKey] = value;
		});
	}

	function _ajax(url, success, key) {
		var xhr = new XMLHttpRequest();
		var rslt;

		if (sv.syncLoading) {
			xhr.open('GET', url, false);
			xhr.send(null);
			if (xhr.status === 200 || xhr.status === 0) {
				rslt = _manageResponse(xhr.responseText);
				if (rslt) {
					success(rslt, key);
				}
			} else {
				_error(8000 + xhr.status, [url]);
			}
		} else {
			xhr.onreadystatechange = function() {
				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200 || xhr.status === 0) {
						rslt = _manageResponse(xhr.responseText);
		                if (rslt) {
							success(rslt, key);
						}
					} else {
						_error(8000 + xhr.status, [url]);
					}
	            }
			};
			xhr.open('GET', url, true);
			xhr.send(null);
		}

		function _manageResponse(response) {
			var json;

			try {
				json = JSON.parse(response);
			} catch (e) {
				_error(7020, [url, response]);
			}

			return json;
		}
	}

	function _localeReady() {
		if (sv.status.callLocaleLoaded === true
		&&	typeof sv.onLocaleReady === 'function'
		&& _hasDataKey(sv.currentLocale.key))
		{
			sv.status.callLocaleLoaded = false;
			sv.onLocaleReady(sv.currentLocale.key);
		}
	}

	function _hasDataKey(key) {
		var hasData = typeof sv.data[key] === 'object' && sv.data[key] !== null;
		var secondary = sv.locales[key].secondary;

		return hasData && (!secondary || secondary && _hasDataKey(secondary));
	}

	/*
	 * Translations
	 */

	function _translation(sentenceKey, key, origKey) {
		var sentence;

		key = key || sv.currentLocale.key;
		origKey = origKey || key;

		switch(typeof sentenceKey) {
			case 'string':
				sentence = _translationString(sentenceKey, key, origKey);
				break;
			case 'object':
				sentence = _translationObject(sentenceKey, key, origKey);
				break;
			default:
				sentence = '';
				_error(7100, [typeof sentenceKey, sentenceKey]);
		}

		return sentence;
	}

	function _translationString(sentenceKey, key, origKey) {
		var ldata, sentence;

		ldata = sv.data[key];
		sentence = ldata && ldata[sentenceKey];

		sentence = _translationFallback(sentenceKey, key, origKey, sentence, _translationIssueString);

		return sentence;
	}

	function _translationIssueString(sentenceKey, origKey) {
		_warning(4100, [sentenceKey, origKey]);
		return sentenceKey;
	}

	function _translationObject(sentenceObject, key, origKey) {
		var sentence;

		sentence = sentenceObject[key];

		sentence = _translationFallback(sentenceObject, key, origKey, sentence, _translationIssueObject);

		return sentence;
	}

	function _translationIssueObject(sentenceKey, origKey) {
		var json;

		try {
			json = JSON.stringify(sentenceKey);
		} catch(e) {
			json = sentenceKey.toString();
		}

		_warning(4101, [json, origKey, sentenceKey]);
		return '';
	}

	function _translationFallback(sentenceKey, key, origKey, sentence, notTranslated) {
		var secondary;

		if (typeof sentence !== 'string') {
			secondary = sv.locales[key].secondary;
			if (secondary) {
				sentence = _translation(sentenceKey, secondary, origKey);
			} else {
				sentence = notTranslated(sentenceKey, origKey);
			}
		}

		return sentence;
	}

	/*
	 * Notifiction functions
	 */

	function _info(code, details) {
		var message = _getMessage(code, details);

		if (typeof sv.log.info === 'function') {
			sv.log.info(code, message, details);
		} else {
			console.info(message);
		}
	}

	function _warning(code, details) {
		var message = _getMessage(code, details);

		if (typeof sv.log.warn === 'function') {
			sv.log.warn(code, message, details);
		} else {
			console.warn(message);
		}
	}

	function _error(code, details) {
		var message = _getMessage(code, details);

		if (typeof sv.log.error === 'function') {
			sv.log.error(code, message, details);
		} else {
			console.error(message);
		}
	}

	function _getMessage(code, details) {
		var idx;
		var message = _codeMessage[code];

		if (!message) {
			message = 'unknown code (' + code + ') with details (' + details + ')';
		} else {
			idx = 0;
			message = message.replace(/%s/g, function() {
				return details[idx++];
			});
		}

		return message;
	}

	function _export(name) {
		/**
		 * export to either browser or node.js
		 */
		if (typeof exports !== 'undefined') {
			exports[name] = i18n;
		} else {
			self[name] = i18n;

			if (typeof define === 'function' && define.amd) {
				define(function() {
					var obj = {};

					obj[name] = i18n;
					return obj;
				});
			}
		}
	}

	/*
	 * generic helper function
	 */

	function _default(value, dfltValue) {
		return typeof value === 'undefined' ? dfltValue : value;
	}

	function _each(object, iteratee, context) {
		var x, f;
		if (typeof context === 'object') {
			f = iteratee.bind(context);
		} else {
			f = iteratee;
		}

		for (x in object) {
			if (object.hasOwnProperty(x)) {
				f(object[x], x, object);
			}
		}
	}

	var _mayUse = {
		cookie: function() {
			return !!(self.document && document.cookie);
		},
		localStorage: function() {
			return !!self.localStorage;
		}
	};

	/* providing the API */
	if (typeof _i18n_config === 'object') {
		i18n.configuration(_i18n_config);

		if (!_i18n_config.doNotAliasi18n) {
			_export('i18n');
		}
	} else {
		_export('i18n');
	}
})();
