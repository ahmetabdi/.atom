(function() {
  var GotoView, WorkspaceView;

  GotoView = require('../lib/goto-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("GotoView", function() {
    return it("has one valid test", function() {
      return expect("life").toBe("easy");
    });
  });

}).call(this);
