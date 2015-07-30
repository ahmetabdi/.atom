(function() {
  var moveToPosition;

  module.exports.gotoSymbol = function(symbol) {
    return atom.workspaceView.open(symbol.path).done((function(_this) {
      return function() {
        return moveToPosition(symbol.position);
      };
    })(this));
  };

  moveToPosition = function(position) {
    var editor, editorView;
    editorView = atom.workspaceView.getActiveView();
    if (editor = typeof editorView.getEditor === "function" ? editorView.getEditor() : void 0) {
      editorView.scrollToBufferPosition(position, {
        center: true
      });
      editor.setCursorBufferPosition(position);
      return editor.moveCursorToFirstCharacterOfLine();
    }
  };

}).call(this);
