
/*
Requires http://golang.org/cmd/gofmt/
 */

(function() {
  "use strict";
  var Beautifier, gofmt,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = gofmt = (function(_super) {
    __extends(gofmt, _super);

    function gofmt() {
      return gofmt.__super__.constructor.apply(this, arguments);
    }

    gofmt.prototype.name = "gofmt";

    gofmt.prototype.options = {
      Go: true
    };

    gofmt.prototype.beautify = function(text, language, options) {
      return this.run("gofmt", [this.tempFile("input", text)]);
    };

    return gofmt;

  })(Beautifier);

}).call(this);
