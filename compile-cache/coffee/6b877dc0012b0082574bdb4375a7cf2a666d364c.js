(function() {
  var Clang, CommandRunner, DIAGNOSTIC_PATTERN, LinterError, PRELIMINARY_PATTERN, Point, Range, Violation, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  DIAGNOSTIC_PATTERN = /^(.+):(\d+):(\d+):\s*([^:]+)\s*:\s*([^]+)/;

  PRELIMINARY_PATTERN = /^In file included from (.+):(\d+):/;

  module.exports = Clang = (function() {
    Clang.canonicalName = 'Clang';

    function Clang(filePath) {
      this.filePath = filePath;
    }

    Clang.prototype.run = function(callback) {
      return this.runClang(function(error, violations) {
        if (error != null) {
          return callback(error);
        } else {
          return callback(null, violations);
        }
      });
    };

    Clang.prototype.runClang = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run((function(_this) {
        return function(error, result) {
          var violations;
          if (error != null) {
            return callback(error);
          }
          if (result.exitCode === 0 || result.exitCode === 1) {
            violations = _this.parseDiagnostics(result.stderr);
            return callback(null, violations);
          } else {
            return callback(new LinterError("clang exited with code " + result.exitCode, result));
          }
        };
      })(this));
    };

    Clang.prototype.parseDiagnostics = function(log) {
      var actualLineNumberInTargetFile, bufferPoint, bufferRange, columnNumber, filePath, line, lineNumber, lines, matches, message, severity, _, _i, _len, _results;
      lines = log.split('\n');
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        matches = line.match(DIAGNOSTIC_PATTERN);
        if (!matches) {
          matches = line.match(PRELIMINARY_PATTERN);
          if (!matches) {
            continue;
          }
          _ = matches[0], filePath = matches[1], lineNumber = matches[2];
          if (filePath === this.filePath) {
            actualLineNumberInTargetFile = lineNumber;
          }
          continue;
        }
        _ = matches[0], _ = matches[1], lineNumber = matches[2], columnNumber = matches[3], severity = matches[4], message = matches[5];
        if (severity === 'note') {
          continue;
        }
        if (severity === 'fatal error') {
          severity = 'error';
        }
        if (actualLineNumberInTargetFile != null) {
          lineNumber = actualLineNumberInTargetFile;
          columnNumber = 1;
          actualLineNumberInTargetFile = null;
        }
        bufferPoint = new Point(parseInt(lineNumber) - 1, parseInt(columnNumber) - 1);
        bufferRange = new Range(bufferPoint, bufferPoint);
        _results.push(new Violation(severity, bufferRange, message));
      }
      return _results;
    };

    Clang.prototype.buildCommand = function() {
      var command, path, userClangPath, userHeaderSearchPaths, _i, _len;
      command = [];
      userClangPath = atom.config.get('atom-lint.clang.path');
      userHeaderSearchPaths = atom.config.get('atom-lint.clang.headerSearchPaths');
      if (userClangPath != null) {
        command.push(userClangPath);
      } else {
        command.push('clang');
      }
      command.push('-fsyntax-only');
      command.push('-fno-caret-diagnostics');
      command.push('-Wall');
      if (userHeaderSearchPaths != null) {
        for (_i = 0, _len = userHeaderSearchPaths.length; _i < _len; _i++) {
          path = userHeaderSearchPaths[_i];
          command.push("-I" + path);
        }
      }
      command.push(this.filePath);
      return command;
    };

    return Clang;

  })();

}).call(this);
