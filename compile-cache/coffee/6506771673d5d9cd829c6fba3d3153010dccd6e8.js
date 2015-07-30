(function() {
  var CompositeDisposable, FuzzyProvider, TextEditor, fuzzaldrin, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  fuzzaldrin = require('fuzzaldrin');

  _ref = require('atom'), TextEditor = _ref.TextEditor, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = FuzzyProvider = (function() {
    FuzzyProvider.prototype.wordRegex = /\b\w*[a-zA-Z_-]+\w*\b/g;

    FuzzyProvider.prototype.wordList = null;

    FuzzyProvider.prototype.editor = null;

    FuzzyProvider.prototype.buffer = null;

    FuzzyProvider.prototype.selector = '*';

    FuzzyProvider.prototype.inclusionPriority = 0;

    FuzzyProvider.prototype.id = 'autocomplete-plus-fuzzyprovider';

    function FuzzyProvider() {
      this.dispose = __bind(this.dispose, this);
      this.getCompletionsForCursorScope = __bind(this.getCompletionsForCursorScope, this);
      this.findSuggestionsForWord = __bind(this.findSuggestionsForWord, this);
      this.buildWordList = __bind(this.buildWordList, this);
      this.lastTypedWord = __bind(this.lastTypedWord, this);
      this.addLastWordToList = __bind(this.addLastWordToList, this);
      this.bufferChanged = __bind(this.bufferChanged, this);
      this.bufferSaved = __bind(this.bufferSaved, this);
      this.getSuggestions = __bind(this.getSuggestions, this);
      this.updateCurrentEditor = __bind(this.updateCurrentEditor, this);
      var builtinProviderBlacklist;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.workspace.observeActivePaneItem(this.updateCurrentEditor));
      this.buildWordList();
      builtinProviderBlacklist = atom.config.get('autocomplete-plus.builtinProviderBlacklist');
      if ((builtinProviderBlacklist != null) && builtinProviderBlacklist.length) {
        this.disableForSelector = builtinProviderBlacklist;
      }
    }

    FuzzyProvider.prototype.updateCurrentEditor = function(currentPaneItem) {
      var _ref1, _ref2;
      if (currentPaneItem == null) {
        return;
      }
      if (currentPaneItem === this.editor) {
        return;
      }
      if ((_ref1 = this.bufferSavedSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.bufferChangedSubscription) != null) {
        _ref2.dispose();
      }
      this.editor = null;
      this.buffer = null;
      if (!this.paneItemIsValid(currentPaneItem)) {
        return;
      }
      this.editor = currentPaneItem;
      this.buffer = this.editor.getBuffer();
      this.bufferSavedSubscription = this.buffer.onDidSave(this.bufferSaved);
      this.bufferChangedSubscription = this.buffer.onDidChange(this.bufferChanged);
      return this.buildWordList();
    };

    FuzzyProvider.prototype.paneItemIsValid = function(paneItem) {
      if (paneItem == null) {
        return false;
      }
      return paneItem instanceof TextEditor;
    };

    FuzzyProvider.prototype.getSuggestions = function(_arg) {
      var editor, prefix, suggestions;
      editor = _arg.editor, prefix = _arg.prefix;
      if (editor == null) {
        return;
      }
      if (!prefix.length) {
        return;
      }
      suggestions = this.findSuggestionsForWord(prefix);
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    FuzzyProvider.prototype.bufferSaved = function() {
      return this.buildWordList();
    };

    FuzzyProvider.prototype.bufferChanged = function(e) {
      var newline, wordChars;
      wordChars = 'ąàáäâãåæăćęèéëêìíïîłńòóöôõøśșțùúüûñçżź' + 'abcdefghijklmnopqrstuvwxyz1234567890';
      if (wordChars.indexOf(e.newText.toLowerCase()) === -1) {
        newline = e.newText === '\n';
        return this.addLastWordToList(e.newRange.start.row, e.newRange.start.column, newline);
      }
    };

    FuzzyProvider.prototype.addLastWordToList = function(row, column, newline) {
      var lastWord;
      lastWord = this.lastTypedWord(row, column, newline);
      if (!lastWord) {
        return;
      }
      if (this.wordList.indexOf(lastWord) < 0) {
        return this.wordList.push(lastWord);
      }
    };

    FuzzyProvider.prototype.lastTypedWord = function(row, column, newline) {
      var lastWord, lineRange, maxColumn;
      if (newline) {
        if (!(column = 0)) {
          maxColumn = column - 1;
        }
      } else {
        maxColumn = column;
      }
      lineRange = [[row, 0], [row, column]];
      lastWord = null;
      this.buffer.scanInRange(this.wordRegex, lineRange, function(_arg) {
        var match, range, stop;
        match = _arg.match, range = _arg.range, stop = _arg.stop;
        return lastWord = match[0];
      });
      return lastWord;
    };

    FuzzyProvider.prototype.buildWordList = function() {
      var editor, editors, matches, minimumWordLength, wordList, _i, _len;
      if (this.editor == null) {
        return;
      }
      wordList = [];
      if (atom.config.get('autocomplete-plus.includeCompletionsFromAllBuffers')) {
        editors = atom.workspace.getEditors();
      } else {
        editors = [this.editor];
      }
      matches = [];
      for (_i = 0, _len = editors.length; _i < _len; _i++) {
        editor = editors[_i];
        matches.push(editor.getText().match(this.wordRegex));
      }
      wordList = _.uniq(_.flatten(matches));
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      if (minimumWordLength) {
        wordList = wordList.filter(function(word) {
          return (word != null ? word.length : void 0) >= minimumWordLength;
        });
      }
      return this.wordList = wordList;
    };

    FuzzyProvider.prototype.findSuggestionsForWord = function(prefix) {
      var results, word, wordList, words;
      if (this.wordList == null) {
        return;
      }
      wordList = this.wordList.concat(this.getCompletionsForCursorScope());
      words = atom.config.get('autocomplete-plus.strictMatching') ? wordList.filter(function(word) {
        return (word != null ? word.indexOf(prefix) : void 0) === 0;
      }) : fuzzaldrin.filter(wordList, prefix);
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = words.length; _i < _len; _i++) {
          word = words[_i];
          if (word !== prefix) {
            _results.push({
              text: word,
              replacementPrefix: prefix
            });
          }
        }
        return _results;
      })();
      return results;
    };

    FuzzyProvider.prototype.settingsForScopeDescriptor = function(scopeDescriptor, keyPath) {
      var entries, value, _i, _len, _results;
      if (!(((typeof atom !== "undefined" && atom !== null ? atom.config : void 0) != null) && (scopeDescriptor != null) && (keyPath != null))) {
        return [];
      }
      entries = atom.config.getAll(null, {
        scope: scopeDescriptor
      });
      _results = [];
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        value = entries[_i].value;
        if (_.valueForKeyPath(value, keyPath) != null) {
          _results.push(value);
        }
      }
      return _results;
    };

    FuzzyProvider.prototype.getCompletionsForCursorScope = function() {
      var completions, cursorScope;
      cursorScope = this.editor.scopeDescriptorForBufferPosition(this.editor.getCursorBufferPosition());
      completions = this.settingsForScopeDescriptor(cursorScope != null ? cursorScope.getScopesArray() : void 0, 'editor.completions');
      completions = completions.map(function(properties) {
        return _.valueForKeyPath(properties, 'editor.completions');
      });
      return _.uniq(_.flatten(completions));
    };

    FuzzyProvider.prototype.dispose = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.bufferSavedSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.bufferChangedSubscription) != null) {
        _ref2.dispose();
      }
      return this.subscriptions.dispose();
    };

    return FuzzyProvider;

  })();

}).call(this);
