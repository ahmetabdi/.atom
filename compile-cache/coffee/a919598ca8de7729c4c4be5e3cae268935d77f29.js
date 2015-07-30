(function() {
  var CommandRunner, LinterError, Point, PuppetLint, Range, Violation, util, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  util = require('../util');

  module.exports = PuppetLint = (function() {
    PuppetLint.canonicalName = 'puppet-lint';

    function PuppetLint(filePath) {
      this.filePath = filePath;
    }

    PuppetLint.prototype.run = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run((function(_this) {
        return function(error, result) {
          var violations;
          if (error != null) {
            return callback(error);
          }
          if (result.exitCode !== 0) {
            return callback(new LinterError("puppet-lint exited with code " + result.exitCode, result));
          }
          violations = _this.parseLog(result.stdout);
          return callback(null, violations);
        };
      })(this));
    };

    PuppetLint.prototype.parseLog = function(log) {
      var bufferPoint, bufferRange, column, line, lines, message, severity, _i, _len, _ref1, _results;
      lines = log.split('\n');
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (!line) {
          continue;
        }
        _ref1 = line.split(':'), line = _ref1[0], column = _ref1[1], severity = _ref1[2], message = _ref1[3];
        bufferPoint = new Point(parseInt(line) - 1, parseInt(column) - 1);
        bufferRange = new Range(bufferPoint, bufferPoint);
        _results.push(new Violation(severity, bufferRange, message));
      }
      return _results;
    };

    PuppetLint.prototype.buildCommand = function() {
      var command, userPuppetLintPath;
      command = [];
      userPuppetLintPath = atom.config.get('atom-lint.puppet-lint.path');
      if (userPuppetLintPath != null) {
        command.push(userPuppetLintPath);
      } else {
        command.push('puppet-lint');
      }
      command.push('--log-format', '%{linenumber}:%{column}:%{kind}:%{message}');
      command.push(this.filePath);
      return command;
    };

    return PuppetLint;

  })();

}).call(this);
