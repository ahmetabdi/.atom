(function() {
  var AtomSpotifyStatusBarView, WorkspaceView;

  AtomSpotifyStatusBarView = require('../lib/atom-spotify-status-bar-view');

  WorkspaceView = require('atom').WorkspaceView;

  describe("AtomSpotifyStatusBarView", function() {
    beforeEach(function() {
      atom.workspaceView = new WorkspaceView;
      return waitsForPromise(function() {
        return atom.packages.activatePackage('atom-spotify');
      });
    });
    return describe("when rocking out", function() {
      return it("renders the current song's info", function() {
        return runs(function() {
          var statusBar;
          statusBar = atom.workspaceView.statusBar;
          return setTimeout((function(_this) {
            return function() {
              return expect(statusBar.find('a.atom-spotify-status').text()).toBe('');
            };
          })(this), 500);
        });
      });
    });
  });

}).call(this);
