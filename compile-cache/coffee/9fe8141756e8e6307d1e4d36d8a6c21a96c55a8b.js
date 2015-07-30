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
      return this.replaceWhitespaceWithTabs(this.editor.buffer);
    };

    TabsToSpaces.prototype.untabify = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceWhitespaceWithSpaces(this.editor.buffer);
    };

    TabsToSpaces.prototype.untabifyAll = function(editor) {
      this.editor = editor != null ? editor : atom.workspace.getActiveTextEditor();
      if (this.editor == null) {
        return;
      }
      return this.replaceAllWhitespaceWithSpaces(this.editor.buffer);
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

    TabsToSpaces.prototype.replaceAllWhitespaceWithSpaces = function(buffer) {
      return buffer.transact((function(_this) {
        return function() {
          return buffer.scan(_this.allWhitespace, function(_arg) {
            var count, match, replace;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            return replace("" + (_this.multiplyText(' ', count)));
          });
        };
      })(this));
    };

    TabsToSpaces.prototype.replaceWhitespaceWithSpaces = function(buffer) {
      return buffer.transact((function(_this) {
        return function() {
          return buffer.scan(_this.leadingWhitespace, function(_arg) {
            var count, match, replace;
            match = _arg.match, replace = _arg.replace;
            count = _this.countSpaces(match[0]);
            return replace("" + (_this.multiplyText(' ', count)));
          });
        };
      })(this));
    };

    TabsToSpaces.prototype.replaceWhitespaceWithTabs = function(buffer) {
      return buffer.transact((function(_this) {
        return function() {
          return buffer.scan(_this.leadingWhitespace, function(_arg) {
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
