(function() {
	'use strict';
	var i18n = 'i18n';
	var has_i18n_config = typeof _i18n_config === 'object';

	var timeUnitScale = [
		31536000000, // y
		2592000000, // month
		86400000, // d
		3600000, // h
		60000, // min
		1000, // s
		1, // ms
		0.001 // µs
	];

	var isEscape = /^esc:/;

	var tagList = {};

	function s_formatter(text, values, statusVariable) {
		var count = -1;

		function noValue() {
			count--;
		}
		
		function replacement(pattern, arg, variation, tag) {
			var value, formatter;

			formatter = tagList[tag];

			if (typeof formatter !== 'function') {
				return pattern;
			}

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
			} else {
				variation = [];
			}

			return formatter.call(s_formatter.i18n, {
				tag: tag,
				variation: variation,
				value: value,
				formatRules: statusVariable.currentLocale.formatRules,
				defaultFormat: statusVariable.defaultFormat,
				locale: statusVariable.currentLocale.key,
				noValue: noValue
			});
		}

		text = text.replace(/%(\([^\)]+\))?(\{[^\}]*\})?(.)/g, replacement);
		return text;
	}

	function addRule(tags, callback) {
		if (typeof tags === 'string') {
			tags = tags.split('');
		}

		tags.forEach(function(tag) {
			tagList[tag] = callback;
		});
	}


	// generate several 0
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

	function getNumber(value, variation) {
		var splitValue, nb, inb, status;

		nb = value;
		if (typeof nb !== 'number') {
			inb = +nb;
			if (typeof nb !== 'string') {
				nb = inb;
			}

			if (typeof nb === 'string' && inb.toString() === nb || isNaN(inb)) {
				nb = inb;
			}
		}

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

	function prettyNumber(origValue, variation, isInteger, formatRules) {
		var status = getNumber(origValue, variation);
		var integer = status.integer;
		var rules = formatRules.number;
		var thousandSeparator = rules.thousandSeparator;
		var decimalSeparator = rules.decimalSeparator;
		var value;

		value = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + thousandSeparator);

		if (!isInteger && status.decimal) {
			value = [value, decimalSeparator, status.decimal].join('');
		}

		return value;
	}

	function shortNumber(origValue, variation, formatRules) {
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

		suffix = formatRules.number.SIsuffix;
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

		return prettyNumber(value, variation, false, formatRules) + suffix[i].suffix;
	}

	function expNumber(origValue, variation, formatRules) {
		var value, splitValue, status, expSep, result;

		value = Number(origValue).toExponential();
		splitValue = value.split('e');
		status = getNumber(splitValue[0], variation);

		if (!isFinite(status.number)) {
			return status.number;
		}

		expSep = formatRules.number.exponentialSeparator;

		result = [status.integer];

		if (status.decimal) {
			result.push('.', status.decimal);
		}
		result.push(expSep, splitValue[1]);

		return result.join('');
	}


	function escapeString(str, rule, defaultFormat) {
		if (typeof rule === 'undefined') {
			rule = defaultFormat.string.escape;
		}

		switch (rule) {
			case 'html':
			case 'htm':
				str = str.replace(/['"<>&]/g, function(p) {
					var code = {
						'<': '&lt;',
						'>': '&gt;',
						'"': '&quot;',
						'&': '&amp;',
						'\'': '&#39;'
						//manage \0 ?
					};
					return code[p];
				}); break;
			case 'uri':
			case 'url': str = encodeURI(str); break;
			case 'uri6': str = encodeURI(str).replace(/%5[BD]/g, function(p) {
				if (p === '%5B') {
					return '[';
				}
				if (p === '%5D') {
					return ']';
				}
			}); break;
			case 'uric':
			case 'urlc': str = encodeURIComponent(str); break;
			case 'regex':
			case 'regexp':
				str = str.replace(/[\\\n\r\t\v\b\f^$.()[\]{}?*+|\0]/g, function(p) {
					var code = {
						'\n': '\\n',
						'\r': '\\r',
						'\t': '\\t',
						'\v': '\\v',
						'\b': '\\b',
						'\f': '\\f',
						'\0': '\\0'
					};
					return code[p] || '\\' + p;
				}); break;
			case 'js':
			case 'json':
				str = str.replace(/["\\\n\r\t\v\b\f\0]/g, function(p) {
					var code = {
						'"': '\\"',
						'\\': '\\\\',
						'\n': '\\n',
						'\r': '\\r',
						'\t': '\\t',
						'\v': '\\u000b',
						'\b': '\\b',
						'\f': '\\f',
						'\0': '\\u0000'
					};
					return code[p];
				}); break;
			case 'no':
			case 'none':
			case 'raw': break;
			default:
				console.warn('escape rule %s unknwon', rule);
		}

		return str;
	}

	function toLowerCase(str, formatRules) {
		var rules = formatRules.string;

		if (!rules.upperChars) {
			return str.toLowerCase();
		} else {
			return str.replace(rules._upperChars, function(p) {
				var idx = rules.upperChars.indexOf(p);

				if (idx !== -1) {
					return rules.lowerChars.charAt(idx);
				} else {
					return p.toLowerCase();
				}
			});
		}
	}

	function toUpperCase(str, formatRules) {
		var rules = formatRules.string;

		if (!rules.lowerChars) {
			return str.toUpperCase();
		} else {
			return str.replace(rules._lowerChars, function(p) {
				var idx = rules.lowerChars.indexOf(p);

				if (idx !== -1) {
					return rules.upperChars.charAt(idx);
				} else {
					return p.toUpperCase();
				}
			});
		}
	}

	function getTimeUnitIndex(unit) {
		var index = {
			'y': 0,
			'month': 1,
			'M': 1,
			'd': 2,
			'h': 3,
			'min': 4,
			'm': 4,
			's': 5,
			'ms': 6,
			'i': 6,
			'µs': 7,
			'µ': 7
		}[unit];

		if (typeof index === 'undefined') {
			return -1;
		}
		return index;
	}

	function getTimestamp(value, variation) {
		var unit, code, index, multiplier;

		if (variation.length) {
			code = variation.filter(function(v) {
				return v.indexOf('u:') === 0;
			})[0];
		}

		if (code) {
			unit = code.substr(2);
		} else {
			unit = 'ms';
		}

		index = getTimeUnitIndex(unit);
		multiplier = timeUnitScale[index];
		if (!multiplier) {
			return value;
		}

		return value * multiplier;
	}

	function durationReplacement(params) {
		var microTs, timeUnit, durationScale, durationValue, dfltFormat, format, code;
		var origValue = params.value;
		var variation = params.variation;
		var formatRules = params.formatRules;
		var maxUnit = -1;
		var minUnit = Infinity;
		var limit = 0;

		timeUnit = formatRules.duration;
		durationScale = [
			['$y', 'y', true],
			['$M', 'month', true],
			['$d', 'd', true],
			['$h', 'h', true],
			['$m', 'min', true],
			['$s', 's', true],
			['$i', 'ms', true],
			['$µ', 'µs', true]
		];
		durationValue = [];
		dfltFormat = [];

		function activateUnit(str) {
			var codes = str.match(/\$./g) || [];

			durationScale.forEach(function(code) {
				code[2] = codes.indexOf(code[0]) !== -1;
			});
		}

		microTs = getTimestamp(origValue, variation) * 1000;

		if (variation.length) {
			/* output format */
			code = variation.filter(function(v) {
				return v.indexOf('f:"') === 0;
			})[0];
			if (code) {
				format = code.slice(3, -1);
				activateUnit(format);
			}

			/* output format inner$ */
			code = variation.filter(function(v) {
				return v.indexOf('f:$"') === 0;
			})[0];
			if (code) {
				format = code.slice(4, -1).replace(/([yMdhmsiµ$])/g, '$$$1');
				activateUnit(format);
			}

			/* min unit */
			code = variation.filter(function(v) {
				return v.indexOf('min:') === 0;
			})[0];
			if (code) {
				minUnit = getTimeUnitIndex(code.substr(4));
			}

			/* max unit */
			code = variation.filter(function(v) {
				return v.indexOf('max:') === 0;
			})[0];
			if (code) {
				maxUnit = getTimeUnitIndex(code.substr(4));
			}

			/* max number display value */
			code = variation.filter(function(v) {
				return v.indexOf('n:') === 0;
			})[0];
			if (code) {
				limit = parseInt(code.substr(2), 10);
				if (maxUnit >= 0 && maxUnit + limit > minUnit) {
					minUnit = maxUnit + limit -1;
					limit = 0;
				}
			}
		}

		/* compute best value for each unit */
		timeUnitScale.forEach(function(scale, index) {
			scale *= 1000; //To convert in µs
			var chunk = Math.floor(microTs / scale);
			var code = durationScale[index];


			if (!code[2] || index < maxUnit || index > minUnit) {
				durationValue.push(0);
				return;
			}
			if (chunk && limit) {
				minUnit = index + limit -1;
				limit = 0;
			}

			microTs -= chunk * scale;
			durationValue.push(chunk);

			if (chunk) {
				dfltFormat.push(code[0] + timeUnit[code[1]]);
			}
		});

		format = format ? format : dfltFormat.join(' ');

		format = format.replace(/\$([yMdhmsiµ$])/g, function(pattern, code) {
			var index = 'yMdhmsiµ'.indexOf(code);

			if (index === -1) {
				if (code === '$') {
					return code;
				} else {
					return pattern
				}
			}

			return prettyNumber(durationValue[index], [], true, formatRules);
		});

		return format;
	}

	function stringReplacement(params) {
		var escapeRule;
		var value = params.value;
		var variation = params.variation;
		var defaultFormat = params.defaultFormat;
		var formatRules = params.formatRules;

		if (typeof value === 'undefined') {
			value = 'undefined';
		} else {
			value = value.toString();
		}

		if (variation.length) {
			if (variation.indexOf('case') !== -1) {
				value = toLowerCase(value, formatRules);
			} else if (variation.indexOf('CASE') !== -1) {
				value = toUpperCase(value, formatRules);
			} else if (variation.indexOf('Case') !== -1) {
				value = toUpperCase(value.charAt(0), formatRules) + toLowerCase(value.slice(1), formatRules);
			} else if (variation.indexOf('CasE') !== -1) {
				value = toUpperCase(value.charAt(0), formatRules) + value.slice(1);
			}

			variation.forEach(function(v) {
				if (isEscape.test(v)) {
					escapeRule = v.slice(4);
				}
			});
		}

		return escapeString(value, escapeRule, defaultFormat);
	}

	function numberReplacement(params) {
		var value = params.value;
		var formatRules = params.formatRules;
		var variation = params.variation;

		switch (params.tag) {
			case 'F': 
				return rawNumber(value, variation);
			case 'f':
				return prettyNumber(value, variation, false, formatRules);
			case 'D':
				return shortNumber(value, variation, formatRules);
			case 'i':
				return prettyNumber(value, variation, true, formatRules);
			case 'd':
				return prettyNumber(value, variation, true, formatRules);
			case 'e':
				return expNumber(value, variation, formatRules);
			default:
				throw 'tag unknown'
		}
	}

	s_formatter.loaded = function(i18n) {
		s_formatter.i18n = i18n;

		i18n.addRule = addRule;
		i18n.addRule('s', stringReplacement);
		i18n.addRule('FfDide', numberReplacement);
		i18n.addRule('t', durationReplacement);
		i18n.addRule('%', function(params) {
			params.noValue();
			return '%';
		});
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
