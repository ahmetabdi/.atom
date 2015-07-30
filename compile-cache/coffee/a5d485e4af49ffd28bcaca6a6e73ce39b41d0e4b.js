(function() {
  var SymbolGen;

  SymbolGen = require('../lib/symbol-gen');

  describe("SymbolGen", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('symbolGen');
    });
    return describe("when the symbol-gen:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.symbol-gen')).not.toExist();
        atom.workspaceView.trigger('symbol-gen:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.symbol-gen')).toExist();
          atom.workspaceView.trigger('symbol-gen:toggle');
          return expect(atom.workspaceView.find('.symbol-gen')).not.toExist();
        });
      });
    });
  });

}).call(this);
