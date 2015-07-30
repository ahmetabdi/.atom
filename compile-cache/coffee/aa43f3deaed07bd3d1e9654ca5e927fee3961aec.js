(function() {
  var AtomGitDiffDetailsView;

  AtomGitDiffDetailsView = require('./git-diff-details-view');

  module.exports = {
    atomGitDiffDetailsView: null,
    activate: function() {
      return atom.workspaceView.eachEditorView(function(editorView) {
        if ((atom.project.getRepo() != null) && editorView.attached && (editorView.getPane() != null)) {
          return new AtomGitDiffDetailsView(editorView);
        }
      });
    }
  };

}).call(this);
