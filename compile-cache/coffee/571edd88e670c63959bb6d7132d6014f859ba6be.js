(function() {
  var Utility;

  Utility = require('../lib/utility');

  describe("Utility", function() {
    return describe("::saveFile", function() {
      var makeEditor;
      makeEditor = function(opts) {
        var editor;
        editor = {
          save: null,
          buffer: {
            file: {
              path: opts.path
            }
          }
        };
        spyOn(editor, 'save');
        spyOn(atom.workspace, 'getActiveTextEditor').andReturn(editor);
        return editor;
      };
      it("calls save() on the active editor file", function() {
        var editor, util;
        editor = makeEditor({
          path: 'foo/bar.rb'
        });
        util = new Utility;
        util.saveFile();
        return expect(editor.save).toHaveBeenCalled();
      });
      return it("does not call save() when there is no file path", function() {
        var editor, util;
        editor = makeEditor({
          path: null
        });
        util = new Utility;
        util.saveFile();
        return expect(editor.save).not.toHaveBeenCalled();
      });
    });
  });

}).call(this);
