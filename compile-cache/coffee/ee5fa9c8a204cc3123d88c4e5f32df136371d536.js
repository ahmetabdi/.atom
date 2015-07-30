(function() {
  var $$, SelectListView, SymbolsView, fs, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  fs = null;

  module.exports = SymbolsView = (function(_super) {
    __extends(SymbolsView, _super);

    function SymbolsView() {
      return SymbolsView.__super__.constructor.apply(this, arguments);
    }

    SymbolsView.prototype.initialize = function(stack) {
      this.stack = stack;
      SymbolsView.__super__.initialize.apply(this, arguments);
      return this.addClass('atom-ctags overlay from-top');
    };

    SymbolsView.prototype.destroy = function() {
      this.cancel();
      return this.remove();
    };

    SymbolsView.prototype.getFilterKey = function() {
      return 'name';
    };

    SymbolsView.prototype.viewForItem = function(_arg) {
      var file, name, position;
      position = _arg.position, name = _arg.name, file = _arg.file;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            if (position != null) {
              _this.div("" + name + ":" + (position.row + 1), {
                "class": 'primary-line'
              });
            } else {
              _this.div(name, {
                "class": 'primary-line'
              });
            }
            return _this.div(file, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    SymbolsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No symbols found';
      } else {
        return SymbolsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    SymbolsView.prototype.confirmed = function(tag) {
      this.cancelPosition = null;
      this.cancel();
      return this.openTag(tag);
    };

    SymbolsView.prototype.openTag = function(tag) {
      var editor, position, previous;
      if (editor = atom.workspace.getActiveEditor()) {
        previous = {
          position: editor.getCursorBufferPosition(),
          file: editor.getUri()
        };
      }
      position = tag.position;
      atom.workspaceView.open(tag.file).done((function(_this) {
        return function() {
          if (position) {
            return _this.moveToPosition(position);
          }
        };
      })(this));
      return this.stack.push(previous);
    };

    SymbolsView.prototype.moveToPosition = function(position) {
      var editor, editorView;
      editorView = atom.workspaceView.getActiveView();
      if (editor = typeof editorView.getEditor === "function" ? editorView.getEditor() : void 0) {
        editorView.scrollToBufferPosition(position, {
          center: true
        });
        return editor.setCursorBufferPosition(position);
      }
    };

    SymbolsView.prototype.attach = function() {
      if (this.parent().length > 0) {
        return;
      }
      this.storeFocusedElement();
      atom.workspaceView.appendToTop(this);
      return this.focusFilterEditor();
    };

    return SymbolsView;

  })(SelectListView);

}).call(this);
