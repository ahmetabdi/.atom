(function() {
  var CoffeeLint, Point, Range, Violation, XmlBase, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  XmlBase = require('./xml-base');

  Violation = require('../violation');

  module.exports = CoffeeLint = (function(_super) {
    __extends(CoffeeLint, _super);

    function CoffeeLint() {
      return CoffeeLint.__super__.constructor.apply(this, arguments);
    }

    CoffeeLint.canonicalName = 'CoffeeLint';

    CoffeeLint.prototype.buildCommand = function() {
      var command, userCoffeeLintPath;
      command = [];
      userCoffeeLintPath = atom.config.get('atom-lint.coffeelint.path');
      if (userCoffeeLintPath != null) {
        command.push(userCoffeeLintPath);
      } else {
        command.push('coffeelint');
      }
      command.push('--reporter');
      command.push('checkstyle');
      command.push(this.filePath);
      return command;
    };

    CoffeeLint.prototype.isValidExitCode = function(exitCode) {
      return (0 <= exitCode && exitCode <= 2);
    };

    CoffeeLint.prototype.createViolationFromElement = function(element) {
      var bufferPoint, bufferRange, column, message;
      column = element.$.column;
      if (column == null) {
        column = 1;
      }
      bufferPoint = new Point(element.$.line - 1, column - 1);
      bufferRange = new Range(bufferPoint, bufferPoint);
      message = element.$.message.replace(/; context: .*?$/, '');
      return new Violation(element.$.severity, bufferRange, message);
    };

    return CoffeeLint;

  })(XmlBase);

}).call(this);
