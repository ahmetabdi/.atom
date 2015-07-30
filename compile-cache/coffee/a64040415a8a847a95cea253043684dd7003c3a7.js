(function() {
  describe("Tag autocomplete tests", function() {
    var buffer, editor, languageMode, _ref;
    _ref = [], editor = _ref[0], buffer = _ref[1], languageMode = _ref[2];
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage("react");
      });
      waitsForPromise(function() {
        return atom.workspace.open("foofoo", {
          autoIndent: false
        }).then(function(o) {
          var grammar;
          editor = o;
          buffer = editor.buffer, languageMode = editor.languageMode;
          grammar = atom.grammars.grammarForScopeName("source.js.jsx");
          return editor.setGrammar(grammar);
        });
      });
      return afterEach(function() {
        atom.packages.deactivatePackages();
        return atom.packages.unloadPackages();
      });
    });
    return describe("tag handling", function() {
      it("should autocomplete tag", function() {
        editor.insertText('<p');
        editor.insertText('>');
        return expect(editor.getText()).toBe('<p></p>');
      });
      it("should not autocomplete tag attributes", function() {
        editor.insertText('<p attr={ 1');
        editor.insertText('>');
        return expect(editor.getText()).toBe('<p attr={ 1>');
      });
      it("should not autocomplete tag attributes with arrow functions", function() {
        editor.insertText('<p attr={number =');
        editor.insertText('>');
        return expect(editor.getText()).toBe('<p attr={number =>');
      });
      it("should not autocomplete tag attributes when insterted between", function() {
        editor.insertText('<p attr={ 1 }');
        editor.setCursorBufferPosition([0, 11]);
        editor.insertText('>');
        return expect(editor.getText()).toBe('<p attr={ 1> }');
      });
      it("should remove closing tag", function() {
        editor.insertText('<p');
        editor.insertText('>');
        expect(editor.getText()).toBe('<p></p>');
        editor.backspace();
        return expect(editor.getText()).toBe('<p');
      });
      return it("should add extra line break when new line added between open and close tag", function() {
        editor.insertText('<p></p>');
        editor.setCursorBufferPosition([0, 3]);
        editor.insertText('\n');
        expect(editor.buffer.getLines()[0]).toBe('<p>');
        expect(editor.buffer.getLines()[2]).toBe('</p>');
        editor.setText("");
        editor.insertText('<p\n  attr=""></p>');
        editor.setCursorBufferPosition([1, 10]);
        editor.insertText('\n');
        expect(editor.buffer.getLines()[0]).toBe('<p');
        expect(editor.buffer.getLines()[1]).toBe('  attr="">');
        return expect(editor.buffer.getLines()[3]).toBe('</p>');
      });
    });
  });

}).call(this);
