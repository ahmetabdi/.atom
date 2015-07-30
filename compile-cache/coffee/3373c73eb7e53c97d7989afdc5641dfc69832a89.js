(function() {
  var AutocompleteRuby;

  AutocompleteRuby = require('../lib/autocomplete-ruby');

  describe("AutocompleteRuby", function() {
    var activationPromise, workspaceElement, _ref;
    _ref = [], workspaceElement = _ref[0], activationPromise = _ref[1];
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return activationPromise = atom.packages.activatePackage('autocomplete-ruby');
    });
    return describe("autocomplete-ruby", function() {
      return it("contains spec with an expectation", function() {
        return expect(true).toBe(true);
      });
    });
  });

}).call(this);
