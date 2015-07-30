(function() {
  var RefCountedTokenList, Symbol, SymbolStore, getObjectLength, removeItemFromArray, selectorsMatchScopeChain,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  RefCountedTokenList = require('./ref-counted-token-list');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  Symbol = (function() {
    Symbol.prototype.count = 0;

    Symbol.prototype.metadataByPath = null;

    Symbol.prototype.cachedConfig = null;

    Symbol.prototype.type = null;

    function Symbol(text) {
      this.text = text;
      this.metadataByPath = {};
    }

    Symbol.prototype.getCount = function() {
      return this.count;
    };

    Symbol.prototype.bufferRowsForEditorPath = function(editorPath) {
      var _ref;
      return (_ref = this.metadataByPath[editorPath]) != null ? _ref.bufferRows : void 0;
    };

    Symbol.prototype.addInstance = function(editorPath, bufferRow, scopeChain) {
      var _base, _base1, _base2;
      if ((_base = this.metadataByPath)[editorPath] == null) {
        _base[editorPath] = {};
      }
      if ((_base1 = this.metadataByPath[editorPath]).bufferRows == null) {
        _base1.bufferRows = [];
      }
      this.metadataByPath[editorPath].bufferRows.push(bufferRow);
      if ((_base2 = this.metadataByPath[editorPath]).scopeChains == null) {
        _base2.scopeChains = {};
      }
      if (this.metadataByPath[editorPath].scopeChains[scopeChain] == null) {
        this.type = null;
        this.metadataByPath[editorPath].scopeChains[scopeChain] = 0;
      }
      this.metadataByPath[editorPath].scopeChains[scopeChain] += 1;
      return this.count += 1;
    };

    Symbol.prototype.removeInstance = function(editorPath, bufferRow, scopeChain) {
      var bufferRows;
      if (this.metadataByPath[editorPath] == null) {
        return;
      }
      bufferRows = this.metadataByPath[editorPath].bufferRows;
      if (bufferRows != null) {
        removeItemFromArray(bufferRows, bufferRow);
      }
      if (this.metadataByPath[editorPath].scopeChains[scopeChain] != null) {
        this.count -= 1;
        this.metadataByPath[editorPath].scopeChains[scopeChain] -= 1;
        if (this.metadataByPath[editorPath].scopeChains[scopeChain] === 0) {
          delete this.metadataByPath[editorPath].scopeChains[scopeChain];
          this.type = null;
        }
        if (getObjectLength(this.metadataByPath[editorPath].scopeChains) === 0) {
          return delete this.metadataByPath[editorPath];
        }
      }
    };

    Symbol.prototype.isSingleInstanceOf = function(word) {
      return this.text === word && this.count === 1;
    };

    Symbol.prototype.appliesToConfig = function(config) {
      var filePath, options, scopeChain, scopeChains, type, typePriority, __, _ref;
      if (this.cachedConfig !== config) {
        this.type = null;
      }
      if (this.type == null) {
        typePriority = 0;
        for (type in config) {
          options = config[type];
          if (options.selectors == null) {
            continue;
          }
          _ref = this.metadataByPath;
          for (filePath in _ref) {
            scopeChains = _ref[filePath].scopeChains;
            for (scopeChain in scopeChains) {
              __ = scopeChains[scopeChain];
              if ((!this.type || options.typePriority > typePriority) && selectorsMatchScopeChain(options.selectors, scopeChain)) {
                this.type = type;
                typePriority = options.typePriority;
              }
            }
          }
        }
        this.cachedConfig = config;
      }
      return this.type != null;
    };

    return Symbol;

  })();

  module.exports = SymbolStore = (function() {
    SymbolStore.prototype.count = 0;

    function SymbolStore(wordRegex) {
      this.wordRegex = wordRegex;
      this.removeSymbol = __bind(this.removeSymbol, this);
      this.removeToken = __bind(this.removeToken, this);
      this.addToken = __bind(this.addToken, this);
      this.clear();
    }

    SymbolStore.prototype.clear = function() {
      return this.symbolMap = {};
    };

    SymbolStore.prototype.getLength = function() {
      return this.count;
    };

    SymbolStore.prototype.getSymbol = function(symbolKey) {
      symbolKey = this.getKey(symbolKey);
      return this.symbolMap[symbolKey];
    };

    SymbolStore.prototype.symbolsForConfig = function(config, wordUnderCursor) {
      var options, symbol, symbolKey, symbols, type, _ref;
      symbols = [];
      _ref = this.symbolMap;
      for (symbolKey in _ref) {
        symbol = _ref[symbolKey];
        if (symbol.appliesToConfig(config) && !symbol.isSingleInstanceOf(wordUnderCursor)) {
          symbols.push(symbol);
        }
      }
      for (type in config) {
        options = config[type];
        if (options.suggestions) {
          symbols = symbols.concat(options.suggestions);
        }
      }
      return symbols;
    };

    SymbolStore.prototype.addToken = function(token, editorPath, bufferRow) {
      var matches, scopeChain, symbolText, text, _i, _len;
      text = this.getTokenText(token);
      scopeChain = this.getTokenScopeChain(token);
      matches = text.match(this.wordRegex);
      if (matches != null) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          symbolText = matches[_i];
          this.addSymbol(symbolText, editorPath, bufferRow, scopeChain);
        }
      }
    };

    SymbolStore.prototype.removeToken = function(token, editorPath, bufferRow) {
      var matches, scopeChain, symbolText, text, _i, _len;
      text = this.getTokenText(token);
      scopeChain = this.getTokenScopeChain(token);
      matches = text.match(this.wordRegex);
      if (matches != null) {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          symbolText = matches[_i];
          this.removeSymbol(symbolText, editorPath, bufferRow, scopeChain);
        }
      }
    };

    SymbolStore.prototype.addTokensInBufferRange = function(editor, bufferRange) {
      return this.operateOnTokensInBufferRange(editor, bufferRange, this.addToken);
    };

    SymbolStore.prototype.removeTokensInBufferRange = function(editor, bufferRange) {
      return this.operateOnTokensInBufferRange(editor, bufferRange, this.removeToken);
    };

    SymbolStore.prototype.operateOnTokensInBufferRange = function(editor, bufferRange, operatorFunc) {
      var bufferRow, bufferRowBase, bufferRowIndex, token, tokenizedLines, tokens, _i, _j, _len, _len1;
      tokenizedLines = this.getTokenizedLines(editor).slice(bufferRange.start.row, +bufferRange.end.row + 1 || 9e9);
      bufferRowBase = bufferRange.start.row;
      for (bufferRowIndex = _i = 0, _len = tokenizedLines.length; _i < _len; bufferRowIndex = ++_i) {
        tokens = tokenizedLines[bufferRowIndex].tokens;
        bufferRow = bufferRowBase + bufferRowIndex;
        for (_j = 0, _len1 = tokens.length; _j < _len1; _j++) {
          token = tokens[_j];
          operatorFunc(token, editor.getPath(), bufferRow);
        }
      }
    };


    /*
    Private Methods
     */

    SymbolStore.prototype.addSymbol = function(symbolText, editorPath, bufferRow, scopeChain) {
      var symbol, symbolKey;
      symbolKey = this.getKey(symbolText);
      symbol = this.symbolMap[symbolKey];
      if (symbol == null) {
        this.symbolMap[symbolKey] = symbol = new Symbol(symbolText);
        this.count += 1;
      }
      return symbol.addInstance(editorPath, bufferRow, scopeChain);
    };

    SymbolStore.prototype.removeSymbol = function(symbolText, editorPath, bufferRow, scopeChain) {
      var symbol, symbolKey;
      symbolKey = this.getKey(symbolText);
      symbol = this.symbolMap[symbolKey];
      if (symbol != null) {
        symbol.removeInstance(editorPath, bufferRow, scopeChain);
        if (symbol.getCount() === 0) {
          delete this.symbolMap[symbolKey];
          return this.count -= 1;
        }
      }
    };

    SymbolStore.prototype.getTokenizedLines = function(editor) {
      return editor.displayBuffer.tokenizedBuffer.tokenizedLines;
    };

    SymbolStore.prototype.getTokenText = function(token) {
      return token.value;
    };

    SymbolStore.prototype.getTokenScopeChain = function(token) {
      var scope, scopeChain, _i, _len, _ref;
      scopeChain = '';
      _ref = token.scopes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        scope = _ref[_i];
        scopeChain += ' .' + scope;
      }
      return scopeChain;
    };

    SymbolStore.prototype.getKey = function(value) {
      return value + '$$';
    };

    return SymbolStore;

  })();

  removeItemFromArray = function(array, item) {
    var index;
    index = array.indexOf(item);
    if (index > -1) {
      return array.splice(index, 1);
    }
  };

  getObjectLength = function(object) {
    var count, k, v;
    count = 0;
    for (k in object) {
      v = object[k];
      count += 1;
    }
    return count;
  };

}).call(this);
