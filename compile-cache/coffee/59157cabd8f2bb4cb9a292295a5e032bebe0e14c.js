(function() {
  var SymbolGenView, WorkspaceView;

  SymbolGenView = require('../lib/symbol-gen-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("SymbolGenView", function() {
    return it("has one valid test", function() {
      return expect("life").toBe("easy");
    });
  });

}).call(this);
