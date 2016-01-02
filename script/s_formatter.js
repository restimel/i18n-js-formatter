(function() {
	var i18n = 'i18n';

	function s_formatter(text, values, statusVariable) {
		var args = [text].concat(values);
		var count = -1;

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
				case 'd':
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
