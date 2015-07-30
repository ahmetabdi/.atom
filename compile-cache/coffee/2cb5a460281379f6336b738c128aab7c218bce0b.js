(function() {
  var LintStatusView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = LintStatusView = (function(_super) {
    __extends(LintStatusView, _super);

    function LintStatusView() {
      return LintStatusView.__super__.constructor.apply(this, arguments);
    }

    LintStatusView.content = function() {
      return this.div({
        "class": 'lint-status inline-block'
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'linter-name'
          });
          return _this.span({
            "class": 'lint-summary'
          });
        };
      })(this));
    };

    LintStatusView.prototype.initialize = function(statusBarView) {
      this.statusBarView = statusBarView;
      this.subscribeToLintRunner();
      this.update();
      return this.subscribe(this.statusBarView, 'active-buffer-changed', (function(_this) {
        return function() {
          return process.nextTick(function() {
            _this.unsubscribeFromLintRunner();
            _this.subscribeToLintRunner();
            return _this.update();
          });
        };
      })(this));
    };

    LintStatusView.prototype.getActiveLintRunner = function() {
      var editorView, _ref;
      editorView = atom.workspaceView.getActiveView();
      return editorView != null ? (_ref = editorView.lintView) != null ? _ref.lintRunner : void 0 : void 0;
    };

    LintStatusView.prototype.subscribeToLintRunner = function() {
      var activeLintRunner;
      activeLintRunner = this.getActiveLintRunner();
      if (activeLintRunner == null) {
        return;
      }
      return this.subscription = activeLintRunner.on('activate deactivate lint', (function(_this) {
        return function(error) {
          return _this.update(error);
        };
      })(this));
    };

    LintStatusView.prototype.unsubscribeFromLintRunner = function() {
      var _ref;
      if ((_ref = this.subscription) != null) {
        _ref.off();
      }
      return this.subscription = null;
    };

    LintStatusView.prototype.update = function(error) {
      var activeLinter, violations, _ref;
      activeLinter = (_ref = this.getActiveLintRunner()) != null ? _ref.getActiveLinter() : void 0;
      if (activeLinter != null) {
        if ((error != null) && error.code === 'ENOENT') {
          this.displayLinterName("" + activeLinter.canonicalName + " is not installed");
          return this.displaySummary(violations);
        } else {
          this.displayLinterName(activeLinter.canonicalName);
          violations = this.getActiveLintRunner().getLastViolations();
          return this.displaySummary(violations);
        }
      } else {
        this.displayLinterName();
        return this.displaySummary();
      }
    };

    LintStatusView.prototype.displayLinterName = function(text) {
      return this.find('.linter-name').text(text || '');
    };

    LintStatusView.prototype.displaySummary = function(violations) {
      var errorCount, html, warningCount;
      html = '';
      if (violations != null) {
        if (violations.length === 0) {
          html += '<span class="icon icon-check lint-clean"></span>';
        } else {
          errorCount = this.countViolationsOfSeverity(violations, 'error');
          if (errorCount > 0) {
            html += "<span class=\"icon icon-alert lint-error\">" + errorCount + "</span>";
          }
          warningCount = this.countViolationsOfSeverity(violations, 'warning');
          if (warningCount > 0) {
            html += "<span class=\"icon icon-alert lint-warning\">" + warningCount + "</span>";
          }
        }
      }
      return this.find('.lint-summary').html(html);
    };

    LintStatusView.prototype.countViolationsOfSeverity = function(violations, severity) {
      if (violations == null) {
        return 0;
      }
      return violations.filter(function(violation) {
        return violation.severity === severity;
      }).length;
    };

    return LintStatusView;

  })(View);

}).call(this);
