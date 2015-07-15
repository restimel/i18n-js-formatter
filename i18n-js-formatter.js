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
	var locales = {};
	var localeKeys = [];
	var currentLocale;

	/* API methods */
	
	function i18n() {}

	i18n.configuration = function(options) {
		options || (options = {});

		if (options.locales instanceof Array) {
			_configureLocales(options);
		} else
		if (typeof options.localeName === 'object') {
			_configurelocaleNames(options);
		}

		if (!currentLocale && localeKeys.length) {
			currentLocale = locales[localeKeys[0]];
		}
	};

	i18n.setLocale = function(key) {
		key = _formatLocaleKey(key);

		if (key !== currentLocale.key && locales[key]) {
			currentLocale = locales[key];
		} else {
			key = false;
		}

		return key;
	};

	i18n.getLocale = function(options) {
		return _getLocale(currentLocale, options);
	};

	i18n.getLocales = function(options) {
		return localeKeys.map(function(key) {
			return _getLocale(locales[key], options);
		});
	};

	/*
	 * private functions
	 */

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
	self.i18n = self.$$ = i18n;
})();
