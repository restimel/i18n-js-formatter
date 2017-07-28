var logs = {
    messages: [],
    reset: function() {
        this.messages = [];
    },
    summary: function() {
        var countInfo = 0;
        var countWarn = 0;
        var countError = 0;
        var text = [];

        if (!this.messages.length) {
            return '-';
        }

        this.messages.forEach(function(log) {
            switch(log.kind) {
                case 'info': countInfo++; break;
                case 'warn': countWarn++; break;
                case 'error': countError++; break;
            }
        });

        if (countError) {
            text.push(i18n('%i error', countError));
        }

        if (countWarn) {
            text.push(i18n('%i warn', countWarn));
        }

        if (countInfo) {
            text.push(i18n('%i info', countInfo));
        }

        return text.join(' ');
    }
};

function logLogs(kind) {
    return function(code, message) {
        var log = {
            kind: kind,
            code: code,
            message: message
        };

        logs.messages.push(log);
    };
}

i18n.configuration({
    log: {
        info: logLogs('info'),
        warn: logLogs('warn'),
        error: logLogs('error')
    }
});

var LIST_HEADER = [];
var PRESET_FORMAT_TEST = [];

/* For test purpose only

i18n({str: 'test1'});
i18n({string: 'test2'});
i18n({ctx: 'test', string: 'test3'});
i18n({en: 'notest', fr:'string'});
i18n({str: 'notest', parse:true});
i18n({ctx: 'test', string: 'notest', parse:true});
i18n({str: 'test4', parse:false});
i18n({ctx: 'test \'{', string: 'test5', parse:null});

*/

function init() {
    LIST_HEADER = [
    {
        id: 'Formatting',
        name: i18n.c('menu item', 'Formatting')
    // }, {
    //     id: 'Data',
    //     name: i18n.c('menu item', 'Data')
    }, {
        id: 'Context',
        name: i18n.c('menu item', 'Contextual')
    }, {
        id: 'Translation',
        name: i18n.c('menu item', 'Dictionary')
    }];

    PRESET_FORMAT_TEST = [
    {
        id: 'numberSuffix',
        name: i18n.c('preset item', 'Number with suffix'),
        pattern: '%{.2}D',
        args: [12345]
    }, {
        id: 'hugeNumber',
        name: i18n.c('preset item', 'Huge Number'),
        pattern: '%d',
        args: ['123456789123456789']
    }, {
        id: 'duration',
        name: i18n.c('preset item', 'Duration'),
        pattern: 'Time to load: %t', //i18n('Time to load: %t')
        args: [100000000]
    }, {
        id: 'multiArgs',
        name: i18n.c('preset item', 'Multiple arguments'),
        pattern: '%{CasE}s: %{esc:html}s | if you do not escape it you get "%(2){esc:raw}s".',
        // i18n('%{CasE}s: %{esc:html}s | if you do not escape it you get "%(2){esc:raw}s".')
        args: ['string in HTML', '<p>describe something</p>']
    }, {
        id: 'objArgs',
        name: i18n.c('preset item', 'Argument is an object'),
        pattern: 'Client %(id)F: %(firstname){Case}s %(familyname){Case}s is waiting for %(waiting){min:min}t.',
        // i18n('Client %(id)F: %(firstname){Case}s %(familyname){Case}s is waiting for %(waiting){min:min}t.')
        args: [{firstname: 'John', familyname: 'Doe', age: 42, waiting: 9752639, id: 1234}]
    }];
}

function isValueValid(value) {
    var r = /^(?:".*"|'.*'|[+-]? *\d+|[+-]? *\d*\.\d+|[+-]? *\d*\.?\d+[eE][+-]?\d*\.?\d+|true|false|undefined|null|NaN|[+-]? *Infinity|function\s*\w*\s*\([^)]*\)\s*\{.*\}|\{.*\}|\[.*\])?$/;

    value = value.trim();

    return r.test(value);
}

function convertValueFromString(value) {
    var rgx;

    value = value.trim();

    if (value === '' || value === 'undefined') {
        value = undefined;
    } else
    if (value === 'true') {
        value = true;
    } else
    if (value === 'false') {
        value = false;
    } else
    if (value === 'null') {
        value = null;
    } else
    if (value === 'NaN') {
        value = NaN;
    } else
    if (value === 'Infinity') {
        value = Infinity;
    } else
    if (value === '-Infinity') {
        value = -Infinity;
    } else
    if (/^(["']).*\1$/.test(value)) {
        value = value.slice(1,-1).replace(/\\(.)/g, function(p) {
            switch (p) {
                case 'n': return '\n';
                case 'r': return '\r';
                case 't': return '\t';
                case 'v': return '\v';
                case 'b': return '\b';
                case 'f': return '\f';
                case '0': return '\0';
                default: return p;
            }
        });
    } else
    if (/^[+-]? *\d*\.?\d*(?:e[+-]?\d+)/i.test(value)) {
        value = +value;
    } else
    if (/^function/.test(value)) {
        var rgx = /^function\s*(\w*)\(([^)]*)\)\s*\{[\s\S]*\}\s*$/.exec(value);

        try {
            value = new Function(rgx[2].split(','), rgx[3]);
            value.name = rgx[1];
        } catch(e) {
            value = null;
        };
    } else {
        //TODO parse object
        try{
            value = JSON.parse(value);
        } catch(e) {
            value = null;
        }
    }
    return value;
}

var TabHeader = React.createClass({
    getInitialState: function() {
        return {selected: 'Formatting'};
    },
    onclick: function(evt) {
        var selected = evt.currentTarget.dataset.value;
        this.setState({selected: selected});
        if (typeof this.props.onChange === 'function') {
            this.props.onChange(selected);
        }
    },
    getList: function() {
        return LIST_HEADER.map(function(header) {
            return (<button className={this.state.selected === header.id ? 'active' : ''}
                            data-value={header.id}
                            onClick={this.onclick}>
                        {header.name}
                    </button>)
        }, this)
    },
    render: function() {
        return (
            <div className="tab-header">
                {this.getList()}
            </div>
        );
    }
});

var RowTable =  React.createClass({
    getInitialState: function() {
        return {editing: -1};
    },
    onchange: function(idx, evt) {
        var value = evt.currentTarget.value;

        this.setState({editing: -1});

        if (this.props.data[idx] === value) {
            return;
        }

        if (typeof this.props.onEdit === 'function') {
            this.props.onEdit(idx, value);
        }
        this.props.data[idx] = value;
    },
    onclick: function(idx) {
        var freeze = this.props.freeze || 0;

        if (idx >= freeze && this.props.editable) {
            this.setState({editing: idx});
        }
    },
    componentDidUpdate: function() {
        var elem = React.findDOMNode(this.refs.rowInput);

        if (elem) {
            elem.focus();
        }
    },
    render: function() {
        return (
            <tr className={this.props.header ? 'header' : ''}>
                {this.props.data.map(function(value, idx) {
                    var cln = idx && this.props.editable ? 'editable' : '';
                    if (this.state.editing === idx) {
                        return (<td><input ref="rowInput" defaultValue={value} onBlur={this.onchange.bind(this, idx)} focus /></td>);
                    } else {
                        return (<td onClick={this.onclick.bind(this, idx)} className={cln}>{value}</td>);
                    }
                }, this)}  
            </tr>
        );
    }
});

var Table =  React.createClass({
    onedit: function(itemIdx, lngIdx, value) {
        if (typeof this.props.editable === 'function') {
            this.props.editable(itemIdx, lngIdx, value);
        }
    },
    render: function() {
        var w = {width: Math.round(100/this.props.header.length) + '%'};
        return (
            <table className={this.props.className}>
                <colgroup>
                    {this.props.header.map(function() {
                        return (<col style={w} />);
                    }, this)}
                </colgroup>
                <RowTable data={this.props.header} header/>
                {this.props.data.map(function(row, idx) {
                    return (<RowTable data={row} onEdit={this.onedit.bind(this, idx)} editable={!!this.props.editable} freeze={this.props.freeze} />)
                }, this)}
            </table>
        );
    }
});

var LocaleSelector =  React.createClass({
    getInitialState: function() {
        return {
            edition: false,
            selected: this.props.selected
        };
    },
    onEdition: function() {
        this.setState({
            edition: true
        });
    },
    onchange: function(evt) {
        var value = evt.currentTarget.value;

        this.setState({
            edition: false,
            selected: value
        });

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(value);
        }
    },
    render: function() {
        if (this.state.edition) {
            return (
                <div className={'edition ' + this.props.className}>
                    <select defaultValue={this.state.selected} onChange={this.onchange} open autofocus>
                        {i18n.getLocales({name: true, key: true}).map(function(opt) {
                            return (<option value={opt.key}>{opt.name} ({opt.key})</option>);
                        }, this)}
                    </select>
                </div>);
        } else {
            return (
                <div className={'read ' + this.props.className} onClick={this.onEdition} title={this.props.title}>
                    {this.state.selected}
                </div>
            );
        }
    }
});

var PresetFormatter = React.createClass({
    getOptions: function() {
        return this.props.list.map(function(elem) {
            return (<option value={elem.id}>{elem.name}</option>);
        });
    },
    onchange: function(evt) {
        var selected = evt.currentTarget.value;

        if (typeof this.props.onChange === 'function') {
            this.props.onChange(selected);
        }
    },
    render: function() {
        return (
            <label className="preset-formatter">
                {this.props.label}
                <select onChange={this.onchange}>
                    <option></option>
                    {this.getOptions()}
                </select>
            </label>
        );
    }
});

var JsInput2 = React.createClass({
    _oldValue: null,
    getInitialState: function() {
        this._oldValue = this.props.value;
        return {
            isValid: true,
            value: this.stringify(this.props.value)
        }
    },
    updateState: function() {
        if (this.props.value !== this._oldValue) {
            this._oldValue = this.props.value;
            this.setState({
                value: this.stringify(this.props.value),
                isValid: true
            })
        }
    },
    stringify: function(value) {
        if (typeof value === 'undefined') {
            return '';
        }

        try {
            value = JSON.stringify(value);
        } catch(e) {
            value = 'null';
        }

        return value;
    },
    parse: function(str) {
        var value;
        var isValid = true;

        try {
            value = JSON.parse(str);
        } catch(e) {
            value = null;
            isValid = false;
        }

        this.setState({
            isValid: isValid,
            value: str
        });

        return [value, isValid];
    },
    onchange: function(evt) {
        var value = evt.currentTarget.value;
        var isValid;

        [value, isValid] = this.parse(value);

        if (isValid && typeof this.props.onChange === 'function') {
            this.props.onChange(value);
        }
    },
    render: function() {
        this.updateState();
        return (
            <span className={this.props.className}>
            <input value={this.state.value} onChange={this.onchange}
                className={this.state.isValid ? '' : 'input-error'}
                title={this.state.isValid ? this.props.title : i18n('Please enter a valid JS code. (string must be surrounded by \' or ")')} />
            </span>
        );
    }
});

var I18nFormatter = React.createClass({
    _save: {
        pattern: '',
        propPattern: '',
        propArgs: []
    },
    getInitialState: function() {
        var args = this.props.args || [undefined];

        if (!args.length) {
            args.push(undefined);
        }

        this.updateState();

        return {
            pattern: this._save.pattern,
            args: args
        };
    },
    updateState: function() {
        var needUpdate = false;
        var state = {};

        if (this._save.propPattern !== this.props.pattern) {
            this._save.propPattern = this.props.pattern;
            this._save.pattern = this.props.pattern || '';
            state.pattern = this._save.pattern;
            needUpdate = true;
        }

        if (this._save.propArgs !== this.props.args) {
            this._save.propArgs = this.props.args;
            state.args = this._save.propArgs;
            needUpdate = true;
        }

        if (needUpdate) {
            this.setState(state);
        }
    },
    addArg: function() {
        var args = this.state.args.concat([undefined]);
        this.setState({args: args});
    },
    callOnChange: function(pattern, args) {
        if (typeof this.props.onChange === 'function') {
            this.props.onChange({
                pattern: pattern,
                args: args
            });
        }
    },
    trimArgs: function(args) {
        var i = args.length -1;

        while (!args[i] && args[i] !== 0 && i >= 0) {
            i--;
        }
        return args.slice(0, i+2);
    },
    useless: function() { //TO REMOVE
        var sArgs = this.state.args;
        var pArgs = this.props.args;

        if (this.state.pattern !== this.props.pattern
         || sArgs.length !== pArgs.length
         || sArgs.some(function(item, key) {
            return pArgs[key] !== item;
         }))
        {
            this.setState({
                pattern: this.props.pattern,
                args: pArgs
            });
        }
        return '';
    },
    changePattern: function(evt) {
        var value = evt.currentTarget.value;
        // this.setState({pattern: value}); //DO not render ??? is it possible ???
        this._save.pattern = value;
        this.callOnChange(value, this.state.args);
    },
    changeArg: function(idx, value) {
        var args = this.state.args;
        args[idx] = value;
        args = this.trimArgs(args);
        // this.setState({args: args});

        this.callOnChange(this._save.pattern, args);
    },
    render: function() {
        this.updateState();
        return (
            <div>
                i18n("<input type="text" value={this.state.pattern} onChange={this.changePattern} />"
                    {this.state.args.map(function(arg, idx) {
                        return (<JsInput2 value={arg} className="argument" onChange={this.changeArg.bind(this, idx)} /> );
                    }, this)} 
                    <span className="fa fa-plus-circle btn-action" title={i18n('Add an argument')} onClick={this.addArg}></span>);
            </div>
        );
    }
});

var Result = React.createClass({
    getInitialState: function() {
        return {
            i18nMethod: this.props.method,
            locale: i18n.getLocale()
        }
    },
    changeMethod: function(evt) {
        var checked = evt.currentTarget.checked
        var method = checked ? 'i18n.parse' : 'i18n';

        this.setState({i18nMethod: method});
    },
    addOptions: function() {
        if (this.props.method === 'i18n.parse') {
            return (
                <label title={i18n('Do not translate the string')}>
                    <input type="checkbox" onChange={this.changeMethod} defaultChecked="true" />
                    i18n.parse
                </label>);
        }
    },
    onLocaleChange: function(locale) {
        this.setState({locale: locale});
    },
    result: function() {
        var f, pattern, args, result, options;

        logs.reset();
        if (!this.props.action) {
            return '';
        }
        pattern = this.props.action.pattern;
        args = this.props.action.args;

        if (!pattern) {
            return '';
        }
        options = {
            str: pattern,
            locale: this.state.locale
        };

        switch (this.state.i18nMethod) {
            case 'i18n.parse':
                options.parse = true;
                break;
            case 'i18n':
            default:
        }

        result = i18n.apply(i18n, [options].concat(args));
        return result;
    },
    render: function() {
        function logClassName(log) {
            return 'log-item log-kind-' + log.kind;
        }

        return (
            <fieldset className="result">
                <legend>{i18n('Result')}</legend>
                <LocaleSelector className="locale-selector" selected={this.state.locale} onChange={this.onLocaleChange} title={i18n('Set result language')} />
                <p className="output">{this.result(this.props.action)}</p>
                <details className="logs">
                    <summary>{i18n('info: %s', logs.summary())}</summary>
                    {logs.messages.map(function(log) {
                        return (<div className={logClassName(log)}>({log.code}) {log.message}</div>);
                    })}
                </details>
                <div className="options">
                    {this.addOptions()}
                </div>
            </fieldset>
        );
    }
});

var FormatDemo = React.createClass({
    getInitialState: function() {
        return {
            action: undefined,
            pattern: undefined,
            args: []
        }
    },
    onTestChange: function(action) {
        this.setState({
            pattern: action.pattern,
            action: action
        });
    },
    onPresetChange: function(presetId) {
        var action = PRESET_FORMAT_TEST.filter(function(data) {
            return data.id === presetId;
        })[0];

        if (action) {
            this.setState({
                action: action,
                pattern: action.pattern,
                args: action.args
            });
        }
    },
    render: function() {
        return (
            <div>
                <PresetFormatter list={PRESET_FORMAT_TEST} label={i18n('Preset example:')} onChange={this.onPresetChange} />
                <I18nFormatter pattern={this.state.pattern} args={this.state.args} onChange={this.onTestChange} />
                <Result action={this.state.action} method="i18n.parse" />
            </div>
        );
    }
});

var TranslationData = React.createClass({
    _save: {},
    getHeader: function() {
        return [i18n('context'), i18n('sentence')].concat(i18n.getLocales());
    },
    getData: function() {
        var x, k, item, dico;
        var data = this._save.data;

        function storeItem(ctx, key, label) {
            var k;
            var item = [ctx, key];

            for (k in label) {
                item.push(label[k]);
            }
            data.push(item);
        }

        if (!data) {
            data = [];
            dico = i18n.getData({format: 'dictionary'});

            for (x in dico) {
                if (x.indexOf('_ctx:') === 0) {
                    for (k in dico[x]) {
                        storeItem(x.slice(5), k, dico[x][k]);
                    }
                } else {
                    storeItem('', x, dico[x]);
                }
            }
        }

        if (!this._save.data) {
            this._save.data = data;
        }

        return data;
    },
    onChangeTranslation: function(itemIdx, lngIdx, value) {
        var item = this._save.data[itemIdx];
        var context = item[0];
        var key = item[1];
        var lng = i18n.getLocales()[lngIdx - 2];
        var data = {};

        item[lngIdx] = value;
        data[lng] = value;
        i18n.addCtxItem(context, key, data);
    },
    render: function() {
        return (
            <div>
                <p className="information">{i18n('These data are the one used in this application. If you change them you can see the difference directly in this page (changing these data does not refresh the view).')}</p>
                <Table className="translations" header={this.getHeader()} data={this.getData()} editable={this.onChangeTranslation} freeze="2" />
            </div>
        );
    }
});

var NotDone = React.createClass({
    render: function() {
        return (
            <div>
                {i18n('This content is still not done :(')}
            </div>
        );
    }
});

var MainPage = React.createClass({
    getInitialState: function() {
        return {
            selected: 'Formatting',
            locale: i18n.getLocale()
        };
    },
    getContent: function() {
        var selected = this.state.selected;

        switch (selected) {
            case 'Formatting': return (<FormatDemo />);
            case 'Data': return (<NotDone />);
            case 'Translation': return (<TranslationData />);
            default: return (<NotDone />);
        }
    },
    changeSelected: function(selected) {
        this.setState({selected: selected});
    },
    onLocaleChange: function(locale) {
        locale = i18n.setLocale(locale);
        init();
        this.setState({locale: locale});
    },
    render: function() {
        return (
            <div>
                <LocaleSelector className="global-locale-selector" selected={this.state.locale} onChange={this.onLocaleChange} title={i18n('Set application language')} />
                <TabHeader onChange={this.changeSelected}/>
                <div className="main-content">
                    {this.getContent()}
                </div>
            </div>
        );
    }
});

// var Comment = React.createClass({
//   getInitialState: function() {
//     return {author: '', text: ''};
//   },
//   componentDidMount: function() {
//   	if (this.props.author) this.setState({author: this.props.author});
//   	if (this.props.children) this.setState({text: this.props.children});
//   },
//   onChangeComment: function(evt) {
//   	this.setState({text: evt.currentTarget.value});
//   },
//   render: function() {
//   	console.count('render')
//     return (
//       <div className="comment">
//         <h2 className="commentAuthor">
//           {this.state.author}
//         </h2>
//         <input placeholder="comments" value={this.state.text} onChange={this.onChangeComment} />
//         <div dangerouslySetInnerHTML={{__html:marked(this.state.text, {sanitize:true})}}/>
//       </div>
//     );
//   }
// });
// var CommentBox = React.createClass({
//   render: function() {
//     return (
//       <div className="commentBox">
//         Hello, world! I am a CommentBox.
//         <Hello>you</Hello>
//         <hr/>
// 	    <Comment author="Pete Hunt">This is one comment</Comment>
// 	    <Comment author="Jordan Walke">This is *another* comment</Comment>
//       </div>
//     );
//   }
// });

init();

ReactDOM.render(
  <MainPage />,
  document.getElementById('content')
);
