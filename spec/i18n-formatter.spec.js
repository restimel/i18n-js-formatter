describe('i18n-formatter', function() {
	'use strict';

	beforeEach(function() {
		this.logInfo = jasmine.createSpy('logInfo');
		this.logWarn = jasmine.createSpy('logWarn');
		this.logError = jasmine.createSpy('logError');

		$$.configuration({
			locales: ['en', 'fr', 'fr-be'],
			dictionary: {
				'Hello %s!': {
					en: 'Hello %s!',
					fr: 'Salut %s !'
				},
				'%d cats': {
					en: '%d cats',
					fr: '%d chats'
				},
				'%D cats': {
					en: '%D cats',
					fr: '%D chats'
				},
				'%f cats': {
					en: '%f cats',
					fr: '%f chats'
				},
				'%F cats': {
					en: '%F cats',
					fr: '%F chats'
				},
				'%i cats': {
					en: '%i cats',
					fr: '%i chats'
				},
				'%e cats': {
					en: '%e cats',
					fr: '%e chats'
				},
				'%d issues: %s': {
					en: '%d issues: %s',
					fr: '%d problèmes : %s'
				}
			},
			secondary: {
				'fr-be': 'fr'
			},
			log: {
				info: this.logInfo,
				warn: this.logWarn,
				error: this.logError
			},
			formatRules: {
				fr: {
					number: {
						thousandSeparator: ' ',
						decimalSeparator: ',',
						exponentialSeparator: ' 10^'
					},
					duration: {
						µs: 'µs',
						ms: 'ms',
						s: 's',
						min: 'min',
						h: 'h',
						d: 'j',
						month: 'M',
						y: 'an'
					}
				},
				'fr-be': {
					number: {
						thousandSeparator: ' ',
						decimalSeparator: ','
					},
					duration: {
						d: 'j',
						y: 'a'
					}
				}
			},
			defaultLocale: 'en'
		});

		$$.setLocale('en');
	});

	afterEach(function() {
		$$.clearData();
		$$._reset();
	});

	if (typeof sprintf !== 'undefined') {
		describe('use formatter sprintf', function() {
			beforeEach(function() {
				$$.loadFormatter({formatter: callSprintf, weight: 100, name: 'sprintf'});
			});

			it('should replace the %s wildcard', function() {
				expect($$('Hello %s!', 'Restimel')).toBe('Hello Restimel!');
				$$.setLocale('fr');
				expect($$('Hello %s!', 'Restimel')).toBe('Salut Restimel !');
				$$.setLocale('fr-be');
				expect($$('Hello %s!', 'Restimel')).toBe('Salut Restimel !');

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logWarn).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});

			it('should convert to string with %s wildcard', function() {
				var obj;

				$$.setLocale('en');

				obj = {};
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');

				obj = 42;
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');

				obj = true;
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logWarn).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});

			it('should replace numeric wildcard', function() {
				expect($$('%d cats', 42)).toBe('42 cats');
				expect($$('%d cats', 42.76)).toBe('42 cats');
				expect($$('%f cats', 42.76)).toBe('42.76 cats');
				$$.setLocale('fr');
				expect($$('%d cats', 42)).toBe('42 chats');
				expect($$('%f cats', 42.76)).toBe('42.76 chats');

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logWarn).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});

			it('should replace several wildcards', function() {
				expect($$('%d issues: %s', 2, 'bug1, bug2')).toBe('2 issues: bug1, bug2');

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logWarn).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});

			it('should not replace unknown wildcards', function() {
				expect($$.parse('%D %S %W', 42)).toBe('%D %S %W');

				expect(this.logWarn).toHaveBeenCalledWith(4200, jasmine.any(String), ['sprintf', jasmine.any(String)]);

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});
		});
	}

	describe('use i18n-formatter', function() {
		beforeEach(function() {
			$$.loadFormatter({formatter: s_formatter, weight: 100, name: 's_formatter'});
		});

		it('should identify correct argument', function() {
			expect($$.parse('%s', 'foo1', 'foo2')).toBe('foo1');
			expect($$.parse('%(1)s', 'bar1', 'bar2')).toBe('bar1');
			expect($$.parse('%(2)s', 'foo1', 'foo2')).toBe('foo2');
			expect($$.parse('%(1)s %(2)s %(1)s', 'foo1', 'foo2')).toBe('foo1 foo2 foo1');

			expect($$.parse('%(foo)s %(bar)s', {
				foo: 'obj1',
				bar: 'obj2'
			})).toBe('obj1 obj2');

			expect($$.parse('%(foo.bar)s', {
				foo: {
					foo: 'obj.foo1',
					bar: 'obj.foo2'
				},
				bar: 'obj3'
			})).toBe('obj.foo2');
		});

		describe('string formatting', function() {
			it('should replace the %s wildcard', function() {
				$$.setLocale('en');
				expect($$('Hello %s!', 'Restimel')).toBe('Hello Restimel!');
				$$.setLocale('fr');
				expect($$('Hello %s!', 'Restimel')).toBe('Salut Restimel !');
				$$.setLocale('fr-be');
				expect($$('Hello %s!', 'Restimel')).toBe('Salut Restimel !');
			});

			it('should convert to string with %s wildcard', function() {
				var obj;

				$$.setLocale('en');

				obj = {};
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');

				obj = 42;
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');

				obj = function() {};
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');

				obj = true;
				expect($$('Hello %s!', obj)).toBe('Hello ' + obj.toString() + '!');
			});

			it('should change the case', function() {
				expect($$.parse('%{case}s', 'some Strings')).toBe('some strings');
				expect($$.parse('%{CASE}s', 'some Strings')).toBe('SOME STRINGS');
				expect($$.parse('%{Case}s', 'some Strings')).toBe('Some strings');
				expect($$.parse('%{CasE}s', 'some Strings')).toBe('Some Strings');
			});

			it('should escape strings', function() {
				var str = 'aBc ^"-_.!|~*\'()[]{}<>;,/?:@&=+$#\r\n\t\v\b\\n←→€';

				expect($$.parse('noEscape_%s', str)).toBe('noEscape_aBc ^"-_.!|~*\'()[]{}<>;,/?:@&=+$#\r\n\t\v\b\\n←→€');
				expect($$.parse('html_%{esc:html}s', str)).toBe('html_aBc ^&quot;-_.!|~*&#39;()[]{}&lt;&gt;;,/?:@&amp;=+$#\r\n\t\v\b\\n←→€');
				expect($$.parse('js_%{esc:js}s', str)).toBe('js_aBc ^\\"-_.!|~*\'()[]{}<>;,/?:@&=+$#\\r\\n\\t\\u000b\\b\\\\n←→€');
				expect($$.parse('json_%{esc:json}s', str)).toBe('json_aBc ^\\"-_.!|~*\'()[]{}<>;,/?:@&=+$#\\r\\n\\t\\u000b\\b\\\\n←→€');
				expect($$.parse('regex_%{esc:regex}s', str)).toBe('regex_aBc \\^"-_\\.!\\|~\\*\'\\(\\)\\[\\]\\{\\}<>;,/\\?:@&=\\+\\$#\\r\\n\\t\\v\\b\\\\n←→€');
				expect($$.parse('url_%{esc:url}s', str)).toBe('url_aBc%20%5E%22-_.!%7C~*\'()%5B%5D%7B%7D%3C%3E;,/?:@&=+$#%0D%0A%09%0B%08%5Cn%E2%86%90%E2%86%92%E2%82%AC');
				expect($$.parse('uri_%{esc:uri}s', str)).toBe('uri_aBc%20%5E%22-_.!%7C~*\'()%5B%5D%7B%7D%3C%3E;,/?:@&=+$#%0D%0A%09%0B%08%5Cn%E2%86%90%E2%86%92%E2%82%AC');
				expect($$.parse('uri6_%{esc:uri6}s', str)).toBe('uri6_aBc%20%5E%22-_.!%7C~*\'()[]%7B%7D%3C%3E;,/?:@&=+$#%0D%0A%09%0B%08%5Cn%E2%86%90%E2%86%92%E2%82%AC');
				expect($$.parse('urlc_%{esc:urlc}s', str)).toBe('urlc_aBc%20%5E%22-_.!%7C~*\'()%5B%5D%7B%7D%3C%3E%3B%2C%2F%3F%3A%40%26%3D%2B%24%23%0D%0A%09%0B%08%5Cn%E2%86%90%E2%86%92%E2%82%AC');
				expect($$.parse('uric_%{esc:uric}s', str)).toBe('uric_aBc%20%5E%22-_.!%7C~*\'()%5B%5D%7B%7D%3C%3E%3B%2C%2F%3F%3A%40%26%3D%2B%24%23%0D%0A%09%0B%08%5Cn%E2%86%90%E2%86%92%E2%82%AC');
				expect($$.parse('no_%{esc:no}s', str)).toBe('no_aBc ^"-_.!|~*\'()[]{}<>;,/?:@&=+$#\r\n\t\v\b\\n←→€');

				$$.configuration({
					defaultFormat: {
						string: {
							escape: 'html'
						}
					}
				});

				expect($$.parse('HTML_%s', str)).toBe('HTML_aBc ^&quot;-_.!|~*&#39;()[]{}&lt;&gt;;,/?:@&amp;=+$#\r\n\t\v\b\\n←→€');
				expect($$.parse('HTMLhtml_%{esc:html}s', str)).toBe('HTMLhtml_aBc ^&quot;-_.!|~*&#39;()[]{}&lt;&gt;;,/?:@&amp;=+$#\r\n\t\v\b\\n←→€');
				expect($$.parse('HTMLjs_%{esc:js}s', str)).toBe('HTMLjs_aBc ^\\"-_.!|~*\'()[]{}<>;,/?:@&=+$#\\r\\n\\t\\u000b\\b\\\\n←→€');
				expect($$.parse('HTMLno_%{esc:no}s', str)).toBe('HTMLno_aBc ^"-_.!|~*\'()[]{}<>;,/?:@&=+$#\r\n\t\v\b\\n←→€');
			});
		});

		describe('number formatting', function() {
			it('should replace the %F wildcard', function() {
				expect($$('%F cats', 42)).toBe('42 cats');
				expect($$('%F cats', 42.76)).toBe('42.76 cats');
				expect($$('%F cats', 1234.5)).toBe('1234.5 cats');
				$$.setLocale('fr');
				expect($$('%F cats', 42)).toBe('42 chats');
				expect($$('%F cats', 42.76)).toBe('42.76 chats');
				expect($$('%F cats', 1234.5)).toBe('1234.5 chats');
				$$.setLocale('fr-be');
				expect($$('%F cats', 42)).toBe('42 chats');
				expect($$('%F cats', 42.76)).toBe('42.76 chats');
				expect($$('%F cats', 1234.5)).toBe('1234.5 chats');
			});

			it('should replace the %f wildcard', function() {
				expect($$('%f cats', 42)).toBe('42 cats');
				expect($$('%f cats', 42.76)).toBe('42.76 cats');
				expect($$('%f cats', 1234.5)).toBe('1,234.5 cats');
				$$.setLocale('fr');
				expect($$('%f cats', 42)).toBe('42 chats');
				expect($$('%f cats', 42.76)).toBe('42,76 chats');
				expect($$('%f cats', 1234.5)).toBe('1 234,5 chats');
				$$.setLocale('fr-be');
				expect($$('%f cats', 42)).toBe('42 chats');
				expect($$('%f cats', 42.76)).toBe('42,76 chats');
				expect($$('%f cats', 1234.5)).toBe('1 234,5 chats');

				expect($$('%f', 0)).toBe('0');
				expect($$('%f', 123456)).toBe('123 456');
				expect($$('%f', -123456)).toBe('-123 456');
				expect($$('%f', -12345)).toBe('-12 345');
			});

			it('should replace the %D wildcard', function() {
				expect($$('%D cats', 42)).toBe('42 cats');
				expect($$('%D cats', 42.76)).toBe('42.76 cats');
				expect($$('%D cats', 1234.5)).toBe('1.235k cats');

				expect($$('%D cats', 0.0000000000000042)).toBe('4.2f cats');
				expect($$('%D cats', 0.0000000000042)).toBe('4.2p cats');
				expect($$('%D cats', 0.0000000042)).toBe('4.2n cats');
				expect($$('%D cats', 0.0000042)).toBe('4.2µ cats');
				expect($$('%D cats', 0.0042)).toBe('4.2m cats');
				expect($$('%D cats', 4.2)).toBe('4.2 cats');
				expect($$('%D cats', 4200)).toBe('4.2k cats');
				expect($$('%D cats', 4200000)).toBe('4.2M cats');
				expect($$('%D cats', 4200000000)).toBe('4.2G cats');
				expect($$('%D cats', 4200000000000)).toBe('4.2T cats');
				expect($$('%D cats', 4200000000000000)).toBe('4.2P cats');
				expect($$('%D cats', 4200000000000000000)).toBe('4,200P cats');

				$$.setLocale('fr');
				expect($$('%D cats', 42)).toBe('42 chats');
				expect($$('%D cats', 42.76)).toBe('42,76 chats');
				expect($$('%D cats', 1234.5)).toBe('1,235k chats');
				$$.setLocale('fr-be');
				expect($$('%D cats', 42)).toBe('42 chats');
				expect($$('%D cats', 42.76)).toBe('42,76 chats');
				expect($$('%D cats', 1234.5)).toBe('1,235k chats');

				expect($$.parse('%D', 0)).toBe('0');
				expect($$.parse('%D', NaN)).toBe('NaN');
				expect($$.parse('%D', Infinity)).toBe('Infinity');

				expect($$.parse('%D', -4200000)).toBe('-4,2M');
				expect($$.parse('%D', -0.000042)).toBe('-42µ');
				expect($$.parse('%D', -123456789001)).toBe('-123,457G');
			});

			it('should replace the %i wildcard', function() {
				expect($$('%i cats', 42)).toBe('42 cats');
				expect($$('%i cats', 42.76)).toBe('42 cats');
				expect($$('%i cats', 1234.5)).toBe('1,234 cats');
				$$.setLocale('fr');
				expect($$('%i cats', 42)).toBe('42 chats');
				expect($$('%i cats', 42.76)).toBe('42 chats');
				expect($$('%i cats', 1234.5)).toBe('1 234 chats');
				$$.setLocale('fr-be');
				expect($$('%i cats', 42)).toBe('42 chats');
				expect($$('%i cats', 42.76)).toBe('42 chats');
				expect($$('%i cats', 1234.5)).toBe('1 234 chats');
			});

			it('should replace the %d wildcard', function() {
				expect($$('%d cats', 42)).toBe('42 cats');
				expect($$('%d cats', 42.76)).toBe('42 cats');
				expect($$('%d cats', 1234.5)).toBe('1,234 cats');
				$$.setLocale('fr');
				expect($$('%d cats', 42)).toBe('42 chats');
				expect($$('%d cats', 42.76)).toBe('42 chats');
				expect($$('%d cats', 1234.5)).toBe('1 234 chats');
				$$.setLocale('fr-be');
				expect($$('%d cats', 42)).toBe('42 chats');
				expect($$('%d cats', 42.76)).toBe('42 chats');
				expect($$('%d cats', 1234.5)).toBe('1 234 chats');
			});

			it('should replace the %e wildcard', function() {
				expect($$('%e cats', 4.2)).toBe('4.2e+0 cats');
				expect($$('%e cats', 42.76)).toBe('4.276e+1 cats');
				expect($$('%e cats', 1234.5)).toBe('1.2345e+3 cats');
				expect($$('%e cats', 0.01234)).toBe('1.234e-2 cats');
				$$.setLocale('fr');
				expect($$('%e cats', 4.2)).toBe('4.2 10^+0 chats');
				expect($$('%e cats', 42.76)).toBe('4.276 10^+1 chats');
				expect($$('%e cats', 1234.5)).toBe('1.2345 10^+3 chats');
				expect($$('%e cats', 0.01234)).toBe('1.234 10^-2 chats');
				$$.setLocale('fr-be');
				expect($$('%e cats', 4.2)).toBe('4.2e+0 chats');
				expect($$('%e cats', 42.76)).toBe('4.276e+1 chats');
				expect($$('%e cats', 1234.5)).toBe('1.2345e+3 chats');
				expect($$('%e cats', 0.01234)).toBe('1.234e-2 chats');

				expect($$.parse('%e', 40)).toBe('4e+1');
			});

			it('should convert to number the number wildcards', function() {
				var obj;

				obj = {};
				expect($$('%F cats', obj)).toBe((+obj) + ' cats');
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');

				obj = "42";
				expect($$('%F cats', obj)).toBe((+obj) + ' cats');
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');

				obj = function() {};
				expect($$('%F cats', obj)).toBe((+obj) + ' cats');
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');

				obj = true;
				expect($$('%F cats', obj)).toBe((+obj) + ' cats');
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');
			});

			it('should support huge number', function() {
				var value, result;

				value = '123456789123456789';
				expect($$.parse('%F', value)).toBe('123456789123456789');
				expect($$.parse('%f', value)).toBe('123,456,789,123,456,789');
				expect($$.parse('%D', value)).toBe('123.457P');
				expect($$.parse('%i', value)).toBe('123,456,789,123,456,789');
				expect($$.parse('%e', value)).toBe('1.2345678912345678e+17');

				value = '-123456789123456789';
				expect($$.parse('%F', value)).toBe('-123456789123456789');
				expect($$.parse('%f', value)).toBe('-123,456,789,123,456,789');
				expect($$.parse('%D', value)).toBe('-123.457P');
				expect($$.parse('%i', value)).toBe('-123,456,789,123,456,789');
				expect($$.parse('%e', value)).toBe('-1.2345678912345678e+17');
			});

			it('should round decimal part with .N', function() {
				var value;

				value = 2.456;
				expect($$.parse('%{.1}F', value)).toBe('2.5');
				expect($$.parse('%{.1}f', value)).toBe('2.5');
				expect($$.parse('%{.1}D', value)).toBe('2.5');
				expect($$.parse('%{.1}i', value)).toBe('2');
				expect($$.parse('%{.1}e', value)).toBe('2.5e+0');

				value = 2.4;
				expect($$.parse('%{.2}F', value)).toBe('2.4');
				expect($$.parse('%{.2}f', value)).toBe('2.4');
				expect($$.parse('%{.2}D', value)).toBe('2.4');
				expect($$.parse('%{.2}i', value)).toBe('2');
				expect($$.parse('%{.2}e', value)).toBe('2.4e+0');

				value = 2456;
				expect($$.parse('%{.1}D', value)).toBe('2.5k');

				value = 2400;
				expect($$.parse('%{.2}D', value)).toBe('2.4k');

				value = 2456789;
				expect($$.parse('%{.4}D', value)).toBe('2.4568M');
			});

			it('should change decimal part with dN', function() {
				var value;

				value = 2.456;
				expect($$.parse('%{d1}F', value)).toBe('2.456');
				expect($$.parse('%{d1}f', value)).toBe('2.456');
				expect($$.parse('%{d1}D', value)).toBe('2.456');
				expect($$.parse('%{d1}i', value)).toBe('2');
				expect($$.parse('%{d1}e', value)).toBe('2.456e+0');

				value = 2.4;
				expect($$.parse('%{d2}F', value)).toBe('2.40');
				expect($$.parse('%{d2}f', value)).toBe('2.40');
				expect($$.parse('%{d2}D', value)).toBe('2.40');
				expect($$.parse('%{d2}i', value)).toBe('2');
				expect($$.parse('%{d2}e', value)).toBe('2.40e+0');

				value = 2;
				expect($$.parse('%{d2}F', value)).toBe('2.00');
				expect($$.parse('%{d2}f', value)).toBe('2.00');
				expect($$.parse('%{d2}D', value)).toBe('2.00');
				expect($$.parse('%{d2}i', value)).toBe('2');
				expect($$.parse('%{d2}e', value)).toBe('2.00e+0');

				value = 2456;
				expect($$.parse('%{d1}D', value)).toBe('2.456k');
				value = 2400;
				expect($$.parse('%{d2}D', value)).toBe('2.40k');
			});

			it('should change integer part with pN', function() {
				var value;

				value = 2.4;
				expect($$.parse('%{p2}F', value)).toBe('02.4');
				expect($$.parse('%{p2}f', value)).toBe('02.4');
				expect($$.parse('%{p2}D', value)).toBe('02.4');
				expect($$.parse('%{p2}i', value)).toBe('02');
				expect($$.parse('%{p2}e', value)).toBe('02.4e+0');

				value = 152;
				expect($$.parse('%{p2}F', value)).toBe('152');
				expect($$.parse('%{p2}f', value)).toBe('152');
				expect($$.parse('%{p2}D', value)).toBe('152');
				expect($$.parse('%{p2}i', value)).toBe('152');
				expect($$.parse('%{p2}e', value)).toBe('01.52e+2');

				value = 2400;
				expect($$.parse('%{p2}D', value)).toBe('02.4k');
				expect($$.parse('%{p5}f', value)).toBe('02,400');
				expect($$.parse('%{p7}f', value)).toBe('0,002,400');
			});

			it('should allow to combine variation', function() {
				var value;

				value = 2400;
				expect($$.parse('%{p2,d2}D', value)).toBe('02.40k');
				expect($$.parse('%{p5,d2}f', value)).toBe('02,400.00');
				expect($$.parse('%{p5, d2}f', value)).toBe('02,400.00');

				value = 2.456;
				expect($$.parse('%{d1,.1}F', value)).toBe('2.5');
				expect($$.parse('%{.1,d1}F', value)).toBe('2.5');
				expect($$.parse('%{d2,.1}F', value)).toBe('2.5');
				expect($$.parse('%{.1,d2}F', value)).toBe('2.50');
				expect($$.parse('%{.5,d5}F', value)).toBe('2.45600');
				expect($$.parse('%{d5,.5}F', value)).toBe('2.456');
				expect($$.parse('%{.2,d2,p2}F', value)).toBe('02.46');

				value = 42.1;
				expect($$.parse('%{.2,d2,p2}F', value)).toBe('42.10');
			});
		});

		describe('date formatting', function() {
			xit('should replace the %T wildcard', function() {
				var offset = (new Date()).getTimezoneOffset();
				var value1;

				// As result depends of the browser timezone offset the value is
				// recomputed accordingly to give the same result indepently
				// where you run the test.
				value1 = 1453125600000 - offset * 60000;
				//To check if 1453125600000 is the correct timestamp
				// 1453129200000 → 3PM => 1453125600000 → 2PM and not 4PM

				expect($$.parse('%T', value1)).toBe('1/18/2016, 4:00:00 PM');
				$$.setLocale('fr');
				expect($$.parse('%T', value1)).toBe('18/1/2016 16:00:00');
				$$.setLocale('fr-be');
				expect($$.parse('%T', value1)).toBe('18/1/2016 16:00:00');
			});

			xit('should defines the value unit with u:S', function() {
				var value = 1453125600000 - offset * 60000;

				expect($$.parse('%{u:µs}T', value * 1000)).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:ms}T', value)).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:s}T', Math.floor(value / 1000))).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:m}T', Math.floor(value / 60000))).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:min}T', Math.floor(value / 60000))).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:h}T', Math.floor(value / 3600000))).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:d}T', Math.floor(value / 86400000))).toBe('1/18/2016, 1:00:00 AM');
				// Not the best tests
				expect($$.parse('%{u:M}T', Math.floor(value / (86400000 * 30)))).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{u:y}T', Math.floor(value / (86400000 * 365)))).toBe('1/18/2016, 4:00:00 PM');

				//check decimal value
				expect($$.parse('%{u:d}T', value / 86400000)).toBe('1/18/2016, 4:00:00 PM');
			});

			xit('should set the tilezone offset with o:N', function() {
				var value = 1453125600000;

				expect($$.parse('%{o:0}T', value)).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{o:1}T', value)).toBe('1/18/2016, 5:00:00 PM');
				expect($$.parse('%{o:+1}T', value)).toBe('1/18/2016, 5:00:00 PM');
				expect($$.parse('%{o:-1}T', value)).toBe('1/18/2016, 3:00:00 PM');
				expect($$.parse('%{o:12}T', value)).toBe('1/19/2016, 4:00:00 AM');
				expect($$.parse('%{o:-12}T', value)).toBe('1/18/2016, 4:00:00 AM');

				expect($$.parse('%{o:0}T', 1453129200000)).toBe('1/18/2016, 3:00:00 PM');
				expect($$.parse('%{o:-6}T', 1453129200000)).toBe('1/18/2016, 9:00:00 AM');
			});

			xit('should display UTC format with $UTC', function() {
				expect($$.parse('%{$UTC}T', 1453125600000)).toBe('1/18/2016, 4:00:00 PM');
				expect($$.parse('%{$U}T', 1453125675000)).toBe('1/18/2016, 4:01:15 PM');
			});

			xit('should format date with f:"S"', function() {
				var value = 1451831696000;

				expect($$.parse('%{f:"%Y"}T', value)).toBe('2016');
				expect($$.parse('%{f:"%y"}T', value)).toBe('16');
				expect($$.parse('%{f:"%C"}T', value)).toBe('20');
				expect($$.parse('%{f:"%G"}T', value)).toBe('2015');
				expect($$.parse('%{f:"%g"}T', value)).toBe('15');

				expect($$.parse('%{f:"%m"}T', value)).toBe('01');
				expect($$.parse('%{f:"%B"}T', value)).toBe('January');
				expect($$.parse('%{f:"%b"}T', value)).toBe('Jan');
				expect($$.parse('%{f:"%h"}T', value)).toBe('Jan');

				expect($$.parse('%{f:"%U"}T', value)).toBe('01');
				expect($$.parse('%{f:"%W"}T', value)).toBe('00');
				expect($$.parse('%{f:"%V"}T', value)).toBe('53');

				expect($$.parse('%{f:"%f"}T', value)).toBe('03');
				expect($$.parse('%{f:"%e"}T', value)).toBe('3');
				expect($$.parse('%{f:"%j"}T', value)).toBe('003');
				expect($$.parse('%{f:"%u"}T', value)).toBe('7');
				expect($$.parse('%{f:"%w"}T', value)).toBe('0');
				expect($$.parse('%{f:"%A"}T', value)).toBe('Sunday');
				expect($$.parse('%{f:"%a"}T', value)).toBe('Sun');

				expect($$.parse('%{f:"%H"}T', value)).toBe('14');
				expect($$.parse('%{f:"%k"}T', value)).toBe('14');
				expect($$.parse('%{f:"%I"}T', value)).toBe('02');
				expect($$.parse('%{f:"%l"}T', value)).toBe(' 2');
				expect($$.parse('%{f:"%P"}T', value)).toBe('pm');
				expect($$.parse('%{f:"%p"}T', value)).toBe('PM');

				expect($$.parse('%{f:"%M"}T', value)).toBe('34');
				expect($$.parse('%{f:"%S"}T', value)).toBe('56');
				expect($$.parse('%{f:"%s"}T', value)).toBe('1451831696');

				expect($$.parse('%{f:"%r"}T', value)).toBe('02:34:56 PM');
				expect($$.parse('%{f:"%R"}T', value)).toBe('14:34');
				expect($$.parse('%{f:"%T"}T', value)).toBe('14:34:56');
				expect($$.parse('%{f:"%D"}T', value)).toBe('01/03/2016');
				expect($$.parse('%{f:"%F"}T', value)).toBe('2016-01-03');

				expect($$.parse('%{f:"%%"}T', value)).toBe('%');
				expect($$.parse('%{f:"%n"}T', value)).toBe('\n');
				expect($$.parse('%{f:"%t"}T', value)).toBe('\t');

				value = 1453130145000;

				expect($$.parse('%{f:"%M:%s"}T', value)).toBe('15:45');
				expect($$.parse('%{f:"%Mmin %ss"}T', value)).toBe('15min 45s');
			});

			xit('should format date with f:%"S"', function() {
				var value = 1451831696000;

				expect($$.parse('%{f:%"Y"}T', value)).toBe('2016');
				expect($$.parse('%{f:%"y"}T', value)).toBe('16');
				expect($$.parse('%{f:%"C"}T', value)).toBe('20');
				expect($$.parse('%{f:%"G"}T', value)).toBe('2015');
				expect($$.parse('%{f:%"g"}T', value)).toBe('15');

				expect($$.parse('%{f:%"m"}T', value)).toBe('01');
				expect($$.parse('%{f:%"B"}T', value)).toBe('January');
				expect($$.parse('%{f:%"b"}T', value)).toBe('Jan');
				expect($$.parse('%{f:%"h"}T', value)).toBe('Jan');

				expect($$.parse('%{f:%"U"}T', value)).toBe('01');
				expect($$.parse('%{f:%"W"}T', value)).toBe('00');
				expect($$.parse('%{f:%"V"}T', value)).toBe('53');

				expect($$.parse('%{f:%"d"}T', value)).toBe('03');
				expect($$.parse('%{f:%"e"}T', value)).toBe('3');
				expect($$.parse('%{f:%"j"}T', value)).toBe('003');
				expect($$.parse('%{f:%"u"}T', value)).toBe('7');
				expect($$.parse('%{f:%"w"}T', value)).toBe('0');
				expect($$.parse('%{f:%"A"}T', value)).toBe('Sunday');
				expect($$.parse('%{f:%"a"}T', value)).toBe('Sun');

				expect($$.parse('%{f:%"H"}T', value)).toBe('14');
				expect($$.parse('%{f:%"k"}T', value)).toBe('14');
				expect($$.parse('%{f:%"I"}T', value)).toBe('02');
				expect($$.parse('%{f:%"l"}T', value)).toBe(' 2');
				expect($$.parse('%{f:%"P"}T', value)).toBe('pm');
				expect($$.parse('%{f:%"p"}T', value)).toBe('PM');

				expect($$.parse('%{f:%"M"}T', value)).toBe('34');
				expect($$.parse('%{f:%"S"}T', value)).toBe('56');
				expect($$.parse('%{f:%"s"}T', value)).toBe('1451831696');

				expect($$.parse('%{f:%"r"}T', value)).toBe('02:34:56 PM');
				expect($$.parse('%{f:%"R"}T', value)).toBe('14:34');
				expect($$.parse('%{f:%"T"}T', value)).toBe('14:34:56');
				expect($$.parse('%{f:%"D"}T', value)).toBe('01/03/2016');
				expect($$.parse('%{f:%"F"}T', value)).toBe('2016-01-03');

				expect($$.parse('%{f:%"%"}T', value)).toBe('%');
				expect($$.parse('%{f:%"n"}T', value)).toBe('\n');
				expect($$.parse('%{f:%"t"}T', value)).toBe('\t');

				value = 1453130145000;

				expect($$.parse('%{f:%"M:s"}T', value)).toBe('15:45');
			});

			xit('should translate formats', function() {
				var value = 1451831696000;

				expect($$.parse('%{f:"%B %b %h %A %a"}T', value)).toBe('January Jan Jan Sunday Sun');
				expect($$.parse('%{f:%"B b h A a"}T', value)).toBe('January Jan Jan Sunday Sun');

				$$.setLocale('fr');
				expect($$.parse('%{f:"%B %b %h %A %a"}T', value)).toBe('Janvier Jan Jan dimanche Dim');
				expect($$.parse('%{f:%"B b h A a"}T', value)).toBe('Janvier Jan Jan dimanche Dim');

				$$.setLocale('fr-be');
				expect($$.parse('%{f:"%B %b %h %A %a"}T', value)).toBe('Janvier Jan Jan dimanche Dim');
				expect($$.parse('%{f:%"B b h A a"}T', value)).toBe('Janvier Jan Jan dimanche Dim');
			});
		});

		describe('duration formatting', function() {
			it('should replace the %t wildcard', function() {
				expect($$.parse('%t', 45123)).toBe('45s 123ms');
				expect($$.parse('%t', 105000)).toBe('1min 45s');
				expect($$.parse('%t', 31719845006)).toBe('1y 2d 3h 4min 5s 6ms');
				expect($$.parse('%t', 7204000)).toBe('2h 4s');
				$$.setLocale('fr');
				expect($$.parse('%t', 45123)).toBe('45s 123ms');
				expect($$.parse('%t', 105000)).toBe('1min 45s');
				expect($$.parse('%t', 31719845006)).toBe('1an 2j 3h 4min 5s 6ms');
				expect($$.parse('%t', 7204000)).toBe('2h 4s');
				$$.setLocale('fr-be');
				expect($$.parse('%t', 45123)).toBe('45s 123ms');
				expect($$.parse('%t', 105000)).toBe('1min 45s');
				expect($$.parse('%t', 31719845006)).toBe('1a 2j 3h 4min 5s 6ms');
				expect($$.parse('%t', 7204000)).toBe('2h 4s');
			});

			it('should defines the value unit with u:S', function() {
				expect($$.parse('%{u:µs}t', 7204000123)).toBe('2h 4s 123µs');
				expect($$.parse('%{u:ms}t', 7204123)).toBe('2h 4s 123ms');
				expect($$.parse('%{u:s}t', 7204)).toBe('2h 4s');
				expect($$.parse('%{u:m}t', 135)).toBe('2h 15min');
				expect($$.parse('%{u:min}t', 135)).toBe('2h 15min');
				expect($$.parse('%{u:h}t', 51)).toBe('2d 3h');
				expect($$.parse('%{u:d}t', 5)).toBe('5d');
				expect($$.parse('%{u:M}t', 7)).toBe('7M');
				expect($$.parse('%{u:y}t', 3)).toBe('3y');

				expect($$.parse('%{u:ms}t', 7204123.456)).toBe('2h 4s 123ms 456µs');
				expect($$.parse('%{u:s}t', 7204.456)).toBe('2h 4s 456ms');
				expect($$.parse('%{u:m}t', 1.5)).toBe('1min 30s');

				expect($$.parse('%{u:s}t', 4200)).toBe('1h 10min');
			});

			it('should defines the minimal unit with min:S', function() {
				var value = 31719845006;

				expect($$.parse('%{min:ms}t', value)).toBe('1y 2d 3h 4min 5s 6ms');
				expect($$.parse('%{min:s}t', value)).toBe('1y 2d 3h 4min 5s');
				expect($$.parse('%{min:m}t', value)).toBe('1y 2d 3h 4min');
				expect($$.parse('%{min:min}t', value)).toBe('1y 2d 3h 4min');
				expect($$.parse('%{min:h}t', value)).toBe('1y 2d 3h');
				expect($$.parse('%{min:d}t', value)).toBe('1y 2d');
				expect($$.parse('%{min:M}t', value)).toBe('1y');
				expect($$.parse('%{min:y}t', value)).toBe('1y');

				expect($$.parse('%{min:ms}t', 123.456)).toBe('123ms');

				expect($$.parse('%{min:s}t', 45123)).toBe('45s');
			});

			it('should defines the maximal unit with max:S', function() {
				var value = 31719845006;

				expect($$.parse('%{max:µs}t', value)).toBe('31,719,845,006,000µs');
				expect($$.parse('%{max:ms}t', value)).toBe('31,719,845,006ms');
				expect($$.parse('%{max:s}t', value)).toBe('31,719,845s 6ms');
				expect($$.parse('%{max:m}t', value)).toBe('528,664min 5s 6ms');
				expect($$.parse('%{max:min}t', value)).toBe('528,664min 5s 6ms');
				expect($$.parse('%{max:h}t', value)).toBe('8,811h 4min 5s 6ms');
				expect($$.parse('%{max:d}t', value)).toBe('367d 3h 4min 5s 6ms');
				expect($$.parse('%{max:M}t', value)).toBe('12M 7d 3h 4min 5s 6ms');
				expect($$.parse('%{max:y}t', value)).toBe('1y 2d 3h 4min 5s 6ms');

				expect($$.parse('%{max:s}t', 105123)).toBe('105s 123ms');
			});

			it('should defines the maximum number of unit with n:N', function() {
				var value = 54342010;
				expect($$.parse('%{n:1}t', value)).toBe('15h');
				expect($$.parse('%{n:2}t', value)).toBe('15h 5min');
				expect($$.parse('%{n:3}t', value)).toBe('15h 5min 42s');
				expect($$.parse('%{n:4}t', value)).toBe('15h 5min 42s 10ms');
				expect($$.parse('%{n:5}t', value +1)).toBe('15h 5min 42s 11ms');
				expect($$.parse('%{n:6}t', value +2)).toBe('15h 5min 42s 12ms');

				expect($$.parse('%{n:2}t', 31719845006)).toBe('1y');
				expect($$.parse('%{n:3}t', 31719845006)).toBe('1y 2d');

				expect($$.parse('%{n:1}t', 105123)).toBe('1min');
				expect($$.parse('%{n:2}t', 105123)).toBe('1min 45s');
				expect($$.parse('%{n:10}t', 105123)).toBe('1min 45s 123ms');
			});

			it('should format the ouput with f:"S"', function() {
				var value = 3705123;

				expect($$.parse('%{f:"$hh $mmin $ss $ims"}t', value)).toBe('1h 1min 45s 123ms');
				expect($$.parse('%{f:"$h:$m:$s"}t', value)).toBe('1:1:45');
				expect($$.parse('%{f:"$m min"}t', value)).toBe('61 min');
				expect($$.parse('%{f:"$d day $h hour $m min"}t', value)).toBe('0 day 1 hour 1 min');
				expect($$.parse('%{f:"$d day $h hour $s seconds"}t', value)).toBe('0 day 1 hour 105 seconds');

				expect($$.parse('%{f:"$y $M $d $h $m $s $i $µ $$"}t', 34311845006.007)).toBe('1 1 2 3 4 5 6 7 $');
			});

			it('should format the ouput with f:$"S"', function() {
				expect($$.parse('%{f:$"y M d h m s i µ $"}t', 34311845006.007)).toBe('1 1 2 3 4 5 6 7 $');
			});
		});

		it('should convert special characters', function() {
			expect($$('42 %%')).toBe('42 %');
			expect($$('42%% of tests')).toBe('42% of tests');
		});

		it('should replace several wildcards', function() {
			expect($$('%d issues: %s', 2, 'bug1, bug2')).toBe('2 issues: bug1, bug2');
			expect($$('%d%% %s', 100, 'success')).toBe('100% success');
		});

		it('should not convert unknown syntax', function() {
			expect($$('42% of success', 'foo')).toBe('42% of success');
			expect($$('42%(1)P success', 'foo')).toBe('42%(1)P success');
			expect($$('42%|s', 'foo')).toBe('42%|s');
		});
	});
});
