(function() {
  var NumbersOnAPaneView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = NumbersOnAPaneView = (function(_super) {
    __extends(NumbersOnAPaneView, _super);

    function NumbersOnAPaneView() {
      return NumbersOnAPaneView.__super__.constructor.apply(this, arguments);
    }

    NumbersOnAPaneView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("numbers-on-a-pane:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    };

    NumbersOnAPaneView.prototype.destroy = function() {
      return this.detach();
    };

    NumbersOnAPaneView.prototype.toggle = function() {
      console.log("Numbers On A Pane was toggled!");
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return NumbersOnAPaneView;

  })(View);

}).call(this);
