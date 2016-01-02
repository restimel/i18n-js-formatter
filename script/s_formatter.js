(function() {
	var i18n = 'i18n';

	function s_formatter(text, values, statusVariable) {
		var args = [text].concat(values);
		var count = -1;

		function getRules() {
			return statusVariable.currentLocale.formatRules;
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
			var splitValue, nb;

			nb = Number(value);

			splitValue = nb.toString().split('.');

			return {
				number: nb,
				integer: splitValue[0],
				decimal: splitValue[1]
			};
		}

		function prettyNumber(origValue, variation) {
			var status = getNumber(origValue, variation);
			var integer = status.integer;
			var rules = getRules().number;
			var thousandSeparator = rules.thousandSeparator;
			var decimalSeparator = rules.decimalSeparator;
			var value;

			value = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + thousandSeparator);

			if (status.decimal) {
				value = [value, decimalSeparator, status.decimal].join('');
			}

			return value;
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
					return Number(value);
				case 'd':
					return prettyNumber(value, variation);
				case 'D':
				case 'i':
				case 'e':
					return Number(value);
					break;
				case '%':
					return '%';
			}
		}

		text = text.replace(/%(\([^\)]+\))?(\{[^\}]*\})?([%dDefis])/g, replacement);
		return text;
	}

	if (_i18n_config && _i18n_config.doNotLoadFormatter) {
		self.s_formatter = s_formatter;
	} else {
		if (typeof _i18n_config === 'object' && _i18n_config.alias) {
			i18n = _i18n_config.alias;
		}

		self[i18n].loadFormatter(s_formatter, 100);
	}
})();
