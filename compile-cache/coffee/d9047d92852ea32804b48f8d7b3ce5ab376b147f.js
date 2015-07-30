(function() {
  var CSSLint, Point, Range, Violation, XmlBase, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  XmlBase = require('./xml-base');

  Violation = require('../violation');

  module.exports = CSSLint = (function(_super) {
    __extends(CSSLint, _super);

    function CSSLint() {
      return CSSLint.__super__.constructor.apply(this, arguments);
    }

    CSSLint.canonicalName = 'CSSLint';

    CSSLint.prototype.buildCommand = function() {
      var command, flag, rules, userCSSLintPath, userCSSLintRules;
      command = [];
      userCSSLintPath = atom.config.get('atom-lint.csslint.path');
      userCSSLintRules = atom.config.get('atom-lint.csslint.rules');
      if (userCSSLintPath != null) {
        command.push(userCSSLintPath);
      } else {
        command.push('csslint');
      }
      if (userCSSLintRules != null) {
        for (flag in userCSSLintRules) {
          rules = userCSSLintRules[flag];
          if (/errors|ignore|warnings/.test(flag) && Array.isArray(rules)) {
            command.push("--" + (flag.toLowerCase()) + "=" + (rules.join(',')));
          }
        }
      }
      command.push('--format=checkstyle-xml');
      command.push(this.filePath);
      return command;
    };

    CSSLint.prototype.isValidExitCode = function(exitCode) {
      return exitCode === 0 || exitCode === 1;
    };

    CSSLint.prototype.createViolationFromElement = function(element) {
      var bufferPoint, bufferRange;
      bufferPoint = new Point(element.$.line - 1, element.$.column - 1);
      bufferRange = new Range(bufferPoint, bufferPoint);
      return new Violation(element.$.severity, bufferRange, element.$.message);
    };

    return CSSLint;

  })(XmlBase);

}).call(this);
