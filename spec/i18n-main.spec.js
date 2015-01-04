describe('i18n', function() {

	// beforeEach(function() {
	//   player = new Player();
	//   song = new Song();
	// });

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
			expect($$.getLocale({locale: true})).toBe('en');
		});

		it('should get locale name', function() {
			expect($$.getLocale({name: true})).toBe('English');
		});

		it('should get locale key and name', function() {
			expect($$.getLocale({locale: true, name: true})).toEqual({locale: 'en', name: 'English'});
		});

		describe('set locale', function() {
			[
				['fr', 'fr'],
				['fr-FR', 'fr'],
				['de', 'de'],
				['DE', 'de'],
				['fr-BE', 'fr-be'],
			].forEach(function(v) {
				it('should change to locale: ' + v[0], function() {
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
			[
				'jp',
				'sp-en',
				'fr be',
				'fr:be',
				'fr_be',
				'frbe',
				'anyword'
			].each(function(locale) {
				expect($$.setLocale(locale)).toBeFalsy();
			});
		});

		it('should get locales', function() {
			expect($$.getLocales()).toEqual(['en', 'fr', 'de', 'fr-be']);
			expect($$.getLocales({locale: true})).toEqual(['en', 'fr', 'de', 'fr-be']);
		});

		it('should get locale names', function() {
			expect($$.getLocales({
				name: true
			})).toEqual([
				'English',
				'Français',
				'Deutsh',
				'Belge'
			]);
		});

		it('should get locale names and keys', function() {
			expect($$.getLocales({
				locale: true,
				name: true
			})).toEqual([
				{locale: 'en', name: 'English'},
				{locale: 'fr', name: 'Français'},
				{locale: 'de', name: 'Deutsh'},
				{locale: 'fr-be', name: 'Belge'}
			]);
		});

		it('should reset configuration for locales', function() {
			$$.configuration({locales: ['en', 'fr']});
			expect($$.getLocales()).toEqual(['en', 'fr']);

			$$.configuration({locales: ['jp', 'sp', 'fi']});
			expect($$.getLocales()).toEqual(['jp', 'sp', 'fi']);
		});

		it('should change configuration for locale names', function() {
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

		it('should not change configuration for locale names with wrong locale', function() {
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

	describe('basic translations', function() {
		//Loading data
	});
  
});
