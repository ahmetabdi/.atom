(function() {
  var $$, CompositeDisposable, Disposable, SpecTreeView, TreeView, View, parser, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Disposable = _ref.Disposable, CompositeDisposable = _ref.CompositeDisposable;

  _ref1 = require('atom-space-pen-views'), View = _ref1.View, $$ = _ref1.$$;

  parser = require('./parser');

  TreeView = require('./tree-view').TreeView;

  module.exports = SpecTreeView = (function(_super) {
    __extends(SpecTreeView, _super);

    function SpecTreeView() {
      return SpecTreeView.__super__.constructor.apply(this, arguments);
    }

    SpecTreeView.content = function() {
      return this.div({
        "class": 'spec-tree-view tool-panel focusable-panel'
      });
    };

    SpecTreeView.prototype.initialize = function() {
      this.treeView = new TreeView;
      this.append(this.treeView);
      this.disposables = new CompositeDisposable;
      this.states = new WeakMap();
      return this.handleEvents();
    };

    SpecTreeView.prototype.handleEvents = function() {
      return this.treeView.onSelect((function(_this) {
        return function(_arg) {
          var editor, item, position;
          item = _arg.item;
          position = [item.line - 1, 0];
          editor = atom.workspace.getActiveTextEditor();
          editor.scrollToBufferPosition(position, {
            center: true
          });
          editor.setCursorBufferPosition(position);
          return editor.moveToFirstCharacterOfLine();
        };
      })(this));
    };

    SpecTreeView.prototype.handleEditorEvents = function(editor) {
      var _ref2;
      if (!editor) {
        return;
      }
      if ((_ref2 = this.editorHandlers) != null) {
        _ref2.dispose();
      }
      this.editorHandlers = null;
      if (this.states.has(editor)) {
        this.editorHandlers = new CompositeDisposable;
        return this.editorHandlers.add(editor.onDidSave((function(_this) {
          return function() {
            return _this.setState(editor);
          };
        })(this)));
      }
    };

    SpecTreeView.prototype.toggle = function(editor) {
      if (!editor) {
        return;
      }
      if (this.states.has(editor)) {
        this.removeState(editor);
      } else {
        this.setState(editor);
      }
      return this.handleEditorEvents(editor);
    };

    SpecTreeView.prototype.setState = function(editor) {
      var e, specTree;
      if (!editor) {
        return;
      }
      try {
        specTree = parser.parse(editor.getText());
      } catch (_error) {
        e = _error;
        console.error(e.message);
      }
      this.states.set(editor, specTree || []);
      return this.render(editor);
    };

    SpecTreeView.prototype.removeState = function(editor) {
      if (!editor) {
        return;
      }
      this.states["delete"](editor);
      return this.render(editor);
    };

    SpecTreeView.prototype.render = function(editor) {
      var tree;
      if (!editor) {
        return;
      }
      tree = this.states.get(editor);
      if (tree) {
        this.treeView.setRoot({
          label: 'root',
          children: tree
        });
        return this.panel.show();
      } else {
        return this.panel.hide();
      }
    };

    SpecTreeView.prototype.attach = function() {
      this.panel = atom.workspace.addRightPanel({
        item: this,
        visible: false
      });
      this.disposables.add(new Disposable((function(_this) {
        return function() {
          _this.panel.destroy();
          return _this.panel = null;
        };
      })(this)));
      return this.disposables.add(atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(editor) {
          _this.handleEditorEvents(editor);
          return _this.render(editor);
        };
      })(this)));
    };

    SpecTreeView.prototype.detach = function() {
      var _ref2;
      this.disposables.dispose();
      return (_ref2 = this.editorHandlers) != null ? _ref2.dispose() : void 0;
    };

    SpecTreeView.prototype.destroy = function() {
      return this.detach();
    };

    return SpecTreeView;

  })(View);

}).call(this);
