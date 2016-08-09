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
		4200: 'Formatter "%s" has thrown an issue: %s',

		/* errors */
		7010: 'dictionary is in a wrong format (%s): %s',
		7011: 'item is in a wrong format (%s while object is expected): %s',
		7012: 'data is in a wrong format (%s): %s',
		7013: 'data with key "%s" is in a wrong format (%s): %s',
		7014: 'data for key "%s" can not be loaded due to wrong format (%s while object is expected): %s',
		7020: 'data recieved from "%s" is not in a valid JSON ("%s")',
		7030: 'The secondaries fallback create a circular loop (%s).',
		7100: 'Translation is not possible due to an unsupported type (%s): %s',
		7200: 'Formatter %s can not be added because it is not a function.',
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

	var defaultRules = {
		number: {
			thousandSeparator: ',',
			decimalSeparator: '.',
			exponentialSeparator: 'e',
			SIsuffix: [
				{suffix: 'P', multiple: 1e+15},
				{suffix: 'T', multiple: 1e+12},
				{suffix: 'G', multiple: 1e+9},
				{suffix: 'M', multiple: 1e+6},
				{suffix: 'k', multiple: 1e+3},
				{suffix: '', multiple: 1e+0},
				{suffix: 'm', multiple: 1e-3},
				{suffix: 'µ', multiple: 1e-6},
				{suffix: 'n', multiple: 1e-9},
				{suffix: 'p', multiple: 1e-12},
				{suffix: 'f', multiple: 1e-15}
			]
		},
		duration: {
			y: 'y',
			month: 'M',
			d: 'd',
			h: 'h',
			min: 'min',
			s: 's',
			ms: 'ms',
			'µs': 'µs'
		}
	};
	var defaultFormat = {
		string: {
			escape: 'no'
		}
	};

	/* status variables */
	var statusVariables;
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

		if (typeof options.formatRules === 'object') {
			_configureFormatRules(options.formatRules);
		}

		if (typeof options.alias === 'string') {
			_export(options.alias);
		}

		if (typeof options.onLocaleReady !== 'undefined') {
			statusVariables.onLocaleReady = options.onLocaleReady;
		}

		if (typeof options.syncLoading === 'boolean') {
			statusVariables.syncLoading = options.syncLoading;
		}

		if (typeof options.lazyLoading === 'boolean') {
			statusVariables.lazyLoading = options.lazyLoading;
		}

		if (needLoading) {
			statusVariables.status.callLocaleLoaded = true;
		}

		if (typeof options.dictionary !== 'undefined') {
			_loadDictionary(options.dictionary);
		}

		if (typeof options.data !== 'undefined') {
			_loadData(options.data);
		}

		if (typeof options.storage !== 'undefined') {
			_configureStorage(options.storage);
			if (!statusVariables.useDfltLocale) {
				_setStorage(statusVariables.currentLocale.key);
			}
		}

		if (typeof options.defaultFormat === 'object') {
			_setDefaultFormat(statusVariables, options.defaultFormat);
		}

		if (typeof options.defaultLocale !== 'undefined') {
			statusVariables.defaultKeyLocale = options.defaultLocale;
		}

		if (statusVariables.useDfltLocale && statusVariables.localeKeys.length) {
			statusVariables.currentLocale = statusVariables.locales[_getDefaultKey()];
		}

		if (needLoading && statusVariables.lazyLoading) {
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

		if (key === statusVariables.currentLocale.key) {
			key = false;
		} else
		if (!statusVariables.locales[key]) {
			key = false;
			saveChanged = false;
		} else {
			statusVariables.currentLocale = statusVariables.locales[key];
			_loadCurrentLocale();
		}

		if (saveChanged) {
			statusVariables.useDfltLocale = useDflt;
			_setStorage(i18n.getLocale(), statusVariables.useDfltLocale);
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
		return _getLocale(statusVariables.currentLocale, options);
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
		return statusVariables.localeKeys.map(function(key) {
			return _getLocale(statusVariables.locales[key], options);
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
		dico = statusVariables.data[key];

		if (format === 'dictionary') {
			rslt = {};
			_getCatalog().forEach(function(sentence) {
				rslt[sentence] = {};

				if (dico && dico[sentence]) {
					rslt[sentence][key] = dico[sentence];
				} else {
					statusVariables.localeKeys.forEach(function(key) {
						if (statusVariables.data[key] && statusVariables.data[key][sentence]) {
							rslt[sentence][key] = statusVariables.data[key][sentence];
						}
					});
				}
			});
		} else {
			if (key && typeof dico !== 'undefined') {
				rslt = dico;
			} else {
				rslt = statusVariables.data;
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
	 * Add a formatter to the formatter list
	 *
	 * @param options.formatter {Function} a formatter to call on string to parse
	 * @param [options.name] {String} the name of the formatter (mainly useful for messages);
	 * @param [options.weight] {Number} the importance of the formatter. The heigher the weight is the first the formatter will be called.
	 */
	i18n.loadFormatter = function(options) {
		if (typeof options !== 'object') {
			options = {formatter: options};
		}

		var formatter = options.formatter;
		var name = options.name || formatter.name || '';
		var weight = options.weight;

		_addFormatter(formatter, name, weight);
	};

	/**
	 * parse a string without translating it
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
			statusVariables.data = {};
			statusVariables.localeKeys.forEach(_resetDataKey);
		} else {
			key = _formatLocaleKey(key);
			if (statusVariables.data[key]) {
				_resetDataKey(key);
			}
		}
	};

	/**
	 * Get the format rules for the given locale
	 *
	 * @param [key] {String} the locale's rule to retrieve. If not defined the current locale's rule is return.
	 *
	 * @return {Object} the formatted rule of the locale
	 */
	i18n.getRules = function(key) {
		var useDflt = typeof key === 'undefined';

		if (useDflt) {
			key = statusVariables.currentLocale.key;
		} else {
			key = _formatLocaleKey(key);
		}

		return (statusVariables.locales[key] && statusVariables.locales[key].formatRules) || {};
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
		statusVariables = {
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
			formatter: [],
			status: {
				callLocaleLoaded: false
			},
			defaultFormat: _extend({}, defaultFormat),
			log: {
				info: null,
				warn: null,
				error: null
			}
		};
	}

	function _resetDataKey(key) {
		statusVariables.data[key] = null;
	}

	function _createLocale(key, name) {
		var dflt, locale;

		key = key.toLowerCase();

		dflt = statusVariables.locales[key] || {};
		locale = {
			key: key,
			name: _default(name, dflt.name),
			secondary: false,
			formatRules: _extend({}, defaultRules)
		};

		return locale;
	}

	function _cleanData() {
		_each(statusVariables.data, function(value, key) {
			if (statusVariables.localeKeys.indexOf(key) === -1) {
				delete statusVariables.data[key];
			}
		});

		statusVariables.localeKeys.forEach(function(key) {
			if (!statusVariables.data[key]) {
				_resetDataKey(key);
			}
		});
	}

	function _configureLocaleSet(options) {
		var nextLocales = {};
		var needLoading = false;

		statusVariables.localeKeys = [];

		options.localeSet.forEach(function(localeObj) {
			var key, name, secondary, formatRules, dataDictionary;
			var locale;
			var data;

			if (typeof localeObj !== 'object') {
				return;
			}

			key = localeObj.localeKey || localeObj.key || localeObj.locale;
			name = localeObj.localeName || localeObj.name;
			secondary = localeObj.secondary;
			formatRules = localeObj.formatRules;
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

			if (typeof formatRules === 'object') {
				_setFormatRules(formatRules, locale);
			}

			if (dataDictionary) {
				data = {};
				data[key] = dataDictionary;
				_loadData(data);
				needLoading = true;
			}

			if (!nextLocales[key]) {
				statusVariables.localeKeys.push(key);
			}
			nextLocales[key] = locale;
		});

		_cleanData();

		statusVariables.locales = nextLocales;

		return needLoading;
	}

	function _configureLocales(options) {
		var nextLocales = {};

		statusVariables.localeKeys = [];

		options.locales.forEach(function(key) {
			var locale;

			if (typeof key !== 'string') {
				return;
			}

			locale = _createLocale(key, options.localeName && options.localeName[key]);
			key = locale.key;

			if (!nextLocales[key]) {
				statusVariables.localeKeys.push(key);
			}
			nextLocales[key] = locale;
		});

		_cleanData();

		statusVariables.locales = nextLocales;
	}

	function _configurelocaleNames(options) {
		_each(options.localeName, function(value, key) {
			key = _formatLocaleKey(key);

			if (statusVariables.locales[key]) {
				statusVariables.locales[key].name = value;
			}
		});
	}

	function _setFormatRules(rules, lng) {
		var locale;

		if (typeof lng === 'string') {
			lng = _formatLocaleKey(lng);
			locale = statusVariables.locales[lng];
		} else {
			locale = lng;
		}

		if (locale) {
			_extend(locale.formatRules, rules);
			if (rules.number && rules.number.SIsuffix) {
				/* sort from biggest multiple to smallest multiple */
				locale.formatRules.number.SIsuffix.sort(function(s1, s2) {
					return s2.multiple - s1.multiple;
				});
			}
		}
	}

	function _configureFormatRules(rules) {
		_each(rules, _setFormatRules);
	}

	function _configureSecondaries(secondaries) {
		var preparationSecondaries = {};
		var errors = false;

		/* prepare the secondaries */
		_each(secondaries, function(origValue, key) {
			var value = origValue;
			key = _formatLocaleKey(key);

			if (statusVariables.locales[key]) {
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
					value = statusVariables.locales[key].secondary;
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
			statusVariables.locales[key].secondary = value;
		});
	}

	function _configureLog(optLog, kind) {
		statusVariables.log[kind] = optLog;
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
		statusVariables.storage.kind = type[0];
		statusVariables.storage.name = type[1];
	}

	function _setDefaultFormat(statusVariables, dfltFormat) {
		_extend(statusVariables.defaultFormat, dfltFormat);
	}

	function _setStorage(value, reset) {
		switch(statusVariables.storage.kind) {
			case 'cookie':
				if (reset) {
					document.cookie = statusVariables.storage.name + '=';
				} else {
					document.cookie = statusVariables.storage.name + '=' + value;
				}
				break;
			case 'localStorage':
				if (reset) {
					self.localStorage.removeItem(statusVariables.storage.name);
				} else {
					self.localStorage.setItem(statusVariables.storage.name, value);
				}
				break;
		}
	}

	function _getStorage() {
		var value, srch;

		switch(statusVariables.storage.kind) {
			case 'cookie':
				srch = statusVariables.storage.name + '=';
				value = document.cookie.split(';').filter(function(str) {
					return str.indexOf(srch) === 0;
				})[0];
				if (value) {
					value = value.substr(srch.length + 1);
				}
				break;
			case 'localStorage':
				value = self.localStorage.getItem(statusVariables.storage.name);
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
						lastResult = statusVariables.data[locale.key] && statusVariables.data[locale.key][value];
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

		if (!key && typeof statusVariables.defaultKeyLocale === 'string') {
			key = _formatLocaleKey(statusVariables.defaultKeyLocale);
		}

		if (!key) {
			/* navigator.languages is not defined in worker */
			if (self.navigator && self.navigator.languages instanceof Array) {
				self.navigator.languages.some(function(lng) {
					key = _formatLocaleKey(lng);
					return key;
				});
			}

			if (!key && self.navigator && self.navigator.language) {
				key = _formatLocaleKey(self.navigator.language);
			}

			/* final fallback use the first locale available */
			if (!key) {
				key = statusVariables.localeKeys[0];
			}
		}

		return key;
	}

	function _getCatalog() {
		var catalog = [];

		statusVariables.localeKeys.forEach(function(key) {
			var dico = statusVariables.data[key];
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

		while (!statusVariables.locales[key] && key) {
			key = key.replace(/(?:^|-)[^-]*$/, '');
		}

		return key;
	}

	function _addFormatter(formatter, name, weight) {
		if (typeof formatter !== 'function') {
			_error(7200, [name]);
			return;
		}

		if (typeof weight === 'undefined') {
			if (statusVariables.formatter.length) {
				weight = statusVariables.formatter[statusVariables.formatter.length - 1].w - 10;
			} else {
				weight = 100;
			}
		}

		statusVariables.formatter.push({
			f: formatter,
			w: weight,
			name: name
		});

		statusVariables.formatter.sort(function(a, b) {
			return b.w - a.w;
		});
	}

	function _parse(text) {
		var txt, values;

		values = Array.prototype.slice.call(arguments, 1);

		txt = statusVariables.formatter.reduce(function (text, formatter) {
			try {
				text = formatter.f(text, values, statusVariables);
			} catch(e) {
				_warning(4200, [formatter.name, e.message]);
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
		var key = statusVariables.currentLocale.key;
		var method = statusVariables.loadingMethod[key];
		var dictionary = statusVariables.data[key];

		statusVariables.status.callLocaleLoaded = true;

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
		var loadData = statusVariables.lazyLoading ? _saveData : _loadData;

		if (typeof dictionary !== 'object') {
			_error(7012, [typeof dictionary, dictionary]);
			return;
		}

		_each(dictionary, loadData);

		if (statusVariables.status.callLocaleLoaded === true) {
			_localeReady();
		}
	}

	function _addDataWithKey(dico, key) {
		if (!dico) {
			return;
		}

		_addDataByKey(dico, key);

		if (statusVariables.status.callLocaleLoaded === true) {
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
			statusVariables.loadingMethod[key] = dico;
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
			var dico = statusVariables.data[key];

			if (dico === null) {
				dico = statusVariables.data[key] = {};
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

		if (statusVariables.syncLoading) {
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
		if (statusVariables.status.callLocaleLoaded === true
		&&	typeof statusVariables.onLocaleReady === 'function'
		&& _hasDataKey(statusVariables.currentLocale.key))
		{
			statusVariables.status.callLocaleLoaded = false;
			statusVariables.onLocaleReady(statusVariables.currentLocale.key);
		}
	}

	function _hasDataKey(key) {
		var hasData = typeof statusVariables.data[key] === 'object' && statusVariables.data[key] !== null;
		var secondary = statusVariables.locales[key].secondary;

		return hasData && (!secondary || secondary && _hasDataKey(secondary));
	}

	/*
	 * Translations
	 */

	function _translation(sentenceKey, key, origKey) {
		var sentence;

		key = key || statusVariables.currentLocale.key;
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

		ldata = statusVariables.data[key];
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
			secondary = statusVariables.locales[key].secondary;
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

		if (typeof statusVariables.log.info === 'function') {
			statusVariables.log.info(code, message, details);
		} else {
			console.info(message);
		}
	}

	function _warning(code, details) {
		var message = _getMessage(code, details);

		if (typeof statusVariables.log.warn === 'function') {
			statusVariables.log.warn(code, message, details);
		} else {
			console.warn(message);
		}
	}

	function _error(code, details) {
		var message = _getMessage(code, details);

		if (typeof statusVariables.log.error === 'function') {
			statusVariables.log.error(code, message, details);
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

	function _extend(origObj, extendObj) {
		_each(extendObj, function(value, key) {
			if (typeof value !== 'object') {
				origObj[key] = value;
			} else {
				if (value instanceof Array) {
					origObj[key] = [];
				} else
				if (typeof origObj[key] !== 'object') {
					origObj[key] = {};
				}

				_extend(origObj[key], value);
			}
		});

		return origObj;
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
