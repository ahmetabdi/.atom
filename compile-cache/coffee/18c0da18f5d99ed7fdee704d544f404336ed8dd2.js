(function() {
  var CommandRunner, LinterError, Point, Range, ShellCheck, Violation, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  module.exports = ShellCheck = (function() {
    ShellCheck.canonicalName = 'ShellCheck';

    function ShellCheck(filePath) {
      this.filePath = filePath;
    }

    ShellCheck.prototype.run = function(callback) {
      return this.runShellCheck((function(_this) {
        return function(error, comments) {
          var violations;
          if (error != null) {
            return callback(error);
          }
          violations = comments.map(_this.createViolationFromComment);
          return callback(null, violations);
        };
      })(this));
    };

    ShellCheck.prototype.createViolationFromComment = function(comment) {
      var bufferPoint, bufferRange, severity;
      bufferPoint = new Point(comment.line - 1, comment.column - 1);
      bufferRange = new Range(bufferPoint, bufferPoint);
      severity = comment.level === 'error' ? 'error' : 'warning';
      return new Violation(severity, bufferRange, comment.message);
    };

    ShellCheck.prototype.runShellCheck = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run(function(error, result) {
        if (error != null) {
          return callback(error);
        }
        if (result.exitCode === 0 || result.exitCode === 1) {
          try {
            return callback(null, JSON.parse(result.stdout));
          } catch (_error) {
            error = _error;
            return callback(error);
          }
        } else {
          return callback(new LinterError("shellcheck exited with code " + result.exitCode, result));
        }
      });
    };

    ShellCheck.prototype.buildCommand = function() {
      var command, userShellCheckPath;
      command = [];
      userShellCheckPath = atom.config.get('atom-lint.shellcheck.path');
      if (userShellCheckPath != null) {
        command.push(userShellCheckPath);
      } else {
        command.push('shellcheck');
      }
      command.push('--format', 'json', this.filePath);
      return command;
    };

    return ShellCheck;

  })();

}).call(this);
