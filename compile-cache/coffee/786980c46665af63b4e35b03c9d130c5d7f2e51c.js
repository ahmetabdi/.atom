(function() {
  var buildIMECompositionEvent, buildTextInputEvent, triggerAutocompletion, _, _ref;

  _ref = require('./spec-helper'), triggerAutocompletion = _ref.triggerAutocompletion, buildIMECompositionEvent = _ref.buildIMECompositionEvent, buildTextInputEvent = _ref.buildTextInputEvent;

  _ = require('underscore-plus');

  describe('Autocomplete', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, _ref1;
    _ref1 = [], completionDelay = _ref1[0], editorView = _ref1[1], editor = _ref1[2], mainModule = _ref1[3], autocompleteManager = _ref1[4];
    beforeEach(function() {
      return runs(function() {
        var workspaceElement;
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        return jasmine.attachToDOM(workspaceElement);
      });
    });
    return describe('when auto-activation is enabled', function() {
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
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            return mainModule = a.mainModule;
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
          advanceClock(mainModule.autocompleteManager.providerManager.fuzzyProvider.deferBuildWordListInterval);
          return editorView = atom.views.getView(editor);
        });
      });
      it('adds words to the wordlist after they have been written', function() {
        var provider;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        expect(provider.wordList.indexOf('somethingNew')).toEqual(-1);
        editor.insertText('somethingNew');
        editor.insertText(' ');
        return expect(provider.wordList.indexOf('somethingNew')).not.toEqual(-1);
      });
      xit('adds words to the wordlist with unicode characters', function() {
        var provider;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        expect(provider.wordList.indexOf('somēthingNew')).toEqual(-1);
        editor.insertText('somēthingNew');
        editor.insertText(' ');
        return expect(provider.wordList.indexOf('somēthingNew')).not.toEqual(-1);
      });
      return xit('removes words from the wordlist when they no longer exist in any open buffers', function() {
        var provider, _i;
        provider = autocompleteManager.providerManager.fuzzyProvider;
        expect(provider.wordList.indexOf('bogos')).toEqual(-1);
        editor.insertText('bogos = 1');
        editor.insertText(' ');
        expect(provider.wordList.indexOf('bogos')).not.toEqual(-1);
        expect(provider.wordList.indexOf('bogus')).toEqual(-1);
        for (_i = 1; _i <= 7; _i++) {
          editor.backspace();
        }
        editor.insertText('us = 1');
        editor.insertText(' ');
        expect(provider.wordList.indexOf('bogus')).not.toEqual(-1);
        return expect(provider.wordList.indexOf('bogos')).toEqual(-1);
      });
    });
  });

}).call(this);
