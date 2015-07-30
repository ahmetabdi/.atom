(function() {
  var AtomSpotifyStatusBarView;

  AtomSpotifyStatusBarView = require('./atom-spotify-status-bar-view');

  module.exports = {
    configDefaults: {
      displayOnLeftSide: true,
      showEqualizer: false,
      showPlayStatus: true,
      showPlayIconAsText: false
    },
    activate: function() {
      return atom.packages.once('activated', (function(_this) {
        return function() {
          _this.statusBar = document.querySelector('status-bar');
          _this.spotifyView = new AtomSpotifyStatusBarView();
          _this.spotifyView.initialize();
          if (atom.config.get('atom-spotify.displayOnLeftSide')) {
            return _this.statusBar.addLeftTile({
              item: _this.spotifyView,
              priority: 100
            });
          } else {
            return _this.statusBar.addRightTile({
              item: _this.spotifyView,
              priority: 100
            });
          }
        };
      })(this));
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.spotifyView) != null) {
        _ref.destroy();
      }
      return this.spotifyView = null;
    }
  };

}).call(this);
