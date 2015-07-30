(function() {
  var AsteroidsView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = AsteroidsView = (function(_super) {
    __extends(AsteroidsView, _super);

    function AsteroidsView() {
      return AsteroidsView.__super__.constructor.apply(this, arguments);
    }

    AsteroidsView.content = function() {
      return this.div({
        "class": 'asteroids'
      });
    };

    AsteroidsView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("asteroids:play", (function(_this) {
        return function() {
          return _this.play();
        };
      })(this));
    };

    AsteroidsView.prototype.serialize = function() {};

    AsteroidsView.prototype.destroy = function() {
      return this.detach();
    };

    AsteroidsView.prototype.play = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return atom.workspaceView.append(this);
      }
    };

    return AsteroidsView;

  })(View);

}).call(this);
