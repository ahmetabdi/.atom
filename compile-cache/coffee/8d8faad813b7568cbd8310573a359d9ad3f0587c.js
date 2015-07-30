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
            return atom.workspaceView.statusBar.appendLeft(_this);
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
