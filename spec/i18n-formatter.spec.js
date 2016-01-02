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
				'%f cats': {
					en: '%f cats',
					fr: '%f chats'
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
					}
				},
				'fr-be': {
					number: {
						thousandSeparator: ' ',
						decimalSeparator: ','
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

		xit('should identify correct argument', function() {
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

			xit('should change the case', function() {
				expect($$.parse('%{case}s', 'some Strings')).toBe('some strings');
				expect($$.parse('%{CASE}s', 'some Strings')).toBe('SOME STRINGS');
				expect($$.parse('%{Case}s', 'some Strings')).toBe('Some strings');
				expect($$.parse('%{CasE}s', 'some Strings')).toBe('Some Strings');
			});
		});

		describe('number formatting', function() {
			it('should replace the %f wildcard', function() {
				expect($$('%f cats', 42)).toBe('42 cats');
				expect($$('%f cats', 42.76)).toBe('42.76 cats');
				expect($$('%f cats', 1234.5)).toBe('1234.5 cats');
				$$.setLocale('fr');
				expect($$('%f cats', 42)).toBe('42 chats');
				expect($$('%f cats', 42.76)).toBe('42.76 chats');
				expect($$('%f cats', 1234.5)).toBe('1234.5 chats');
				$$.setLocale('fr-be');
				expect($$('%f cats', 42)).toBe('42 chats');
				expect($$('%f cats', 42.76)).toBe('42.76 chats');
				expect($$('%f cats', 1234.5)).toBe('1234.5 chats');
			});

			xit('should replace the %d wildcard', function() {
				expect($$('%d cats', 42)).toBe('42 cats');
				expect($$('%d cats', 42.76)).toBe('42.76 cats');
				expect($$('%d cats', 1234.5)).toBe('1,234.5 cats');
				$$.setLocale('fr');
				expect($$('%d cats', 42)).toBe('42 chats');
				expect($$('%d cats', 42.76)).toBe('42,76 chats');
				expect($$('%d cats', 1234.5)).toBe('1 234,5 chats');
				$$.setLocale('fr-be');
				expect($$('%d cats', 42)).toBe('42 chats');
				expect($$('%d cats', 42.76)).toBe('42,76 chats');
				expect($$('%d cats', 1234.5)).toBe('1 234,5 chats');
			});

			xit('should replace the %D wildcard', function() {
				expect($$('%D cats', 42)).toBe('42 cats');
				expect($$('%D cats', 42.76)).toBe('42.76 cats');
				expect($$('%D cats', 1234.5)).toBe('1.2345k cats');

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

				$$.setLocale('fr');
				expect($$('%D cats', 42)).toBe('42 chats');
				expect($$('%D cats', 42.76)).toBe('42,76 chats');
				expect($$('%D cats', 1234.5)).toBe('1,2345k chats');
				$$.setLocale('fr-be');
				expect($$('%D cats', 42)).toBe('42 chats');
				expect($$('%D cats', 42.76)).toBe('42,76 chats');
				expect($$('%D cats', 1234.5)).toBe('1,2345k chats');
			});

			xit('should replace the %i wildcard', function() {
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

			xit('should replace the %e wildcard', function() {
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
			});

			xit('should convert to number the number wildcards', function() {
				var obj;

				obj = {};
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%d cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');

				obj = "42";
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%d cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');

				obj = function() {};
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%d cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');

				obj = true;
				expect($$('%f cats', obj)).toBe((+obj) + ' cats');
				expect($$('%d cats', obj)).toBe((+obj) + ' cats');
				expect($$('%D cats', obj)).toBe((+obj) + ' cats');
				expect($$('%i cats', obj)).toBe((+obj) + ' cats');
				expect($$('%e cats', obj)).toBe((+obj).toExponential() + ' cats');
			});

			xit('should round decimal part with .N', function() {
				var value;

				value = 2.456;
				expect($$.parse('%{.1}f', value)).toBe('2.5');
				expect($$.parse('%{.1}d', value)).toBe('2.5');
				expect($$.parse('%{.1}D', value)).toBe('2.5');
				expect($$.parse('%{.1}i', value)).toBe('2');
				expect($$.parse('%{.1}e', value)).toBe('2.5e+0');

				value = 2.4;
				expect($$.parse('%{.2}f', value)).toBe('2.4');
				expect($$.parse('%{.2}d', value)).toBe('2.4');
				expect($$.parse('%{.2}D', value)).toBe('2.4');
				expect($$.parse('%{.2}i', value)).toBe('2');
				expect($$.parse('%{.2}e', value)).toBe('2.e+0');

				value = 2456;
				expect($$.parse('%{.1}D', value)).toBe('2.5k');
				value = 2400;
				expect($$.parse('%{.2}D', value)).toBe('2.4k');
			});

			xit('should change decimal part with dN', function() {
				var value;

				value = 2.456;
				expect($$.parse('%{d1}f', value)).toBe('2.456');
				expect($$.parse('%{d1}d', value)).toBe('2.456');
				expect($$.parse('%{d1}D', value)).toBe('2.456');
				expect($$.parse('%{d1}i', value)).toBe('2');
				expect($$.parse('%{d1}e', value)).toBe('2.456e+0');

				value = 2.4;
				expect($$.parse('%{d2}f', value)).toBe('2.40');
				expect($$.parse('%{d2}d', value)).toBe('2.40');
				expect($$.parse('%{d2}D', value)).toBe('2.40');
				expect($$.parse('%{d2}i', value)).toBe('2');
				expect($$.parse('%{d2}e', value)).toBe('2.40e+0');

				value = 2456;
				expect($$.parse('%{d1}D', value)).toBe('2.456k');
				value = 2400;
				expect($$.parse('%{d2}D', value)).toBe('2.40k');
			});

			xit('should change integer part with pN', function() {
				var value;

				value = 2.4;
				expect($$.parse('%{p2}f', value)).toBe('02.4');
				expect($$.parse('%{p2}d', value)).toBe('02.4');
				expect($$.parse('%{p2}D', value)).toBe('02.4');
				expect($$.parse('%{p2}i', value)).toBe('02');
				expect($$.parse('%{p2}e', value)).toBe('02.4e+0');

				value = 152;
				expect($$.parse('%{p2}f', value)).toBe('152');
				expect($$.parse('%{p2}d', value)).toBe('152');
				expect($$.parse('%{p2}D', value)).toBe('152');
				expect($$.parse('%{p2}i', value)).toBe('152');
				expect($$.parse('%{p2}e', value)).toBe('01.52e+2');

				value = 2400;
				expect($$.parse('%{p2}D', value)).toBe('02.4k');
				expect($$.parse('%{p5}d', value)).toBe('02,400');
			});

			xit('should allow to combine variation', function() {
				var value;

				value = 2400;
				expect($$.parse('%{p2,d2}D', value)).toBe('02.40k');
				expect($$.parse('%{p5,d2}d', value)).toBe('02,400.00');
				expect($$.parse('%{p5, d2}d', value)).toBe('02,400.00');

				value = 2.456;
				expect($$.parse('%{d1,.1}f', value)).toBe('2.5');
				expect($$.parse('%{d2,.1}f', value)).toBe('2.50');
				expect($$.parse('%{d2,.2,p2}f', value)).toBe('02.46');
			});
		});

		it('should replace several wildcards', function() {
			expect($$('%d issues: %s', 2, 'bug1, bug2')).toBe('2 issues: bug1, bug2');
		});

		it('should convert special characters', function() {
			expect($$('42 %%')).toBe('42 %');
			expect($$('42%%success')).toBe('42%success');
		});

		it('should not convert unknown syntax', function() {
			expect($$('42% of success', 'foo')).toBe('42% of success');
			expect($$('42%(1)P success', 'foo')).toBe('42%(1)P success');
			expect($$('42%|s', 'foo')).toBe('42%|s');
		});
	});
});
