describe('i18n', function() {

	it('should declare variables', function() {
		expect(i18n).toBeDefined();
		expect($$).toBeDefined();

		expect(typeof i18n).toBe('function');
		expect($$).toEqual(i18n);
	});

	describe('configuration', function() {

		beforeEach(function() {
			$$.configuration({
				locales: ['en', 'fr', 'de', 'fr-be'],
				localeName: {
					'en': 'English',
					'fr': 'Français',
					'de': 'Deutsh',
					'fr-be': 'Belge'
				}
			});

			$$.setLocale('en');
		});

		it('should get locale', function() {
			expect($$.getLocale()).toBe('en');
			expect($$.getLocale({key: true})).toBe('en');
			expect($$.getLocale({key: true, name: false})).toBe('en');
			expect($$.getLocale({})).toBe('en');
		});

		it('should get locale name', function() {
			expect($$.getLocale({name: true})).toBe('English');
			expect($$.getLocale({key:false, name: true})).toBe('English');
		});

		it('should get locale key and name', function() {
			expect($$.getLocale({key: true, name: true})).toEqual({key: 'en', name: 'English'});
		});

		describe('set locale', function() {
			[
			/*  [input, expected result] */
				['fr', 'fr'],
				['fr-FR', 'fr'],
				['de', 'de'],
				['DE', 'de'],
				['fr-BE', 'fr-be'],
			].forEach(function(v) {
				it('should change from "' + v[0] + '" to locale: ' + v[1], function() {
					expect($$.setLocale(v[0])).toBeTruthy();
					expect($$.getLocale()).toBe(v[1]);
				});
			});

			it('should not change twice', function() {
				$$.setLocale('fr');
				expect($$.setLocale('fr')).toBeFalsy();
				expect($$.getLocale()).toBe('fr');
			});
		});

		it('should set default language', function() {
			$$.setLocale(navigator.language)
			var locale = $$.getLocale();

			$$.setLocale();
			expect($$.getLocale()).toBe(locale);
		});

		it('should not change locale to outscope locales', function() {
			var locale = $$.getLocale();

			[
				'jp',
				'sp-en',
				'fr be',
				'fr:be',
				'fr_be',
				'frbe',
				'anyword'
			].forEach(function(locale) {
				expect($$.setLocale(locale)).toBeFalsy();
			});

			expect($$.getLocale()).toBe(locale);
		});

		xit('should get locales', function() {
			expect($$.getLocales()).toEqual(['en', 'fr', 'de', 'fr-be']);
			expect($$.getLocales({key: true})).toEqual(['en', 'fr', 'de', 'fr-be']);
		});

		xit('should get locale names', function() {
			expect($$.getLocales({
				name: true
			})).toEqual([
				'English',
				'Français',
				'Deutsh',
				'Belge'
			]);
		});

		xit('should get locale names and keys', function() {
			expect($$.getLocales({
				key: true,
				name: true
			})).toEqual([
				{key: 'en', name: 'English'},
				{key: 'fr', name: 'Français'},
				{key: 'de', name: 'Deutsh'},
				{key: 'fr-be', name: 'Belge'}
			]);
		});

		xit('should reset configuration for locales', function() {
			$$.configuration({locales: ['en', 'fr']});
			expect($$.getLocales()).toEqual(['en', 'fr']);

			$$.configuration({locales: ['jp', 'sp', 'fi']});
			expect($$.getLocales()).toEqual(['jp', 'sp', 'fi']);
		});

		xit('should change configuration for locale names', function() {
			$$.configuration({localeName: {'fr-be': 'Français (Belge)'}});
			expect($$.getLocales({
				name: true
			})).toEqual([
				'English',
				'Français',
				'Deutsh',
				'Français (Belge)'
			]);
		});

		xit('should not change configuration for locale names with wrong locale', function() {
			$$.configuration({localeName: {'fi': 'Suomi'}});
			expect($$.getLocales({
				name: true
			})).toEqual([
				'English',
				'Français',
				'Deutsh',
				'Belge'
			]);
		});
	});

	xdescribe('basic translations', function() {
		//Loading data
	});
  
});
