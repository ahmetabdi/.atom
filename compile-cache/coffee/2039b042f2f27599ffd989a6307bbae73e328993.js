(function() {
  var $$, FileView, SymbolsView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $$ = require('atom').$$;

  SymbolsView = require('./symbols-view');

  module.exports = FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.prototype.initialize = function() {
      FileView.__super__.initialize.apply(this, arguments);
      this.subscribe(atom.project.eachBuffer((function(_this) {
        return function(buffer) {
          _this.subscribe(buffer, 'after-will-be-saved', function() {
            var f;
            if (!buffer.isModified()) {
              return;
            }
            f = buffer.getPath();
            if (!atom.project.contains(f)) {
              return;
            }
            return _this.ctagsCache.generateTags(f);
          });
          return _this.subscribe(buffer, 'destroyed', function() {
            return _this.unsubscribe(buffer);
          });
        };
      })(this)));
      return this.subscribe(atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          return _this.subscribe(editor, 'destroyed', function() {
            return _this.unsubscribe(editor);
          });
        };
      })(this)));
    };

    FileView.prototype.viewForItem = function(_arg) {
      var file, name, pattern, position;
      position = _arg.position, name = _arg.name, file = _arg.file, pattern = _arg.pattern;
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div({
              "class": 'primary-line'
            }, function() {
              _this.span(name, {
                "class": 'pull-left'
              });
              return _this.span(pattern, {
                "class": 'pull-right'
              });
            });
            return _this.div({
              "class": 'secondary-line'
            }, function() {
              _this.span("Line " + (position.row + 1), {
                "class": 'pull-left'
              });
              return _this.span(file, {
                "class": 'pull-right'
              });
            });
          };
        })(this));
      });
    };

    FileView.prototype.toggle = function() {
      var editor, filePath;
      if (this.hasParent()) {
        return this.cancel();
      } else {
        editor = atom.workspace.getActiveEditor();
        if (!editor) {
          return;
        }
        filePath = editor.getPath();
        if (!filePath) {
          return;
        }
        this.cancelPosition = editor.getCursorBufferPosition();
        this.populate(filePath);
        return this.attach();
      }
    };

    FileView.prototype.cancel = function() {
      FileView.__super__.cancel.apply(this, arguments);
      if (this.cancelPosition) {
        this.scrollToPosition(this.cancelPosition, false);
      }
      return this.cancelPosition = null;
    };

    FileView.prototype.toggleAll = function() {
      var key, tags, val, _ref;
      if (this.hasParent()) {
        return this.cancel();
      } else {
        this.list.empty();
        this.maxItems = 10;
        tags = [];
        _ref = this.ctagsCache.cachedTags;
        for (key in _ref) {
          val = _ref[key];
          tags.push.apply(tags, val);
        }
        this.setItems(tags);
        return this.attach();
      }
    };

    FileView.prototype.getCurSymbol = function() {
      var editor, range;
      editor = atom.workspace.getActiveEditor();
      if (!editor) {
        console.error("[atom-ctags:getCurSymbol] failed getActiveEditor ");
        return;
      }
      if (editor.getCursor().getScopes().indexOf('source.ruby') !== -1) {
        range = editor.getCursor().getCurrentWordBufferRange({
          wordRegex: /[\w!?]*/g
        });
      } else {
        range = editor.getCursor().getCurrentWordBufferRange();
      }
      return editor.getTextInRange(range);
    };

    FileView.prototype.rebuild = function() {
      var projectPath;
      projectPath = atom.project.getPath();
      if (!projectPath) {
        console.error("[atom-ctags:rebuild] cancel rebuild, invalid projectPath: " + projectPath);
        return;
      }
      this.ctagsCache.cachedTags = {};
      return this.ctagsCache.generateTags(projectPath);
    };

    FileView.prototype.goto = function() {
      var symbol, tags;
      symbol = this.getCurSymbol();
      if (!symbol) {
        console.error("[atom-ctags:goto] failed getCurSymbol");
        return;
      }
      tags = this.ctagsCache.findTags(symbol);
      if (tags.length === 1) {
        return this.openTag(tags[0]);
      } else {
        this.setItems(tags);
        return this.attach();
      }
    };

    FileView.prototype.populate = function(filePath) {
      this.list.empty();
      this.setLoading('Generating symbols\u2026');
      return this.ctagsCache.getOrCreateTags(filePath, (function(_this) {
        return function(tags) {
          _this.maxItem = Infinity;
          return _this.setItems(tags);
        };
      })(this));
    };

    FileView.prototype.scrollToItemView = function(view) {
      var tag;
      FileView.__super__.scrollToItemView.apply(this, arguments);
      if (!this.cancelPosition) {
        return;
      }
      tag = this.getSelectedItem();
      return this.scrollToPosition(tag.position);
    };

    FileView.prototype.scrollToPosition = function(position, select) {
      var editor, editorView;
      if (select == null) {
        select = true;
      }
      editorView = atom.workspaceView.getActiveView();
      if (!editorView) {
        return;
      }
      editor = editorView.getEditor();
      editorView.scrollToBufferPosition(position, {
        center: true
      });
      editor.setCursorBufferPosition(position);
      if (select) {
        return editor.selectWord();
      }
    };

    return FileView;

  })(SymbolsView);

}).call(this);
