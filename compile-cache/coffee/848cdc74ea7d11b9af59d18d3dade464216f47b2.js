(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    activate: function() {
      this.subscriptions = new CompositeDisposable;
      return this.subscriptions.add(atom.commands.add('atom-workspace', 'spec-tree-view:toggle', (function(_this) {
        return function() {
          var editor;
          editor = atom.workspace.getActiveTextEditor();
          return _this.getView().toggle(editor);
        };
      })(this)));
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.subscriptions) != null) {
        _ref.dispose();
      }
      if ((_ref1 = this.view) != null) {
        _ref1.destroy();
      }
      return this.view = null;
    },
    getView: function() {
      var SpecTreeView;
      if (!this.view) {
        SpecTreeView = require('./spec-tree-view');
        this.view = new SpecTreeView();
        this.view.attach();
      }
      return this.view;
    }
  };

}).call(this);
