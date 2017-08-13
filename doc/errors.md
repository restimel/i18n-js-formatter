# Handling errors

* [Managing Errors](#managing-errors)
* [Codes](#codes)

[Back to menu](index.md) | [Back to main page](../README.md)


## Managing Errors

The API give several feed back when issues occurs. There are splitted in 3 kinds: info, warning and error.

By default, the message is displayed in the console with given level (info, warn, error). If a listener is set for this level, nothing is done (if you want to display the message in console, the listening function must do it).

It is possible to listen on these messages with "log".

	i18n.configuration({
		log: {
			info: function(code, message, details) {},
			warn: function(code, message, details) {},
			error: function(code, message, details) {}
		}
	});

Arguments are:
* **code** {Number}:. The goal of this "code" is to handle issues in a easy way.
* **message** {String}: information message to express the issue. The message is in English.
* **details** {Array}: some details depending of the issue. 


## Codes

Here are code details:
* 0 → 999: reserved for future usage
* 1000 → 3999: info
* 4000 → 6999: warning
	* 4030: The secondary fallback of "%s" cannot be set to "%s" because it is out of locales scope. This setting has been ignored. (details: [locale key, the secondary given])
	* 4031: The secondary fallback of "%s" cannot be of type "%s". It must be a string or false. This setting has been ignored. (details: [locale key, typeof secondary given])
	* 4050: The configuration option %s is badly set because there is no valid key defined. This setting has been ignored. (details: [option name])
	* 4100: The sentence "%s" is not translated for language "%s". (details: [sentence without translation, current locale])
	* 4101: It is not possible to translate object (%s) to language "%s". (details: [object stringified, current locale, the object])
	* 4200: 'Formatter "%s" has thrown an issue: %s' (details: [formatter name, detail thrown by formatter])
* 7000 → 9999: error
	* 7010: dictionary is in a wrong format (%s): %s (details: [type of dictionary, the value received]) called if not possible to load dictionary.
	* 7011: item is in a wrong format (%s while object is expected): %s (details: [type of dictionary, the value received])
	* 7012: data is in a wrong format (%s): %s (details: [type of data, the value received]) called if not possible to load data.
	* 7013: data with key "%s" is in a wrong format (%s): %s (details: [locale key, type of data, the value received])
	* 7014: data for key "%s" can not be loaded due to wrong format (%s while object is expected): %s (details: [locale key, type of data, the value received])
	* 7015: item "%s" for locale "%s" is %s instead of string: %s (details: [sentence, locale key, type of value, the value received])
	* 7020: data received from "%s" is not in a valid JSON ("%s") (details: [the url sent, the response])
	* 7100: Translation is not possible due to an unsupported type (%s): %s (details: [typeof given argument, the argument])
	* 7200: Formatter %s can not be added because it is not a function. (details: [formatter name])
	* 7300: Browser does not support feature "%s". (details: [name of the unsupported feature])
	* 8400 → 8599: http request issue (details: [the url sent]). It uses the http code prefixed by '2'


[Back to menu](index.md) | [Back to main page](../README.md)