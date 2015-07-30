(function() {
  var Point, buildIMECompositionEvent, buildTextInputEvent, indexOfWord, suggestionForWord, triggerAutocompletion, _, _ref;

  Point = require('atom').Point;

  _ref = require('./spec-helper'), triggerAutocompletion = _ref.triggerAutocompletion, buildIMECompositionEvent = _ref.buildIMECompositionEvent, buildTextInputEvent = _ref.buildTextInputEvent;

  _ = require('underscore-plus');

  indexOfWord = function(suggestionList, word) {
    var i, suggestion, _i, _len;
    for (i = _i = 0, _len = suggestionList.length; _i < _len; i = ++_i) {
      suggestion = suggestionList[i];
      if (suggestion.text === word) {
        return i;
      }
    }
    return -1;
  };

  suggestionForWord = function(suggestionList, word) {
    var suggestion, _i, _len;
    for (_i = 0, _len = suggestionList.length; _i < _len; _i++) {
      suggestion = suggestionList[_i];
      if (suggestion.text === word) {
        return suggestion;
      }
    }
    return null;
  };

  describe('SymbolProvider', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, _ref1;
    _ref1 = [], completionDelay = _ref1[0], editorView = _ref1[1], editor = _ref1[2], mainModule = _ref1[3], autocompleteManager = _ref1[4];
    beforeEach(function() {
      return runs(function() {
        var workspaceElement;
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('autocomplete-plus.defaultProvider', 'Symbol');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
    });
    afterEach(function() {
      return atom.config.set('autocomplete-plus.defaultProvider', 'Fuzzy');
    });
    describe("when completing with the default configuration", function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set("autocomplete-plus.enableAutoActivation", true);
        });
        waitsForPromise(function() {
          return atom.workspace.open("sample.coffee").then(function(e) {
            return editor = e;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage("language-coffee-script").then(function() {
            return atom.packages.activatePackage("autocomplete-plus").then(function(a) {
              return mainModule = a.mainModule;
            });
          });
        });
        waitsFor(function() {
          var _ref2;
          return (_ref2 = mainModule.autocompleteManager) != null ? _ref2.ready : void 0;
        });
        runs(function() {
          return autocompleteManager = mainModule.autocompleteManager;
        });
        return runs(function() {
          advanceClock(1);
          return editorView = atom.views.getView(editor);
        });
      });
      it("properly swaps a lower priority type for a higher priority type", function() {
        var provider, suggestion;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        suggestion = suggestionForWord(provider.symbolList, 'SomeModule');
        return expect(suggestion.type).toEqual('class');
      });
      return it("does not output suggestions from the other buffer", function() {
        var provider, results;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        results = null;
        waitsForPromise(function() {
          var promise;
          promise = provider.getSuggestions({
            editor: editor,
            prefix: 'item',
            bufferPosition: new Point(7, 0)
          });
          advanceClock(1);
          return promise.then(function(r) {
            return results = r;
          });
        });
        return runs(function() {
          return expect(results).toHaveLength(0);
        });
      });
    });
    return describe("when auto-activation is enabled", function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.js').then(function(e) {
            return editor = e;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage("language-javascript").then(function() {
            return atom.packages.activatePackage("autocomplete-plus").then(function(a) {
              return mainModule = a.mainModule;
            });
          });
        });
        waitsFor(function() {
          var _ref2;
          return (_ref2 = mainModule.autocompleteManager) != null ? _ref2.ready : void 0;
        });
        runs(function() {
          return autocompleteManager = mainModule.autocompleteManager;
        });
        return runs(function() {
          advanceClock(1);
          return editorView = atom.views.getView(editor);
        });
      });
      it("runs a completion ", function() {
        var provider;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        return expect(indexOfWord(provider.symbolList, 'quicksort')).not.toEqual(-1);
      });
      it("adds words to the symbol list after they have been written", function() {
        var provider;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        expect(indexOfWord(provider.symbolList, 'aNewFunction')).toEqual(-1);
        editor.insertText('function aNewFunction(){};');
        editor.insertText(' ');
        advanceClock(provider.changeUpdateDelay);
        return expect(indexOfWord(provider.symbolList, 'aNewFunction')).not.toEqual(-1);
      });
      describe("when includeCompletionsFromAllBuffers is enabled", function() {
        beforeEach(function() {
          atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', true);
          return waitsForPromise(function() {
            return atom.packages.activatePackage("language-coffee-script").then(function() {
              return atom.workspace.open("sample.coffee").then(function(e) {
                return editor = e;
              });
            });
          });
        });
        afterEach(function() {
          return atom.config.set('autocomplete-plus.includeCompletionsFromAllBuffers', false);
        });
        it("outputs unique suggestions", function() {
          var provider, results;
          provider = autocompleteManager.providerManager.fuzzyProvider;
          results = null;
          waitsForPromise(function() {
            var promise;
            promise = provider.getSuggestions({
              editor: editor,
              prefix: 'qu',
              bufferPosition: new Point(7, 0)
            });
            advanceClock(1);
            return promise.then(function(r) {
              return results = r;
            });
          });
          return runs(function() {
            return expect(results).toHaveLength(1);
          });
        });
        return it("outputs suggestions from the other buffer", function() {
          var provider, results;
          provider = autocompleteManager.providerManager.fuzzyProvider;
          results = null;
          waitsForPromise(function() {
            var promise;
            promise = provider.getSuggestions({
              editor: editor,
              prefix: 'item',
              bufferPosition: new Point(7, 0)
            });
            advanceClock(1);
            return promise.then(function(r) {
              return results = r;
            });
          });
          return runs(function() {
            return expect(results[0].text).toBe('items');
          });
        });
      });
      return xit('adds words to the wordlist with unicode characters', function() {
        var provider;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        expect(provider.symbolList.indexOf('somēthingNew')).toEqual(-1);
        editor.insertText('somēthingNew');
        editor.insertText(' ');
        return expect(provider.symbolList.indexOf('somēthingNew')).not.toEqual(-1);
      });
    });
  });

}).call(this);
