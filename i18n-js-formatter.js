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
	var locales, localeKeys,
		defaultKeyLocale, currentLocale, useDfltLocale;
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
	 */
	i18n.configuration = function(options) {
		options || (options = {});

		if (options.locales instanceof Array) {
			_configureLocales(options);
		} else
		if (typeof options.localeName === 'object') {
			_configurelocaleNames(options);
		}

		if (typeof options.alias === 'string') {
			self[options.alias] = i18n;
		}

		if (typeof options.defaultLocale !== 'undefined') {
			defaultKeyLocale = options.defaultLocale;
		}

		if (useDfltLocale && localeKeys.length) {
			currentLocale = locales[_getDefaultKey()];
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

		if (useDflt) {
			key = _getDefaultKey();
		} else {
			key = _formatLocaleKey(key);
		}

		if (key === currentLocale.key) {
			key = false;
			useDfltLocale = useDflt;
		} else
		if (!locales[key]) {
			key = false;
		} else {
			currentLocale = locales[key];
			useDfltLocale = useDflt;
		}

		return key;
	};

	/**
	 * Retrieve the current locale
	 *
	 * @param [options.key] {Boolean} if true, the locale's key will be return
	 * @param [options.name] {Boolean} if true, the locale's name will be return
	 * @return [String|Object] If only one option is given, it return the value of this option
	 *						   If several options are given, it return an object with the key/value of wanted options.
	 */
	i18n.getLocale = function(options) {
		return _getLocale(currentLocale, options);
	};

	/**
	 * Retrieve the informations of all locales
	 *
	 * @param [options.key] {Boolean} if true, the locales' key will be return
	 * @param [options.name] {Boolean} if true, the locales' name will be return
	 * @return [String[]|Object[]] If only one option is given, it return the value list of this option
	 *							   If several options are given, it return a list of object with the key/value of wanted options.
	 */
	i18n.getLocales = function(options) {
		return localeKeys.map(function(key) {
			return _getLocale(locales[key], options);
		});
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
		currentLocale = undefined;
		useDfltLocale = true;
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

	function _getLocale(locale, options) {
		var result, lastResult, x, nb;
		options || (options = {key: true});

		if (!locale) {
			return;
		}

		result = {};
		nb = 0;
		_each(options, function(value, attribute) {
			if (value) {
				lastResult = locale[attribute];
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
		var key;

		if (typeof defaultKeyLocale === 'string') {
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

	function _formatLocaleKey(key) {
		key = _default(key, '');
		key = key.toLowerCase();

		while (!locales[key] && key) {
			key = key.replace(/(?:^|-)[^-]*$/, '');
		}

		return key;
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
