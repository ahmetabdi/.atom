(function() {
  var Linter, LinterRubocop, findFile, linterPath,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  findFile = require("" + linterPath + "/lib/util");

  LinterRubocop = (function(_super) {
    __extends(LinterRubocop, _super);

    LinterRubocop.syntax = ['source.ruby', 'source.ruby.rails', 'source.ruby.rspec'];

    LinterRubocop.prototype.cmd = 'rubocop --force-exclusion --format emacs';

    LinterRubocop.prototype.linterName = 'rubocop';

    LinterRubocop.prototype.regex = '.+?:(?<line>\\d+):(?<col>\\d+): ' + '((?<warning>[RCW])|(?<error>[EF])): ' + '(?<message>.+)';

    LinterRubocop.prototype.options = ['executablePath'];

    function LinterRubocop(editor) {
      var config;
      LinterRubocop.__super__.constructor.call(this, editor);
      if (editor.getGrammar().scopeName === 'source.ruby.rails') {
        this.cmd += " --rails";
      }
      config = findFile(this.cwd, '.rubocop.yml');
      if (config) {
        this.cmd += " --config " + config;
      }
    }

    return LinterRubocop;

  })(Linter);

  module.exports = LinterRubocop;

}).call(this);
