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
	/* status variables */
	var locales = {};
	var localeKeys = [];
	var currentLocale;

	/* API methods */
	
	function i18n() {}

	i18n.configuration = function(options) {
		var locale;
		options || (options = {});

		if (options.locales instanceof Array) {
			options.locales.forEach(function(key) {
				locale = _createLocale(key, options.localeName[key]);
				key = locale.key;

				if (!locales[key]) {
					localeKeys.push(key);
				}
				locales[key] = locale;
			});
		}

		if (!currentLocale && localeKeys.length) {
			currentLocale = locales[localeKeys[0]];
		}
	};

	i18n.setLocale = function(key) {
		if (locales[key]) {
			currentLocale = locales[key];
		}
	};

	i18n.getLocale = function(options) {
		var result, lastResult, x, nb;
		options || (options = {key: true});

		if (!currentLocale) {
			return;
		}

		result = {};
		nb = 0;
		for (x in options) {
			if (options.hasOwnProperty(x) && options[x]) {
				lastResult = currentLocale[x];
				result[x] = lastResult;
				nb++;
			}
		}

		if (nb === 1) {
			result = lastResult;
		} else if (nb === 0) {
			result = currentLocale.key;
		}

		return result;
	};

	/* private methods */
	function _createLocale(key, name) {
		var dflt, locale;

		dflt = locales[key] || {};
		locale = {
			key: key,
			name: _default(name, dflt.name)
		};

		return locale;
	}

	function _default(value, dfltValue) {
		return typeof value === 'undefined' ? dfltValue : value;
	}

	/* providing the API */
	self.i18n = self.$$ = i18n;
})();
