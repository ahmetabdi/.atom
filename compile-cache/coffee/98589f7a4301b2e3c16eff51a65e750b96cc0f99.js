(function() {
  var KeymapManager, NodeTypeText, buildIMECompositionEvent, buildTextInputEvent, triggerAutocompletion, waitForAutocomplete, _, _ref;

  _ref = require('./spec-helper'), triggerAutocompletion = _ref.triggerAutocompletion, waitForAutocomplete = _ref.waitForAutocomplete, buildIMECompositionEvent = _ref.buildIMECompositionEvent, buildTextInputEvent = _ref.buildTextInputEvent;

  _ = require('underscore-plus');

  KeymapManager = require('atom').KeymapManager;

  NodeTypeText = 3;

  describe('Autocomplete Manager', function() {
    var autocompleteManager, completionDelay, editor, editorView, mainModule, workspaceElement, _ref1;
    _ref1 = [], workspaceElement = _ref1[0], completionDelay = _ref1[1], editorView = _ref1[2], editor = _ref1[3], mainModule = _ref1[4], autocompleteManager = _ref1[5], mainModule = _ref1[6];
    beforeEach(function() {
      return runs(function() {
        atom.config.set('autocomplete-plus.enableAutoActivation', true);
        atom.config.set('editor.fontSize', '16');
        completionDelay = 100;
        atom.config.set('autocomplete-plus.autoActivationDelay', completionDelay);
        completionDelay += 100;
        workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        return atom.config.set('autocomplete-plus.maxVisibleSuggestions', 10);
      });
    });
    describe("when an external provider is registered", function() {
      var provider;
      provider = [][0];
      beforeEach(function() {
        waitsForPromise(function() {
          return Promise.all([
            atom.workspace.open('').then(function(e) {
              editor = e;
              return editorView = atom.views.getView(editor);
            }), atom.packages.activatePackage('autocomplete-plus').then(function(a) {
              return mainModule = a.mainModule;
            })
          ]);
        });
        return runs(function() {
          provider = {
            selector: '*',
            getSuggestions: function(_arg) {
              var list, prefix, text, _i, _len, _results;
              prefix = _arg.prefix;
              list = ['a', 'ab', 'abc', 'abcd', 'abcde'];
              _results = [];
              for (_i = 0, _len = list.length; _i < _len; _i++) {
                text = list[_i];
                _results.push({
                  text: text,
                  replacementPrefix: prefix
                });
              }
              return _results;
            }
          };
          return mainModule.consumeProvider(provider);
        });
      });
      it("calls the provider's onDidInsertSuggestion method when it exists", function() {
        provider.onDidInsertSuggestion = jasmine.createSpy();
        triggerAutocompletion(editor, true, 'a');
        return runs(function() {
          var suggestion, suggestionListView, triggerPosition, _ref2;
          suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
          atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
          expect(provider.onDidInsertSuggestion).toHaveBeenCalled();
          _ref2 = provider.onDidInsertSuggestion.mostRecentCall.args[0], editor = _ref2.editor, triggerPosition = _ref2.triggerPosition, suggestion = _ref2.suggestion;
          expect(editor).toBe(editor);
          expect(triggerPosition).toEqual([0, 1]);
          return expect(suggestion.text).toBe('a');
        });
      });
      describe("when number of suggestions > maxVisibleSuggestions", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.maxVisibleSuggestions', 2);
        });
        return it("only shows the maxVisibleSuggestions in the suggestion popup", function() {
          triggerAutocompletion(editor, true, 'a');
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            expect(editorView.querySelectorAll('.autocomplete-plus li')).toHaveLength(5);
            return expect(editorView.querySelector('.autocomplete-plus .list-group').style['max-height']).toBe("" + (2 * 25) + "px");
          });
        });
      });
      describe("when match.snippet is used", function() {
        beforeEach(function() {
          return spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var list, prefix, snippet, _i, _len, _results;
            prefix = _arg.prefix;
            list = ['method(${1:something})', 'method2(${1:something})', 'method3(${1:something})'];
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
              snippet = list[_i];
              _results.push({
                snippet: snippet,
                replacementPrefix: prefix
              });
            }
            return _results;
          });
        });
        return describe("when the snippets package is enabled", function() {
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.packages.activatePackage('snippets');
            });
          });
          it("displays the snippet without the `${1:}` in its own class", function() {
            triggerAutocompletion(editor, true, 'm');
            return runs(function() {
              var wordElement, wordElements;
              wordElement = editorView.querySelector('.autocomplete-plus span.word');
              expect(wordElement.textContent).toBe('method(something)');
              expect(wordElement.querySelector('.snippet-completion').textContent).toBe('something');
              wordElements = editorView.querySelectorAll('.autocomplete-plus span.word');
              return expect(wordElements).toHaveLength(3);
            });
          });
          return it("accepts the snippet when autocomplete-plus:confirm is triggered", function() {
            triggerAutocompletion(editor, true, 'm');
            return runs(function() {
              var suggestionListView;
              suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
              atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
              expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
              return expect(editor.getSelectedText()).toBe('something');
            });
          });
        });
      });
      describe("when the matched prefix is highlighted", function() {
        it('highlights the prefix of the word in the suggestion list', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var prefix;
            prefix = _arg.prefix;
            return [
              {
                text: 'items',
                replacementPrefix: prefix
              }
            ];
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('i');
          editor.insertText('e');
          editor.insertText('m');
          waitForAutocomplete();
          return runs(function() {
            var word;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            word = editorView.querySelector('.autocomplete-plus li span.word');
            expect(word.childNodes).toHaveLength(5);
            expect(word.childNodes[0]).toHaveClass('character-match');
            expect(word.childNodes[1].nodeType).toBe(NodeTypeText);
            expect(word.childNodes[2]).toHaveClass('character-match');
            expect(word.childNodes[3]).toHaveClass('character-match');
            return expect(word.childNodes[4].nodeType).toBe(NodeTypeText);
          });
        });
        it('highlights repeated characters in the prefix', function() {
          spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
            var prefix;
            prefix = _arg.prefix;
            return [
              {
                text: 'apply',
                replacementPrefix: prefix
              }
            ];
          });
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('a');
          editor.insertText('p');
          editor.insertText('p');
          waitForAutocomplete();
          return runs(function() {
            var word;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            word = editorView.querySelector('.autocomplete-plus li span.word');
            expect(word.childNodes).toHaveLength(4);
            expect(word.childNodes[0]).toHaveClass('character-match');
            expect(word.childNodes[1]).toHaveClass('character-match');
            expect(word.childNodes[2]).toHaveClass('character-match');
            expect(word.childNodes[3].nodeType).toBe(3);
            return expect(word.childNodes[3].textContent).toBe('ly');
          });
        });
        return describe("when the prefix does not match the word", function() {
          it("does not render any character-match spans", function() {
            spyOn(provider, 'getSuggestions').andCallFake(function(_arg) {
              var prefix;
              prefix = _arg.prefix;
              return [
                {
                  text: 'omgnope',
                  replacementPrefix: prefix
                }
              ];
            });
            editor.moveToBottom();
            editor.insertText('x');
            editor.insertText('y');
            editor.insertText('z');
            waitForAutocomplete();
            return runs(function() {
              var characterMatches, text;
              expect(editorView.querySelector('.autocomplete-plus')).toExist();
              characterMatches = editorView.querySelectorAll('.autocomplete-plus li span.word .character-match');
              text = editorView.querySelector('.autocomplete-plus li span.word').textContent;
              console.log(characterMatches);
              expect(characterMatches).toHaveLength(0);
              return expect(text).toBe('omgnope');
            });
          });
          return describe("when the snippets package is enabled", function() {
            beforeEach(function() {
              return waitsForPromise(function() {
                return atom.packages.activatePackage('snippets');
              });
            });
            it("does not highlight the snippet html; ref issue 301", function() {
              spyOn(provider, 'getSuggestions').andCallFake(function() {
                return [
                  {
                    snippet: 'ab(${1:c})c'
                  }
                ];
              });
              editor.moveToBottom();
              editor.insertText('c');
              waitForAutocomplete();
              return runs(function() {
                var charMatch, word;
                word = editorView.querySelector('.autocomplete-plus li span.word');
                charMatch = editorView.querySelector('.autocomplete-plus li span.word .character-match');
                expect(word.textContent).toBe('ab(c)c');
                expect(charMatch.textContent).toBe('c');
                return expect(charMatch.parentNode).toHaveClass('word');
              });
            });
            return it("does not highlight the snippet html when highlight beginning of the word", function() {
              spyOn(provider, 'getSuggestions').andCallFake(function() {
                return [
                  {
                    snippet: 'abcde(${1:e}, ${1:f})f'
                  }
                ];
              });
              editor.moveToBottom();
              editor.insertText('c');
              editor.insertText('e');
              editor.insertText('f');
              waitForAutocomplete();
              return runs(function() {
                var charMatches, word;
                word = editorView.querySelector('.autocomplete-plus li span.word');
                expect(word.textContent).toBe('abcde(e, f)f');
                charMatches = editorView.querySelectorAll('.autocomplete-plus li span.word .character-match');
                expect(charMatches[0].textContent).toBe('c');
                expect(charMatches[0].parentNode).toHaveClass('word');
                expect(charMatches[1].textContent).toBe('e');
                expect(charMatches[1].parentNode).toHaveClass('word');
                expect(charMatches[2].textContent).toBe('f');
                return expect(charMatches[2].parentNode).toHaveClass('word');
              });
            });
          });
        });
      });
      describe("when a replacementPrefix is not specified", function() {
        beforeEach(function() {
          return spyOn(provider, 'getSuggestions').andCallFake(function() {
            return [
              {
                text: 'something'
              }
            ];
          });
        });
        return it("replaces with the default input prefix", function() {
          editor.insertText('abc');
          triggerAutocompletion(editor, false, 'm');
          expect(editor.getText()).toBe('abcm');
          return runs(function() {
            var suggestionListView;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestionListView = editorView.querySelector('.autocomplete-plus autocomplete-suggestion-list');
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            return expect(editor.getText()).toBe('something');
          });
        });
      });
      return describe("when autocomplete-plus.suggestionListFollows is 'Word'", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.suggestionListFollows', 'Word');
        });
        afterEach(function() {
          return atom.config.set('autocomplete-plus.suggestionListFollows', 'Cursor');
        });
        return it("opens to the correct position, and correctly closes on cancel", function() {
          editor.insertText('x ab');
          triggerAutocompletion(editor, false, 'c');
          return runs(function() {
            var left, overlayElement;
            overlayElement = editorView.querySelector('.autocomplete-plus');
            expect(overlayElement).toExist();
            left = editorView.pixelPositionForBufferPosition([0, 2]).left;
            expect(overlayElement.style.left).toBe("" + left + "px");
            atom.commands.dispatch(editorView, 'autocomplete-plus:cancel');
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
    });
    describe('when opening a file without a path', function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.workspace.open('').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-text');
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
        return runs(function() {
          autocompleteManager = mainModule.autocompleteManager;
          spyOn(autocompleteManager, 'findSuggestions').andCallThrough();
          return spyOn(autocompleteManager, 'displaySuggestions').andCallThrough();
        });
      });
      return describe("when strict matching is used", function() {
        beforeEach(function() {
          return atom.config.set('autocomplete-plus.strictMatching', true);
        });
        return it('using strict matching does not cause issues when typing', function() {
          runs(function() {
            editor.moveToBottom();
            editor.insertText('h');
            editor.insertText('e');
            editor.insertText('l');
            editor.insertText('l');
            editor.insertText('o');
            return advanceClock(completionDelay + 1000);
          });
          return waitsFor(function() {
            return autocompleteManager.findSuggestions.calls.length === 1;
          });
        });
      });
    });
    describe('when opening a javascript file', function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.js').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(editor);
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-javascript');
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            mainModule = a.mainModule;
            return autocompleteManager = mainModule.autocompleteManager;
          });
        });
      });
      describe('when fuzzyprovider is disabled', function() {
        return it('should not show the suggestion list', function() {
          atom.config.set('autocomplete-plus.enableBuiltinProvider', false);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          triggerAutocompletion(editor);
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      describe('when the buffer changes', function() {
        it('should show the suggestion list when suggestions are found', function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          triggerAutocompletion(editor);
          return runs(function() {
            var index, item, suggestions, _i, _len, _ref2, _results;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestions = ['function', 'if', 'left', 'shift'];
            _ref2 = editorView.querySelectorAll('.autocomplete-plus li span.word');
            _results = [];
            for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
              item = _ref2[index];
              _results.push(expect(item.innerText).toEqual(suggestions[index]));
            }
            return _results;
          });
        });
        it('should not show the suggestion list when no suggestions are found', function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('x');
          waitForAutocomplete();
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('shows the suggestion list on backspace if allowed', function() {
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('f');
            editor.insertText('u');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            editor.insertText('\r');
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return expect(editor.lineTextForBufferRow(13)).toBe('f');
          });
        });
        it('does not shows the suggestion list on backspace if disallowed', function() {
          runs(function() {
            atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', false);
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            editor.moveToBottom();
            editor.insertText('f');
            editor.insertText('u');
            return waitForAutocomplete();
          });
          runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            editor.insertText('\r');
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return expect(editor.lineTextForBufferRow(13)).toBe('f');
          });
        });
        it("keeps the suggestion list open when it's already open on backspace", function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.insertText('f');
          editor.insertText('u');
          waitForAutocomplete();
          runs(function() {
            var key;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            return expect(editor.lineTextForBufferRow(13)).toBe('f');
          });
        });
        it("does not open the suggestion on backspace when it's closed", function() {
          atom.config.set('autocomplete-plus.backspaceTriggersAutocomplete', false);
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.setCursorBufferPosition([2, 39]);
          runs(function() {
            var key;
            key = atom.keymaps.constructor.buildKeydownEvent('backspace', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        it('should not update the suggestion list while composition is in progress', function() {
          var activeElement;
          triggerAutocompletion(editor);
          activeElement = editorView.rootElement.querySelector('input');
          runs(function() {
            spyOn(autocompleteManager.suggestionList, 'changeItems').andCallThrough();
            expect(autocompleteManager.suggestionList.changeItems).not.toHaveBeenCalled();
            activeElement.dispatchEvent(buildIMECompositionEvent('compositionstart', {
              target: activeElement
            }));
            activeElement.dispatchEvent(buildIMECompositionEvent('compositionupdate', {
              data: '~',
              target: activeElement
            }));
            return waitForAutocomplete();
          });
          return runs(function() {
            expect(autocompleteManager.suggestionList.changeItems).not.toHaveBeenCalled();
            activeElement.dispatchEvent(buildIMECompositionEvent('compositionend', {
              target: activeElement
            }));
            activeElement.dispatchEvent(buildTextInputEvent({
              data: 'ã',
              target: activeElement
            }));
            return expect(editor.lineTextForBufferRow(13)).toBe('fã');
          });
        });
        return it('does not show the suggestion list when it is triggered then no longer needed', function() {
          runs(function() {
            editor.moveToBottom();
            editor.insertText('f');
            editor.insertText('u');
            editor.insertText('\r');
            return waitForAutocomplete();
          });
          return runs(function() {
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
      });
      describe('accepting suggestions', function() {
        it('hides the suggestions list when a suggestion is confirmed', function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          editor.moveToBottom();
          editor.moveToBeginningOfLine();
          editor.insertText('f');
          waitForAutocomplete();
          return runs(function() {
            var suggestionListView;
            expect(editorView.querySelector('.autocomplete-plus')).toExist();
            suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:confirm');
            return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          });
        });
        describe('when tab is used to accept suggestions', function() {
          beforeEach(function() {
            return atom.config.set('autocomplete-plus.confirmCompletion', 'tab');
          });
          it('inserts the word and moves the cursor to the end of the word', function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            triggerAutocompletion(editor);
            return runs(function() {
              var bufferPosition, key;
              key = atom.keymaps.constructor.buildKeydownEvent('tab', {
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              expect(editor.getBuffer().getLastLine()).toEqual('function');
              bufferPosition = editor.getCursorBufferPosition();
              expect(bufferPosition.row).toEqual(13);
              return expect(bufferPosition.column).toEqual(8);
            });
          });
          return it('does not insert the word when enter completion not enabled', function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            triggerAutocompletion(editor);
            return runs(function() {
              var key;
              key = atom.keymaps.constructor.buildKeydownEvent('enter', {
                keyCode: 13,
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              return expect(editor.getBuffer().getLastLine()).toEqual('');
            });
          });
        });
        return describe('when enter is used to accept suggestions', function() {
          beforeEach(function() {
            return atom.config.set('autocomplete-plus.confirmCompletion', 'enter');
          });
          it('inserts the word and moves the cursor to the end of the word', function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            triggerAutocompletion(editor);
            return runs(function() {
              var bufferPosition, key;
              key = atom.keymaps.constructor.buildKeydownEvent('enter', {
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              expect(editor.getBuffer().getLastLine()).toEqual('function');
              bufferPosition = editor.getCursorBufferPosition();
              expect(bufferPosition.row).toEqual(13);
              return expect(bufferPosition.column).toEqual(8);
            });
          });
          return it('does not insert the word when tab completion not enabled', function() {
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            triggerAutocompletion(editor);
            return runs(function() {
              var key;
              key = atom.keymaps.constructor.buildKeydownEvent('tab', {
                target: document.activeElement
              });
              atom.keymaps.handleKeyboardEvent(key);
              return expect(editor.getBuffer().getLastLine()).toEqual('f ');
            });
          });
        });
      });
      describe('select-previous event', function() {
        it('selects the previous item in the list', function() {
          triggerAutocompletion(editor);
          return runs(function() {
            var items, suggestionListView;
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            expect(items[3]).not.toHaveClass('selected');
            suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:select-previous');
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).not.toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            return expect(items[3]).toHaveClass('selected');
          });
        });
        it('closes the autocomplete when up arrow pressed when only one item displayed', function() {
          triggerAutocompletion(editor, false, 'q');
          return runs(function() {
            var autocomplete, key;
            key = atom.keymaps.constructor.buildKeydownEvent('down', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).not.toExist();
          });
        });
        it('does not close the autocomplete when down arrow pressed when many items', function() {
          triggerAutocompletion(editor);
          return runs(function() {
            var autocomplete, key;
            key = atom.keymaps.constructor.buildKeydownEvent('down', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).toExist();
          });
        });
        return it('does close the autocomplete when down arrow while up,down navigation not selected', function() {
          atom.config.set('autocomplete-plus.navigateCompletions', 'ctrl-p,ctrl-n');
          triggerAutocompletion(editor, false);
          return runs(function() {
            var autocomplete, key;
            key = atom.keymaps.constructor.buildKeydownEvent('down', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).not.toExist();
          });
        });
      });
      describe('select-next event', function() {
        it('selects the next item in the list', function() {
          triggerAutocompletion(editor);
          return runs(function() {
            var items, suggestionListView;
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).toHaveClass('selected');
            expect(items[1]).not.toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            expect(items[3]).not.toHaveClass('selected');
            suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
            atom.commands.dispatch(suggestionListView, 'autocomplete-plus:select-next');
            items = editorView.querySelectorAll('.autocomplete-plus li');
            expect(items[0]).not.toHaveClass('selected');
            expect(items[1]).toHaveClass('selected');
            expect(items[2]).not.toHaveClass('selected');
            return expect(items[3]).not.toHaveClass('selected');
          });
        });
        it('closes the autocomplete when up arrow pressed when only one item displayed', function() {
          triggerAutocompletion(editor, false, 'q');
          return runs(function() {
            var autocomplete, key;
            key = atom.keymaps.constructor.buildKeydownEvent('up', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).not.toExist();
          });
        });
        it('does not close the autocomplete when up arrow pressed when many items', function() {
          triggerAutocompletion(editor);
          return runs(function() {
            var autocomplete, key;
            key = atom.keymaps.constructor.buildKeydownEvent('up', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).toExist();
          });
        });
        return it('does close the autocomplete when up arrow while up,down navigation not selected', function() {
          atom.config.set('autocomplete-plus.navigateCompletions', 'ctrl-p,ctrl-n');
          triggerAutocompletion(editor);
          return runs(function() {
            var autocomplete, key;
            key = atom.keymaps.constructor.buildKeydownEvent('up', {
              target: document.activeElement
            });
            atom.keymaps.handleKeyboardEvent(key);
            advanceClock(1);
            autocomplete = editorView.querySelector('.autocomplete-plus');
            return expect(autocomplete).not.toExist();
          });
        });
      });
      describe('when a suggestion is clicked', function() {
        return it('should select the item and confirm the selection', function() {
          triggerAutocompletion(editor);
          return runs(function() {
            var item, mouse;
            item = editorView.querySelectorAll('.autocomplete-plus li')[1];
            mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mousedown', true, true, window);
            item.dispatchEvent(mouse);
            mouse = document.createEvent('MouseEvents');
            mouse.initMouseEvent('mouseup', true, true, window);
            item.dispatchEvent(mouse);
            expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
            return expect(editor.getBuffer().getLastLine()).toEqual(item.innerText);
          });
        });
      });
      return describe('.cancel()', function() {
        return it('unbinds autocomplete event handlers for move-up and move-down', function() {
          triggerAutocompletion(editor, false);
          autocompleteManager.hideSuggestionList();
          editorView = atom.views.getView(editor);
          atom.commands.dispatch(editorView, 'core:move-down');
          expect(editor.getCursorBufferPosition().row).toBe(1);
          atom.commands.dispatch(editorView, 'core:move-up');
          return expect(editor.getCursorBufferPosition().row).toBe(0);
        });
      });
    });
    describe('when a long completion exists', function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', true);
        });
        waitsForPromise(function() {
          return atom.workspace.open('samplelong.js').then(function(e) {
            return editor = e;
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            mainModule = a.mainModule;
            return autocompleteManager = mainModule.autocompleteManager;
          });
        });
      });
      return it('sets the width of the view to be wide enough to contain the longest completion without scrolling', function() {
        editor.moveToBottom();
        editor.insertNewline();
        editor.insertText('t');
        waitForAutocomplete();
        return runs(function() {
          var suggestionListView;
          suggestionListView = atom.views.getView(autocompleteManager.suggestionList);
          return expect(suggestionListView.scrollWidth).toBe(suggestionListView.offsetWidth);
        });
      });
    });
    return describe('when auto-activation is disabled', function() {
      beforeEach(function() {
        runs(function() {
          return atom.config.set('autocomplete-plus.enableAutoActivation', false);
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.js').then(function(e) {
            editor = e;
            return editorView = atom.views.getView(e);
          });
        });
        return waitsForPromise(function() {
          return atom.packages.activatePackage('autocomplete-plus').then(function(a) {
            mainModule = a.mainModule;
            return autocompleteManager = mainModule.autocompleteManager;
          });
        });
      });
      it('does not show suggestions after a delay', function() {
        triggerAutocompletion(editor);
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
        });
      });
      return it('shows suggestions when explicitly triggered', function() {
        triggerAutocompletion(editor);
        runs(function() {
          expect(editorView.querySelector('.autocomplete-plus')).not.toExist();
          atom.commands.dispatch(editorView, 'autocomplete-plus:activate');
          return waitForAutocomplete();
        });
        return runs(function() {
          return expect(editorView.querySelector('.autocomplete-plus')).toExist();
        });
      });
    });
  });

}).call(this);
