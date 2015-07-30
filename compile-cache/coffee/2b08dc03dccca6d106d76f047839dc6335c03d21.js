(function() {
  var Goto;

  Goto = require('../lib/goto');

  describe("Goto", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('goto');
    });
    return describe("when the goto:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.goto')).not.toExist();
        atom.workspaceView.trigger('goto:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.goto')).toExist();
          atom.workspaceView.trigger('goto:toggle');
          return expect(atom.workspaceView.find('.goto')).not.toExist();
        });
      });
    });
  });

}).call(this);
