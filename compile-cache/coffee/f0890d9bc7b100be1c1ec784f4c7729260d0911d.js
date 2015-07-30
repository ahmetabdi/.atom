(function() {
  var AtomGitDiffDetails, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  AtomGitDiffDetails = require('../lib/atom-git-diff-details');

  describe("AtomGitDiffDetails", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('atom-git-diff-details');
    });
    return describe("when the atom-git-diff-details:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.atom-git-diff-details')).not.toExist();
        atom.commands.dispatch(atom.workspaceView.element, 'atom-git-diff-details:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.atom-git-diff-details')).toExist();
          atom.commands.dispatch(atom.workspaceView.element, 'atom-git-diff-details:toggle');
          return expect(atom.workspaceView.find('.atom-git-diff-details')).not.toExist();
        });
      });
    });
  });

}).call(this);
