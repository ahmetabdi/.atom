(function() {
  var CSON, Config, Emitter, LINTER_MAP, LintRunner, Subscriber, path, _ref;

  path = require('path');

  CSON = require('season');

  _ref = require('emissary'), Emitter = _ref.Emitter, Subscriber = _ref.Subscriber;

  Config = require('./config');

  LINTER_MAP = CSON.readFileSync(path.join(__dirname, 'linter-map.cson'));

  module.exports = LintRunner = (function() {
    Emitter.includeInto(LintRunner);

    Subscriber.includeInto(LintRunner);

    function LintRunner(editor) {
      this.editor = editor;
      this.buffer = this.editor.getBuffer();
      this.lastViolations = null;
    }

    LintRunner.prototype.startWatching = function() {
      if (this.isWatching()) {
        return;
      }
      this.switchLinter();
      return this.grammerChangeSubscription = this.subscribe(this.editor, 'grammar-changed', (function(_this) {
        return function() {
          return _this.switchLinter();
        };
      })(this));
    };

    LintRunner.prototype.stopWatching = function() {
      if (this.grammerChangeSubscription != null) {
        this.grammerChangeSubscription.off();
        this.grammerChangeSubscription = null;
      }
      return this.deactivate();
    };

    LintRunner.prototype.refresh = function() {
      if (!this.isWatching()) {
        return;
      }
      return this.switchLinter();
    };

    LintRunner.prototype.isWatching = function() {
      return this.grammerChangeSubscription != null;
    };

    LintRunner.prototype.switchLinter = function() {
      var linterConfig, linterName, scopeName;
      scopeName = this.editor.getGrammar().scopeName;
      linterName = LINTER_MAP[scopeName];
      if (!linterName) {
        return this.deactivate();
      }
      linterConfig = new Config(linterName);
      if (!linterConfig.isFileToLint(this.getFilePath())) {
        return this.deactivate();
      }
      return this.activate(linterName);
    };

    LintRunner.prototype.activate = function(linterName) {
      var linterPath, wasAlreadyActivated;
      wasAlreadyActivated = this.linterConstructor != null;
      linterPath = "./linter/" + linterName;
      this.linterConstructor = require(linterPath);
      if (!wasAlreadyActivated) {
        this.emit('activate');
      }
      this.lint();
      if (this.bufferSubscription == null) {
        return this.bufferSubscription = this.subscribe(this.buffer, 'saved reloaded', (function(_this) {
          return function() {
            return _this.lint();
          };
        })(this));
      }
    };

    LintRunner.prototype.deactivate = function() {
      this.lastViolations = null;
      if (this.bufferSubscription != null) {
        this.bufferSubscription.off();
        this.bufferSubscription = null;
      }
      if (this.linterConstructor != null) {
        this.linterConstructor = null;
        return this.emit('deactivate');
      }
    };

    LintRunner.prototype.lint = function() {
      var linter;
      linter = new this.linterConstructor(this.getFilePath());
      return linter.run((function(_this) {
        return function(error, violations) {
          _this.setLastViolations(violations);
          return _this.emit('lint', error, _this.lastViolations);
        };
      })(this));
    };

    LintRunner.prototype.getFilePath = function() {
      return this.buffer.getUri();
    };

    LintRunner.prototype.getActiveLinter = function() {
      return this.linterConstructor;
    };

    LintRunner.prototype.getLastViolations = function() {
      return this.lastViolations;
    };

    LintRunner.prototype.setLastViolations = function(violations) {
      this.lastViolations = violations;
      if (this.lastViolations == null) {
        return;
      }
      return this.lastViolations = this.lastViolations.sort(function(a, b) {
        return a.bufferRange.compare(b.bufferRange);
      });
    };

    return LintRunner;

  })();

}).call(this);
