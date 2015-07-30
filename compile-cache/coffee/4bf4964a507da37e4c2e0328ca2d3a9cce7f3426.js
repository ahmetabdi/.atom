(function() {
  var DataAtomView, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  DataAtomView = require('../lib/data-atom-view');

  describe("DataAtomView", function() {
    beforeEach(function() {
      return atom.workspaceView = new WorkspaceView;
    });
    describe("when toggling view", function() {
      return it("it sets isShowing", function() {
        var view;
        view = new DataAtomView();
        expect(atom.workspaceView.find('.data-atom')).not.toExist();
        view.toggleView();
        expect(atom.workspaceView.find('.data-atom')).toExist();
        view.toggleView();
        return expect(atom.workspaceView.find('.data-atom')).not.toExist();
      });
    });
    describe("when calling show()", function() {
      return it("it sets isShowing true", function() {
        var view;
        view = new DataAtomView();
        expect(atom.workspaceView.find('.data-atom')).not.toExist();
        view.show();
        return expect(atom.workspaceView.find('.data-atom')).toExist();
      });
    });
    return describe("when calling hide()", function() {
      return it("it sets isShowing false", function() {
        var view;
        view = new DataAtomView();
        expect(atom.workspaceView.find('.data-atom')).not.toExist();
        view.show();
        expect(atom.workspaceView.find('.data-atom')).toExist();
        view.hide();
        return expect(atom.workspaceView.find('.data-atom')).not.toExist();
      });
    });
  });

}).call(this);
