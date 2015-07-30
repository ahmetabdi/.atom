(function() {
  describe("HTML autocompletions", function() {
    var editor, getCompletions, provider, _ref;
    _ref = [], editor = _ref[0], provider = _ref[1];
    getCompletions = function() {
      var cursor, end, prefix, request, start;
      cursor = editor.getLastCursor();
      start = cursor.getBeginningOfCurrentWordBufferPosition();
      end = cursor.getBufferPosition();
      prefix = editor.getTextInRange([start, end]);
      request = {
        editor: editor,
        bufferPosition: end,
        scopeDescriptor: cursor.getScopeDescriptor(),
        prefix: prefix
      };
      return provider.getSuggestions(request);
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('autocomplete-html');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-html');
      });
      runs(function() {
        return provider = atom.packages.getActivePackage('autocomplete-html').mainModule.getProvider();
      });
      waitsFor(function() {
        return Object.keys(provider.completions).length > 0;
      });
      waitsForPromise(function() {
        return atom.workspace.open('test.html');
      });
      return runs(function() {
        return editor = atom.workspace.getActiveTextEditor();
      });
    });
    it("returns no completions when not at the start of a tag", function() {
      editor.setText('');
      expect(getCompletions().length).toBe(0);
      editor.setText('d');
      editor.setCursorBufferPosition([0, 0]);
      expect(getCompletions().length).toBe(0);
      editor.setCursorBufferPosition([0, 1]);
      return expect(getCompletions().length).toBe(0);
    });
    it("returns no completions in style tags", function() {
      editor.setText("<style>\n<\n</style>");
      editor.setCursorBufferPosition([1, 1]);
      return expect(getCompletions().length).toBe(0);
    });
    it("returns no completions in script tags", function() {
      editor.setText("<script>\n<\n</script>");
      editor.setCursorBufferPosition([1, 1]);
      return expect(getCompletions().length).toBe(0);
    });
    it("autcompletes tag names without a prefix", function() {
      var completion, completions, _i, _len, _results;
      editor.setText('<');
      editor.setCursorBufferPosition([0, 1]);
      completions = getCompletions();
      expect(completions.length).toBe(112);
      _results = [];
      for (_i = 0, _len = completions.length; _i < _len; _i++) {
        completion = completions[_i];
        _results.push(expect(completion.text.length).toBeGreaterThan(0));
      }
      return _results;
    });
    it("autocompletes tag names with a prefix", function() {
      var completions;
      editor.setText('<d');
      editor.setCursorBufferPosition([0, 2]);
      completions = getCompletions();
      expect(completions.length).toBe(9);
      expect(completions[0].text).toBe('datalist');
      expect(completions[0].replacementPrefix).toBe('d');
      expect(completions[1].text).toBe('dd');
      expect(completions[2].text).toBe('del');
      expect(completions[3].text).toBe('details');
      expect(completions[4].text).toBe('dfn');
      expect(completions[5].text).toBe('dialog');
      expect(completions[6].text).toBe('div');
      expect(completions[7].text).toBe('dl');
      expect(completions[8].text).toBe('dt');
      editor.setText('<D');
      editor.setCursorBufferPosition([0, 2]);
      completions = getCompletions();
      expect(completions.length).toBe(9);
      expect(completions[0].text).toBe('datalist');
      expect(completions[0].replacementPrefix).toBe('D');
      expect(completions[1].text).toBe('dd');
      expect(completions[2].text).toBe('del');
      expect(completions[3].text).toBe('details');
      expect(completions[4].text).toBe('dfn');
      expect(completions[5].text).toBe('dialog');
      expect(completions[6].text).toBe('div');
      expect(completions[7].text).toBe('dl');
      return expect(completions[8].text).toBe('dt');
    });
    it("autocompletes attribute names without a prefix", function() {
      var completion, completions, _i, _j, _len, _len1, _results;
      editor.setText('<div ');
      editor.setCursorBufferPosition([0, 5]);
      completions = getCompletions();
      expect(completions.length).toBe(69);
      for (_i = 0, _len = completions.length; _i < _len; _i++) {
        completion = completions[_i];
        expect(completion.text.length).toBeGreaterThan(0);
      }
      editor.setText('<marquee ');
      editor.setCursorBufferPosition([0, 9]);
      completions = getCompletions();
      expect(completions.length).toBe(81);
      _results = [];
      for (_j = 0, _len1 = completions.length; _j < _len1; _j++) {
        completion = completions[_j];
        _results.push(expect(completion.text.length).toBeGreaterThan(0));
      }
      return _results;
    });
    it("autocompletes attribute names with a prefix", function() {
      var completions;
      editor.setText('<div c');
      editor.setCursorBufferPosition([0, 6]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('class');
      expect(completions[0].replacementPrefix).toBe('c');
      expect(completions[1].text).toBe('contenteditable');
      expect(completions[2].text).toBe('contextmenu');
      editor.setText('<div C');
      editor.setCursorBufferPosition([0, 6]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('class');
      expect(completions[0].replacementPrefix).toBe('C');
      expect(completions[1].text).toBe('contenteditable');
      expect(completions[2].text).toBe('contextmenu');
      editor.setText('<div c>');
      editor.setCursorBufferPosition([0, 6]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('class');
      expect(completions[1].text).toBe('contenteditable');
      expect(completions[2].text).toBe('contextmenu');
      editor.setText('<div c></div>');
      editor.setCursorBufferPosition([0, 6]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('class');
      expect(completions[1].text).toBe('contenteditable');
      expect(completions[2].text).toBe('contextmenu');
      editor.setText('<marquee di');
      editor.setCursorBufferPosition([0, 12]);
      completions = getCompletions();
      expect(completions.length).toBe(2);
      expect(completions[0].text).toBe('dir');
      expect(completions[1].text).toBe('direction');
      editor.setText('<marquee dI');
      editor.setCursorBufferPosition([0, 12]);
      completions = getCompletions();
      expect(completions.length).toBe(2);
      expect(completions[0].text).toBe('dir');
      return expect(completions[1].text).toBe('direction');
    });
    it("autocompletes attribute values without a prefix", function() {
      var completions;
      editor.setText('<div behavior=""');
      editor.setCursorBufferPosition([0, 15]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('scroll');
      expect(completions[1].text).toBe('slide');
      expect(completions[2].text).toBe('alternate');
      editor.setText('<div behavior="');
      editor.setCursorBufferPosition([0, 15]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('scroll');
      expect(completions[1].text).toBe('slide');
      expect(completions[2].text).toBe('alternate');
      editor.setText('<div behavior=\'');
      editor.setCursorBufferPosition([0, 15]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('scroll');
      expect(completions[1].text).toBe('slide');
      expect(completions[2].text).toBe('alternate');
      editor.setText('<div behavior=\'\'');
      editor.setCursorBufferPosition([0, 15]);
      completions = getCompletions();
      expect(completions.length).toBe(3);
      expect(completions[0].text).toBe('scroll');
      expect(completions[1].text).toBe('slide');
      return expect(completions[2].text).toBe('alternate');
    });
    return it("autocompletes attribute values with a prefix", function() {
      var completions;
      editor.setText('<html behavior="" lang="e"');
      editor.setCursorBufferPosition([0, 25]);
      completions = getCompletions();
      expect(completions.length).toBe(6);
      expect(completions[0].text).toBe('eu');
      expect(completions[0].replacementPrefix).toBe('e');
      expect(completions[1].text).toBe('en');
      expect(completions[2].text).toBe('eo');
      expect(completions[3].text).toBe('et');
      expect(completions[4].text).toBe('el');
      expect(completions[5].text).toBe('es');
      editor.setText('<html behavior="" lang="E"');
      editor.setCursorBufferPosition([0, 25]);
      completions = getCompletions();
      expect(completions.length).toBe(6);
      expect(completions[0].text).toBe('eu');
      expect(completions[0].replacementPrefix).toBe('E');
      expect(completions[1].text).toBe('en');
      expect(completions[2].text).toBe('eo');
      expect(completions[3].text).toBe('et');
      expect(completions[4].text).toBe('el');
      expect(completions[5].text).toBe('es');
      editor.setText('<html behavior="" lang=\'e\'');
      editor.setCursorBufferPosition([0, 25]);
      completions = getCompletions();
      expect(completions.length).toBe(6);
      expect(completions[0].text).toBe('eu');
      expect(completions[1].text).toBe('en');
      expect(completions[2].text).toBe('eo');
      expect(completions[3].text).toBe('et');
      expect(completions[4].text).toBe('el');
      return expect(completions[5].text).toBe('es');
    });
  });

}).call(this);
