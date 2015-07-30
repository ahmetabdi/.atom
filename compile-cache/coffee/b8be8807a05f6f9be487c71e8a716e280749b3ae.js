(function() {
  var NumbersOnAPaneView;

  NumbersOnAPaneView = require('./numbers-on-a-pane-view');

  module.exports = {
    numbersOnAPaneView: null,
    activate: function(state) {
      return this.numbersOnAPaneView = new NumbersOnAPaneView(state.numbersOnAPaneViewState);
    },
    deactivate: function() {
      return this.numbersOnAPaneView.destroy();
    },
    serialize: function() {
      return {
        numbersOnAPaneViewState: this.numbersOnAPaneView.serialize()
      };
    }
  };

}).call(this);
