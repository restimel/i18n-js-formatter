(function() {
	'use strict';
	var i18n = 'i18n';
	var has_i18n_config = typeof _i18n_config === 'object';

	function s_formatter(text, values, statusVariable) {
		var args = [text].concat(values);
		var count = -1;

		function getRules() {
			return statusVariable.currentLocale.formatRules;
		}

		function buildX0(nb) {
			var result = [];
			nb = +nb;

			if (!nb) {
				return '';
			}

			while (result.length < nb) {
				result.push('0');
			}

			return result.join('');
		}

		function stringReplacement(value, variation) {
			if (typeof value === 'undefined') {
				value = 'undefined';
			} else {
				value = value.toString();
			}

			if (variation) {
				if (variation.indexOf('case') !== -1) {
					value = value.toLowerCase();
				} else if (variation.indexOf('CASE') !== -1) {
					value = value.toUpperCase();
				} else if (variation.indexOf('Case') !== -1) {
					value = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
				} else if (variation.indexOf('CasE') !== -1) {
					value = value.charAt(0).toUpperCase() + value.slice(1);
				}
			}

			return value;
		}

		function getNumber(value, variation) {
			var splitValue, nb, status;

			nb = Number(value);

			splitValue = nb.toString().split('.');

			status = {
				number: nb,
				integer: splitValue[0],
				decimal: splitValue[1]
			};

			if (variation) {
				variation.forEach(function(code) {
					var nb = parseInt(code.slice(1), 10);

					if (isNaN(nb)) {
						return;
					}

					switch(code.charAt(0)) {
						case '.':
							if (status.decimal && (status.decimal.length > nb || status.decimal.charAt(status.decimal.length-1) === '0')) {
								status.decimal = (Math.round(('0.'+status.decimal) * Math.pow(10, nb)) / Math.pow(10, nb)).toString().slice(2);
							}
							break;
						case 'p':
							if (status.integer.length < nb) {
								status.integer = buildX0(nb - status.integer.length) + status.integer;
							}
							break;
						case 'd':
							if (!status.decimal) {
								status.decimal = '';
							}
							if (status.decimal.length < nb) {
								status.decimal += buildX0(nb - status.decimal.length);
							}
							break;
					}
				});
			}

			return status;
		}

		function rawNumber(origValue, variation) {
			var status = getNumber(origValue, variation);
			var result = [status.integer];

			if (status.decimal) {
				result.push('.', status.decimal);
			}

			return result.join('');
		}

		function prettyNumber(origValue, variation, isInteger) {
			var status = getNumber(origValue, variation);
			var integer = status.integer;
			var rules = getRules().number;
			var thousandSeparator = rules.thousandSeparator;
			var decimalSeparator = rules.decimalSeparator;
			var value;

			value = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + thousandSeparator);

			if (!isInteger && status.decimal) {
				value = [value, decimalSeparator, status.decimal].join('');
			}

			return value;
		}

		function shortNumber(origValue, variation) {
			var value, computeValue, i, sign, suffix;

			origValue = Number(origValue);
			sign = origValue < 0;
			computeValue = Math.abs(origValue);

			if (!isFinite(computeValue)) {
				return computeValue;
			}

			/* default number of rounded decimal is 3 */
			if (!variation) {
				variation = ['.3'];
			} else if (variation.every(function(v) {
				return v.indexOf('.') !== 0
			})) {
				variation.unshift('.3');
			}

			/* special case: 0 should be display like single digit (as 1) */
			if (origValue === 0) {
				computeValue = 1;
			}

			suffix = getRules().number.SIsuffix;
			i = 0;
			do {
				value = computeValue / suffix[i].multiple;
			} while(++i < suffix.length && value < 1);
			i--;

			if (origValue === 0) {
				value = 0;
			}

			if (sign) {
				value = -value;
			}

			return prettyNumber(value, variation) + suffix[i].suffix;
		}

		function expNumber(origValue, variation) {
			var value, splitValue, status, expSep, result;

			value = Number(origValue).toExponential();
			splitValue = value.split('e');
			status = getNumber(splitValue[0], variation);

			if (!isFinite(status.number)) {
				return status.number;
			}

			expSep = getRules().number.exponentialSeparator;

			result = [status.integer];

			if (status.decimal) {
				result.push('.', status.decimal);
			}
			result.push(expSep, splitValue[1]);

			return result.join('');
		}

		function replacement(pattern, arg, variation, kind) {
			var value;

			count++;

			if (!arg) {
				value = values[count];
			} else {
				arg = arg.slice(1, -1);
				if (/\d+/.test(arg)) {
					value = values[parseInt(arg, 10) - 1];
				} else {
					arg = arg.split('.');
					value = arg.reduce(function(obj, property) {
						if (typeof obj !== 'undefined') {
							obj = obj[property];
						}

						return obj;
					}, values[0]);
				}
			}

			if (variation) {
				variation = variation.slice(1, -1).split(',').map(function(v) {
					return v.trim();
				});
			}

			switch(kind) {
				case 's':
					return stringReplacement(value, variation);
				case 'f':
					return rawNumber(value, variation);
				case 'd':
					return prettyNumber(value, variation);
				case 'D':
					return shortNumber(value, variation);
				case 'i':
					return prettyNumber(value, variation, true);
				case 'e':
					return expNumber(value, variation);
				case '%':
					return '%';
			}
		}

		text = text.replace(/%(\([^\)]+\))?(\{[^\}]*\})?([%dDefis])/g, replacement);
		return text;
	}

	if ((!has_i18n_config && !self[i18n]) || (has_i18n_config && _i18n_config.doNotLoadFormatter)) {
		self.s_formatter = s_formatter;
	} else {
		if (has_i18n_config && _i18n_config.alias) {
			i18n = _i18n_config.alias;
		}

		self[i18n].loadFormatter(s_formatter, 100);
	}
})();
