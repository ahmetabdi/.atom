(function() {
  var CommandRunner, HLint, HLintViolation, LinterError, Point, Range, Violation, util, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  _ = require('lodash');

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  LinterError = require('../linter-error');

  util = require('../util');

  module.exports = HLint = (function() {
    HLint.canonicalName = 'HLint';

    function HLint(filePath) {
      this.filePath = filePath;
    }

    HLint.prototype.run = function(callback) {
      return this.runHLint(function(error, violations) {
        if (error != null) {
          return callback(error);
        } else {
          return callback(null, violations);
        }
      });
    };

    HLint.prototype.runHLint = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run(function(error, result) {
        var bufferPoint, bufferRange, col, file, item, items, line, msg, pattern, severity, violation, violations, _i, _len, _ref1, _ref2;
        if (error != null) {
          return callback(error);
        }
        if (result.exitCode === 0 || result.exitCode === 1) {
          pattern = /^(.+):(\d+):(\d+):\s*(Warning|Error):\s*([^]+)/;
          violations = [];
          items = result.stdout.split('\n\n');
          _ref1 = items.slice(0, -1);
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            item = _ref1[_i];
            _ref2 = item.match(pattern).slice(1, 6), file = _ref2[0], line = _ref2[1], col = _ref2[2], severity = _ref2[3], msg = _ref2[4];
            bufferPoint = new Point(parseInt(line) - 1, parseInt(col) - 1);
            bufferRange = new Range(bufferPoint, bufferPoint);
            violation = new HLintViolation(severity.toLowerCase(), bufferRange, msg);
            violations.push(violation);
          }
          return callback(null, violations);
        } else {
          return callback(new LinterError("hlint exited with code " + result.exitCode, result));
        }
      });
    };

    HLint.prototype.buildCommand = function() {
      var command, userHLintPath;
      command = [];
      userHLintPath = atom.config.get('atom-lint.hlint.path');
      if (userHLintPath != null) {
        command.push(userHLintPath);
      } else {
        command.push('hlint');
      }
      command.push(this.filePath);
      return command;
    };

    return HLint;

  })();

  HLintViolation = (function(_super) {
    __extends(HLintViolation, _super);

    HLintViolation.MESSAGE_PATTTERN = /^(.+)\nFound:\n(\x20{2}[\S\s]+)Why\x20not:\n(\x20{2}[\S\s]+)/;

    function HLintViolation(severity, bufferRange, message) {
      var matches, _match;
      matches = message.match(HLintViolation.MESSAGE_PATTTERN);
      if (matches != null) {
        _match = matches[0], message = matches[1], this.foundCode = matches[2], this.alternativeCode = matches[3];
      }
      HLintViolation.__super__.constructor.call(this, severity, bufferRange, message);
    }

    HLintViolation.prototype.getAttachmentHTML = function() {
      if (this.foundCode == null) {
        return null;
      }
      return '<figure>' + '<figcaption>Found:</figcaption>' + this.formatSnippet(this.foundCode) + '</figure>' + '<figure>' + '<figcaption>Why not:</figcaption>' + this.formatSnippet(this.alternativeCode) + '</figure>';
    };

    HLintViolation.prototype.formatSnippet = function(snippet) {
      var line, lines, unindentedLines, unindentedSnippet;
      lines = snippet.split('\n');
      unindentedLines = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = lines.length; _i < _len; _i++) {
          line = lines[_i];
          _results.push(line.slice(2));
        }
        return _results;
      })();
      unindentedSnippet = unindentedLines.join('\n');
      return "<pre>" + (_.escape(unindentedSnippet)) + "</pre>";
    };

    return HLintViolation;

  })(Violation);

}).call(this);
