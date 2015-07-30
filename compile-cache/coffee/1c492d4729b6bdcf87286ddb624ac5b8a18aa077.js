(function() {
  var RubyTest;

  RubyTest = require('../lib/ruby-test');

  describe("RubyTest", function() {
    var activationPromise, workspaceElement;
    activationPromise = null;
    workspaceElement = null;
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('ruby-test');
    });
    return describe("when the ruby-test:toggle event is triggered", function() {
      return it("attaches and then detaches the view", function() {
        expect(workspaceElement.querySelector('.ruby-test')).not.toExist();
        atom.commands.dispatch(workspaceElement, 'ruby-test:toggle');
        waitsForPromise(function() {
          return activationPromise;
        });
        return runs(function() {
          expect(workspaceElement.querySelector('.ruby-test')).toExist();
          atom.commands.dispatch(workspaceElement, 'ruby-test:toggle');
          return expect(workspaceElement.querySelector('.ruby-test')).not.toExist();
        });
      });
    });
  });

}).call(this);
