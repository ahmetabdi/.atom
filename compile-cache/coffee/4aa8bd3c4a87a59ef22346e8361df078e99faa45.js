(function() {
  var HighlightSelected, Point, Range, path, _ref;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  HighlightSelected = require('../lib/highlight-selected');

  describe("DecorationExample", function() {
    var activationPromise, editor, editorElement, highlightSelected, workspaceElement, _ref1;
    _ref1 = [], activationPromise = _ref1[0], workspaceElement = _ref1[1], editor = _ref1[2], editorElement = _ref1[3], highlightSelected = _ref1[4];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      atom.project.setPaths([path.join(__dirname, 'fixtures')]);
      waitsForPromise(function() {
        return atom.workspace.open('sample.coffee');
      });
      runs(function() {
        jasmine.attachToDOM(workspaceElement);
        editor = atom.workspace.getActiveTextEditor();
        editorElement = atom.views.getView(editor);
        return activationPromise = atom.packages.activatePackage('highlight-selected').then(function(_arg) {
          var mainModule;
          mainModule = _arg.mainModule;
          return highlightSelected = mainModule.highlightSelected, mainModule;
        });
      });
      return waitsForPromise(function() {
        return activationPromise;
      });
    });
    describe("when the view is loaded", function() {
      return it("attaches the view", function() {
        return expect(workspaceElement.querySelectorAll('.highlight-selected')).toHaveLength(1);
      });
    });
    describe("when a whole word is selected", function() {
      beforeEach(function() {
        var range;
        range = new Range(new Point(8, 2), new Point(8, 8));
        return editor.setSelectedBufferRange(range);
      });
      return it("adds the decoration to all words", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
      });
    });
    describe("when hide highlight on selected word is enabled", function() {
      beforeEach(function() {
        var range;
        atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true);
        range = new Range(new Point(8, 2), new Point(8, 8));
        return editor.setSelectedBufferRange(range);
      });
      return it("adds the decoration to all words", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
      });
    });
    describe("leading whitespace doesn't get used", function() {
      beforeEach(function() {
        var range;
        range = new Range(new Point(8, 0), new Point(8, 8));
        return editor.setSelectedBufferRange(range);
      });
      return it("doesn't add regions", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });
    });
    describe("will highlight non whole words", function() {
      beforeEach(function() {
        var range;
        range = new Range(new Point(10, 13), new Point(10, 17));
        return editor.setSelectedBufferRange(range);
      });
      return it("does add regions", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
      });
    });
    describe("will not highlight non whole words", function() {
      beforeEach(function() {
        var range;
        atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
        range = new Range(new Point(10, 13), new Point(10, 17));
        return editor.setSelectedBufferRange(range);
      });
      return it("does add regions", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
      });
    });
    describe("will not highlight less than minimum length", function() {
      beforeEach(function() {
        var range;
        atom.config.set('highlight-selected.minimumLength', 7);
        range = new Range(new Point(4, 0), new Point(4, 6));
        return editor.setSelectedBufferRange(range);
      });
      return it("doesn't add regions", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
      });
    });
    describe("will not highlight words in different case", function() {
      beforeEach(function() {
        var range;
        range = new Range(new Point(4, 0), new Point(4, 6));
        return editor.setSelectedBufferRange(range);
      });
      return it("does add regions", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
      });
    });
    return describe("will highlight words in different case", function() {
      beforeEach(function() {
        var range;
        atom.config.set('highlight-selected.ignoreCase', true);
        range = new Range(new Point(4, 0), new Point(4, 6));
        return editor.setSelectedBufferRange(range);
      });
      it("does add regions", function() {
        return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(5);
      });
      describe("adds background to selected", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.highlightBackground', true);
          range = new Range(new Point(8, 2), new Point(8, 8));
          return editor.setSelectedBufferRange(range);
        });
        return it("adds the background to all highlights", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.background .region')).toHaveLength(4);
        });
      });
      return describe("adds light theme to selected", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.lightTheme', true);
          range = new Range(new Point(8, 2), new Point(8, 8));
          return editor.setSelectedBufferRange(range);
        });
        return it("adds the background to all highlights", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.light-theme .region')).toHaveLength(4);
        });
      });
    });
  });

}).call(this);
