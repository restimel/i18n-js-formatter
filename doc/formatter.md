# i18n formatter

* [formatter usage](#formatter-usage)
  * [Summary](#summary)
  * [Usage](#usage)
  * [special character](#special-character)
  * [string format (s)](#string-format-s)
    *[Default configuration](#default-configuration)
    *[Conversion configuration](#conversion-configuration)
  * [number format (d, D, e, f, F, i)](#number-format-d-d-e-f-f-i)
    * [Separator configuration](#separator-configuration)
  * [date format (T)](#date-format-t)
    * [strftime format](#strftime-format)
    * [Textual configuration](#textual-format)
  * [duration format (t)](#mduration-format-t)
    * [Textual configuration](#textual-format-1)

[Back to menu](index.md) | [Back to main page](../README.md)


A formatter is provided with the i18n-js-formatter library but as many wants to use their own formatters (like sprintf), this formatter is not loaded by default.

To load it, you must include the script "script/s_formatter.js".
If you have set _i18n_config.doNotLoadFormatter to true, then you should load it into the i18n manager explicitely:

	i18n.loadFormatter(s_formatter);

## formatter usage

### Summary

| Code | output | result in English with example: '98765.43' |
|:----:| ------ | ------ |
| %% | % | - |
| %f | locale formatted number | 98,765.43 |
| %D | locale formatted number with suffix | 98.765k |
| %d | locale formatted integer number | 98,765 |
| %e | locale formatted number in scientific notation | 9.877e+4 |
| %i | locale formatted integer number | 98,765 |
| %F | raw number | 98765.43 |
| %s | string | 98765.43 |
| %t | duration | 1min 38s 765ms 430µs |
| %T | date | 1/1/1970 00:01:39 AM |

### Usage

A formatting tag starts with a '%' and ends with a character to indicates the kind of output.

	"%s" will display the value as a string
	"%f" will display the value as a number

It is possible to give more information to format it better. The full syntax is **%(position){variation}k**

* *(position)*: [optional]
	If position is a number, it reads the value of the given arguments (starting at 1). Example: i18n('%(2)s %(1)s', 'alpha', 'bravo') => 'bravo alpha'
	If position is a string, it reads the property value of the first argument. Example: i18n('%(foo)s %(bar)s', {foo: 'alpha', bar: 'bravo'}) => 'alpha bravo'
	By default, it refers to the N argument where N is the number of formatting replacement. i18n('%s %s', 'a', 'b') is equivalent to i18n('%(1)s %(2)s', 'a', 'b')
* *{variation}*: [optional]
	Depending to the output format, it allows to change the display (see below for more details). For example, i18n('%{.2}F', 1.2345) => '1.23'
	Many rules can be added, they must be separated by comma. For example, i18n('%{p2, .2, d2}F', 1.2345) => '01.23'
* *k*: the kind of out output, it defines how the output must be interpreted.
	It is composed with a single letter.

### special character

**%%** it displays a single %.

Note: if the format does not follow `%(position){variation}k` then it is not necessary to "escape" the '%'.

### string format (s)

It converts the value to string.
The kind character is "*s*".

Possible variations:

* **case**: convert string to lower case
* **CASE**: convert string to upper case
* **Case**: convert string to lower case except the first character which is upper case
* **CasE**: The first character is set to upper case. Others are stay unchanged.
* **esc:STR**: (STR must be a string of one below) escape the string sequence to be safely inserted in the context defined.
	* **html**: escape string to be safely inserted in HTML. Characters `"<>&` are escaped to &#Unicode; equivalent.
	* **js**: escape string to be evaluated as string in js eval.
	* **regex**: escape special characters to insert the string in a regexp like a simple string.
	* **json**: escape string to be safely added in a JSON as a string. Characters `\"` are escaped to \char; equivalent. Special character are converted to unicode equivalent.
	* **url**: escape string to be safely used as url. Latin characters, numbers and  `-_.!~*'();,/?:@&=+$#` are not escaped. Others are escaped to %Hex equivalent.
	* **uri**: alias of url.
	* **uri6**: escape string to be safely used as url in IP v6 (RFC 3986). Latin characters, numbers and  `-_.!~*'();,/?:@&=+$#[]` are not escaped. Others are escaped to %Hex equivalent.
	* **urlc**: escape string to be safely used as url. Latin characters, numbers and  `-_.!~*'()` are not escaped. Others are escaped to %Hex equivalent.
	* **uric**: alias of urlc.
	* **no**, **raw**: do not escape the string.

#### Default configuration

The default escaping rule is "no" but it can be changed in configuration. This is the default rule which is applied if no escape rule are given.

	i18n.configuration({
		defaultFormat: {
			string: {
				escape: 'html'
			}
		}
	});
	i18n('hey<script>alert("ho")</script>'); //hey&lt;script&gt;alert(&quot;ho&quot;)&lt;/script&gt;

#### Conversion configuration

To manage some conversion from lower case to upper case (and reciprocally), it is possible define how characters must be converted. This is useful for some language.

	i18n.configuration({
		formatRules: {
			tr: {
				string: {
					lowerChars: 'iı',
					upperChars: 'İI'
				}
			}
		}
	});

Parameters are:

* **lowerChars**: {String} Used to define the lower chars for this locale which must be converted to specific chars. Conversion values are taken from upperChars (characters must be in the same order). Example: i18n('%{case}s', 'BİRLEŞIK') => 'birleşik'
	Default value: ''
* **upperChars**: {String} Used to define the upper chars for this locale which must be converted to specific chars. Conversion values are taken from lowerChars (characters must be in the same order). Example: i18n('%{case}s', 'birleşik') => 'BİRLEŞIK'
	Default value: ''

Note: whithout these parameters the lower/upper conversion will change i←→I and not i←→İ and ı←→I

### number format (d, D, e, f, F, i)

It converts the value to number.
The kind character can be either **d**, **D**, **e**, **f**, **F**, **i**.

* **F**: displays a float number as it is in JavaScript whatever is the language. Example: i18n('%F', 1234.56) => '1234.56'
* **f**: displays a float number formatted depending to the locale. Example: i18n('%f', 1234.56) => '1,234.56' (en) or '1 234,56' (fr) (see number parameter options below).
* **D**: displays a float number with suffix. Example: i18n('%D', 1234.56) => '1.23k' | i18n('%D', 0.0123) => '12.3m' (by default, number are rounded to 3 decimals)
* **d**: displays an integer number formatted depending to the locale. Example: i18n('%d', 1234.56) => '1,234' (en) or '1 234' (fr)
* **i**: displays an integer number formatted depending to the locale. Example: i18n('%f', 1234.56) => '1,234' (en) or '1 234' (fr)
* **e**: displays a number in scientific format. Example: i18n('%e', 1234.56) => '1.23456e+3' | i18n('%e', 0.0123) => '1.23e-2'

It supports huge number (higher than 2^53) without rounding the value if the value comes from a string (otherwise JavaScript will round it to the closest writable number by the matrice).

Possible variations:

* **.N**: (N must be a number) it rounds the number to N decimals. Example: i18n('%{.1}F', 1.234) => '1.2'
* **pN**: (N must be a number) The integer part must have at least N digits. It adds 0 before digits to have the right number of digits. Example: i18n('%{p3}F', 12) => '012'
* **dN**: (N must be a number) The decimal part must have at least N digits. It adds 0 after digits to have the right number of digits. Example: i18n('%{d3}F', 1.2) => '1.20'

#### Separator configuration

To manage some parameters it is possible to change some separator depending on the locale.

	i18n.configuration({
		formatRules: {
			en: {
				number: {
					thousandSeparator: ',',
					decimalSeparator: '.'
				}
			}
		}
	});

It is also possible to use the LocaleSet parameter.

	i18n.configuration({
		LocaleSet: [{
			key: 'en',
			formatRules: {
				number: {
					thousandSeparator: ',',
					decimalSeparator: '.'
				}
			}
		}
	});

Parameters are:

* **thousandSeparator**: {String} Used to separate thousand digits. Example: i18n('%f', 1234567) => '1,234,567'
	Default value: ','
* **decimalSeparator**: {String} Used to separate integer part from decimal part. Example: i18n('%f', 123.456) => '123.456' (if separator is '.'), i18n('%f', 123.456) => '123,456' (if separator is ',')
	Default value: '.'
* **exponentialSeparator**: {String} Used by scientific notation. Example: i18n('%e', 1234567) => '1.234567e+6' (if separator is 'e'), i18n('%e', 1234567) => '1.234567 10^+6' (if separator is ' 10^')
	Default value: 'e'
* **SIsuffix**: {Object[]} list of SI suffix and their multipler. The object contain the suffix character (property suffix) and the multipler value (property multiple).
Example: [{suffix: 'M', multiple: 1000000}, {suffix: 'k', multiple: 1000}]
Default value is the list of SI suffixes for all thousand from 10^-15 to 10^15.

### date format (T)
##### not implemented yet :'(

It converts the value to a date.
The kind character is **T**.

* **T**: displays a date from a timestamp. The default unit of the timestamp is milliseconds but it can be set to a different unit with variation. By default it displays like locale JavaScript Date. Example: i18n('%T', 1453129200000) => '1/18/2016, 4:00:00 PM' (en) or '18/1/2016 16:00:00' (fr) or '18.1.2016, 16:00:00' (de) (for a browser in timezone GMT+1).

Be careful the result can depend on the local timezone offset of the browser. To avoid such difference use the variation _{o:N}_ (see below).

The timestamp origin is on 1/1/1970, 1:00:00 AM.

Possible variations:

* **u:S**: (S must be a string) defines the unit of the timestamp. Example: i18n('%{u:s}T', 1453129200) => '1/18/2016, 4:00:00 PM' (en)
S values can be:
	* **µs** for microseconds
	* **ms** for milliseconds (default value)
	* **s** for seconds
	* **min** for minutes
	* **h** for hours
	* **d** for days
	* **m** for months
	* **y** for years

* **o:N**: (N must be a number) displays the date from the given timezone. The number can be preceded by a + or a - (0 is for GMT). Example: i18n('%{o:0}T', 1453129200000) => '1/18/2016, 3:00:00 PM' (en), i18n('%{o:-6}T', 1453129200000) => '1/18/2016, 9:00:00 AM' (en) The result is no more depending of the browser local timezone.
* **$U** or **$UTC**: preset format to display UTC Time
* **f:"S"**: (S must be a string) format the output. Example: i18n('%{f:"%M:%s"}T', 1453130145000) => '15:45', i18n('%{f:"%Mmin %ss"}T', 1453130145000) => '15min 45s'
The formating token are the same recognized by strftime (cf bellow to have the full details).
**f:%"S"**: (S must be a string) format the output. This is the same as f:"S" except that token are not preceded by %. Example: i18n('%{f:%"M:s"}T', 1453130145000) => '15:45' (it is not possible to have the same result as with %{f:"%Mmin %ss"}T )

#### strftime format

Examples are based on date 2016/01/03 02:34:56 PM (which was on Sunday).

| Code | Meaning | Range | Example |
|:----:| ------- | ----- | ------- |
|| *Year* |||
| %Y | The full year with 4 digits | 0000 → 9999 | 2016 |
| %y | Year without century (2 digits) | 00 → 99 | 16 |
| %C | The century (2 digits) | 00 → 99 | 20 |
| %G | Week-based year (ISO-8601) with century (4 digits) | 0000 → 9999 | 2015 |
| %g | Week-based year (ISO-8601) without century (2 digits) | 00 → 99 | 15 |
|| *Month* |||
| %m | Month number (2 digits) | 00 → 12 | 01 |
| %B | Month name (depends on locale) | - | January |
| %b | Abbreviated month name (depends on locale) | - | Jan |
| %h | Abbreviated month name (Alias of %b) | - | Jan |
|| *Week* |||
| %U | Week number (counting the number of Sunday in the year) | 00 → 53 | 01 |
| %W | Week number (counting the number of Monday in the year) | 00 → 53 | 00 |
| %V | Week number (ISO-8601) | 01 → 53 | 53 |
|| *Day* |||
| %d | Day of the month (2 digits) | 01 → 31 | 03 |
| %e | Day of the month (leading 0 is a space) | 1 → 31 |  3 |
| %j | Day of the year (3 digits) | 001 → 366 | 003 |
| %u | Day of the week ISO-8601 (week starts at Monday) | 1 → 7 | 7 |
| %w | Day of the week (week starts at Sunday) | 0 → 6 | 0 |
| %A | Textual day of the week (depends on locale) | - | Sunday |
| %a | Abbreviated textual day of the week (depends on locale) | - | Sun |
|| *Hour* |||
| %H | Hour in 24h format (2 digits) | 00 → 23 | 14 |
| %k | Hour in 24h format (leading 0 is a space) | 0 → 23 | 14 |
| %I | Hour in 12h format (2 digits) | 01 → 12 | 02 |
| %l | Hour in 12h format (leading 0 is a space) | 1 → 12 | 2 |
| %P | lower case 'am'/'pm' | - | pm |
| %p | upper case 'AM'/'PM' | - | PM |
|| *Minute* |||
| %M | Minute (2 digits) | 00 → 59 | 34 |
|| *Second* |||
| %S | Second (2 digits) | 00 → 59 | 56 |
| %s | Number of second since the Epoch (1970-01-01 00:00:00) | - | 1451831696 |
|| *Millisecond* |||
| | nothing standard :'( | | |
|| *Preset code* |||
| %r | equivalent to "%I:%M:%S %p" | - | 02:34:56 PM |
| %R | equivalent to "%H:%M" | - | 14:34 |
| %T | equivalent to "%H:%M:%S" | - | 14:34:56 |
| %D | equivalent to "%m/%d/%y" | - | 01/03/2016 |
| %F | equivalent to "%Y-%m-%d" (ISO 8601 date format) | - | 2016-01-03 |
|| *Special characters* |||
| %% | print a percentage ('%') | % | % |
| %n | print a line feed ('\n') | \n | \n |
| %t | print a tabulation ('\t') | \t | \t |
|| *Not implemented code* |||
| %z | Time zone offset, +hhmm  or  -hhmm  numeric  timezone from UTC | - | - |
| %Z | Time zone name abbreviation (GMT, UTC, EST) | - | - |
| %x | preferred date | - | - |
| %X | preferred time | - | - |
| %c | preferred date and time | - | - |

#### Textual configuration

To manage some parameters it is possible to change textual values depending on the locale.

	i18n.configuration({
		formatRules: {
			en: {
				date: {
					months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
					shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
				}
			}
		}
	});

It is also possible to use the LocaleSet parameter.

	i18n.configuration({
		LocaleSet: [{
			key: 'en',
			formatRules: {
				date: {
					days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
					shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
				}
			}
		}
	});

Parameters are:

* **months**: {String[]} List of month names
* **shortMonths**: {String[]} List of month abbreviated names
* **days**: {String[]} List of day names (starting from Sunday)
* **shortDays**: {String[]} List of day abbreviated names


### duration format (t)

It converts the value to a duration.
The kind character is **t**.

* **t**: displays a duration. The default unit of the value is milliseconds but it can be set to a different unit with variation. By default it displays the most precise unit. Example: i18n('%t', 45123) => '45s 123ms', i18n('%t', 105000) => '1min 45s'.

Possible variations:

* **u:S**: (S must be a string) defines the unit of the value. Example: i18n('%{u:s}t', 4200) => '1h 10min'
S values can be:
	* **µs** for microseconds
	* **ms** for milliseconds (default value)
	* **s** for seconds
	* **m** or **min** for minutes
	* **h** for hours
	* **d** for days
	* **M** or **month** for months
	* **y** for years
* **min:S**: (S must be a string) defines the minimal unit to display (value is floored if it is more precise). Example: i18n('%{min:s}t', 45123) => '45s'
* **max:S**: (S must be a string) defines the maximal unit to display. Example: i18n('%{max:s}t', 105123) => '105s 123ms'
* **n:N**: (N must be a number) defines the maximum number of unit to display. Example: i18n('%{n:1}t', 105123) => '1min', i18n('%{n:2}t', 105123) => '1min 45s', i18n('%{n:10}t', 105123) => '1min 45s 123ms'
* **f:"S"**: (S must be a string) defines the output format. This output is static and the display is no more dynamic regarding the value. Code for describing unit is defined below. These code starts with $. Example: i18n('%{f:"$hh $mmin $ss $ims"}t', 3705123) => '1h 1min 45s 123ms', i18n('%{f:"$h:$m:$s"}t', 3705123) => '1:1:45', i18n('%{f:"$m min"}t', 3705123) => '61 min', i18n('%{f:"$d day $h hour $m min"}t', 3705123) => '0 day 1 hour 1 min', i18n('%{f:"$d day $h hour $s seconds"}t', 3705123) => '0 day 1 hour 105 seconds'
code can be:
| code | meaning | value |
|:----:| ------- | ----- |
|$µ|microseconds||
|$i|milliseconds| = 1000$µ |
|$s|seconds| = 1000$i |
|$m|minutes| = 60$s |
|$h|hours| = 60$m |
|$d|days| = 24$h |
|$M|months| = 30$d |
|$y|years| = 365$d |

Be careful number of months is always computed on 30 days which is not obviously the right number of months.
In the same way number of years is computed on 365 days which is wrong for bissextil years.


#### Textual configuration

To manage some parameters it is possible to change textual values depending on the locale.

	i18n.configuration({
		formatRules: {
			en: {
				duration: {
					µs: 'µs',
					ms: 'ms',
					s: 's',
					min: 'min',
					h: 'h',
					d: 'd',
					month: 'M',
					y: 'y'
				}
			}
		}
	});

It is also possible to use the LocaleSet parameter.

	i18n.configuration({
		LocaleSet: [{
			key: 'en',
			formatRules: {
				duration: {
					µs: 'µs',
					ms: 'ms',
					s: 's',
					min: 'min',
					h: 'h',
					d: 'd',
					month: 'M',
					y: 'y'
				}
			}
		}
	});

Parameters are:

* **ms**: milliseconds unit
* **s**: seconds unit
* **min**: minutes unit
* **h**: hours unit
* **d**: days unit
* **month**: months unit
* **y**: years unit


[Back to menu](index.md) | [Back to main page](../README.md)