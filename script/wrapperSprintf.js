(function() {
	var i18n = 'i18n';
	var has_i18n_config = typeof _i18n_config === 'object';

	function callSprintf(text, values, statusVariable) {
		var args = [text].concat(values);

		return sprintf.apply(this, args);
	}

	if ((!has_i18n_config && !self[i18n]) || (has_i18n_config && _i18n_config.doNotLoadFormatter)) {
		self.callSprintf = callSprintf;
	} else {
		if (has_i18n_config && _i18n_config.alias) {
			i18n = _i18n_config.alias;
		}

		self[i18n].loadFormatter(callSprintf, 100);
	}
})();
