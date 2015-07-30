(function() {
  var Asteroids;

  Asteroids = require('../lib/asteroids');

  describe("Asteroids", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('asteroids');
    });
    return describe("when the asteroids:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.asteroids')).not.toExist();
        atom.workspaceView.trigger('asteroids:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.asteroids')).toExist();
          atom.workspaceView.trigger('asteroids:toggle');
          return expect(atom.workspaceView.find('.asteroids')).not.toExist();
        });
      });
    });
  });

}).call(this);
