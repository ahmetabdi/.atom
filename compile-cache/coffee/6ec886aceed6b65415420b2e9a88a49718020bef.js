(function() {
  var Point, Range, SCSSLint, VALID_EXIT_CODES, Violation, XmlBase, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  XmlBase = require('./xml-base');

  Violation = require('../violation');

  VALID_EXIT_CODES = [0, 1, 2, 65];

  module.exports = SCSSLint = (function(_super) {
    __extends(SCSSLint, _super);

    function SCSSLint() {
      return SCSSLint.__super__.constructor.apply(this, arguments);
    }

    SCSSLint.canonicalName = 'SCSS-Lint';

    SCSSLint.prototype.buildCommand = function() {
      var command, userSCSSLintPath;
      command = [];
      userSCSSLintPath = atom.config.get('atom-lint.scss-lint.path');
      if (userSCSSLintPath != null) {
        command.push(userSCSSLintPath);
      } else {
        command.push('scss-lint');
      }
      command.push('--format', 'XML');
      command.push(this.filePath);
      return command;
    };

    SCSSLint.prototype.isValidExitCode = function(exitCode) {
      return VALID_EXIT_CODES.indexOf(exitCode) >= 0;
    };

    SCSSLint.prototype.createViolationsFromXml = function(xml) {
      var element, _i, _len, _ref1, _results;
      if (xml.lint.file == null) {
        return [];
      }
      _ref1 = xml.lint.file[0].issue;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        element = _ref1[_i];
        _results.push(this.createViolationFromElement(element));
      }
      return _results;
    };

    SCSSLint.prototype.createViolationFromElement = function(element) {
      var bufferPoint, bufferRange, column;
      column = element.$.column;
      if (column == null) {
        column = 1;
      }
      bufferPoint = new Point(element.$.line - 1, column - 1);
      bufferRange = new Range(bufferPoint, bufferPoint);
      return new Violation(element.$.severity, bufferRange, element.$.reason);
    };

    return SCSSLint;

  })(XmlBase);

}).call(this);
