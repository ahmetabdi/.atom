(function() {
  var NumbersOnAPaneView, WorkspaceView;

  NumbersOnAPaneView = require('../lib/numbers-on-a-pane-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("NumbersOnAPaneView", function() {
    return it("has one valid test", function() {
      return expect("life").toBe("easy");
    });
  });

}).call(this);
