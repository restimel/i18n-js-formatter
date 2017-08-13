# Download, Installation and Configuration

* [Installation](#installation)
* [Download](#download)

[Back to menu](index.md) | [Back to main page](../README.md)


## Installation
### old way

You only have to insert the i18n-js-formatter.js file in your web page.

	<script src="i18n-js-formatter.js"></script>

By default, i18n is defined in global variables. It is possible to set another name by configuration (and not set i18n) but you need to write configuration first in `_i18_config` variable.

  <script>
    var _i18_config = {
      doNotAliasi18n: true,
      alias: "_"
    };
  </script>
  <script src="i18n-js-formatter.js"></script>

For all option configurations see [configuration documentation](configuration.md#configuration).

### From modules

It can be loaded liek an AMD module, a nodeJS module or an ES6 module.
	
	var i18n = require("i18n-js-formatter");
	import i18n from "i18n-js-formatter";

There are no global variables set if it it is loaded in such context.


## Download

Get the minified version of

[the i18n API](https://restimel.github.io/i18n-js-formatter/i18n-js-formatter.min.js)

[the full API (i18n API + formatter)](https://restimel.github.io/i18n-js-formatter/i18n-js-formatter.full.min.js)

Get source files:

[i18n library](https://restimel.github.io/i18n-js-formatter/i18n-js-formatter.js)

[sprintf wrapper](https://restimel.github.io/i18n-js-formatter/script/wrapperSprintf.js) (to load it as formatter) note: you must also load sprintf

[inner formatter](https://restimel.github.io/i18n-js-formatter/script/wrapperSprintf.js) (the one described below)

You don't need both sprintf wrapper and the inner formatter. Only one is enough ;)


[Back to menu](index.md) | [Back to main page](../README.md)