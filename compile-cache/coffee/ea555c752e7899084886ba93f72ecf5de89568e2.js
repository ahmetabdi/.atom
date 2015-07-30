
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  "use strict";
  var Beautifier, sqlformat,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = sqlformat = (function(_super) {
    __extends(sqlformat, _super);

    function sqlformat() {
      return sqlformat.__super__.constructor.apply(this, arguments);
    }

    sqlformat.prototype.name = "sqlformat";

    sqlformat.prototype.options = {
      SQL: true
    };

    sqlformat.prototype.beautify = function(text, language, options) {
      return this.run("sqlformat", [this.tempFile("input", text), "--reindent", options.indent_size != null ? "--indent_width=" + options.indent_size : void 0, options.keywords != null ? "--keywords=" + options.keywords : void 0, options.identifiers != null ? "--identifiers=" + options.identifiers : void 0]);
    };

    return sqlformat;

  })(Beautifier);

}).call(this);
