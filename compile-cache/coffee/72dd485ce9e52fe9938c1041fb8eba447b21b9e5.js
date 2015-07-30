(function() {
  var KeyboardListener;

  KeyboardListener = require('./keyboard-listener');

  module.exports = {
    toggleState: false,
    keyboardListeners: null,
    activate: function(state) {
      atom.workspaceView.command('mechanical-keyboard:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.keyboardListeners = [];
      return atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          return _this.keyboardListeners.push(new KeyboardListener(editorView));
        };
      })(this));
    },
    toggle: function() {
      this.toggleState = !this.toggleState;
      if (this.toggleState) {
        return this.keyboardListeners.forEach(function(listener) {
          return listener.subscribe();
        });
      } else {
        return this.keyboardListeners.forEach(function(listener) {
          return listener.unsubscribe();
        });
      }
    },
    deactivate: function() {}
  };

}).call(this);
