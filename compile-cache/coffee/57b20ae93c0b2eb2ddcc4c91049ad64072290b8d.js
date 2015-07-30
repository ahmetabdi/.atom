(function() {
  var CommandRunner, LinterError, XmlBase, xml2js;

  xml2js = require('xml2js');

  CommandRunner = require('../command-runner');

  LinterError = require('../linter-error');

  module.exports = XmlBase = (function() {
    function XmlBase(filePath) {
      this.filePath = filePath;
    }

    XmlBase.prototype.run = function(callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand());
      return runner.run((function(_this) {
        return function(commandError, result) {
          if (commandError != null) {
            return callback(commandError);
          }
          if (!_this.isValidExitCode(result.exitCode)) {
            return callback(new LinterError("Process exited with code " + result.exitCode, result));
          }
          return xml2js.parseString(result.stdout, function(xmlError, xml) {
            if (xmlError != null) {
              return callback(xmlError);
            }
            return callback(null, _this.createViolationsFromXml(xml));
          });
        };
      })(this));
    };

    XmlBase.prototype.buildCommand = function() {
      throw new Error('::buildCommand must be overridden');
    };

    XmlBase.prototype.isValidExitCode = function(exitCode) {
      throw new Error('::isValidExitCode must be overridden');
    };

    XmlBase.prototype.createViolationsFromXml = function(xml) {
      var element, _i, _len, _ref, _ref1, _results;
      if ((xml != null ? (_ref = xml.checkstyle) != null ? _ref.file : void 0 : void 0) == null) {
        return [];
      }
      _ref1 = xml.checkstyle.file[0].error;
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        element = _ref1[_i];
        _results.push(this.createViolationFromElement(element));
      }
      return _results;
    };

    XmlBase.prototype.createViolationFromElement = function(element) {
      throw new Error('::createViolationFromElement must be overridden');
    };

    return XmlBase;

  })();

}).call(this);
