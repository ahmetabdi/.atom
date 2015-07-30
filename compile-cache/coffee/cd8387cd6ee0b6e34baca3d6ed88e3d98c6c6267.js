(function() {
  var BufferedProcess, Linter, LinterErb, Point, Range, linterPath, log, warn, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage("linter").path;

  Linter = require("" + linterPath + "/lib/linter");

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, BufferedProcess = _ref.BufferedProcess;

  _ref1 = require("" + linterPath + "/lib/utils"), log = _ref1.log, warn = _ref1.warn;

  LinterErb = (function(_super) {
    __extends(LinterErb, _super);

    LinterErb.syntax = ['text.html.erb'];

    LinterErb.prototype.rubyCmd = 'ruby -c -';

    LinterErb.prototype.erbCmd = 'erb -x -T -';

    LinterErb.prototype.executablePath = null;

    LinterErb.prototype.rubyOnRailsMode = false;

    LinterErb.prototype.linterName = 'erb';

    LinterErb.prototype.regex = '.+:(?<line>\\d+):(?<error>)(?<message>.+)';

    function LinterErb(editor) {
      LinterErb.__super__.constructor.call(this, editor);
      atom.config.observe('linter-erb.erbExecutablePath', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('linter-erb.erbExecutablePath');
        };
      })(this));
      atom.config.observe('linter-erb.rubyOnRailsMode', (function(_this) {
        return function() {
          return _this.rubyOnRailsMode = atom.config.get('linter-erb.rubyOnRailsMode');
        };
      })(this));
    }

    LinterErb.prototype.destroy = function() {
      atom.config.unobserve('linter-erb.erbExecutablePath');
      return atom.config.unobserve('linter-erb.rubyOnRailsMode');
    };

    LinterErb.prototype.lintFile = function(filePath, callback) {
      var data, erbArgs, erbCommand, erbExit, erbOptions, erbProcess, erbStdout, rubyArgs, rubyCommand, rubyExit, rubyOptions, rubyProcess, rubyStderr, that, _ref2, _ref3;
      this.cmd = this.rubyCmd;
      _ref2 = this.getCmdAndArgs(null), rubyCommand = _ref2.command, rubyArgs = _ref2.args;
      this.cmd = this.erbCmd;
      _ref3 = this.getCmdAndArgs(filePath), erbCommand = _ref3.command, erbArgs = _ref3.args;
      rubyOptions = {
        stdio: ['pipe', null, null]
      };
      erbOptions = {
        cwd: this.cwd
      };
      that = this;
      data = [];
      rubyStderr = function(output) {
        warn('stderr', output);
        return data += output;
      };
      rubyExit = (function(_this) {
        return function() {
          return _this.processMessage(data, callback);
        };
      })(this);
      erbStdout = function(output) {
        if (that.rubyOnRailsMode) {
          output = output.replace(/_erbout.concat\(\((.+?do.+?)\).to_s\)/g, '\$1');
        }
        log('stdout', output);
        return rubyProcess.process.stdin.write(output);
      };
      erbExit = (function(_this) {
        return function() {
          return rubyProcess.process.stdin.end();
        };
      })(this);
      rubyProcess = new BufferedProcess({
        command: rubyCommand,
        args: rubyArgs,
        options: rubyOptions,
        stderr: rubyStderr,
        exit: rubyExit
      });
      erbProcess = new BufferedProcess({
        command: erbCommand,
        args: erbArgs,
        options: erbOptions,
        stdout: erbStdout,
        exit: erbExit
      });
      return setTimeout(function() {
        rubyProcess.kill();
        return erbProcess.kill();
      }, 5000);
    };

    LinterErb.prototype.createMessage = function(match) {
      match.line -= 1;
      return LinterErb.__super__.createMessage.call(this, match);
    };

    return LinterErb;

  })(Linter);

  module.exports = LinterErb;

}).call(this);
