(function() {
  var AtomGitDiffDetailsView, DiffDetailsDataManager, Highlights, Housekeeping, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  Highlights = require('highlights');

  DiffDetailsDataManager = require('./data-manager');

  Housekeeping = require('./housekeeping');

  module.exports = AtomGitDiffDetailsView = (function(_super) {
    __extends(AtomGitDiffDetailsView, _super);

    function AtomGitDiffDetailsView() {
      this.notifyContentsModified = __bind(this.notifyContentsModified, this);
      return AtomGitDiffDetailsView.__super__.constructor.apply(this, arguments);
    }

    Housekeeping.includeInto(AtomGitDiffDetailsView);

    AtomGitDiffDetailsView.content = function() {
      return this.div({
        "class": "git-diff-details-outer"
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "git-diff-details-main-panel",
            outlet: "mainPanel"
          }, function() {
            return _this.div({
              "class": "editor",
              outlet: "contents"
            });
          });
          return _this.div({
            "class": "git-diff-details-button-panel",
            outlet: "buttonPanel"
          }, function() {
            _this.button({
              "class": 'btn btn-primary inline-block-tight',
              click: "copy"
            }, 'Copy');
            return _this.button({
              "class": 'btn btn-error inline-block-tight',
              click: "undo"
            }, 'Undo');
          });
        };
      })(this));
    };

    AtomGitDiffDetailsView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      this.initializeHousekeeping();
      this.preventFocusOut();
      this.highlighter = new Highlights();
      this.diffDetailsDataManager = new DiffDetailsDataManager();
      this.showDiffDetails = false;
      this.lineDiffDetails = null;
      return this.updateCurrentRow();
    };

    AtomGitDiffDetailsView.prototype.preventFocusOut = function() {
      this.buttonPanel.on('mousedown', function() {
        return false;
      });
      return this.mainPanel.on('mousedown', function() {
        return false;
      });
    };

    AtomGitDiffDetailsView.prototype.notifyContentsModified = function() {
      if (this.editor.isDestroyed()) {
        return;
      }
      this.diffDetailsDataManager.invalidate(atom.project.getRepo(), this.buffer.getPath(), this.buffer.getText());
      if (this.showDiffDetails) {
        return this.updateDiffDetailsDisplay();
      }
    };

    AtomGitDiffDetailsView.prototype.toggleShowDiffDetails = function() {
      this.showDiffDetails = !this.showDiffDetails;
      return this.updateDiffDetails();
    };

    AtomGitDiffDetailsView.prototype.closeDiffDetails = function() {
      this.showDiffDetails = false;
      return this.updateDiffDetails();
    };

    AtomGitDiffDetailsView.prototype.updateDiffDetails = function() {
      this.diffDetailsDataManager.invalidatePreviousSelectedHunk();
      this.updateCurrentRow();
      return this.updateDiffDetailsDisplay();
    };

    AtomGitDiffDetailsView.prototype.removeDecorations = function() {};

    AtomGitDiffDetailsView.prototype.notifyChangeCursorPosition = function() {
      var currentRowChanged;
      if (this.showDiffDetails) {
        currentRowChanged = this.updateCurrentRow();
        if (currentRowChanged) {
          return this.updateDiffDetailsDisplay();
        }
      }
    };

    AtomGitDiffDetailsView.prototype.attach = function() {
      return this.editorView.appendToLinesView(this);
    };

    AtomGitDiffDetailsView.prototype.setPosition = function(top) {
      var left, _ref;
      _ref = this.editorView.pixelPositionForBufferPosition({
        row: top - 1,
        col: 0
      }), left = _ref.left, top = _ref.top;
      return this.css({
        top: top + this.editorView.lineHeight
      });
    };

    AtomGitDiffDetailsView.prototype.populate = function(selectedHunk) {
      var html;
      html = this.highlighter.highlightSync({
        filePath: this.buffer.getBaseName(),
        fileContents: selectedHunk.oldString
      });
      html = html.replace('<pre class="editor editor-colors">', '').replace('</pre>', '');
      this.contents.html(html);
      return this.contents.css({
        height: selectedHunk.oldLines.length * this.editorView.lineHeight
      });
    };

    AtomGitDiffDetailsView.prototype.copy = function(e) {
      var selectedHunk;
      selectedHunk = this.diffDetailsDataManager.getSelectedHunk(this.currentRow).selectedHunk;
      return atom.clipboard.write(selectedHunk.oldString);
    };

    AtomGitDiffDetailsView.prototype.undo = function(e) {
      var buffer, selectedHunk;
      selectedHunk = this.diffDetailsDataManager.getSelectedHunk(this.currentRow).selectedHunk;
      if (buffer = this.editor.getBuffer()) {
        if (selectedHunk.kind === "m") {
          buffer.deleteRows(selectedHunk.start - 1, selectedHunk.end - 1);
          return buffer.insert([selectedHunk.start - 1, 0], selectedHunk.oldString);
        } else {
          return buffer.insert([selectedHunk.start, 0], selectedHunk.oldString);
        }
      }
    };

    AtomGitDiffDetailsView.prototype.getActiveTextEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    AtomGitDiffDetailsView.prototype.updateDiffDetailsDisplay = function() {
      var isDifferent, selectedHunk, _ref;
      if (this.showDiffDetails) {
        _ref = this.diffDetailsDataManager.getSelectedHunk(this.currentRow), selectedHunk = _ref.selectedHunk, isDifferent = _ref.isDifferent;
        if (selectedHunk != null) {
          if (!isDifferent) {
            return;
          }
          this.attach();
          this.setPosition(selectedHunk.end);
          this.populate(selectedHunk);
          return;
        }
        this.previousSelectedHunk = selectedHunk;
      }
      this.detach();
    };

    AtomGitDiffDetailsView.prototype.updateCurrentRow = function() {
      var newCurrentRow, _ref, _ref1;
      newCurrentRow = ((_ref = this.getActiveTextEditor()) != null ? (_ref1 = _ref.getCursorBufferPosition()) != null ? _ref1.row : void 0 : void 0) + 1;
      if (newCurrentRow !== this.currentRow) {
        this.currentRow = newCurrentRow;
        return true;
      }
      return false;
    };

    return AtomGitDiffDetailsView;

  })(View);

}).call(this);
