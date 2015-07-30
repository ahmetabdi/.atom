(function() {
  var CompositeDisposable, Selector, SymbolProvider, TextEditor, fuzzaldrin, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  fuzzaldrin = require('fuzzaldrin');

  _ref = require('atom'), TextEditor = _ref.TextEditor, CompositeDisposable = _ref.CompositeDisposable;

  Selector = require('selector-kit').Selector;

  module.exports = SymbolProvider = (function() {
    SymbolProvider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    SymbolProvider.prototype.symbolList = null;

    SymbolProvider.prototype.editor = null;

    SymbolProvider.prototype.buffer = null;

    SymbolProvider.prototype.changeUpdateDelay = 300;

    SymbolProvider.prototype.selector = '*';

    SymbolProvider.prototype.inclusionPriority = 0;

    SymbolProvider.prototype.suggestionPriority = 0;

    SymbolProvider.prototype.config = null;

    SymbolProvider.prototype.defaultConfig = {
      "class": {
        selector: '.class.name, .inherited-class',
        priority: 4
      },
      "function": {
        selector: '.function.name',
        priority: 3
      },
      variable: {
        selector: '.variable',
        priority: 2
      },
      '': {
        selector: '.comment, .string',
        priority: 1
      }
    };

    function SymbolProvider() {
      this.buildSymbolList = __bind(this.buildSymbolList, this);
      this.buildWordListOnNextTick = __bind(this.buildWordListOnNextTick, this);
      this.builtinCompletionsForCursorScope = __bind(this.builtinCompletionsForCursorScope, this);
      this.findSuggestionsForWord = __bind(this.findSuggestionsForWord, this);
      this.getSuggestions = __bind(this.getSuggestions, this);
      this.bufferChanged = __bind(this.bufferChanged, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      this.dispose = __bind(this.dispose, this);
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
    }

    SymbolProvider.prototype.dispose = function() {
      var _ref1;
      if ((_ref1 = this.editorSubscriptions) != null) {
        _ref1.dispose();
      }
      return this.subscriptions.dispose();
    };

    SymbolProvider.prototype.updateCurrentEditor = function(currentPaneItem) {
      var _ref1;
      if (currentPaneItem == null) {
        return;
      }
      if (currentPaneItem === this.editor) {
        return;
      }
      if ((_ref1 = this.editorSubscriptions) != null) {
        _ref1.dispose();
      }
      this.editorSubscriptions = new CompositeDisposable;
      this.editor = null;
      this.buffer = null;
      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }
      this.editor = currentPaneItem;
      this.buffer = this.editor.getBuffer();
      this.editorSubscriptions.add(this.editor.displayBuffer.onDidTokenize(this.buildWordListOnNextTick));
      this.editorSubscriptions.add(this.buffer.onDidSave(this.buildWordListOnNextTick));
      this.editorSubscriptions.add(this.buffer.onDidChange(this.bufferChanged));
      this.buildConfig();
      return this.buildWordListOnNextTick();
    };

    SymbolProvider.prototype.buildConfig = function() {
      var allConfig, config, options, type, _base, _base1, _base2, _i, _len;
      this.config = {};
      allConfig = this.settingsForScopeDescriptor(this.editor.getRootScopeDescriptor(), 'editor.completionSymbols');
      if (!allConfig.length) {
        allConfig.push(this.defaultConfig);
      }
      for (_i = 0, _len = allConfig.length; _i < _len; _i++) {
        config = allConfig[_i];
        for (type in config) {
          options = config[type];
          this.config[type] = _.clone(options);
          if (options.selector != null) {
            this.config[type].selectors = Selector.create(options.selector);
          }
          if ((_base = this.config[type]).selectors == null) {
            _base.selectors = [];
          }
          if ((_base1 = this.config[type]).priority == null) {
            _base1.priority = 1;
          }
          if ((_base2 = this.config[type]).wordRegex == null) {
            _base2.wordRegex = this.wordRegex;
          }
        }
      }
    };

    SymbolProvider.prototype.paneItemIsValid = function(paneItem) {
      if (paneItem == null) {
        return false;
      }
      return paneItem instanceof TextEditor;
    };

    SymbolProvider.prototype.bufferChanged = function(_arg) {
      var newRange;
      newRange = _arg.newRange;
      if (this.changeUpdateRange == null) {
        this.changeUpdateRange = {
          start: newRange.start.row,
          end: newRange.end.row
        };
      }
      this.changeUpdateRange.start = Math.min(this.changeUpdateRange.start, newRange.start.row);
      this.changeUpdateRange.end = Math.max(this.changeUpdateRange.end, newRange.end.row);
      clearTimeout(this.changeUpdateTimeout);
      return this.changeUpdateTimeout = setTimeout((function(_this) {
        return function() {
          _this.updateSymbolListForRange(_this.editor, _this.changeUpdateRange.start, _this.changeUpdateRange.end);
          return _this.changeUpdateRange = null;
        };
      })(this), this.changeUpdateDelay);
    };


    /*
    Section: Suggesting Completions
     */

    SymbolProvider.prototype.getSuggestions = function(options) {
      if (!options.prefix.trim().length) {
        return;
      }
      return new Promise((function(_this) {
        return function(resolve) {
          var suggestions;
          suggestions = _this.findSuggestionsForWord(options);
          return resolve(suggestions);
        };
      })(this));
    };

    SymbolProvider.prototype.findSuggestionsForWord = function(options) {
      var symbolList, word, words, _i, _len;
      if (this.symbolList == null) {
        return;
      }
      symbolList = this.symbolList.concat(this.builtinCompletionsForCursorScope());
      words = atom.config.get("autocomplete-plus.strictMatching") ? symbolList.filter(function(match) {
        var _ref1;
        return ((_ref1 = match.text) != null ? _ref1.indexOf(options.prefix) : void 0) === 0;
      }) : this.fuzzyFilter(symbolList, options);
      for (_i = 0, _len = words.length; _i < _len; _i++) {
        word = words[_i];
        word.replacementPrefix = options.prefix;
        word.rightLabel = word.type;
      }
      return words;
    };

    SymbolProvider.prototype.fuzzyFilter = function(symbolList, _arg) {
      var bufferPosition, candidates, i, key, locality, prefix, results, rowDifference, score, symbol, wordsSeen, _i, _j, _len, _len1, _ref1;
      bufferPosition = _arg.bufferPosition, prefix = _arg.prefix;
      candidates = [];
      for (_i = 0, _len = symbolList.length; _i < _len; _i++) {
        symbol = symbolList[_i];
        if (prefix[0].toLowerCase() !== symbol.text[0].toLowerCase()) {
          continue;
        }
        score = fuzzaldrin.score(symbol.text, prefix);
        if (symbol.path === this.editor.getPath()) {
          score *= this.getLocalityScore(symbol, bufferPosition);
        }
        if (score > 0) {
          candidates.push({
            symbol: symbol,
            score: score,
            locality: locality,
            rowDifference: rowDifference
          });
        }
      }
      candidates.sort(this.symbolSortReverseIterator);
      wordsSeen = {};
      results = [];
      for (i = _j = 0, _len1 = candidates.length; _j < _len1; i = ++_j) {
        _ref1 = candidates[i], symbol = _ref1.symbol, score = _ref1.score, locality = _ref1.locality, rowDifference = _ref1.rowDifference;
        if (results.length === 20) {
          break;
        }
        key = this.getSymbolKey(symbol.text);
        if (!wordsSeen[key]) {
          results.push(symbol);
        }
        wordsSeen[key] = true;
      }
      return results;
    };

    SymbolProvider.prototype.symbolSortReverseIterator = function(a, b) {
      return b.score - a.score;
    };

    SymbolProvider.prototype.getLocalityScore = function(symbol, bufferPosition) {
      var bufferRow, locality, rowDifference, _i, _len, _ref1;
      if (symbol.bufferRows != null) {
        rowDifference = Number.MAX_VALUE;
        _ref1 = symbol.bufferRows;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          bufferRow = _ref1[_i];
          rowDifference = Math.min(rowDifference, bufferRow - bufferPosition.row);
        }
        locality = this.computeLocalityModifier(rowDifference);
        return locality;
      } else {
        return 1;
      }
    };

    SymbolProvider.prototype.computeLocalityModifier = function(rowDifference) {
      rowDifference = Math.abs(rowDifference);
      return 1 + Math.max(-Math.pow(.2 * rowDifference - 3, 3) / 25 + .5, 0);
    };

    SymbolProvider.prototype.settingsForScopeDescriptor = function(scopeDescriptor, keyPath) {
      return atom.config.getAll(keyPath, {
        scope: scopeDescriptor
      });
    };

    SymbolProvider.prototype.builtinCompletionsForCursorScope = function() {
      var completions, cursorScope, properties, scopedCompletions, suggestion, suggestions, _i, _j, _len, _len1;
      cursorScope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = this.settingsForScopeDescriptor(cursorScope, "editor.completions");
      scopedCompletions = [];
      for (_i = 0, _len = completions.length; _i < _len; _i++) {
        properties = completions[_i];
        if (suggestions = _.valueForKeyPath(properties, "editor.completions")) {
          for (_j = 0, _len1 = suggestions.length; _j < _len1; _j++) {
            suggestion = suggestions[_j];
            scopedCompletions.push({
              text: suggestion,
              type: 'builtin'
            });
          }
        }
      }
      return _.uniq(scopedCompletions, function(completion) {
        return completion.text;
      });
    };


    /*
    Section: Word List Building
     */

    SymbolProvider.prototype.buildWordListOnNextTick = function() {
      return _.defer((function(_this) {
        return function() {
          return _this.buildSymbolList();
        };
      })(this));
    };

    SymbolProvider.prototype.buildSymbolList = function() {
      var editor, minimumWordLength, symbolList, _i, _len, _ref1;
      if (this.editor == null) {
        return;
      }
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      symbolList = this.getSymbolsFromEditor(this.editor, minimumWordLength);
      if (atom.config.get('autocomplete-plus.includeCompletionsFromAllBuffers')) {
        _ref1 = atom.workspace.getTextEditors();
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          editor = _ref1[_i];
          symbolList = symbolList.concat(this.getSymbolsFromEditor(editor, minimumWordLength));
        }
      }
      return this.symbolList = symbolList;
    };

    SymbolProvider.prototype.updateSymbolListForRange = function(editor, startBufferRow, endBufferRow) {
      var minimumWordLength, symbolList, tokenizedLines;
      tokenizedLines = this.getTokenizedLines(editor).slice(startBufferRow, +endBufferRow + 1 || 9e9);
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      symbolList = this.getSymbolsFromEditor(editor, minimumWordLength, tokenizedLines);
      return this.symbolList = this.symbolList.concat(symbolList);
    };

    SymbolProvider.prototype.getSymbolsFromEditor = function(editor, minimumWordLength, tokenizedLines) {
      var bufferRow, cacheSymbol, key, matchText, matches, options, scopes, selector, symbol, symbols, token, tokens, type, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref1, _ref2, _results;
      if (tokenizedLines == null) {
        tokenizedLines = this.getTokenizedLines(editor);
      }
      symbols = {};
      cacheSymbol = (function(_this) {
        return function(text, type, bufferRow, scopes) {
          var cachedSymbol, cachedTypePriority, currentTypePriority, key;
          key = _this.getSymbolKey(text);
          cachedSymbol = symbols[key];
          if (cachedSymbol != null) {
            currentTypePriority = _this.config[type].priority;
            cachedTypePriority = _this.config[cachedSymbol.type].priority;
            if (currentTypePriority > cachedTypePriority) {
              cachedSymbol.type = type;
            }
            cachedSymbol.bufferRows.push(bufferRow);
            return cachedSymbol.scopes.push(scopes);
          } else {
            return symbols[key] = {
              text: text,
              type: type,
              bufferRows: [bufferRow],
              scopes: [scopes],
              path: editor.getPath()
            };
          }
        };
      })(this);
      for (bufferRow = _i = 0, _len = tokenizedLines.length; _i < _len; bufferRow = ++_i) {
        tokens = tokenizedLines[bufferRow].tokens;
        for (_j = 0, _len1 = tokens.length; _j < _len1; _j++) {
          token = tokens[_j];
          scopes = this.cssSelectorFromScopes(token.scopes);
          _ref1 = this.config;
          for (type in _ref1) {
            options = _ref1[type];
            _ref2 = options.selectors;
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              selector = _ref2[_k];
              if (selector.matches(scopes) && (matches = token.value.match(options.wordRegex))) {
                for (_l = 0, _len3 = matches.length; _l < _len3; _l++) {
                  matchText = matches[_l];
                  if (matchText.length >= minimumWordLength) {
                    cacheSymbol(matchText, type, bufferRow, scopes);
                  }
                }
                break;
              }
            }
          }
        }
      }
      _results = [];
      for (key in symbols) {
        symbol = symbols[key];
        _results.push(symbol);
      }
      return _results;
    };

    SymbolProvider.prototype.getSymbolKey = function(symbolText) {
      return symbolText + '$$';
    };

    SymbolProvider.prototype.getTokenizedLines = function(editor) {
      return editor.displayBuffer.tokenizedBuffer.tokenizedLines;
    };

    SymbolProvider.prototype.cssSelectorFromScopes = function(scopes) {
      var scope, selector, _i, _len;
      selector = '';
      for (_i = 0, _len = scopes.length; _i < _len; _i++) {
        scope = scopes[_i];
        selector += ' .' + scope;
      }
      return selector;
    };

    return SymbolProvider;

  })();

}).call(this);
