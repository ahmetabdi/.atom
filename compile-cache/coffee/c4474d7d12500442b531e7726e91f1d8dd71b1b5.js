(function() {
  var CommandRunner, Flake8, LinterError, Point, Range, Violation, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  module.exports = Flake8 = (function() {
    Flake8.canonicalName = 'flake8';

    function Flake8(filePath) {
      this.filePath = filePath;
    }

    Flake8.prototype.run = function(callback) {
      return this.runFlake8(function(error, violations) {
        if (error != null) {
          return callback(error);
        } else {
          return callback(null, violations);
        }
      });
    };

    Flake8.prototype.runFlake8 = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run(function(error, result) {
        var bufferPoint, bufferRange, col, elements, file, item, line, msg, severity, violations, x, _i, _len, _ref1;
        if (error != null) {
          return callback(error);
        }
        if (result.exitCode === 0 || result.exitCode === 1) {
          violations = [];
          _ref1 = result.stdout.split('\n');
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            item = _ref1[_i];
            if (!item) {
              continue;
            }
            elements = (function() {
              var _j, _len1, _ref2, _results;
              _ref2 = item.split(':');
              _results = [];
              for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                x = _ref2[_j];
                _results.push(x.trim());
              }
              return _results;
            })();
            if (elements.length !== 4) {
              continue;
            }
            file = elements[0], line = elements[1], col = elements[2], msg = elements[3];
            bufferPoint = new Point(parseInt(line) - 1, parseInt(col) - 1);
            bufferRange = new Range(bufferPoint, bufferPoint);
            severity = (function() {
              switch (msg.slice(0, 4)) {
                case 'F821':
                case 'F822':
                case 'F823':
                case 'F831':
                  return 'error';
                default:
                  if (msg[0] === 'E') {
                    return 'error';
                  } else {
                    return 'warning';
                  }
              }
            })();
            violations.push(new Violation(severity, bufferRange, msg));
          }
          return callback(null, violations);
        } else {
          return callback(new LinterError("flake8 exited with code " + result.exitCode, result));
        }
      });
    };

    Flake8.prototype.buildCommand = function() {
      var command, userFlake8Config, userFlake8Path;
      command = [];
      userFlake8Path = atom.config.get('atom-lint.flake8.path');
      userFlake8Config = atom.config.get('atom-lint.flake8.configPath');
      if (userFlake8Path != null) {
        command.push(userFlake8Path);
      } else {
        command.push('flake8');
      }
      if (userFlake8Config != null) {
        command.push("--config=" + userFlake8Config);
      }
      command.push(this.filePath);
      return command;
    };

    return Flake8;

  })();

}).call(this);
