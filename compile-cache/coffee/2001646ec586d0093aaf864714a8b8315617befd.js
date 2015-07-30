(function() {
  var Selector, SymbolStore, TextEditor;

  SymbolStore = require('../lib/symbol-store');

  TextEditor = require('atom').TextEditor;

  Selector = require('selector-kit').Selector;

  describe('SymbolStore', function() {
    var buffer, editor, store, _ref;
    _ref = [], store = _ref[0], editor = _ref[1], buffer = _ref[2];
    beforeEach(function() {
      waitsForPromise(function() {
        return Promise.all([
          atom.packages.activatePackage("language-coffee-script"), atom.workspace.open('sample.coffee').then(function(e) {
            return editor = e;
          })
        ]);
      });
      return runs(function() {
        store = new SymbolStore(/\b\w*[a-zA-Z_-]+\w*\b/g);
        editor.setText('');
        buffer = editor.getBuffer();
        buffer.onWillChange(function(_arg) {
          var oldRange;
          oldRange = _arg.oldRange;
          return store.removeTokensInBufferRange(editor, oldRange);
        });
        return buffer.onDidChange(function(_arg) {
          var newRange;
          newRange = _arg.newRange;
          return store.addTokensInBufferRange(editor, newRange);
        });
      });
    });
    it("adds and removes symbols and counts references", function() {
      expect(store.getLength()).toBe(0);
      editor.setText('\n\nabc = ->');
      expect(store.getLength()).toBe(1);
      expect(store.getSymbol('abc').getCount()).toBe(1);
      editor.setText('');
      expect(store.getLength()).toBe(0);
      expect(store.getSymbol('abc')).toBeUndefined();
      editor.setText('\n\nabc = ->\nabc = 34');
      expect(store.getLength()).toBe(1);
      expect(store.getSymbol('abc').getCount()).toBe(2);
      editor.setText('\n\nabc = ->');
      expect(store.getLength()).toBe(1);
      return expect(store.getSymbol('abc').getCount()).toBe(1);
    });
    return describe("::symbolsForConfig(config)", function() {
      it("gets a list of symbols matching the passed in configuration", function() {
        var config, symbols;
        config = {
          "function": {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        expect(store.getLength()).toBe(3);
        symbols = store.symbolsForConfig(config);
        expect(symbols.length).toBe(1);
        expect(symbols[0].text).toBe('abc');
        return expect(symbols[0].type).toBe('function');
      });
      it("updates the symbol types as new tokens come in", function() {
        var config, symbols;
        config = {
          variable: {
            selectors: Selector.create('.variable'),
            typePriority: 2
          },
          "function": {
            selectors: Selector.create('.function'),
            typePriority: 3
          },
          "class": {
            selectors: Selector.create('.class.name'),
            typePriority: 4
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        symbols = store.symbolsForConfig(config);
        expect(symbols.length).toBe(2);
        expect(symbols[0].text).toBe('abc');
        expect(symbols[0].type).toBe('function');
        expect(symbols[1].text).toBe('avar');
        expect(symbols[1].type).toBe('variable');
        editor.setCursorBufferPosition([0, 0]);
        editor.insertText('class abc');
        symbols = store.symbolsForConfig(config);
        expect(symbols.length).toBe(2);
        expect(symbols[0].text).toBe('abc');
        expect(symbols[0].type).toBe('class');
        expect(symbols[1].text).toBe('avar');
        return expect(symbols[1].type).toBe('variable');
      });
      it("returns symbols with an empty type", function() {
        var config, symbols;
        config = {
          '': {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        symbols = store.symbolsForConfig(config);
        expect(symbols.length).toBe(1);
        expect(symbols[0].text).toBe('abc');
        return expect(symbols[0].type).toBe('');
      });
      return it("resets the types when a new config is used", function() {
        var config, symbols;
        config = {
          'function': {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        symbols = store.symbolsForConfig(config);
        expect(symbols.length).toBe(1);
        expect(symbols[0].text).toBe('abc');
        expect(symbols[0].type).toBe('function');
        config = {
          'newtype': {
            selectors: Selector.create('.function'),
            typePriority: 1
          }
        };
        editor.setText('\n\nabc = -> cats\n\navar = 1');
        symbols = store.symbolsForConfig(config);
        expect(symbols.length).toBe(1);
        expect(symbols[0].text).toBe('abc');
        return expect(symbols[0].type).toBe('newtype');
      });
    });
  });

}).call(this);
