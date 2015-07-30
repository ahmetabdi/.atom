(function() {
  'use strict';
  var CompositeDisposable, SplitMovesTab;

  CompositeDisposable = require('atom').CompositeDisposable;

  SplitMovesTab = (function() {
    function SplitMovesTab() {}

    SplitMovesTab.prototype.activate = function() {
      this.disposables = new CompositeDisposable();
      return this.disposables.add(atom.commands.add('atom-pane', {
        'pane:split-up': this.splitPane,
        'pane:split-down': this.splitPane,
        'pane:split-left': this.splitPane,
        'pane:split-right': this.splitPane
      }));
    };

    SplitMovesTab.prototype.deactivate = function() {
      return this.disposables.dispose();
    };

    SplitMovesTab.prototype.splitPane = function(_arg) {
      var currentTarget;
      currentTarget = _arg.currentTarget;
      return process.nextTick(function() {
        return currentTarget.getModel().destroyActiveItem();
      });
    };

    return SplitMovesTab;

  })();

  module.exports = new SplitMovesTab();

}).call(this);
