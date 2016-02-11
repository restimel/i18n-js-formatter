#!/bin/bash

if ! type "uglifyjs" >& /dev/null; then
  echo ""
  echo "uglify is not installed yet."
  echo "Type 'npm install uglify-js -g' to install it."
  echo ""
  exit 1
fi

# https://github.com/mishoo/UglifyJS2
uglifyjs i18n-js-formatter.js -c --preamble="/* https://github.com/restimel/i18n-js-formatter */" -o i18n-js-formatter.min.js
echo "i18n-js-formatter.min.js has been generated"

uglifyjs i18n-js-formatter.js script/s_formatter.js -c --preamble="/* https://github.com/restimel/i18n-js-formatter */" -o i18n-js-formatter.full.min.js
echo "i18n-js-formatter.full.min.js has been generated"
