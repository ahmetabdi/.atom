(function() {
  var AtomBitcoinStatusBarView, View, jQuery, valid_currencies,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  jQuery = require('jquery');

  valid_currencies = require('./currencies');

  module.exports = AtomBitcoinStatusBarView = (function(_super) {
    __extends(AtomBitcoinStatusBarView, _super);

    function AtomBitcoinStatusBarView() {
      return AtomBitcoinStatusBarView.__super__.constructor.apply(this, arguments);
    }

    AtomBitcoinStatusBarView.prototype.default_interval = 5000;

    AtomBitcoinStatusBarView.prototype.default_currency = 'USD';

    AtomBitcoinStatusBarView.prototype.load_text = 'Retreiving price...';

    AtomBitcoinStatusBarView.content = function() {
      return this.div({
        "class": 'inline-block atom-bitcoin'
      }, (function(_this) {
        return function() {
          return _this.span({
            outlet: "bitcoinInfo",
            tabindex: '-1'
          }, "");
        };
      })(this));
    };

    AtomBitcoinStatusBarView.prototype.initialize = function() {
      return this.subscribe(atom.packages.once('activated', (function(_this) {
        return function() {
          return setTimeout(function() {
            return atom.views.getView(atom.workspace).statusBar.appendLeft(_this);
          }, 1);
        };
      })(this)));
    };

    AtomBitcoinStatusBarView.prototype.afterAttach = function() {
      var currency, interval, last_output, output;
      interval = atom.config.get('atom-bitcoin.interval');
      interval = !isNaN(interval) ? interval.toFixed() * 1000 : this.default_interval;
      currency = atom.config.get('atom-bitcoin.currency');
      currency = currency in valid_currencies ? currency : this.default_currency;
      this.display(null);
      output = void 0;
      last_output = void 0;
      return setInterval((function(_this) {
        return function() {
          jQuery(function($) {
            var json;
            return json = $.getJSON('https://api.bitcoinaverage.com/ticker/' + currency + '/last', '', function(data, resp) {
              if (resp = "success") {
                return output = parseFloat(data).toFixed(2);
              } else {

              }
            });
          });
          _this.bitcoinInfo.removeClass('status-stable status-rise status-fall');
          if (output > last_output) {
            _this.bitcoinInfo.addClass('status-rise');
          } else if (output < last_output) {
            _this.bitcoinInfo.addClass('status-fall');
          } else {
            _this.bitcoinInfo.addClass('status-stable');
          }
          _this.display(output, valid_currencies[currency]);
          return last_output = output;
        };
      })(this), interval);
    };

    AtomBitcoinStatusBarView.prototype.display = function(price, symbol) {
      return this.bitcoinInfo.text(!price ? this.load_text : symbol + price);
    };

    return AtomBitcoinStatusBarView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUSxRQUFSLENBRFQsQ0FBQTs7QUFBQSxFQUVBLGdCQUFBLEdBQW1CLE9BQUEsQ0FBUSxjQUFSLENBRm5CLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHVDQUFBLGdCQUFBLEdBQWtCLElBQWxCLENBQUE7O0FBQUEsdUNBQ0EsZ0JBQUEsR0FBa0IsS0FEbEIsQ0FBQTs7QUFBQSx1Q0FFQSxTQUFBLEdBQVcscUJBRlgsQ0FBQTs7QUFBQSxJQUlBLHdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTywyQkFBUDtPQUFMLEVBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3ZDLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE1BQUEsRUFBUSxhQUFSO0FBQUEsWUFBdUIsUUFBQSxFQUFVLElBQWpDO1dBQU4sRUFBNkMsRUFBN0MsRUFEdUM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QyxFQURRO0lBQUEsQ0FKVixDQUFBOztBQUFBLHVDQVFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFHVixJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBZCxDQUFtQixXQUFuQixFQUFnQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUl6QyxVQUFBLENBQVcsU0FBQSxH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
//# sourceURL=/Users/ahmet/.atom/packages/atom-bitcoin/lib/atom-bitcoin-status-bar-view.coffee