(function() {
  var Utility;

  module.exports = Utility = (function() {
    function Utility() {}

    Utility.prototype.saveFile = function() {
      if (this.filePath()) {
        return this.editor().save();
      }
    };

    Utility.prototype.filePath = function() {
      return this.editor() && this.editor().buffer && this.editor().buffer.file && this.editor().buffer.file.path;
    };

    Utility.prototype.editor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    return Utility;

  })();

}).call(this);
