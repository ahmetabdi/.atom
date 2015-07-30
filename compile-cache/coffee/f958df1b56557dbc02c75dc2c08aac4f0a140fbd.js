(function() {
  var AtomSpotifyStatusBarView, spotify,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  spotify = require('spotify-node-applescript');

  Number.prototype.times = function(fn) {
    var _i, _ref;
    if (this.valueOf()) {
      for (_i = 1, _ref = this.valueOf(); 1 <= _ref ? _i <= _ref : _i >= _ref; 1 <= _ref ? _i++ : _i--) {
        fn();
      }
    }
  };

  AtomSpotifyStatusBarView = (function(_super) {
    __extends(AtomSpotifyStatusBarView, _super);

    function AtomSpotifyStatusBarView() {
      return AtomSpotifyStatusBarView.__super__.constructor.apply(this, arguments);
    }

    AtomSpotifyStatusBarView.prototype.initialize = function() {
      var div;
      this.classList.add('spotify', 'inline-block');
      div = document.createElement('div');
      div.classList.add('spotify-container');
      this.soundBars = document.createElement('span');
      this.soundBars.classList.add('spotify-sound-bars');
      this.soundBars.data = {
        hidden: true,
        state: 'paused'
      };
      5..times((function(_this) {
        return function() {
          var soundBar;
          soundBar = document.createElement('span');
          soundBar.classList.add('spotify-sound-bar');
          return _this.soundBars.appendChild(soundBar);
        };
      })(this));
      div.appendChild(this.soundBars);
      this.trackInfo = document.createElement('span');
      this.trackInfo.classList.add('track-info');
      this.trackInfo.textContent = '';
      div.appendChild(this.trackInfo);
      this.appendChild(div);
      atom.commands.add('atom-workspace', 'atom-spotify:next', (function(_this) {
        return function() {
          return spotify.next(function() {
            return _this.updateTrackInfo();
          });
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-spotify:previous', (function(_this) {
        return function() {
          return spotify.previous(function() {
            return _this.updateTrackInfo();
          });
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-spotify:play', (function(_this) {
        return function() {
          return spotify.play(function() {
            return _this.updateTrackInfo();
          });
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-spotify:pause', (function(_this) {
        return function() {
          return spotify.pause(function() {
            return _this.updateTrackInfo();
          });
        };
      })(this));
      atom.commands.add('atom-workspace', 'atom-spotify:togglePlay', (function(_this) {
        return function() {
          return _this.togglePlay();
        };
      })(this));
      atom.config.observe('atom-spotify.showEqualizer', (function(_this) {
        return function(newValue) {
          return _this.toggleShowEqualizer(newValue);
        };
      })(this));
      return setInterval((function(_this) {
        return function() {
          return _this.updateTrackInfo();
        };
      })(this), 5000);
    };

    AtomSpotifyStatusBarView.prototype.updateTrackInfo = function() {
      return spotify.isRunning((function(_this) {
        return function(err, isRunning) {
          if (isRunning) {
            return spotify.getState(function(err, state) {
              if (state) {
                return spotify.getTrack(function(error, track) {
                  var trackInfoText;
                  if (track) {
                    trackInfoText = "";
                    if (atom.config.get('atom-spotify.showPlayStatus')) {
                      if (!atom.config.get('atom-spotify.showPlayIconAsText')) {
                        trackInfoText = state.state === 'playing' ? '► ' : '|| ';
                      } else {
                        trackInfoText = state.state === 'playing' ? 'Now Playing: ' : 'Paused: ';
                      }
                    }
                    trackInfoText += "" + track.artist + " - " + track.name;
                    if (!atom.config.get('atom-spotify.showEqualizer')) {
                      if (atom.config.get('atom-spotify.showPlayStatus')) {
                        trackInfoText += " ♫";
                      } else {
                        trackInfoText = "♫ " + trackInfoText;
                      }
                    }
                    _this.trackInfo.textContent = trackInfoText;
                  } else {
                    _this.trackInfo.textContent = '';
                  }
                  return _this.updateEqualizer();
                });
              }
            });
          } else {
            return _this.trackInfo.textContent = '';
          }
        };
      })(this));
    };

    AtomSpotifyStatusBarView.prototype.updateEqualizer = function() {
      return spotify.isRunning((function(_this) {
        return function(err, isRunning) {
          return spotify.getState(function(err, state) {
            if (err) {
              return;
            }
            return _this.togglePauseEqualizer(state.state !== 'playing');
          });
        };
      })(this));
    };

    AtomSpotifyStatusBarView.prototype.togglePlay = function() {
      return spotify.isRunning((function(_this) {
        return function(err, isRunning) {
          if (isRunning) {
            return spotify.playPause(function() {
              return _this.updateEqualizer();
            });
          }
        };
      })(this));
    };

    AtomSpotifyStatusBarView.prototype.toggleShowEqualizer = function(shown) {
      if (shown) {
        return this.soundBars.removeAttribute('data-hidden');
      } else {
        return this.soundBars.setAttribute('data-hidden', true);
      }
    };

    AtomSpotifyStatusBarView.prototype.togglePauseEqualizer = function(paused) {
      if (paused) {
        return this.soundBars.setAttribute('data-state', 'paused');
      } else {
        return this.soundBars.removeAttribute('data-state');
      }
    };

    return AtomSpotifyStatusBarView;

  })(HTMLElement);

  module.exports = document.registerElement('status-bar-spotify', {
    prototype: AtomSpotifyStatusBarView.prototype,
    "extends": 'div'
  });

}).call(this);
