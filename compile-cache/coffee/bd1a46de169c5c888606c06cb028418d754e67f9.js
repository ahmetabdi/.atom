(function() {
  var Commands, CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  Commands = (function() {
    function Commands(linter) {
      this.linter = linter;
      this._subscriptions = new CompositeDisposable;
      this._subscriptions.add(atom.commands.add('atom-workspace', {
        'linter:next-error': (function(_this) {
          return function() {
            return _this.nextError();
          };
        })(this),
        'linter:toggle': (function(_this) {
          return function() {
            return _this.toggleLinter();
          };
        })(this),
        'linter:set-bubble-transparent': (function(_this) {
          return function() {
            return _this.setBubbleTransparent();
          };
        })(this),
        'linter:lint': (function(_this) {
          return function() {
            return _this.lint();
          };
        })(this)
      }));
      this._messages = null;
    }

    Commands.prototype.toggleLinter = function() {
      var _ref;
      return (_ref = this.linter.getActiveEditorLinter()) != null ? _ref.toggleStatus() : void 0;
    };

    Commands.prototype.setBubbleTransparent = function() {
      return this.linter.views.setBubbleTransparent();
    };

    Commands.prototype.lint = function() {
      var error, _ref;
      try {
        if ((_ref = this.linter.getActiveEditorLinter()) != null) {
          _ref.lint(false);
        }
        return this.linter.views.render();
      } catch (_error) {
        error = _error;
        return atom.notifications.addError(error.message, {
          detail: error.stack,
          dismissable: true
        });
      }
    };

    Commands.prototype.nextError = function() {
      var message, next;
      if (!this._messages || (next = this._messages.next()).done) {
        next = (this._messages = this.linter.views.getMessages().values()).next();
      }
      if (next.done) {
        return;
      }
      message = next.value;
      if (!message.filePath) {
        return;
      }
      if (!message.range) {
        return;
      }
      return atom.workspace.open(message.filePath).then(function() {
        return atom.workspace.getActiveTextEditor().setCursorBufferPosition(message.range.start);
      });
    };

    Commands.prototype.destroy = function() {
      this._messages = null;
      return this._subscriptions.dispose();
    };

    return Commands;

  })();

  module.exports = Commands;

}).call(this);
