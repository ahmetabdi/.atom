(function() {
  var AtomBitcoinStatusBarView;

  AtomBitcoinStatusBarView = require('./atom-bitcoin-status-bar-view');

  module.exports = {
    activate: function() {
      return this.atomBitcoinStatusBarView = new AtomBitcoinStatusBarView();
    },
    configDefaults: {
      currency: 'USD',
      interval: 5
    }
  };

}).call(this);
