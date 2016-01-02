(function() {
	var i18n = 'i18n';

	function s_formatter(text, values, statusVariable) {
		var args = [text].concat(values);
		var count = -1;

		function replacement(pattern, arg, code, kind) {
			var value;

			count++;

			if (!arg) {
				value = values[count];
			} else {
				console.log('TODO')
			}

			switch(kind) {
				case 's':
					return value.toString();
					break;
				case 'd':
					return +value;
					break;
				case '%':
					return '%';
			}
		}

		text = text.replace(/%(\([^\)]+\))?(\{[^\}]*\})?([%ds])/g, replacement);
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
