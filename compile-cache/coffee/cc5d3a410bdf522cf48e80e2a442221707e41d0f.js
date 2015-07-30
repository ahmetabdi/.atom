(function() {
  var CommandRunner, DIAGNOSTIC_PATTERN, LinterError, Point, Range, Rustc, Violation, util, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  util = require('../util');

  DIAGNOSTIC_PATTERN = /^(.+):(\d+):(\d+):\s*(\d+):(\d+)\s*([^:]+)\s*:\s*([^]+)/;

  module.exports = Rustc = (function() {
    Rustc.canonicalName = 'rustc';

    function Rustc(filePath) {
      this.filePath = filePath;
    }

    Rustc.prototype.run = function(callback) {
      return this.runRustc(function(error, violations) {
        if (error != null) {
          return callback(error);
        } else {
          return callback(null, violations);
        }
      });
    };

    Rustc.prototype.runRustc = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run((function(_this) {
        return function(error, result) {
          var violations;
          if (error != null) {
            return callback(error);
          }
          if (result.exitCode === 0 || result.exitCode === 101) {
            violations = _this.parseDiagnostics(result.stderr);
            return callback(null, violations);
          } else {
            return callback(new LinterError("rustc exited with code " + result.exitCode, result));
          }
        };
      })(this));
    };

    Rustc.prototype.parseDiagnostics = function(log) {
      var bufferRange, columnNumber, columnNumber2, endPoint, line, lineNumber, lineNumber2, lines, matches, message, severity, startPoint, _, _i, _len, _results;
      lines = log.split('\n');
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (!(matches = line.match(DIAGNOSTIC_PATTERN))) {
          continue;
        }
        _ = matches[0], _ = matches[1], lineNumber = matches[2], columnNumber = matches[3], lineNumber2 = matches[4], columnNumber2 = matches[5], severity = matches[6], message = matches[7];
        if (severity === 'note') {
          continue;
        }
        startPoint = new Point(parseInt(lineNumber - 1), parseInt(columnNumber - 1));
        endPoint = new Point(parseInt(lineNumber2 - 1), parseInt(columnNumber2 - 1));
        bufferRange = new Range(startPoint, endPoint);
        _results.push(new Violation(severity, bufferRange, message));
      }
      return _results;
    };

    Rustc.prototype.buildCommand = function() {
      var command, userRustcPath;
      command = [];
      userRustcPath = atom.config.get('atom-lint.rustc.path');
      if (userRustcPath != null) {
        command.push(userRustcPath);
      } else {
        command.push('rustc');
      }
      command.push('--parse-only');
      command.push(this.filePath);
      return command;
    };

    return Rustc;

  })();

}).call(this);
