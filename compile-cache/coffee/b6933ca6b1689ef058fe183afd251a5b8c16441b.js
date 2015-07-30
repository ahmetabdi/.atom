(function() {
  var AsteroidsView;

  AsteroidsView = require('./asteroids-view');

  require('./asteroids-game');

  module.exports = {
    asteroidsView: null,
    activate: function(state) {
      this.asteroidsView = new AsteroidsView(state.asteroidsViewState);
      return startAsteroids();
    },
    deactivate: function() {
      return this.asteroidsView.destroy();
    },
    serialize: function() {
      return {
        asteroidsViewState: this.asteroidsView.serialize()
      };
    }
  };

}).call(this);
