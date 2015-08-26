
var KindGenericMethods = '*members*';

//
// This function finds the right part of the string which needs to be considered for the auto-completion. 
// See examples below:
//
// extractTextForAutocompletion('if (app')
// Object {v1: "app", v2: ""}
//
// extractTextForAutocompletion('for (var i=0;i<system.')
// Object {v1: "system", v2: ""}
//
// extractTextForAutocompletion('if (app')
// Object {v1: "app", v2: ""}
//
// extractTextForAutocompletion('if (app.aaa')
// Object {v1: "app", v2: "aaa"} 
//
// extractTextForAutocompletion('var t = system.get')
// Object {v1: " system", v2: "get"}
//
// Note: 
// The logic has been modelled from the chrome console.
// Arguably it has some bugs: 
// the logic does not check if we are part of a string or a comment (not even chrome console does)
// how do I cope with: ((system)).getValue :: Answer: chrome console also does not handle that.
// how do I cope with combined statements: document.getElementById('xxx').se (we don't. Not even chrome copes with it)
// how do I cope with array ? We don't. Not even chrome copes with it. 
// Arguably all of the above are bugs.
//
function extractTextForAutocompletion(code) {

	var isLetterOrDigitOrWhitespaceOrDot = function(ch) { 
		return /[.\w$\s]/.test(ch);
	};
	var resetKind = function() {
		kind = KindGenericMethods;
	}
	var manageContext = function(ch, snip) {
		var parse, args;
		var rFullObject = /\{[^{}]*?\}/g;
		var rFullArray = /\[[^[\]]*?\]/g;
		var rObjMember = /^\{?(?:\s*\w+\s*:[^,{]*,)*\s*(\w+)\s*:\s*{/;

		if (/[,{]/.test(ch)) {
			parse = snip.match(/(?:^|[.])\s*(\w+)\s*\(\s*(\{.*)/);
			if (!parse) {
				return resetKind();
			}
			kind = parse[1];
			args = parse[2];
			while(rFullObject.test(args)) {
				args = args.replace(rFullObject, '');
			}
	
			while(rFullArray.test(args)) {
				args = args.replace(rFullArray, '');
			}

			if (args.lastIndexOf('[') > args.lastIndexOf('{')) {
				return resetKind();
			}

			while(rObjMember.test(args)) {
				parse = args.match(rObjMember);
				kind += '_' + parse[1];
				args = args.replace(rObjMember, '');
			}

			if (/\)\s*\{/.test(args)) {
				return resetKind();
			}
		} else {
			resetKind();
		}
	};
	var i, ch, ix, index;
	var snips = code.split(';');
	var origSnip = snips.pop();
	var snip = origSnip;
	var kind = KindGenericMethods;

	for (i = code.length - 1; i>=0; i--) {
		ch = code.charAt(i);
		if (!isLetterOrDigitOrWhitespaceOrDot(ch)) {
			manageContext(ch, snip);
			snip = code.substring(i + 1);
			break;
		}
	}

	if (kind === KindGenericMethods) {
		ix = origSnip.lastIndexOf('.');
	} else {
		ix = origSnip.lastIndexOf(ch);
	}
	
	while(/\s/.test(origSnip[ix+1])) {
		ix++;
	}

	if (snips.length) {
		index = ix + snips.join(';').length + 1;
	} else {
		index = ix;
	}

	return ix === -1 ? { v1: '', v2: snip, v3: kind, index: index }
					 : { v1: snip.substring(0, ix),
		                 v2: snip.substring(ix + 1),
		                 v3: kind,
		                 index: index
		               };
	
};

function getMembers (ctx) {
	var opt = [];
	var x;

	for (x in ctx) {
		opt.push(x.toString());
	}

	opt = opt.sort();
	return opt;
}

function buildOptionsFromText(text) {
	var options = [];
	var v, obj, index;

	if (text.length === 0) {
		return [options, 0];
	}

	v = extractTextForAutocompletion(text);
	if (v.v1 === '') {
		v.v1 = 'self';
	}

	try {
	   obj = eval(v.v1);
	} catch (e) {
	   obj = null;
	}

	if (autoCompleteMap && autoCompleteMap[v.v3]) {
		options = autoCompleteMap[v.v3];
	} else {
		options = getMembers(obj);
	}

	options.sort();
	
	return [options, v.index + 1];
};