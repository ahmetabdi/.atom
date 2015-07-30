(function() {
  var JsHint, Point, Range, Violation, XmlBase, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  XmlBase = require('./xml-base');

  Violation = require('../violation');

  module.exports = JsHint = (function(_super) {
    __extends(JsHint, _super);

    function JsHint() {
      return JsHint.__super__.constructor.apply(this, arguments);
    }

    JsHint.canonicalName = 'JSHint';

    JsHint.prototype.buildCommand = function() {
      var command, userJsHintPath;
      command = [];
      userJsHintPath = atom.config.get('atom-lint.jshint.path');
      if (userJsHintPath != null) {
        command.push(userJsHintPath);
      } else {
        command.push('jshint');
      }
      command.push('--reporter', 'checkstyle');
      command.push(this.filePath);
      return command;
    };

    JsHint.prototype.isValidExitCode = function(exitCode) {
      return exitCode === 0 || exitCode === 2;
    };

    JsHint.prototype.createViolationFromElement = function(element) {
      var bufferPoint, bufferRange;
      bufferPoint = new Point(element.$.line - 1, element.$.column - 1);
      bufferRange = new Range(bufferPoint, bufferPoint);
      return new Violation(element.$.severity, bufferRange, element.$.message);
    };

    return JsHint;

  })(XmlBase);

}).call(this);
