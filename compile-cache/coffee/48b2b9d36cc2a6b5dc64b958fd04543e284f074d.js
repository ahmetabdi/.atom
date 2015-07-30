(function() {
  var NumbersOnAPane;

  NumbersOnAPane = require('../lib/numbers-on-a-pane');

  describe("NumbersOnAPane", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('numbersOnAPane');
    });
    return describe("when the numbers-on-a-pane:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(atom.workspaceView.find('.numbers-on-a-pane')).not.toExist();
        atom.workspaceView.trigger('numbers-on-a-pane:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(atom.workspaceView.find('.numbers-on-a-pane')).toExist();
          atom.workspaceView.trigger('numbers-on-a-pane:toggle');
          return expect(atom.workspaceView.find('.numbers-on-a-pane')).not.toExist();
        });
      });
    });
  });

}).call(this);
