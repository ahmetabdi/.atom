(function() {
  var Linter, LinterRuby, linterPath,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  LinterRuby = (function(_super) {
    __extends(LinterRuby, _super);

    LinterRuby.syntax = ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec'];

    LinterRuby.prototype.cmd = 'ruby -wc';

    LinterRuby.prototype.executablePath = null;

    LinterRuby.prototype.errorStream = 'stderr';

    LinterRuby.prototype.linterName = 'ruby';

    LinterRuby.prototype.regex = '.+:(?<line>\\d+):((?<warning> warning:)|(?<error>))(?<message>.+)';

    function LinterRuby(editor) {
      LinterRuby.__super__.constructor.call(this, editor);
      atom.config.observe('linter-ruby.rubyExecutablePath', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('linter-ruby.rubyExecutablePath');
        };
      })(this));
    }

    LinterRuby.prototype.destroy = function() {
      return atom.config.unobserve('linter-ruby.rubyExecutablePath');
    };

    return LinterRuby;

  })(Linter);

  module.exports = LinterRuby;

}).call(this);
