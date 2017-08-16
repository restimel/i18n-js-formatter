describe('i18n ES6', () => {
	'use strict';

	beforeEach(() => {
		this.logInfo = jasmine.createSpy('logInfo');
		this.logWarn = jasmine.createSpy('logWarn');
		this.logError = jasmine.createSpy('logError');

		$$.configuration({
			locales: ['en', 'fr', 'fr-be'],
			dictionary: {
				'Hello': {
					en: 'Hello',
					fr: 'Salut'
				},
				'Hello %s!': {
					en: 'Hello %s!',
					fr: 'Salut %s !'
				},
				'%d cats\n%d dogs': {
					en: '%d cats\n%d dogs',
					fr: '%d chats\n%d chiens'
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
		$$.loadFormatter({formatter: s_formatter, weight: 100, name: 's_formatter'});

		$$.setLocale('en');
	});

	afterEach(() => {
		$$.clearData();
		$$._reset();
	});

	describe('i18n', () => {
		it('should accept simple litteral templates', () => {
			expect($$`Hello`).toBe('Hello');
			
			$$.setLocale('fr');
			expect($$`Hello`).toBe('Salut');
			
			$$.setLocale('fr-be');
			expect($$`Hello`).toBe('Salut');
			
			expect(this.logInfo).not.toHaveBeenCalled();
			expect(this.logWarn).not.toHaveBeenCalled();
			expect(this.logError).not.toHaveBeenCalled();
		});

		it('should replace values of litteral templates', () => {
			let name = 'test';

			expect($$`Hello ${name}%s!`).toBe('Hello test!');
			
			$$.setLocale('fr');
			expect($$`Hello ${name}%s!`).toBe('Salut test !');
			
			$$.setLocale('fr-be');
			expect($$`Hello ${name}%s!`).toBe('Salut test !');
			
			expect(this.logInfo).not.toHaveBeenCalled();
			expect(this.logWarn).not.toHaveBeenCalled();
			expect(this.logError).not.toHaveBeenCalled();
		});


		it('should handle multilines of litteral templates', () => {
			let cats = 4;
			let dogs = 2;

			expect($$`${cats}%d cats\n%d${dogs} dogs`).toBe('4 cats\n2 dogs');
			expect($$`${cats}%d cats
%d${dogs} dogs`).toBe('4 cats\n2 dogs');
			
			$$.setLocale('fr');
			expect($$`${cats}%d cats\n%d${dogs} dogs`).toBe('4 chats\n2 chiens');
			expect($$`${cats}%d cats
%d${dogs} dogs`).toBe('4 chats\n2 chiens');
			
			$$.setLocale('fr-be');
			expect($$`${cats}%d cats\n%d${dogs} dogs`).toBe('4 chats\n2 chiens');
			expect($$`${cats}%d cats
%d${dogs} dogs`).toBe('4 chats\n2 chiens');
			
			expect(this.logInfo).not.toHaveBeenCalled();
			expect(this.logWarn).not.toHaveBeenCalled();
			expect(this.logError).not.toHaveBeenCalled();
		});
	});

/* Is it needed? */
	xdescribe('i18n.parse', () => {
		it('should accept simple litteral templates', () => {
			expect($$.parse`Hello`).toBe('Hello');
			
			expect(this.logInfo).not.toHaveBeenCalled();
			expect(this.logWarn).not.toHaveBeenCalled();
			expect(this.logError).not.toHaveBeenCalled();
		});

		it('should replace values of litteral templates', () => {
			let name = 'test';

			expect($$.parse`Hello ${name}%s!`).toBe('Hello test!');
			
			expect(this.logInfo).not.toHaveBeenCalled();
			expect(this.logWarn).not.toHaveBeenCalled();
			expect(this.logError).not.toHaveBeenCalled();
		});


		it('should handle multilines of litteral templates', () => {
			let cats = 4;
			let dogs = 2;

			expect($$.parse`${cats}%d cats\n%d${dogs} dogs`).toBe('4 cats\n2 dogs');
			expect($$.parse`${cats}%d cats
%d${dogs} dogs`).toBe('4 cats\n2 dogs');
			
			expect(this.logInfo).not.toHaveBeenCalled();
			expect(this.logWarn).not.toHaveBeenCalled();
			expect(this.logError).not.toHaveBeenCalled();
		});

	});

});
