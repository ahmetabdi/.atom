(function() {
  var TabsToSpaces,
    __modulo = function(a, b) { return (+a % (b = +b) + b) % b; };

  module.exports = TabsToSpaces = (function() {
    function TabsToSpaces() {}

    TabsToSpaces.prototype.allWhitespace = /[ \t]+/g;

    TabsToSpaces.prototype.leadingWhitespace = /^[ \t]+/g;

    TabsToSpaces.prototype.tabify = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceWhitespaceWithTabs(this.editor);
    };

    TabsToSpaces.prototype.untabify = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceWhitespaceWithSpaces(this.editor);
    };

    TabsToSpaces.prototype.untabifyAll = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceAllWhitespaceWithSpaces(this.editor);
    };

    TabsToSpaces.prototype.countSpaces = function(text) {
      var ch, count, tabLength, _i, _len;
      count = 0;
      tabLength = this.editor.getTabLength();
      for (_i = 0, _len = text.length; _i < _len; _i++) {
        ch = text[_i];
        switch (ch) {
          case ' ':
            count += 1;
            break;
          case '\t':
            count += tabLength;
        }
      }
      return count;
    };

    TabsToSpaces.prototype.multiplyText = function(text, count) {
      return Array(count + 1).join(text);
    };

    TabsToSpaces.prototype.replaceAllWhitespaceWithSpaces = function(editor) {
      return editor.transact((function(_this) {
        return function() {
          return editor.scan(_this.allWhitespace, function(_arg) {
            var count, match, replace;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            return replace("" + (_this.multiplyText(' ', count)));
          });
        };
      })(this));
    };

    TabsToSpaces.prototype.replaceWhitespaceWithSpaces = function(editor) {
      return editor.transact((function(_this) {
        return function() {
          return editor.scan(_this.leadingWhitespace, function(_arg) {
            var count, match, replace;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            return replace("" + (_this.multiplyText(' ', count)));
          });
        };
      })(this));
    };

    TabsToSpaces.prototype.replaceWhitespaceWithTabs = function(editor) {
      return editor.transact((function(_this) {
        return function() {
          return editor.scan(_this.leadingWhitespace, function(_arg) {
            var count, match, replace, spaces, tabs;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            tabs = Math.floor(count / _this.editor.getTabLength());
            spaces = __modulo(count, _this.editor.getTabLength());
            return replace("" + (_this.multiplyText('\t', tabs)) + (_this.multiplyText(' ', spaces)));
          });
        };
      })(this));
    };

    return TabsToSpaces;

  })();

}).call(this);
