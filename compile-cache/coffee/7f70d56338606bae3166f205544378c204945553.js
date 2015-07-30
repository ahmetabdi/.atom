(function() {
  var $, TokenizedBuffer, WorkspaceView, _;

  require('./benchmark-helper');

  $ = require('../src/space-pen-extensions').$;

  _ = require('underscore-plus');

  WorkspaceView = require('atom').WorkspaceView;

  TokenizedBuffer = require('../src/tokenized-buffer');

  describe("editorView.", function() {
    var editorView;
    editorView = null;
    beforeEach(function() {
      atom.workspaceViewParentSelector = '#jasmine-content';
      atom.workspaceView = atom.views.getView(atom.workspace).__spacePenView;
      atom.workspaceView.attachToDom();
      atom.workspaceView.width(1024);
      atom.workspaceView.height(768);
      atom.workspaceView.openSync();
      return editorView = atom.workspaceView.getActiveView();
    });
    afterEach(function() {
      if (editorView.pendingDisplayUpdate) {
        return waitsFor("editor to finish rendering", function(done) {
          return editorView.on('editor:display-updated', done);
        });
      }
    });
    describe("keymap.", function() {
      var event;
      event = null;
      beforeEach(function() {
        return event = keydownEvent('x', {
          target: editorView.hiddenInput[0]
        });
      });
      return benchmark("keydown-event-with-no-binding", 10, function() {
        return keymap.handleKeyEvent(event);
      });
    });
    describe("opening-buffers.", function() {
      return benchmark("300-line-file.", function() {
        var buffer;
        return buffer = project.bufferForPathSync('medium.coffee');
      });
    });
    describe("empty-file.", function() {
      return benchmark("insert-delete", function() {
        editorView.insertText('x');
        return editorView.backspace();
      });
    });
    describe("300-line-file.", function() {
      beforeEach(function() {
        return atom.workspaceView.openSync('medium.coffee');
      });
      describe("at-begining.", function() {
        benchmark("insert-delete", function() {
          editorView.insertText('x');
          return editorView.backspace();
        });
        return benchmark("insert-delete-rehighlight", function() {
          editorView.insertText('"');
          return editorView.backspace();
        });
      });
      describe("at-end.", function() {
        beforeEach(function() {
          return editorView.moveToBottom();
        });
        return benchmark("insert-delete", function() {
          editorView.insertText('"');
          return editorView.backspace();
        });
      });
      describe("empty-vs-set-innerHTML.", function() {
        var firstRow, lastRow, _ref;
        _ref = [], firstRow = _ref[0], lastRow = _ref[1];
        beforeEach(function() {
          firstRow = editorView.getModel().getFirstVisibleScreenRow();
          return lastRow = editorView.getModel().getLastVisibleScreenRow();
        });
        benchmark("build-gutter-html.", 1000, function() {
          return editorView.gutter.renderLineNumbers(null, firstRow, lastRow);
        });
        benchmark("set-innerHTML.", 1000, function() {
          editorView.gutter.renderLineNumbers(null, firstRow, lastRow);
          return editorView.gutter.lineNumbers[0].innerHtml = '';
        });
        return benchmark("empty.", 1000, function() {
          editorView.gutter.renderLineNumbers(null, firstRow, lastRow);
          return editorView.gutter.lineNumbers.empty();
        });
      });
      describe("positionLeftForLineAndColumn.", function() {
        var line;
        line = null;
        beforeEach(function() {
          editorView.scrollTop(2000);
          editorView.resetDisplay();
          return line = editorView.lineElementForScreenRow(106)[0];
        });
        describe("one-line.", function() {
          beforeEach(function() {
            return editorView.clearCharacterWidthCache();
          });
          benchmark("uncached", 5000, function() {
            editorView.positionLeftForLineAndColumn(line, 106, 82);
            return editorView.clearCharacterWidthCache();
          });
          return benchmark("cached", 5000, function() {
            return editorView.positionLeftForLineAndColumn(line, 106, 82);
          });
        });
        return describe("multiple-lines.", function() {
          var firstRow, lastRow, _ref;
          _ref = [], firstRow = _ref[0], lastRow = _ref[1];
          beforeEach(function() {
            firstRow = editorView.getModel().getFirstVisibleScreenRow();
            return lastRow = editorView.getModel().getLastVisibleScreenRow();
          });
          return benchmark("cache-entire-visible-area", 100, function() {
            var i, _i, _results;
            _results = [];
            for (i = _i = firstRow; firstRow <= lastRow ? _i <= lastRow : _i >= lastRow; i = firstRow <= lastRow ? ++_i : --_i) {
              line = editorView.lineElementForScreenRow(i)[0];
              _results.push(editorView.positionLeftForLineAndColumn(line, i, Math.max(0, editorView.getModel().lineTextForBufferRow(i).length)));
            }
            return _results;
          });
        });
      });
      describe("text-rendering.", function() {
        beforeEach(function() {
          return editorView.scrollTop(2000);
        });
        benchmark("resetDisplay", 50, function() {
          return editorView.resetDisplay();
        });
        benchmark("htmlForScreenRows", 1000, function() {
          var lastRow;
          lastRow = editorView.getLastScreenRow();
          return editorView.htmlForScreenRows(0, lastRow);
        });
        return benchmark("htmlForScreenRows.htmlParsing", 50, function() {
          var div, html, lastRow;
          lastRow = editorView.getLastScreenRow();
          html = editorView.htmlForScreenRows(0, lastRow);
          div = document.createElement('div');
          return div.innerHTML = html;
        });
      });
      describe("gutter-api.", function() {
        describe("getLineNumberElementsForClass.", function() {
          beforeEach(function() {
            editorView.gutter.addClassToLine(20, 'omgwow');
            return editorView.gutter.addClassToLine(40, 'omgwow');
          });
          return benchmark("DOM", 20000, function() {
            return editorView.gutter.getLineNumberElementsForClass('omgwow');
          });
        });
        benchmark("getLineNumberElement.DOM", 20000, function() {
          return editorView.gutter.getLineNumberElement(12);
        });
        benchmark("toggle-class", 2000, function() {
          editorView.gutter.addClassToLine(40, 'omgwow');
          return editorView.gutter.removeClassFromLine(40, 'omgwow');
        });
        return describe("find-then-unset.", function() {
          var classes;
          classes = ['one', 'two', 'three', 'four'];
          benchmark("single-class", 200, function() {
            editorView.gutter.addClassToLine(30, 'omgwow');
            editorView.gutter.addClassToLine(40, 'omgwow');
            return editorView.gutter.removeClassFromAllLines('omgwow');
          });
          return benchmark("multiple-class", 200, function() {
            var klass, _i, _len, _results;
            editorView.gutter.addClassToLine(30, 'one');
            editorView.gutter.addClassToLine(30, 'two');
            editorView.gutter.addClassToLine(40, 'two');
            editorView.gutter.addClassToLine(40, 'three');
            editorView.gutter.addClassToLine(40, 'four');
            _results = [];
            for (_i = 0, _len = classes.length; _i < _len; _i++) {
              klass = classes[_i];
              _results.push(editorView.gutter.removeClassFromAllLines(klass));
            }
            return _results;
          });
        });
      });
      return describe("line-htmlification.", function() {
        var div, html;
        div = null;
        html = null;
        beforeEach(function() {
          var lastRow;
          lastRow = editorView.getLastScreenRow();
          html = editorView.htmlForScreenRows(0, lastRow);
          return div = document.createElement('div');
        });
        return benchmark("setInnerHTML", 1, function() {
          return div.innerHTML = html;
        });
      });
    });
    return describe("9000-line-file.", function() {
      benchmark("opening.", 5, function() {
        return atom.workspaceView.openSync('huge.js');
      });
      return describe("after-opening.", function() {
        beforeEach(function() {
          return atom.workspaceView.openSync('huge.js');
        });
        benchmark("moving-to-eof.", 1, function() {
          return editorView.moveToBottom();
        });
        describe("on-first-line.", function() {
          return benchmark("inserting-newline", 5, function() {
            return editorView.insertNewline();
          });
        });
        describe("on-last-visible-line.", function() {
          beforeEach(function() {
            return editorView.setCursorScreenPosition([editorView.getLastVisibleScreenRow(), 0]);
          });
          return benchmark("move-down-and-scroll", 300, function() {
            return editorView.trigger('move-down');
          });
        });
        return describe("at-eof.", function() {
          var endPosition;
          endPosition = null;
          beforeEach(function() {
            editorView.moveToBottom();
            return endPosition = editorView.getCursorScreenPosition();
          });
          benchmark("move-to-beginning-of-word", function() {
            editorView.moveToBeginningOfWord();
            return editorView.setCursorScreenPosition(endPosition);
          });
          return benchmark("insert", function() {
            return editorView.insertText('x');
          });
        });
      });
    });
  });

  describe("TokenizedBuffer.", function() {
    return describe("coffee-script-grammar.", function() {
      var buffer, languageMode, _ref;
      _ref = [], languageMode = _ref[0], buffer = _ref[1];
      beforeEach(function() {
        var editor;
        editor = benchmarkFixturesProject.openSync('medium.coffee');
        return languageMode = editor.languageMode, buffer = editor.buffer, editor;
      });
      return benchmark("construction", 20, function() {
        return new TokenizedBuffer(buffer, {
          languageMode: languageMode,
          tabLength: 2
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFRLG9CQUFSLENBQUEsQ0FBQTs7QUFBQSxFQUNDLElBQUssT0FBQSxDQUFRLDZCQUFSLEVBQUwsQ0FERCxDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUZKLENBQUE7O0FBQUEsRUFHQyxnQkFBaUIsT0FBQSxDQUFRLE1BQVIsRUFBakIsYUFIRCxDQUFBOztBQUFBLEVBSUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FKbEIsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsQ0FBUyxhQUFULEVBQXdCLFNBQUEsR0FBQTtBQUN0QixRQUFBLFVBQUE7QUFBQSxJQUFBLFVBQUEsR0FBYSxJQUFiLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQywyQkFBTCxHQUFtQyxrQkFBbkMsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLGFBQUwsR0FBcUIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFYLENBQW1CLElBQUksQ0FBQyxTQUF4QixDQUFrQyxDQUFDLGNBRHhELENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBbkIsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBbkIsQ0FBeUIsSUFBekIsQ0FKQSxDQUFBO0FBQUEsTUFLQSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQW5CLENBQTBCLEdBQTFCLENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUFBLENBTkEsQ0FBQTthQU9BLFVBQUEsR0FBYSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQW5CLENBQUEsRUFSSjtJQUFBLENBQVgs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/benchmark/benchmark-suite.coffee