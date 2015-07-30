(function() {
  var Violation, util, _;

  _ = require('lodash');

  util = require('./util');

  module.exports = Violation = (function() {
    Violation.SEVERITIES = ['warning', 'error'];

    function Violation(severity, bufferRange, message, metadata) {
      this.severity = severity;
      this.bufferRange = bufferRange;
      this.message = message;
      this.metadata = metadata != null ? metadata : [];
      if (!_.contains(Violation.SEVERITIES, this.severity)) {
        message = "Severity must be any of " + (Violation.SEVERITIES.join(',')) + ". ";
        message += "" + this.severity + " is passed.";
        throw new Error(message);
      }
    }

    Violation.prototype.getMessageHTML = function() {
      var HTML;
      HTML = util.punctuate(util.capitalize(this.message));
      HTML = _.escape(HTML);
      HTML = HTML.replace(/(^|\s)&#39;(.+?)&#39;([\s\.\,\:\;\!\?\)]|$)/g, '$1<code>$2</code>$3');
      return HTML = HTML.replace(/`(.+?)`/g, '<code>$1</code>');
    };

    Violation.prototype.getAttachmentHTML = function() {
      return null;
    };

    Violation.prototype.getMetadataHTML = function() {
      var elements, item;
      elements = (function() {
        var _i, _len, _ref, _results;
        _ref = this.metadata;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          item = _ref[_i];
          _results.push("<span class=\"item\">" + (_.escape(item)) + "</span>");
        }
        return _results;
      }).call(this);
      return elements.join('');
    };

    return Violation;

  })();

}).call(this);
