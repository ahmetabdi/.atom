(function() {
  var MechanicalKeyboard, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  MechanicalKeyboard = require('../lib/mechanical-keyboard');

  describe("MechanicalKeyboard", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('mechanical-keyboard');
    });
    return describe("when the mechanical-keyboard:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.mechanical-keyboard')).not.toExist();
        atom.workspaceView.trigger('mechanical-keyboard:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.mechanical-keyboard')).toExist();
          atom.workspaceView.trigger('mechanical-keyboard:toggle');
          return expect(atom.workspaceView.find('.mechanical-keyboard')).not.toExist();
        });
      });
    });
  });

}).call(this);
