
/*
Requires https://github.com/bbatsov/rubocop
 */

(function() {
  "use strict";
  var Beautifier, Rubocop,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = Rubocop = (function(_super) {
    __extends(Rubocop, _super);

    function Rubocop() {
      return Rubocop.__super__.constructor.apply(this, arguments);
    }

    Rubocop.prototype.name = "Rubocop";

    Rubocop.prototype.options = {
      Ruby: {
        indent_size: true
      }
    };

    Rubocop.prototype.beautify = function(text, language, options) {
      var config, configStr, tempFile, yaml;
      yaml = require("yaml-front-matter");
      config = {
        "Style/IndentationWidth": {
          "Width": options.indent_size
        }
      };
      configStr = yaml.safeDump(config);
      this.debug("rubocop", config, configStr);
      return this.run("rubocop", ["--auto-correct", "--config", this.tempFile("rubocop-config", configStr), tempFile = this.tempFile("temp", text)], {
        ignoreReturnCode: true
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Rubocop;

  })(Beautifier);

}).call(this);
