(function() {
  var Subscriber, TidyMarkdown, tidyMarkdown;

  Subscriber = require('emissary').Subscriber;

  tidyMarkdown = require('tidy-markdown');

  TidyMarkdown = (function() {
    Subscriber.includeInto(TidyMarkdown);

    function TidyMarkdown() {
      this.subscribe(atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          return _this.handleEvents(editor);
        };
      })(this)));
      this.subscribeToCommand(atom.workspaceView, 'tidy-markdown:run', (function(_this) {
        return function() {
          var editor;
          if (editor = atom.workspace.getActiveEditor()) {
            return _this.run(editor, editor.getGrammar().scopeName);
          }
        };
      })(this));
    }

    TidyMarkdown.prototype.destroy = function() {
      return this.unsubscribe();
    };

    TidyMarkdown.prototype.handleEvents = function(editor) {
      var buffer, bufferSavedSubscription;
      buffer = editor.getBuffer();
      bufferSavedSubscription = this.subscribe(buffer, 'will-be-saved', (function(_this) {
        return function() {
          return buffer.transact(function() {
            if (atom.config.get('tidy-markdown.runOnSave')) {
              return _this.run(editor, editor.getGrammar().scopeName);
            }
          });
        };
      })(this));
      this.subscribe(editor, 'destroyed', (function(_this) {
        return function() {
          bufferSavedSubscription.off();
          return _this.unsubscribe(editor);
        };
      })(this));
      return this.subscribe(buffer, 'destroyed', (function(_this) {
        return function() {
          return _this.unsubscribe(buffer);
        };
      })(this));
    };

    TidyMarkdown.prototype.run = function(editor, grammarScopeName) {
      var buffer, fixedText, text;
      if (grammarScopeName !== 'source.gfm') {
        return;
      }
      buffer = editor.getBuffer();
      text = buffer.getText();
      fixedText = tidyMarkdown(text);
      if (text !== fixedText) {
        return buffer.setTextViaDiff(fixedText);
      }
    };

    return TidyMarkdown;

  })();

  module.exports = TidyMarkdown;

}).call(this);
