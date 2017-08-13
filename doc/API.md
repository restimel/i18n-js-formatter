# API

* [i18n()](#i18n)
  * [i18n(str)](#i18nstr)
  * [i18n(object)](#i18nobject)
  * [i18n``str`` (ES6 tagged template)](#i18nstr-1)
* [i18n.parse(str)](#i18nparsestr)
* [i18n.context(str, str)](#i18ncontextstr-str)
* [i18n.c(str, str)](#i18ncontextstr-str)
* [i18n.n()](#i18nn)
* [i18n.loadFormatter()](#i18nloadformatter)
  * [i18n.loadFormatter(formatterFunction)](#i18nloadformatterformatterfunction)
  * [i18n.loadFormatter(options)](#i18nloadformatteroptions)
* [i18n.getRules(locale?)](#i18ngetruleslocale)
* [i18n.html()](#i18nhtml)
  * [i18n.html(Node?)](#i18nhtmlnode)
  * [i18n.html(Node[])](#i18nhtmlnode-1)
* [i18n.configuration(options)](#i18nconfigurationoptions)
* [i18n.setLocale(str)](#i18nsetlocalestr)
* [i18n.getLocale(options?)](#i18ngetlocaleoptions)
* [i18n.getLocales(options?)](#i18ngetlocalesoptions)
* [i18n.clearData(str?)](#i18ncleardatastr)
* [i18n.getData(options?)](#i18ngetdataoptions)
  * [i18n.getData(str)](#i18ngetdatastr)
* [i18n.addItem(str, dictionary)](#i18nadditemstr-dictionary)
* [i18n.addCtxItem(str, str, dictionary)](#i18naddctxitemstr-str-dictionary)

[Back to menu](index.md) | [Back to main page](../README.md)

## i18n()

Translates a single expression. Returns translated parsed and substituted string. If the translation is not found it returns the expression given.

The first argument can be a string or an object. In all cases following arguments will be used as arguments of formatting functions.

### i18n(str)

Translates the given string.

    // (locale == 'fr')
    i18n('Hello'); // Salut

### i18n(object)

Get the string to translate from the object and may apply some options.
They are 2 main usage:
    * when object contains translation of different locales (dictionary object)

    // (locale == 'fr')
    i18n({
        en: 'Hello',
        fr: 'Salut'
    }); // Salut

    * When object contains different options:
    // give a context
    // (locale == 'fr')
    i18n({str: 'Hello', context: 'phone greeting'}); // Allo
    // which is equivalent to
    i18n.context('phone greeting', 'Hello'); // Allo

    // passing specific locale
    // (locale == 'fr')
    i18n({str: 'Hello', locale: 'de'}); // Hallo

It is possible to use different options at once but "string" (or "str") must be provided (otherwise it considers the object as a dictionary object).

Option properties:
* **string** or **str**: the sentence to look for and translate
* **context** or **ctx** or **c**: the context (see [context section](#i18ncontextstr-str) for more explanation).
* **parse**: if true, it does not translate the string (see [parse section](#i18nparsestr) for more explanation)
* **locale** or **lng**: force a specific locale (and not use the default one).

### i18n``str``
__It is not fully supported yet__

i18n can be used as ES6 templates

    // using ES6
    // (locale == 'fr')
    i18n`Hello`; // Salut

The dictionary will look for 'Hello'.

    // ES6 templates
    // (locale == 'fr')
    i18n`Hello ${'Restimel'}%s.` // Salut Restimel.

The string which will be translated will be 'Hello %s.'. The string 'restimel' will be given as first argument in formatter.

To work properly, you must have a formatter and add '%s' (or any other markers) which will be replaced by your formatter.

### Formatting

The formatters are also called on each translation string:

    i18n.setLocale('fr');
    i18n('Hello %s', 'Restimel'); // Salut Restimel
    i18n('Hello %(name)s', { name: 'Restimel' }); // Salut Restimel

**WARNING**: Depending of what you download, there may be no formatter loaded. You can load your own with [i18n.loadFormatter()](#i18nloadformatter).


## i18n.parse(str)

It formats a string without translating it.

#### Example:

    i18n.parse('Hello %s', 'Restimel'); // Hello Restimel
    i18n.parse('Hello %(name)s', { name: 'Restimel' }); // Hello Restimel

_Note_: calling directly i18n.parse will not prompt warning log if the key string is not in data dictionary.

This can be usefull for only displaying data without adding entries in dictionaries.

    // (locale == 'fr')
    i18n.parse('%i', 1234); // 1 234

You must have a formatter loaded to do such operations!


## i18n.context(str, str)

Context allows to give more details to some strings and helps to translate it correctly.
Some people also call it namespace.

This is also very usefull for all abreviations.

For example, if you use a string 'min', is it stand for 'minute' or 'minimum' or something else? It is not easy to translate this correctly when you see only the string. This is why the context is for.

#### Usage:
The first argument is the context (this one won't be translated) and the second argument is the string to be translated. All other arguments are for formatting.

    i18n.context('computer key', 'Give the correct key'); // should be translated in French 'Donnez la bonne touche'
    i18n.context('door key', 'Give the correct key'); // should be translated in French 'Donnez la bonne clef'

    i18n.context('computer key', 'key %s', keyValue); // The result will be "key A" if keyValue is worth 'A'

It is also possible to call it with method **c**. It's an alias of method context

    i18n.c('minimum', 'min');

The entry in dictionary are different from string without contextual.

_Note_: Using method context (or c), is equivalent of calling i18n with object containing property *context*.


## i18n.n()
__will be available in version 0.4, syntax may be change at this time__

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

    // template and global (this.locale == 'de')
    i18n.n('%s cat', '%s cats', 1); // 1 Katze
    i18n.n('%s cat', '%s cats', 3); // 3 Katzen

    //using numeric values
    i18n.n({
        0: 'no cats',
        1: 'a cat',
        default: '%s cats'
    }, quantity);


## i18n.loadFormatter()

An inner formatter is provided but you can load different formatter and load the inner one.

It is possible to add several formatter and they will be all called.

loadFormatter helps to load all these formatters.

### i18n.loadFormatter(formatterFunction)

To load a formatter to the i18n API, you must prove the function which will do the formatting:

    i18n.loadFormatter(formatterFunction);

The formatter function will be called with 3 arguments:

* text {String}: this is the raw text which must be parsed
* args {Any[]}: this is the list of arguments given to replace wildcards.
* sv {Object}: this is an object containing all locale information. sv.currentLocale is the current Locale.

It must return a string.

### i18n.loadFormatter(options)

When several formatters are added, it is possible to order them with the weight attribute, they will be all called one by one in the given order.

    i18n.loadFormatter({
        formatter: formatterFunction,
        weight: 150
    });

By default weight is 100. If the weight is higher than another formatter, the formatter will be called before.

#### sprintf support

src/wrapperSprintf.js contains a simple method to handle Sprintf API as a formatter for i18n API.

If _i18n_config.doNotLoadFormatter is set to true, the sprintf formatter is not automatically added to i18n but you can load the function "callSprintf" manually with the options you want.


## i18n.getRules(locale?)

It retrieves the current formatting rules or the one specified by the first argument.

    i18n.getRules('fr') =>    {
                                number: {
                                    thousandSeparator: ' ',
                                    decimalSeparator: ',',
                                    exponentialSeprator: 'e'
                                }
                            }

    // in locale (en)
    i18n.getRules() =>    {
                            number: {
                                thousandSeparator: ',',
                                decimalSeparator: '.',
                                exponentialSeprator: 'e'
                            }
                        }

See formatter section to get more details about Rules values


## i18n.html()

Change text of all HTML nodes which have a `data-i18n` attribute. It uses it as key and replace the text content by the translation.

This feature allows to change language without rerendering everything. This also helps when using HTML template library where it can be difficult to call a JavaScript function.

_Note_: this method cannot be called when it is executed in workers or at server side. There must be DOM API available.

### i18n.html(Node?)

#### Usage:
The first argument is the root node to look for all nodes which have a data-i18n atrribute.

If no argument is given, the root node is `document`.

#### Example:

    <section>
        <header data-i18n="hello"></header>
        <p>not changed text</p>
        <p data-i18n="a text"></p>
    </section>

After using `i18n.html(document.querySelector('section'))` it renders like (translated in french):

    <section>
        <header data-i18n="hello">salut</header>
        <p>not changed text</p>
        <p data-i18n="a text">un texte</p>
    </section>

Be careful, this feature may remove any child nodes. The data-i18n attribute should be located on leaf nodes to avoid any lose.

This feature requires that browser supports dataset API.

_Note_: Currently, it supports only static strings (no formating).

### i18n.html(Node[])

It is possible to give several root nodes. In such case replacement will be done only for these elements and their children.

This argument can be either an array either a NodeList.


## i18n.configuration(options)

Change the default configuration to the ones specified in options.


Define locale to use

    i18n.configuration({locales: ['en', 'fr', 'de']}); // accepted locales are only 'en', 'fr' and 'de'
    i18n.configuration({localeName: {'en': 'English', 'fr': 'Français'}}); // set name for locales

Define locale configuration at once

    i18n.configuration({localeSet: [
        {
            key: 'en',
            name: 'English',
            data: 'dictionary-en.json'
        },
        {
            key: 'fr',
            name: 'Français',
            data: 'dictionary-fr.json',
            formatRules: {
                number: {
                    thousandSeparator: ' ',
                    decimalSeparator: ','
                }
            }
        },
        {
            key: 'fr-be',
            name: 'Belge',
            data: 'dictionary-be.json',
            formatRules: {
                number: {
                    thousandSeparator: ' ',
                    decimalSeparator: ','
                }
            }
        }
    ]});

Change the way to use the library

    i18n.configuration({alias: '_'}); // now it is possible to use _ instead of i18n
    _.setLocale('fr');
    _('cat'); // returns "chat"


## i18n.setLocale(str)

Set the current locale.

    // set locale to french
    i18n.setLocale('fr');
    i18n.setLocale('fr-FR');

    // set locale depending of browser context
    i18n.setLocale(); //equivalent to i18n.setLocale(navigator.language);

_Note_: if you have put a storage system (cookie, localStorage), i18n.setLocale() will use the last locale used in the browser.

Returns a boolean.
It return true if the locale has been changed, false otheriwse (for example if the given locale was the one already in use).

## i18n.getLocale(options?)

Get the current locale.

The option argument is to precise which information to retrieve.
If only one option is given, it returns a string.
If several options are given, it returns an object with the given options properties.

#### Options:
* **key** or **locale** _{Boolean}_: if true, retrieves the locale key
* **name** _{Boolean}_: if true, retrieves the locale full name
* **data** _{string}_: retrieve the given string as it is in the locale dictionary.

If no argument is given, it returns the locale key.

#### Example:

    i18n.setLocale('fr');
    i18n.getLocale(); // 'fr'
    i18n.getLocale({locale: true}); // 'fr'
    i18n.getLocale({key: true}); // 'fr'
    i18n.getLocale({name: true}); // 'Français'
    i18n.getLocale({locale: true, name: true}); // {locale: 'fr', name: 'Français'}
    i18n.getLocale({key: true, name: true}); // {key: 'fr', name: 'Français'}
    i18n.getLocale({data: 'hello'}); // 'salut'


## i18n.getLocales(options?)

Returns a whole catalog based on current locale.
Options are the same as in [i18n.getLocale()](#i18ngetlocaleoptions).

    i18n.getLocales(); // ['en', 'fr', 'de']
    i18n.getLocales({locale: true}) // ['en', 'fr', 'de']
    i18n.getLocales({key: true}) // ['en', 'fr', 'de']
    i18n.getLocales({name: true}) // ['English', 'Français', 'Deutsch']
    i18n.getLocales({data: 'hello'}) // ['hello', 'salut', 'hallo']
    i18n.getLocales({locale: true, name: true, data:'hello'}) // [{locale: 'en', name: 'English', data: 'hello'}, {locale: 'fr', name: 'Français', data: 'salut'}, {locale: 'de', name: 'Deutsch', data: 'hallo'}]


## i18n.clearData(str?)

Clear all dictionary data or only the given one.

    i18n.clearData(); // clear data of all dictionaries
    i18n.clearData('fr'); // clear data of the french dictionary only


## i18n.getData(options?)

It is possible to retrieve the current loaded entries with getData.

Returns an object formatted in data format or in dictionary format (depending of options) ([Read more information about data format and dictionary format](format.md)).

#### Options:
* **format** _{'data' or 'dictionary'}_: format the result. By default the _data_ format is used.
* **locale** _{string}_: retrieve only items from the given locale (by default all locales are retrieved).

#### Example:

    i18n.getData(); // returns all data in data format
    i18n.getData({format: 'dictionary'}); // returns all data in dictionary format
    i18n.getData({locale: 'en', format: 'dictionary'}); // returns all data of English language in dictionary format

### i18n.getData(str)

It is possible to tell which locale we want to retrieve (in data format) only by giving the locale key.

    i18n.getData('en'); // returns all data of English language in data format


## i18n.addItem(str, dictionary)

It is possible to add new entry in the data.

The first argument is the sentence key.
The second argument is the translation in each locale.

    i18n.addItem('new sentence to add', {
        en: 'the English version',
        fr: 'the French version'
    });


## i18n.addCtxItem(str, str, dictionary)

Same as addItem but add a context to the sentence

The first argument is the context.
The second argument is the sentence key.
The third argument is the translation in each locale.

    i18n.addCtxItem('Some context','new sentence to add', {
        en: 'the English version',
        fr: 'the French version'
    });


[Back to menu](index.md) | [Back to main page](../README.md)