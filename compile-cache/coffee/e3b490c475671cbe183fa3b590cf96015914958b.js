(function() {
  var CommandRunner, ERROR_PATTERN, Erlc, LinterError, Point, Range, Violation, path, _ref;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  ERROR_PATTERN = /^(.+):(\d+):\s*([^]+)/;

  module.exports = Erlc = (function() {
    Erlc.canonicalName = 'erlc';

    function Erlc(filePath) {
      this.filePath = filePath;
    }

    Erlc.prototype.run = function(callback) {
      return this.runErlc(function(error, violations) {
        if (error != null) {
          return callback(error);
        } else {
          return callback(null, violations);
        }
      });
    };

    Erlc.prototype.runErlc = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run((function(_this) {
        return function(error, result) {
          var violations;
          if (error != null) {
            return callback(error);
          }
          if (result.exitCode === 0 || result.exitCode === 1) {
            violations = _this.parseLog(result.stdout);
            return callback(null, violations);
          } else {
            return callback(new LinterError("erlc exited with code " + result.exitCode, result));
          }
        };
      })(this));
    };

    Erlc.prototype.parseLog = function(log) {
      var bufferPoint, bufferRange, filePath, line, lineNumber, lines, matches, message, severity, _, _i, _len, _results;
      lines = log.split('\n');
      _results = [];
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        if (!line) {
          continue;
        }
        matches = line.match(ERROR_PATTERN);
        if (!matches) {
          continue;
        }
        _ = matches[0], filePath = matches[1], lineNumber = matches[2], message = matches[3];
        severity = 'error';
        if (message.startsWith('Warning: ')) {
          severity = 'warning';
        }
        bufferPoint = new Point(parseInt(lineNumber) - 1, 0);
        bufferRange = new Range(bufferPoint, bufferPoint);
        _results.push(new Violation(severity, bufferRange, message));
      }
      return _results;
    };

    Erlc.prototype.buildCommand = function() {
      var command, directoryPath, projectRoot, userErlcPath;
      command = [];
      userErlcPath = atom.config.get('atom-lint.erlc.path');
      if (userErlcPath != null) {
        command.push(userErlcPath);
      } else {
        command.push('erlc');
      }
      directoryPath = path.dirname(this.filePath);
      if (directoryPath.endsWith('/src')) {
        projectRoot = path.dirname(directoryPath);
        command.push('-I', path.join(projectRoot, 'include'));
        command.push('-I', path.join(projectRoot, 'deps'));
        command.push('-pa', path.join(projectRoot, 'ebin'));
      }
      command.push('-Wall');
      command.push('+warn_obsolete_guard');
      command.push('+warn_unused_import');
      command.push('+warn_shadow_vars');
      command.push('+warn_export_vars');
      command.push('+strong_validation');
      command.push('+report');
      command.push(this.filePath);
      return command;
    };

    return Erlc;

  })();

}).call(this);
