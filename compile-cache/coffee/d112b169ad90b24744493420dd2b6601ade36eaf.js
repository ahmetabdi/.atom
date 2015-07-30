(function() {
  var $, _;

  _ = require('underscore-plus');

  $ = require('atom-space-pen-views').$;

  describe("EditorStats", function() {
    var editorStats, simulateClick, simulateKeyUp, workspaceElement;
    editorStats = null;
    workspaceElement = null;
    simulateKeyUp = function(key) {
      var e;
      e = $.Event("keydown", {
        keyCode: key.charCodeAt(0)
      });
      return $(workspaceElement).trigger(e);
    };
    simulateClick = function() {
      var e;
      e = $.Event("mouseup");
      return $(workspaceElement).trigger(e);
    };
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      waitsForPromise(function() {
        return atom.workspace.open('sample.js');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('editor-stats').then(function(pack) {
          return editorStats = pack.mainModule.stats;
        });
      });
    });
    describe("when a keyup event is triggered", function() {
      beforeEach(function() {
        expect(_.values(editorStats.eventLog)).not.toContain(1);
        return expect(_.values(editorStats.eventLog)).not.toContain(2);
      });
      return it("records the number of times a keyup is triggered", function() {
        simulateKeyUp('a');
        expect(_.values(editorStats.eventLog)).toContain(1);
        simulateKeyUp('b');
        return expect(_.values(editorStats.eventLog)).toContain(2);
      });
    });
    return describe("when a mouseup event is triggered", function() {
      return it("records the number of times a mouseup is triggered", function() {
        simulateClick();
        expect(_.values(editorStats.eventLog)).toContain(1);
        simulateClick();
        return expect(_.values(editorStats.eventLog)).toContain(2);
      });
    });
  });

}).call(this);
