(function() {
  var CommandRunner, LinterError, Point, Range, Rubocop, Violation, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  module.exports = Rubocop = (function() {
    Rubocop.canonicalName = 'RuboCop';

    function Rubocop(filePath) {
      this.filePath = filePath;
    }

    Rubocop.prototype.run = function(callback) {
      return this.runRubocop((function(_this) {
        return function(error, result) {
          var file, offenses, violations;
          if (error != null) {
            return callback(error);
          } else {
            file = result.files[0];
            offenses = file.offenses || file.offences;
            violations = offenses.map(_this.createViolationFromOffense);
            return callback(null, violations);
          }
        };
      })(this));
    };

    Rubocop.prototype.createViolationFromOffense = function(offense) {
      var bufferRange, location, metadata, severity, startPoint;
      location = offense.location;
      startPoint = new Point(location.line - 1, location.column - 1);
      bufferRange = location.length != null ? Range.fromPointWithDelta(startPoint, 0, location.length) : new Range(startPoint, startPoint);
      severity = (function() {
        switch (offense.severity) {
          case 'error':
          case 'fatal':
            return 'error';
          default:
            return 'warning';
        }
      })();
      metadata = [offense.cop_name];
      return new Violation(severity, bufferRange, offense.message, metadata);
    };

    Rubocop.prototype.runRubocop = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run(function(error, result) {
        var escapedStdout, rubocopResult;
        if (error != null) {
          return callback(error);
        }
        if (result.exitCode === 0 || result.exitCode === 1) {
          try {
            rubocopResult = JSON.parse(result.stdout);
          } catch (_error) {
            error = _error;
            escapedStdout = JSON.stringify(result.stdout);
            error = new LinterError("Failed parsing RuboCop's JSON output " + escapedStdout, result);
          }
          return callback(error, rubocopResult);
        } else {
          return callback(new LinterError("rubocop exited with code " + result.exitCode, result));
        }
      });
    };

    Rubocop.prototype.buildCommand = function() {
      var command, userRubocopPath;
      command = [];
      userRubocopPath = atom.config.get('atom-lint.rubocop.path');
      if (userRubocopPath != null) {
        command.push(userRubocopPath);
      } else {
        command.push('rubocop');
      }
      command.push('--format', 'json', this.filePath);
      return command;
    };

    return Rubocop;

  })();

}).call(this);
