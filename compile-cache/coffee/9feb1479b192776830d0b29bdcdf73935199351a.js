(function() {
  var CSON, LintRunner, LintView, View, Violation, ViolationView, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  View = require('atom').View;

  CSON = require('season');

  _ = require('lodash');

  LintRunner = require('./lint-runner');

  ViolationView = require('./violation-view');

  Violation = require('./violation');

  module.exports = LintView = (function(_super) {
    __extends(LintView, _super);

    function LintView() {
      return LintView.__super__.constructor.apply(this, arguments);
    }

    LintView.content = function() {
      return this.div({
        "class": 'lint'
      });
    };

    LintView.prototype.initialize = function(editorView) {
      this.editorView = editorView;
      this.editorView.lintView = this;
      this.editorView.overlayer.append(this);
      this.editor = this.editorView.getEditor();
      this.violationViews = [];
      this.lintRunner = new LintRunner(this.editor);
      this.lintRunner.on('activate', (function(_this) {
        return function() {
          return _this.onLinterActivation();
        };
      })(this));
      this.lintRunner.on('deactivate', (function(_this) {
        return function() {
          return _this.onLinterDeactivation();
        };
      })(this));
      this.lintRunner.on('lint', (function(_this) {
        return function(error, violations) {
          return _this.onLint(error, violations);
        };
      })(this));
      this.lintRunner.startWatching();
      this.editorView.command('lint:move-to-next-violation', (function(_this) {
        return function() {
          return _this.moveToNextViolation();
        };
      })(this));
      return this.editorView.command('lint:move-to-previous-violation', (function(_this) {
        return function() {
          return _this.moveToPreviousViolation();
        };
      })(this));
    };

    LintView.prototype.beforeRemove = function() {
      this.editorView.off('lint:move-to-next-violation lint:move-to-previous-violation');
      this.lintRunner.stopWatching();
      return this.editorView.lintView = void 0;
    };

    LintView.prototype.refresh = function() {
      return this.lintRunner.refresh();
    };

    LintView.prototype.onLinterActivation = function() {
      return this.editorDisplayUpdateSubscription = this.subscribe(this.editorView, 'editor:display-updated', (function(_this) {
        return function() {
          if (_this.pendingViolations != null) {
            _this.addViolationViews(_this.pendingViolations);
            return _this.pendingViolations = null;
          }
        };
      })(this));
    };

    LintView.prototype.onLinterDeactivation = function() {
      var _ref;
      if ((_ref = this.editorDisplayUpdateSubscription) != null) {
        _ref.off();
      }
      return this.removeViolationViews();
    };

    LintView.prototype.onLint = function(error, violations) {
      this.removeViolationViews();
      if (error != null) {
        console.log(error.toString());
        return console.log(error.stack);
      } else if (this.editorView.active) {
        return this.addViolationViews(violations);
      } else {
        return this.pendingViolations = violations;
      }
    };

    LintView.prototype.addViolationViews = function(violations) {
      var violation, violationView, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = violations.length; _i < _len; _i++) {
        violation = violations[_i];
        violationView = new ViolationView(violation, this);
        _results.push(this.violationViews.push(violationView));
      }
      return _results;
    };

    LintView.prototype.removeViolationViews = function() {
      var view, _results;
      _results = [];
      while (view = this.violationViews.shift()) {
        _results.push(view.remove());
      }
      return _results;
    };

    LintView.prototype.getValidViolationViews = function() {
      return this.violationViews.filter(function(violationView) {
        return violationView.isValid;
      });
    };

    LintView.prototype.moveToNextViolation = function() {
      return this.moveToNeighborViolation('next');
    };

    LintView.prototype.moveToPreviousViolation = function() {
      return this.moveToNeighborViolation('previous');
    };

    LintView.prototype.moveToNeighborViolation = function(direction) {
      var comparingMethod, currentCursorPosition, enumerationMethod, neighborViolationView;
      if (this.violationViews.length === 0) {
        atom.beep();
        return;
      }
      if (direction === 'next') {
        enumerationMethod = 'find';
        comparingMethod = 'isGreaterThan';
      } else {
        enumerationMethod = 'findLast';
        comparingMethod = 'isLessThan';
      }
      currentCursorPosition = this.editor.getCursor().getScreenPosition();
      neighborViolationView = _[enumerationMethod](this.getValidViolationViews(), function(violationView) {
        var violationPosition;
        violationPosition = violationView.screenStartPosition;
        return violationPosition[comparingMethod](currentCursorPosition);
      });
      if (neighborViolationView != null) {
        return this.editor.setCursorScreenPosition(neighborViolationView.screenStartPosition);
      } else {
        return atom.beep();
      }
    };

    return LintView;

  })(View);

}).call(this);
