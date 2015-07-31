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

	/* status variables */
	var locales, localeKeys, currentLocale,
		defaultKeyLocale, useDfltLocale, storage,
		syncLoading, lazyLoading,
		onLocaleReady,
		data, loadingMethod, status;
	_reset();

	/* API methods */

	function i18n() {}

	/**
	 * Configure the i18n
	 *
	 * Each parameter is optional
	 * @param [options.locales] {String[]} list of locale keys to manage. Other locales will be rejected. It reset previous configuration.
	 * @param [options.localeName] {Object} list of key/value to give to locale a pretty name.
	 * @param [options.alias] {string} attach the i18n function to the global variable described by alias.
	 * @param [options.defaultLocale] {string} the default locale key to use.
	 * @param [options.storage] {String|String[]} tell the way to store the locale for another session.
	 * @param [options.syncLoading] {Boolean} If true Ajax call are done synchronously.
	 * @param [options.lazyLoading] {Boolean} If true, Ajax and data function are called when needed.
	 * @param [options.onLocaleReady] {Function} called each time the data for the current locale are ready to use
	 * @param [options.dictionary] {Object|String|Function} add data to all language (formatted by sentences)
	 * @param [options.data] {Object|String|Function} add data to all language (formatted by languages)
	 */
	i18n.configuration = function(options) {
		options || (options = {});
		var needLoading = typeof options.dictionary !== 'undefined' || typeof options.data !== 'undefined';

		if (options.locales instanceof Array) {
			_configureLocales(options);
		} else
		if (typeof options.localeName === 'object') {
			_configurelocaleNames(options);
		}

		if (typeof options.alias === 'string') {
			self[options.alias] = i18n;
		}

		if (typeof options.onLocaleReady !== 'undefined') {
			onLocaleReady = options.onLocaleReady;
		}

		if (typeof options.syncLoading === 'boolean') {
			syncLoading = options.syncLoading;
		}

		if (typeof options.lazyLoading === 'boolean') {
			lazyLoading = options.lazyLoading;
		}

		if (needLoading) {
			status.callLocaleLoaded = true;
		}

		if (typeof options.dictionary !== 'undefined') {
			_loadDictionary(options.dictionary);
		}

		if (typeof options.data !== 'undefined') {
			_loadData(options.data);
		}

		if (typeof options.storage !== 'undefined') {
			_configureStorage(options.storage);
			if (!useDfltLocale) {
				_setStorage(currentLocale.key);
			}
		}

		if (typeof options.defaultLocale !== 'undefined') {
			defaultKeyLocale = options.defaultLocale;
		}

		if (useDfltLocale && localeKeys.length) {
			currentLocale = locales[_getDefaultKey()];
		}

		if (needLoading && lazyLoading) {
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

		if (key === currentLocale.key) {
			key = false;
		} else
		if (!locales[key]) {
			key = false;
			saveChanged = false;
		} else {
			currentLocale = locales[key];
			_loadCurrentLocale();
		}

		if (saveChanged) {
			useDfltLocale = useDflt;
			_setStorage(i18n.getLocale(), useDfltLocale);
		}

		return key;
	};

	/**
	 * Retrieve the current locale
	 *
	 * @param [options.key] {Boolean} if true, the locale's key will be returned
	 * @param [options.name] {Boolean} if true, the locale's name will be returned
	 * @param [options.data] {String} if defined, the locale's translation will be returned
	 * @return [String|Object] If only one option is given, it return the value of this option
	 *						   If several options are given, it return an object with the key/value of wanted options.
	 */
	i18n.getLocale = function(options) {
		return _getLocale(currentLocale, options);
	};

	/**
	 * Retrieve the informations of all locales
	 *
	 * @param [options.key] {Boolean} if true, the locales' key will be returned
	 * @param [options.name] {Boolean} if true, the locales' name will be returned
	 * @param [options.data] {String} if defined, the locales' translation will be returned
	 * @return [String[]|Object[]] If only one option is given, it return the value list of this option
	 *							   If several options are given, it return a list of object with the key/value of wanted options.
	 */
	i18n.getLocales = function(options) {
		return localeKeys.map(function(key) {
			return _getLocale(locales[key], options);
		});
	};

	/**
	 * Get the data of the specified locale
	 *
	 * @param [options] {Object|String} options to retrieve data. If a string it defines key.
	 * @param [options.key] {String} the locale's data to get. If not defined data of all locales are returned.
	 * @param [options.format] {String} the result format. Value can be 'dictionary' or 'data' (default is 'data').
	 * @return {Object} the data
	 */
	i18n.getData = function(options) {
		var opt = typeof options === 'object' ? options : {};
		var key = (typeof options === 'string' ? options : opt.key || opt.locale) || '';
		var format = opt.format || 'data';
		var rslt;
		var dico;

		key = _formatLocaleKey(key);
		dico = data[key];

		if (format === 'dictionary') {
			rslt = {};
			_getCatalog().forEach(function(sentence) {
				rslt[sentence] = {};

				if (dico && dico[sentence]) {
					rslt[sentence][key] = dico[sentence];
				} else {
					localeKeys.forEach(function(key) {
						if (data[key] && data[key][sentence]) {
							rslt[sentence][key] = data[key][sentence];
						}
					});
				}
			});
		} else {
			if (key && typeof dico !== 'undefined') {
				rslt = dico;
			} else {
				rslt = data;
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
	 * Clear the data of the specified locale
	 *
	 * @param [key] {String} the locale's data to clear. If not defined all data are cleared.
	 */
	i18n.clearData = function(key) {
		if (typeof key === 'undefined') {
			data = {};
			localeKeys.forEach(_resetDataKey);
		} else {
			key = _formatLocaleKey(key);
			if (data[key]) {
				_resetDataKey(key);
			}
		}
	};

	/** should be used for test only */
	i18n._reset = _reset;

	/*
	 * private functions
	 */

	function _reset() {
		locales = {};
		localeKeys = [];
		defaultKeyLocale = undefined;
		currentLocale = null;
		useDfltLocale = true;
		storage = {
			kind: 'none',
			name: ''
		};
		data = {};
		loadingMethod = {};
		syncLoading = false;
		lazyLoading = true;
		onLocaleReady = null;
		status = {
			callLocaleLoaded: false
		};
	}

	function _resetDataKey(key) {
		data[key] = null;
	}

	function _createLocale(key, name) {
		var dflt, locale;

		key = key.toLowerCase();

		dflt = locales[key] || {};
		locale = {
			key: key,
			name: _default(name, dflt.name)
		};

		return locale;
	}

	function _configureLocales(options) {
		var nextLocales = {};

		localeKeys = [];

		options.locales.forEach(function(key) {
			var locale;

			if (typeof key !== 'string') {
				return;
			}

			locale = _createLocale(key, options.localeName && options.localeName[key]);
			key = locale.key;

			if (!nextLocales[key]) {
				localeKeys.push(key);
			}
			nextLocales[key] = locale;
		});

		_each(data, function(value, key) {
			if (localeKeys.indexOf(key) === -1) {
				delete data[key];
			}
		});

		localeKeys.forEach(function(key) {
			if (!data[key]) {
				_resetDataKey(key);
			}
		});

		locales = nextLocales;
	}

	function _configurelocaleNames(options) {
		_each(options.localeName, function(value, key) {
			key = _formatLocaleKey(key);

			if (locales[key]) {
				locales[key].name = value;
			}
		});
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
		storage.kind = type[0];
		storage.name = type[1];
	}

	function _setStorage(value, reset) {
		switch(storage.kind) {
			case 'cookie':
				if (reset) {
					document.cookie = storage.name + '=';
				} else {
					document.cookie = storage.name + '=' + value;
				}
				break;
			case 'localStorage':
				if (reset) {
					self.localStorage.removeItem(storage.name);
				} else {
					self.localStorage.setItem(storage.name, value);
				}
				break;
		}
	}

	function _getStorage() {
		var value, srch;

		switch(storage.kind) {
			case 'cookie':
				srch = storage.name + '=';
				value = document.cookie.split(';').filter(function(str) {
					return str.indexOf(srch) === 0;
				})[0];
				if (value) {
					value = value.substr(srch.length + 1);
				}
				break;
			case 'localStorage':
				value = self.localStorage.getItem(storage.name);
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
						lastResult = data[locale.key] && data[locale.key][value];
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

		if (!key && typeof defaultKeyLocale === 'string') {
			key = _formatLocaleKey(defaultKeyLocale);
		}

		if (!key) {
			self.navigator.languages.some(function(lng) {
				return key = _formatLocaleKey(lng);
			});

			if (!key) {
				key = localeKeys[0];
			}
		}

		return key;
	}

	function _getCatalog() {
		var catalog = [];

		localeKeys.forEach(function(key) {
			var dico = data[key];
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

		while (!locales[key] && key) {
			key = key.replace(/(?:^|-)[^-]*$/, '');
		}

		return key;
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
				_error('%s is not a type supported for dictionary', typeof dictionary);
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
				_error('%s is not a type supported for data', typeof dictionary);
		}
	}

	function _loadCurrentLocale() {
		var key = currentLocale.key;
		var method = loadingMethod[key];
		var dictionary = data[key];

		status.callLocaleLoaded = true;

		if (!dictionary || typeof dictionary !== 'object') {
			switch(typeof method) {
				case 'function':
					_addDataWithKey(method(key), key);
					break;
				case 'string':
					_ajax(method, _addDataWithKey, key);
					break;
				default:
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
		var loadData = lazyLoading ? _saveData : _loadData;

		if (typeof dictionary !== 'object') {
			warning('Data cannot be loaded because it is not in correct format (' + (typeof dictionary) + ')');
			return;
		}

		_each(dictionary, loadData);

		if (status.callLocaleLoaded === true) {
			_localeReady();
		}
	}

	function _addDataWithKey(dico, key) {
		if (!dico) {
			return;
		}

		_addDataByKey(dico, key);

		if (status.callLocaleLoaded === true) {
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
			loadingMethod[key] = dico;
		}
	}

	function _addDataByKey(dico, key) {
		if (typeof dico[key] === 'object') {
			dico = dico[key];
		}

		if (typeof dico !== 'object') {
			warning('Data cannot be loaded in "' + key + '" because it is not in correct format (' + (typeof dico) + ')');
			return;
		}

		_each(dico, function(value, sentenceKey) {
			var obj = {};
			obj[key] = value;
			_addItem(obj, sentenceKey);
		});
	}

	function _addItem(values, sentenceKey) {
		_each(values, function(value, key) {
			var dico = data[key];

			if (dico === null) {
				dico = data[key] = {};
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

		if (syncLoading) {
			xhr.open('GET', url, false);
			xhr.send(null);
			if (xhr.status === 200 || xhr.status === 0) {
				if (rslt = _manageResponse(xhr.responseText)) {
					success(rslt, key);
				}
			} else {
				_error('Request "' + url + '" has return a code ' + xhr.status);
			}
		} else {
			xhr.onreadystatechange = function() {
				if (xhr.readyState === xhr.DONE) {
					if (xhr.status === 200 || xhr.status === 0) {
		                if (rslt = _manageResponse(xhr.responseText)) {
							success(rslt, key);
						}
					} else {
						_error('Request "' + url + '" has return a code ' + xhr.status);
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
				_error('response is not json valid');
			}

			return json;
		}
	}

	function _localeReady() {
		if (status.callLocaleLoaded === true
		&&	typeof onLocaleReady === 'function'
		&& _hasDataKey(currentLocale.key))
		{
			status.callLocaleLoaded = false;
			onLocaleReady(currentLocale.key);
		}
	}

	function _hasDataKey(key) {
		var hasData = typeof data[key] === 'object' && data[key] !== null;
		var secondary = locales[key].secondary;

		return hasData && (!secondary || secondary && _hasDataKey(secondary));
	}

	function warning(message) {
		console.warn(message);
	}

	function _error(message) {
		console.error(message);
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
			self.i18n = i18n;
		}
	} else {
		self.i18n = i18n;
	}
})();
