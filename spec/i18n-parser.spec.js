describe('i18n-parser', function() {
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
			defaultLocale: 'en'
		});

		$$.setLocale('en');
	});

	afterEach(function() {
		$$.clearData();
		$$._reset();
	});

	if (typeof sprintf !== 'undefined') {
		describe('use parser sprintf', function() {
			beforeEach(function() {
				$$.loadParser({parser: callSprintf, weight: 100, name: 'sprintf'});
			});

			it('should remplace the %s wildcard', function() {
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

			it('should remplace numeric wildcard', function() {
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

			it('should remplace several wildcards', function() {
				expect($$('%d issues: %s', 2, 'bug1, bug2')).toBe('2 issues: bug1, bug2');

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logWarn).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});

			it('should not remplace unknown wildcards', function() {
				expect($$.parse('%D %S %W', 42)).toBe('%D %S %W');

				expect(this.logWarn).toHaveBeenCalledWith(4200, jasmine.any(String), ['sprintf', jasmine.any(String)]);

				expect(this.logInfo).not.toHaveBeenCalled();
				expect(this.logError).not.toHaveBeenCalled();
			});
		});
	}

	xdescribe('use i18n-parser', function() {
		beforeEach(function() {
			$$.loadParser({parser: callSprintf, weight: 100, name: 'sprintf'});
		});

		it('should remplace the %s wildcard', function() {
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

		xit('should remplace the %d wildcard', function() {
			expect($$('%d cats', 42)).toBe('42 cats');
			expect($$('%d cats', 42.76)).toBe('42.76 cats');
			$$.setLocale('fr');
			expect($$('%d cats', 42)).toBe('42 chats');
			expect($$('%d cats', 42.76)).toBe('42,76 chats');
			$$.setLocale('fr-be');
			expect($$('%d cats', 42)).toBe('42 chats');
			expect($$('%d cats', 42.76)).toBe('42,76 chats');
		});

		xit('should convert to number the %d wildcard', function() {
			var obj;

			obj = {};
			expect($$('%d cats', obj)).toBe((+obj) + ' cats');

			obj = "42";
			expect($$('%d cats', obj)).toBe((+obj) + ' cats');

			obj = function() {};
			expect($$('%d cats', obj)).toBe((+obj) + ' cats');

			obj = true;
			expect($$('%d cats', obj)).toBe((+obj) + ' cats');
		});

		it('should remplace several wildcards', function() {
			expect($$('%d issues: %s', 2, 'bug1, bug2')).toBe('2 issues: bug1, bug2');
		});
	});
});
