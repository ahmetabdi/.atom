(function() {
  var CharacterCount, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  CharacterCount = require('../lib/character-count');

  describe("CharacterCount", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('character-count');
    });
    return describe("when the character-count:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.character-count')).not.toExist();
        atom.workspaceView.trigger('character-count:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.character-count')).toExist();
          atom.workspaceView.trigger('character-count:toggle');
          return expect(atom.workspaceView.find('.character-count')).not.toExist();
        });
      });
    });
  });

}).call(this);
