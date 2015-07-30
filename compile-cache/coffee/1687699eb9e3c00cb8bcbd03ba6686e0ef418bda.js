(function() {
  var AsteroidsView, WorkspaceView;

  AsteroidsView = require('../lib/asteroids-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("AsteroidsView", function() {
    return it("has one valid test", function() {
      return expect("life").toBe("easy");
    });
  });

}).call(this);
