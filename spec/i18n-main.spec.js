describe('i18n', function() {
	'use strict';

	it('should declare variables', function() {
		expect(i18n).toBeDefined();
		expect($$).toBeDefined(); // '$$' has been added as an alias by _i18n_config

		expect(typeof i18n).toBe('function');
		expect($$).toEqual(i18n);
	});

	describe('configuration', function() {

		beforeEach(function() {
			this.logInfo = jasmine.createSpy('logInfo');
			this.logWarn = jasmine.createSpy('logWarn');
			this.logError = jasmine.createSpy('logError');

			$$.configuration({
				locales: ['en', 'fr', 'de', 'fr-be'],
				localeName: {
					'en': 'English',
					'fr': 'Français',
					'de': 'Deutsch',
					'fr-be': 'Belge'
				},
				secondary: {
					'fr-be': 'fr'
				},
				log: {
					info: this.logInfo,
					warn: this.logWarn,
					error: this.logError
				}
			});
		});

		afterEach(function() {
			$$._reset();
		});

		it('should add an alias', function() {
			$$.configuration({alias: 'translations'});

			expect(translations).toBeDefined();
			expect(translations).toEqual(i18n);
		});

		it('should get locale', function() {
			expect($$.getLocale()).toEqual(jasmine.any(String));
			$$.setLocale('en');
			expect($$.getLocale()).toBe('en');
			expect($$.getLocale({key: true})).toBe('en');
			expect($$.getLocale({key: true, name: false})).toBe('en');
			expect($$.getLocale({})).toBe('en');
		});

		it('should get locale name', function() {
			$$.setLocale('en');
			expect($$.getLocale({name: true})).toBe('English');
			expect($$.getLocale({key:false, name: true})).toBe('English');
		});

		xit('should get locale secondary fallback', function() {
			$$.setLocale('en');
			expect($$.getLocale({secondary: true})).toBeFalsy();

			$$.setLocale('fr-be');
			expect($$.getLocale({secondary: true})).toBe('fr');
		});

		it('should get locale key and name', function() {
			$$.setLocale('en');
			expect($$.getLocale({key: true, name: true})).toEqual({key: 'en', name: 'English'});
		});

		it('should configure a default locale', function() {
			var locale = $$.getLocale();
			var list = $$.getLocales();

			expect(locale).toEqual(jasmine.any(String));
			expect(list.indexOf(locale) !== -1).toBeTruthy();

			$$.configuration({defaultLocale: 'en'});
			expect($$.getLocale()).toBe('en');

			$$.configuration({defaultLocale: 'fr'});
			expect($$.getLocale()).toBe('fr');
		});

		it('should not change the locale', function() {
			$$.setLocale('en');
			$$.configuration({defaultLocale: 'fr'});

			expect($$.getLocale()).toBe('en');
		});

		describe('set locale', function() {
			beforeEach(function() {
				$$.setLocale('en');
			});

			[
			/*  [input, expected result] */
				['fr', 'fr'],
				['fr-FR', 'fr'],
				['de', 'de'],
				['DE', 'de'],
				['fr-BE', 'fr-be']
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

			it('should not change locale to outscope locales', function() {
				$$.setLocale('en');
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

				expect($$.getLocale()).toEqual(locale);
			});
		});

		it('should set default language', function() {
			var language = $$.setLocale(navigator.language);
			var locale = $$.getLocale();

			if (language === 'fr') {
				language = 'de';
			} else {
				language = 'fr';
			}
			$$.setLocale(language);

			$$.setLocale();
			expect($$.getLocale()).toEqual(locale);

			$$.configuration({defaultLocale: 'en'});
			$$.setLocale();

			expect($$.getLocale()).toBe('en');
		});

		describe('navigator storage', function() {
			afterEach(function() {
				$$.setLocale();
				if (self.document && document.cookie) {
					document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
				}

				if (self.localStorage) {
					localStorage.removeItem('test');
				}
			});

			it('should store the locale in cookie', function() {
				$$.setLocale('en');
				expect(function() {
					$$.configuration({
						storage: 'cookie:test'
					});
				}).not.toThrow();

				if (self.document && document.cookie) {
					expect(document.cookie.indexOf('test=en') !== -1).toBeTruthy();

					$$.setLocale('fr');
					expect(document.cookie.indexOf('test=en') !== -1).toBeFalsy();
					expect(document.cookie.indexOf('test=fr') !== -1).toBeTruthy();
				}
			});

			it('should store the locale in localStorage', function() {
				$$.setLocale('en');
				expect(function() {
					$$.configuration({
						storage: 'localStorage:test'
					});
				}).not.toThrow();

				if (self.localStorage) {
					expect(self.localStorage.getItem('test')).toBe('en');
					$$.setLocale('fr');
					expect(self.localStorage.getItem('test')).toBe('fr');
				}
			});

			it('should store the locale in the available storage', function() {
				$$.setLocale('en');
				expect(function() {
					$$.configuration({
						storage: ['localStorage:test', 'cookie:test']
					});
				}).not.toThrow();

				if (self.localStorage) {
					expect(localStorage.getItem('test')).toBe('en');
				} else if (self.document && document.cookie) {
					expect(document.cookie.indexOf('test=en') !== -1).toBeTruthy();
				}
			});
		});

		describe('getLocales', function() {
			it('should get locales', function() {
				expect($$.getLocales()).toEqual(['en', 'fr', 'de', 'fr-be']);
				expect($$.getLocales({key: true})).toEqual(['en', 'fr', 'de', 'fr-be']);
			});

			it('should get locale names', function() {
				expect($$.getLocales({
					name: true
				})).toEqual([
					'English',
					'Français',
					'Deutsch',
					'Belge'
				]);
			});

			xit('should get locale secondary fallback', function() {
				expect($$.getLocales({
					secondary: true
				})).toEqual([
					false,
					false,
					false,
					'fr'
				]);
			});

			it('should get locale names and keys', function() {
				expect($$.getLocales({
					key: true,
					name: true
				})).toEqual([
					{key: 'en', name: 'English'},
					{key: 'fr', name: 'Français'},
					{key: 'de', name: 'Deutsch'},
					{key: 'fr-be', name: 'Belge'}
				]);
			});

			// TODO remove previous test
			xit('should get details of locales', function() {
				expect($$.getLocales({
					key: true,
					name: true,
					secondary: true
				})).toEqual([
					{key: 'en', name: 'English', secondary: false},
					{key: 'fr', name: 'Français', secondary: false},
					{key: 'de', name: 'Deutsch', secondary: false},
					{key: 'fr-be', name: 'Belge', secondary: 'fr'}
				]);
			});
		});

		xit('should set secondary fallback', function() {
			$$.configuration({
				secondary: {
					en: false,
					fr: 'en',
					de: 'fr',
					'fr-be': 'de'
				}
			});

			expect($$.getLocales({secondary: true})).toEqual([false, 'en', 'fr', 'de']);

			$$.configuration({
				secondary: {
					en: 'fr',
					fr: false
				}
			});

			expect($$.getLocales({secondary: true})).toEqual(['fr', false, 'fr', 'de']);
			expect(this.logError).not.toHaveBeenCalled();
		});

		xit('should not set secondary circular fallback', function() {
			$$.configuration({
				secondary: {
					en: 'fr-be',
					fr: 'en',
					de: 'fr',
					'fr-be': 'de'
				}
			});

			expect($$.getLocales({secondary: true})).toEqual([false, false, false, 'fr']);
			expect(this.logError).toHaveBeenCalled();
			expect(this.logError.calls.count()).toEqual(1);

			$$.configuration({
				secondary: {
					fr: 'fr-be'
				}
			});

			expect($$.getLocales({secondary: true})).toEqual([false, false, false, 'fr']);
			expect(this.logError.calls.count()).toEqual(2);
		});

		xit('should ignore unknown secondary fallback', function() {
			$$.configuration({
				secondary: {
					en: 42,
					fr: 'it',
					de: 'en', // ← this one is valid and should be stored
					'fr-be': {en: true}
				}
			});

			expect($$.getLocales({secondary: true})).toEqual([false, false, 'en', 'fr']);
			expect(this.logWarn).toHaveBeenCalled();
			expect(this.logWarn.calls.count()).toEqual(3);
		});

		it('should reset configuration for locales', function() {
			$$.configuration({locales: ['en', 'fr']});
			expect($$.getLocales()).toEqual(['en', 'fr']);
			expect($$.getLocales({name: true})).toEqual(['English', 'Français']);

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
				'Deutsch',
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
				'Deutsch',
				'Belge'
			]);
		});

		describe('$$.getData()', function() {
			beforeEach(function() {
				$$.configuration({
					dictionary: {
						'seventy': {
							en: 'seventy',
							fr: 'soixante-dix',
							de: 'siebzig',
							'fr-be': 'septante'
						},
						'cat': {
							en: 'cat',
							fr: 'chat',
							de: 'Katze',
							'fr-be': 'chat'
						}
					}
				});
			});

			afterEach(function() {
				$$.clearData();
			});

			it('should get data loaded', function() {
				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy',
						cat: 'cat'
					},
					fr: {
						seventy: 'soixante-dix',
						cat: 'chat'
					},
					de: {
						seventy: 'siebzig',
						cat: 'Katze'
					},
					'fr-be': {
						seventy: 'septante',
						cat: 'chat'
					}
				});
			});

			it('should get data of a language only', function() {
				expect($$.getData('de')).toEqual({
					seventy: 'siebzig',
					cat: 'Katze'
				});

				expect($$.getData({key: 'de'})).toEqual({
					seventy: 'siebzig',
					cat: 'Katze'
				});

				expect($$.getData({locale: 'de'})).toEqual({
					seventy: 'siebzig',
					cat: 'Katze'
				});
			});

			it('should get data loaded formatted as dictionary', function() {
				expect($$.getData({format: 'dictionary'})).toEqual({
						'seventy': {
							en: 'seventy',
							fr: 'soixante-dix',
							de: 'siebzig',
							'fr-be': 'septante'
						},
						'cat': {
							en: 'cat',
							fr: 'chat',
							de: 'Katze',
							'fr-be': 'chat'
						}
					});
			});

			it('should get data by using all options', function() {
				expect($$.getData({key: 'fr-be', format: 'dictionary'})).toEqual({
					'seventy': {
						'fr-be': 'septante'
					},
					'cat': {
						'fr-be': 'chat'
					}
				});
			});

			it('should keep previous data when resetting locales', function() {
				$$.configuration({locales: ['en', 'fr', 'de', 'fi']});
				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy',
						cat: 'cat'
					},
					fr: {
						seventy: 'soixante-dix',
						cat: 'chat'
					},
					de: {
						seventy: 'siebzig',
						cat: 'Katze'
					},
					fi: null
				});
			});
		});

		describe('$$.clearData()', function() {
			beforeEach(function() {
				$$.configuration({
					dictionary: {
						'seventy': {
							en: 'seventy',
							fr: 'soixante-dix',
							de: 'siebzig',
							'fr-be': 'septante'
						}
					}
				});
			});

			afterEach(function() {
				$$.clearData();
			});

			it('should clear all data', function() {
				$$.clearData();

				expect($$.getData()).toEqual({
					en: null,
					fr: null,
					de: null,
					'fr-be': null
				});
			});

			it('should clear data of a language', function() {
				$$.clearData('fr');

				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy'
					},
					fr: null,
					de: {
						seventy: 'siebzig'
					},
					'fr-be': {
						seventy: 'septante'
					}
				});
			});
		});

		describe('load raw dictionary', function() {
			beforeEach(function() {
				$$.configuration({
					dictionary: {
						'seventy': {
							en: 'seventy',
							fr: 'soixante-dix',
							de: 'siebzig',
							'fr-be': 'septante'
						}
					}
				});
			});

			afterEach(function() {
				$$.clearData();
			});

			it('should load raw dictionary', function() {
				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy'
					},
					fr: {
						seventy: 'soixante-dix'
					},
					de: {
						seventy: 'siebzig'
					},
					'fr-be': {
						seventy: 'septante'
					}
				});
				expect($$.getLocales({data: 'seventy'})).toEqual(['seventy', 'soixante-dix', 'siebzig', 'septante']);
			});

			it('should not reset previous data on raw dictionary', function() {
				$$.configuration({
					dictionary: {
						cat: {
							en: 'cat',
							fr: 'chat',
							de: 'Katze',
							'fr-be': 'chat'
						}
					}
				});

				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy',
						cat: 'cat'
					},
					fr: {
						seventy: 'soixante-dix',
						cat: 'chat'
					},
					de: {
						seventy: 'siebzig',
						cat: 'Katze'
					},
					'fr-be': {
						seventy: 'septante',
						cat: 'chat'
					}
				});
				expect($$.getLocales({data: 'seventy'})).toEqual(['seventy', 'soixante-dix', 'siebzig', 'septante']);
				expect($$.getLocales({data: 'cat'})).toEqual(['cat', 'chat', 'Katze', 'chat']);
			});

			it('should load partial raw dictionary', function() {
				$$.configuration({
					dictionary: {
						cat: {
							en: 'cat',
							fr: 'chat',
							de: 'Katze'
						}
					}
				});

				expect($$.getLocales({data: 'cat'})).toEqual(['cat', 'chat', 'Katze', undefined]);
			});

			it('should reject outscope dictionary', function() {
				var data = $$.getData();
				$$.configuration({
					dictionary: {
						'cube': {
							it: 'cubo',
							gr: 'κύβος',
							jp: 'キューブ',
							fi: 'kuutio'
						}
					}
				});

				expect($$.getData()).toEqual(data);
			});
		});

		describe('load raw data', function() {
			beforeEach(function() {
				$$.configuration({
					data: {
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: {
							seventy: 'siebzig'
						},
						'fr-be': {
							seventy: 'septante'
						}
					}
				});
			});

			afterEach(function() {
				$$.clearData();
			});

			it('should load raw data', function() {
				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy'
					},
					fr: {
						seventy: 'soixante-dix'
					},
					de: {
						seventy: 'siebzig'
					},
					'fr-be': {
						seventy: 'septante'
					}
				});
				expect($$.getLocales({data: 'seventy'})).toEqual(['seventy', 'soixante-dix', 'siebzig', 'septante']);
			});

			it('should not reset previous data on raw data', function() {
				$$.configuration({
					data: {
						en: {
							cat: 'cat'
						},
						fr: {
							cat: 'chat'
						},
						de: {
							cat: 'Katze'
						},
						'fr-be': {
							cat: 'chat'
						}
					}
				});

				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy',
						cat: 'cat'
					},
					fr: {
						seventy: 'soixante-dix',
						cat: 'chat'
					},
					de: {
						seventy: 'siebzig',
						cat: 'Katze'
					},
					'fr-be': {
						seventy: 'septante',
						cat: 'chat'
					}
				});
				expect($$.getLocales({data: 'seventy'})).toEqual(['seventy', 'soixante-dix', 'siebzig', 'septante']);
				expect($$.getLocales({data: 'cat'})).toEqual(['cat', 'chat', 'Katze', 'chat']);
			});

			it('should load partial raw data', function() {
				$$.configuration({
					data: {
						en: {
							cat: 'cat'
						},
						fr: {
							cat: 'chat'
						},
						de: {
							cat: 'Katze'
						}
					}
				});

				expect($$.getLocales({data: 'cat'})).toEqual(['cat', 'chat', 'Katze', undefined]);
			});

			it('should reject outscope data', function() {
				var data = $$.getData();
				$$.configuration({
					data: {
						it: {'cube': 'cubo'},
						gr: {'cube': 'κύβος'},
						jp: {'cube': 'キューブ'},
						fi: {'cube': 'kuutio'}
					}
				});

				expect($$.getData()).toEqual(data);
			});
		});

		describe('load dynamic dictionary', function() {
			beforeEach(function() {
				jasmine.Ajax.install();

				this.json = {
					'seventy': {
						en: 'seventy',
						fr: 'soixante-dix',
						de: 'siebzig',
						'fr-be': 'septante'
					}
				};
				var json = JSON.stringify(this.json);

				jasmine.Ajax.stubRequest('dictionary.json').andReturn({
					'status': 200,
					'contentType': 'text/plain',
					'responseText': json
				});
			});

			afterEach(function() {
				$$.clearData();
				jasmine.Ajax.uninstall();
				this.json = null;
			});

			it('should retrieve the dictionary from json', function() {
				var spy = jasmine.createSpy('onLocaleReady');
				$$.configuration({
					dictionary: 'dictionary.json',
					onLocaleReady: spy
				});

				expect(jasmine.Ajax.requests.count()).toBe(1);
				var request = jasmine.Ajax.requests.mostRecent();

				expect(request.method).toBe('GET');
				expect(request.url).toBe('dictionary.json');
				expect(spy).toHaveBeenCalled();

				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy'
					},
					fr: {
						seventy: 'soixante-dix'
					},
					de: {
						seventy: 'siebzig'
					},
					'fr-be': {
						seventy: 'septante'
					}
				});
			});

			it('should retrieve the dictionary from function', function() {
				var spy = jasmine.createSpy('onLocaleReady');
				var spyDico = jasmine.createSpy('dictionary').and.returnValue(this.json);
				$$.configuration({
					dictionary: spyDico,
					onLocaleReady: spy
				});

				expect(jasmine.Ajax.requests.count()).toBe(0);
				expect(spyDico).toHaveBeenCalled();
				expect(spy).toHaveBeenCalled();

				expect($$.getData()).toEqual({
					en: {
						seventy: 'seventy'
					},
					fr: {
						seventy: 'soixante-dix'
					},
					de: {
						seventy: 'siebzig'
					},
					'fr-be': {
						seventy: 'septante'
					}
				});
			});
		});

		describe('load dynamic data', function() {
			beforeEach(function() {
				jasmine.Ajax.install();
			});

			afterEach(function() {
				$$.clearData();
				jasmine.Ajax.uninstall();
			});

			describe('synchronously', function() {
				beforeEach(function() {
					var dico = JSON.stringify({
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: {
							seventy: 'siebzig'
						},
						'fr-be': {
							seventy: 'septante'
						}
					});
					var dico_en = JSON.stringify({
						en: {'seventy': 'seventy'}
					});
					var dico_fr = JSON.stringify({
						fr: {'seventy': 'soixante-dix'}
					});
					var dico_de = JSON.stringify({
						de: {'seventy': 'siebzig'}
					});
					var dico_be = JSON.stringify({
						'fr-be': {'seventy': 'septante'}
					});

					jasmine.Ajax.stubRequest('dictionary.json').andReturn({
						'status': 200,
						'contentType': 'text/plain',
						'responseText': dico
					});
					jasmine.Ajax.stubRequest('dictionary-en.json').andReturn({
						'status': 200,
						'contentType': 'text/plain',
						'responseText': dico_en
					});
					jasmine.Ajax.stubRequest('dictionary-fr.json').andReturn({
						'status': 200,
						'contentType': 'text/plain',
						'responseText': dico_fr
					});
					jasmine.Ajax.stubRequest('dictionary-de.json').andReturn({
						'status': 200,
						'contentType': 'text/plain',
						'responseText': dico_de
					});
					jasmine.Ajax.stubRequest('dictionary-be.json').andReturn({
						'status': 200,
						'contentType': 'text/plain',
						'responseText': dico_be
					});
				});

				it('should retrieve the data from json in lazy mode', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					$$.configuration({
						defaultLocale: 'en',
						data: {
							en: 'dictionary-en.json',
							fr: 'dictionary-fr.json',
							de: 'dictionary-de.json',
							'fr-be': 'dictionary-be.json'
						},
						onLocaleReady: spy,
						syncLoading: true
					});

					expect(jasmine.Ajax.requests.count()).toBe(1);
					var request = jasmine.Ajax.requests.mostRecent();

					expect(request.method).toBe('GET');
					expect(request.url).toBe('dictionary-en.json');
					expect(spy).toHaveBeenCalled();

					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: null,
						de: null,
						'fr-be': null
					});

					$$.setLocale('fr');
					expect(spy.calls.count()).toEqual(2);
					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: null,
						'fr-be': null
					});
				});

				it('should retrieve the data from json in non-lazy mode', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					$$.configuration({
						defaultLocale: 'en',
						data: {
							en: 'dictionary-en.json',
							fr: 'dictionary-fr.json',
							de: 'dictionary-de.json',
							'fr-be': 'dictionary-be.json'
						},
						onLocaleReady: spy,
						lazyLoading: false,
						syncLoading: true
					});

					expect(jasmine.Ajax.requests.count()).toBe(4);
					expect(spy).toHaveBeenCalled();
					expect(spy.calls.count()).toEqual(1);

					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: {
							seventy: 'siebzig'
						},
						'fr-be': {
							seventy: 'septante'
						}
					});

					$$.setLocale('fr');
					expect(jasmine.Ajax.requests.count()).toBe(4);
					expect(spy.calls.count()).toEqual(2);
					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: {
							seventy: 'siebzig'
						},
						'fr-be': {
							seventy: 'septante'
						}
					});
				});

				it('should retrieve the data from one json', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					$$.configuration({
						defaultLocale: 'en',
						data: 'dictionary.json',
						onLocaleReady: spy,
						lazyLoading: false,
						syncLoading: true
					});

					expect(jasmine.Ajax.requests.count()).toBe(1);
					expect(spy).toHaveBeenCalled();
					expect(spy.calls.count()).toEqual(1);

					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: {
							seventy: 'siebzig'
						},
						'fr-be': {
							seventy: 'septante'
						}
					});

					$$.setLocale('fr');
					expect(jasmine.Ajax.requests.count()).toBe(1);
					expect(spy.calls.count()).toEqual(2);
					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: {
							seventy: 'soixante-dix'
						},
						de: {
							seventy: 'siebzig'
						},
						'fr-be': {
							seventy: 'septante'
						}
					});
				});

				it('should retrieve the data from function in lazy mode', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					var spyEn = jasmine.createSpy('dictionary_En');
					var spyFr = jasmine.createSpy('dictionary_Fr');
					var spyDe = jasmine.createSpy('dictionary_De');
					var spyBe = jasmine.createSpy('dictionary_Be');
					$$.configuration({
						defaultLocale: 'en',
						data: {
							en: spyEn,
							fr: spyFr,
							de: spyDe,
							'fr-be': spyBe
						},
						onLocaleReady: spy,
						syncLoading: true
					});

					expect(jasmine.Ajax.requests.count()).toBe(0);
					expect(spy).not.toHaveBeenCalled();
					expect(spyEn).toHaveBeenCalled();
					expect(spyFr).not.toHaveBeenCalled();
					expect(spyDe).not.toHaveBeenCalled();
					expect(spyBe).not.toHaveBeenCalled();

					$$.setLocale('fr');
					expect(spy).not.toHaveBeenCalled();
					expect(spyFr).toHaveBeenCalled();
					expect(spyDe).not.toHaveBeenCalled();
					expect(spyBe).not.toHaveBeenCalled();
				});

				it('should retrieve the data from function in non-lazy mode', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					var spyEn = jasmine.createSpy('data_En');
					var spyFr = jasmine.createSpy('data_Fr');
					var spyDe = jasmine.createSpy('data_De');
					var spyBe = jasmine.createSpy('data_Be');
					$$.configuration({
						defaultLocale: 'en',
						data: {
							en: spyEn,
							fr: spyFr,
							de: spyDe,
							'fr-be': spyBe
						},
						onLocaleReady: spy,
						syncLoading: true,
						lazyLoading: false
					});

					expect(jasmine.Ajax.requests.count()).toBe(0);
					expect(spy).not.toHaveBeenCalled();
					expect(spyEn).toHaveBeenCalled();
					expect(spyFr).toHaveBeenCalled();
					expect(spyDe).toHaveBeenCalled();
					expect(spyBe).toHaveBeenCalled();
				});

				it('should retrieve all data from function', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					var spyDico = jasmine.createSpy('data');
					$$.configuration({
						defaultLocale: 'en',
						data: spyDico,
						onLocaleReady: spy,
						syncLoading: true
					});

					expect(jasmine.Ajax.requests.count()).toBe(0);
					expect(spy).not.toHaveBeenCalled();
					expect(spyDico).toHaveBeenCalled();
				});
			});

			describe('asynchronously', function() {
				it('should retrieve the data from json in asynchronous mode', function() {
					var spy = jasmine.createSpy('onLocaleReady');
					$$.configuration({
						defaultLocale: 'en',
						syncLoading: false,
						data: {
							en: 'dictionary-en.json',
							fr: 'dictionary-fr.json',
							de: 'dictionary-de.json',
							'fr-be': 'dictionary-be.json'
						},
						onLocaleReady: spy
					});

					expect(jasmine.Ajax.requests.count()).toBe(1);
					var request = jasmine.Ajax.requests.mostRecent();

					expect(request.method).toBe('GET');
					expect(request.url).toBe('dictionary-en.json');
					expect(spy).not.toHaveBeenCalled();

					request.respondWith({
						'status': 200,
						'contentType': 'text/plain',
						'responseText': '{"seventy": "seventy"}'
					});

					expect(spy).toHaveBeenCalled();
					expect($$.getData()).toEqual({
						en: {
							seventy: 'seventy'
						},
						fr: null,
						de: null,
						'fr-be': null
					});
				});
			});
		});

		xit('should configure all locales options at once', function() {
			var spyEn = jasmine.createSpy('data_En');
			var spyFr = jasmine.createSpy('data_Fr');

			$$.configuration({
				defaultLocale: 'en',
				localeSet: [{
					locale: 'en',
					localeName: 'English',
					secondary: false,
					data: spyEn
				}, {
					key: 'fr',
					name: 'Français',
					seconadary: 'en',
					data: spyFr
				}]
			});

			expect($$.getLocales({key: true, name: true, secondary: true})).toEqual([
				{key: 'en', name: 'English', secondary: false},
				{key: 'fr', name: 'Français', secondary: 'en'}
			]);
			expect(spyEn).toHaveBeenCalled();
			expect(spyFr).not.toHaveBeenCalled();

			$$.setLocale('fr');
			expect(spyFr).toHaveBeenCalled();
		});

		describe('addItem()', function() {
			afterEach(function() {
				$$.clearData();
			});

			it('should add a new entry', function() {
				$$.addItem('seventy', {
					en: 'seventy',
					fr: 'soixante-dix',
					de: 'siebzig',
					'fr-be': 'septante'
				});

				expect($$.getLocales({data: 'seventy'})).toEqual(['seventy', 'soixante-dix', 'siebzig', 'septante']);
			});

			it('should replace a previous entry', function() {
				$$.addItem('seventy', {
					en: 'seventy',
					fr: 'seventy',
					de: 'seventy',
					'fr-be': 'seventy'
				});

				$$.addItem('seventy', {
					en: 'seventy',
					fr: 'soixante-dix',
					de: 'siebzig',
					'fr-be': 'septante'
				});

				expect($$.getLocales({data: 'seventy'})).toEqual(['seventy', 'soixante-dix', 'siebzig', 'septante']);
			});
		});
	});

	describe('basic translations', function() {
		beforeEach(function() {
			this.logInfo = jasmine.createSpy('logInfo');
			this.logWarn = jasmine.createSpy('logWarn');
			this.logError = jasmine.createSpy('logError');

			$$.configuration({
				locales: ['en', 'fr', 'fr-be'],
				dictionary: {
					seventy: {
						en: 'seventy',
						fr: 'soixante-dix',
						'fr-be': 'septante'
					},
					cat: {
						en: 'cat',
						fr: 'chat'
					}
				},
				secondary: {
					'fr-be': 'fr'
				},
				log: {
					info: this.logInfo,
					warn: this.logWarn,
					error: this.logError
				}
			});
			$$.setLocale('en');
		});

		afterEach(function() {
			$$.clearData();
		});

		xit('should translate the key', function() {
			expect($$('seventy')).toBe('seventy');
			$$.setLocale('fr');
			expect($$('seventy')).toBe('soixante-dix');
			$$.setLocale('fr-be');
			expect($$('seventy')).toBe('septante');
		});

		xit('should fallback the translation', function() {
			$$.setLocale('fr-be');

			expect($$('cat')).toBe('chat');
			expect(this.logWarn).not.toHaveBeenCalled();

			expect($$('unknown')).toBe('unknown');
			expect(this.logWarn).toHaveBeenCalled();
		});

		xit('should support object entry', function() {
			expect($$({
				en: 'Hi',
				fr: 'Salut'
			})).toBe('Hi');

			$$.setLocale('fr');
			expect($$({
				en: 'Hi',
				fr: 'Salut'
			})).toBe('Salut');
		});

		xit('should fallback the translation with object entry', function() {
			$$.setLocale('fr-be');
			expect($$({
				en: 'Hi',
				fr: 'Salut'
			})).toBe('Salut');

			expect(this.logWarn).not.toHaveBeenCalled();

			expect($$({
				en: 'Hi'
			})).toBe('');
			expect(this.logWarn).toHaveBeenCalled();
		});
	});

});
