(function() {
  var Config, LintStatusView, LintView, _;

  LintView = null;

  LintStatusView = null;

  Config = null;

  _ = null;

  module.exports = {
    configDefaults: {
      ignoredNames: [],
      showViolationMetadata: true
    },
    activate: function() {
      atom.workspaceView.command('lint:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      atom.workspaceView.command('lint:toggle-violation-metadata', (function(_this) {
        return function() {
          return _this.toggleViolationMetadata();
        };
      })(this));
      this.lintViews = [];
      return this.enable();
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = atom.workspaceView) != null) {
        _ref.off('lint:toggle-violation-metadata');
      }
      if ((_ref1 = atom.workspaceView) != null) {
        _ref1.off('lint:toggle');
      }
      return this.disable();
    },
    enable: function() {
      this.enabled = true;
      this.editorViewSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          return _this.injectLintViewIntoEditorView(editorView);
        };
      })(this));
      this.injectLintStatusViewIntoStatusBar();
      atom.packages.once('activated', (function(_this) {
        return function() {
          return _this.injectLintStatusViewIntoStatusBar();
        };
      })(this));
      if (Config == null) {
        Config = require('./config');
      }
      return this.configSubscription = Config.onDidChange((function(_this) {
        return function(event) {
          var lintView, _i, _len, _ref, _results;
          if (!_this.shouldRefleshWithConfigChange(event.oldValue, event.newValue)) {
            return;
          }
          _ref = _this.lintViews;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            lintView = _ref[_i];
            _results.push(lintView.refresh());
          }
          return _results;
        };
      })(this));
    },
    disable: function() {
      var view, _ref, _ref1, _ref2;
      if ((_ref = this.lintStatusView) != null) {
        _ref.remove();
      }
      this.lintStatusView = null;
      if ((_ref1 = this.configSubscription) != null) {
        _ref1.off();
      }
      if ((_ref2 = this.editorViewSubscription) != null) {
        _ref2.off();
      }
      while (view = this.lintViews.shift()) {
        view.remove();
      }
      return this.enabled = false;
    },
    toggle: function() {
      if (this.enabled) {
        return this.disable();
      } else {
        return this.enable();
      }
    },
    toggleViolationMetadata: function() {
      var currentValue, key;
      key = 'showViolationMetadata';
      currentValue = Config.get(key);
      return Config.set(key, !currentValue);
    },
    injectLintViewIntoEditorView: function(editorView) {
      var lintView;
      if (editorView.getPane() == null) {
        return;
      }
      if (!editorView.attached) {
        return;
      }
      if (editorView.lintView != null) {
        return;
      }
      if (LintView == null) {
        LintView = require('./lint-view');
      }
      lintView = new LintView(editorView);
      return this.lintViews.push(lintView);
    },
    injectLintStatusViewIntoStatusBar: function() {
      var statusBar;
      if (this.lintStatusView != null) {
        return;
      }
      statusBar = atom.workspaceView.statusBar;
      if (statusBar == null) {
        return;
      }
      if (LintStatusView == null) {
        LintStatusView = require('./lint-status-view');
      }
      this.lintStatusView = new LintStatusView(statusBar);
      return statusBar.prependRight(this.lintStatusView);
    },
    shouldRefleshWithConfigChange: function(previous, current) {
      previous.showViolationMetadata = current.showViolationMetadata = null;
      if (_ == null) {
        _ = require('lodash');
      }
      return !_.isEqual(previous, current);
    }
  };

}).call(this);
