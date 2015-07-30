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
            var view;
            view = atom.views.getView(atom.workspace);
            return view.statusBar.appendLeft(_this);
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