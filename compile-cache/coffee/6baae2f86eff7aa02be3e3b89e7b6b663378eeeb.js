
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Beautifier, autopep8,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = autopep8 = (function(_super) {
    __extends(autopep8, _super);

    function autopep8() {
      return autopep8.__super__.constructor.apply(this, arguments);
    }

    autopep8.prototype.name = "autopep8";

    autopep8.prototype.options = {
      Python: true
    };

    autopep8.prototype.beautify = function(text, language, options) {
      return this.run("autopep8", [this.tempFile("input", text), options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0]);
    };

    return autopep8;

  })(Beautifier);

}).call(this);
