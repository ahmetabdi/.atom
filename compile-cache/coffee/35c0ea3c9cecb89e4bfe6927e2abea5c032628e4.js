(function() {
  var Beautify;

  Beautify = require('../src/beautify');

  describe("AtomBeautify", function() {
    var activationPromise;
    activationPromise = null;
    return beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('atomBeautify');
    });
  });

}).call(this);
