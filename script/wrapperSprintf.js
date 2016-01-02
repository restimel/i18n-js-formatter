(function() {
	var i18n = 'i18n';

	function callSprintf(text, values, statusVariable) {
		var args = [text].concat(values);

		return sprintf.apply(this, args);
	}

	if (_i18n_config.doNotLoadFormatter) {
		self.callSprintf = callSprintf;
	} else {
		if (typeof _i18n_config === 'object' && _i18n_config.alias) {
			i18n = _i18n_config.alias;
		}

		self[i18n].loadFormatter(callSprintf, 100);
	}
})();
