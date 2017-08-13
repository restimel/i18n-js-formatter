# Download, Installation and Configuration

* [Configuration](#configuration)
  * [Options](#list-of-configuration-options)

[Back to menu](index.md) | [Back to main page](../README.md)


## Configuration

There are 2 ways to configure the library.

The first way is to define an object with wanted options (cf below) in variable _i18n_config before running the i18n-js-formatter script.
For some options, this is the only way to set them.

The second possibility is to use the configuration method available in the library API (cf section bellow).

### list of configuration options

* **doNotAliasi18n**: {Boolean} if true it does not create a variable i18n in the global context.
			This is to avoid variable conflicts with other library.
			This option is only available with _i18_config configuration (at start).
			/!\ if you use this variable you must also use 'alias' to bind the API to a variable.
* **doNotLoadFormatter**: {Boolean} if true wrappers does not load formatter.
			The formatter have to be load later. This allow to load them with different configuration.
			This option is only available with _i18_config configuration (at start).
* **alias**:	{String} allow to save the function to another global variable.
			example: i18n.configuration({alias: '$$'}); // now you can use the variable $$ to access the API
* **locales**:	{String[]} list of locale keys.
			example: i18n.configuration({locale: ['en', 'fr']}; // handle only english and french
* **localeName**: {String{}} give a pretty name to locale.
			example: i18n.configuration({localeName: {en: 'English', fr: 'Français'}});
* **defaultLocale**: {String} the default local value (if no one are selected from storage). If the value is not a string the default value is the best from navigator.languages
* **secondary**: {String{}} set a fallback to another locale if the sentence is not translated in the current locale
* **storage**:	{String|String[]} the ways to store the current locale on browser. If the value is an array, it uses the first accessible technology.
				Possible values are (%s must be replaced by wanted name for storage):
	* *cookie:%s*: to store the locale in cookie
	* *localStorage:%s*: to store the locale in localstorage
	* *none*: to not store the locale in browser.
* **onLocaleReady**: {Function} called each time the data for the current locale are ready to use. Arguments are:
	* *key*: {String} the locale key which is ready.
* **log**: {Object} to be notify when issues occurs. If not defined a message to console is sent.
	* *info*: {Function} a function called when an info has to be prompted.
	* *warn*: {Function} a function called when a warning issue has to be prompted (sentence where translation is missing).
	* *error*: {Function} a function called when an error has to be prompted (wrong configuration).
* **dictionary**: 	{Object|String|Function} load data in "dictionary" format (cf section Load Data vs Load Dictionary).
					If the value is an object it is loaded as it is
					If the value is a string, it should be an url to load data.
					If the value is a function. This function will be called when data must be (re)loaded.
* **data**: 		{Object|String|Function} load data in "data" format (cf section Load Data vs Load Dictionary).
					If the value is an object it is loaded as it is
					If the value is a string, it should be an url to load data.
					If the value is a function. This function will be called when data must be (re)loaded.
* **lazyLoading**:	{Boolean} If true, load json file only when locale is changed (it works only with data loading and not with dictionary loading).
					[Default value: true]
* **syncLoading**:	{Boolean} If true, the json file loading is done synchronously.
* **defaultFormat**: {Object} rules which are applied by default (these rules are not dependent of locale).
	* **string**: {Object} rules for displaying strings. Attributes are **escape** (see formatter section for more details)
* **formatRules**: {Object} rules for some output format depending of locales.
					For each locale keys, an object contains the rules.
	* **number**: {Object} rules for displaying numbers. Attributes are **thousandSeparator**, **decimalSeparator**, **exponentialSeparator**, **SIsuffix** (see formatter section for more details)
	* **string**: {Object} rules for displaying string. Attributes are **lowerChars**, **upperChars** (see formatter section for more details)
* **localeSet**:	{Object} define all options at one for defined locales. It replaces locales defined with options "locales".
	* *key*:	{String} [Required] the locale to define.
	* *name*:	{String} the locale pretty name.
	* *data*:	{Object|String|Function} the data of the locale.
	* *secondary*: {String} the secondary locale to use if the sentence is not translated in the current locale


[Back to menu](index.md) | [Back to main page](../README.md)