(function() {
  module.exports = {
    count: function() {
      var editor;
      editor = atom.workspace.activePaneItem;
      return alert('char count: ' + editor.getText().length);
    },
    activate: function(state) {
      return atom.workspaceView.command("character-count:count", (function(_this) {
        return function() {
          return _this.count();
        };
      })(this));
    }
  };

}).call(this);
