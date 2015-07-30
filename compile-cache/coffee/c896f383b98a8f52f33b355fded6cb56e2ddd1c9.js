(function() {
  var SubAtom;

  SubAtom = require('sub-atom');

  module.exports = {
    activate: function(state) {
      var _base;
      this.state = state;
      this.subs = new SubAtom;
      this.subs.add(atom.commands.add('atom-text-editor', "find-selection:find-next", (function(_this) {
        return function() {
          return _this.find(+1);
        };
      })(this)));
      this.subs.add(atom.commands.add('atom-text-editor', "find-selection:find-previous", (function(_this) {
        return function() {
          return _this.find(-1);
        };
      })(this)));
      if (this.state == null) {
        this.state = {};
      }
      return this.state.selection = ((_base = this.state).selection != null ? _base.selection : _base.selection = '');
    },
    find: function(dir) {
      var buffer, editor, matchArray, newRange, noSel, origIdx, origRange, selMatchIdx, selText;
      editor = atom.workspace.activePaneItem;
      buffer = editor.getBuffer();
      origRange = editor.getSelection().getBufferRange();
      selText = editor.getSelectedText().replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
      noSel = origRange.isEmpty();
      if ((selText || (selText = this.state.selection))) {
        this.state.selection = selText;
      }
      if (!selText) {
        return;
      }
      origIdx = null;
      matchArray = [];
      buffer.scan(new RegExp(selText, 'ig'), function(res) {
        var comp;
        if (origIdx === null) {
          comp = res.range.compare(origRange);
          if (comp > -1) {
            origIdx = matchArray.length;
          }
        }
        return matchArray.push(res);
      });
      if (matchArray.length === 0) {
        return;
      }
      if (origIdx == null) {
        origIdx = 0;
      }
      if (noSel) {
        selMatchIdx = origIdx;
      } else {
        if (dir > 0) {
          if (origIdx === matchArray.length - 1) {
            selMatchIdx = 0;
          } else {
            selMatchIdx = origIdx + 1;
          }
        } else {
          if (origIdx === 0) {
            selMatchIdx = matchArray.length - 1;
          } else {
            selMatchIdx = origIdx - 1;
          }
        }
      }
      newRange = matchArray[selMatchIdx].range;
      editor.setCursorBufferPosition(newRange.start, {
        autoscroll: true
      });
      return editor.setSelectedBufferRanges([newRange]);
    },
    serialize: function() {
      return this.state;
    },
    deactivate: function() {
      return this.subs.dispose();
    }
  };

}).call(this);
