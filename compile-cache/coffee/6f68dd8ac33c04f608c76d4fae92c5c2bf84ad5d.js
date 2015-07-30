(function() {
  var basename;

  basename = require('path').basename;

  module.exports = {
    activate: function(state) {
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          var rspecGrammar;
          if (!_this._isRspecFile(editor.getPath())) {
            return;
          }
          rspecGrammar = atom.grammars.grammarForScopeName('source.ruby.rspec');
          if (rspecGrammar == null) {
            return;
          }
          return editor.setGrammar(rspecGrammar);
        };
      })(this));
    },
    deactivate: function() {},
    serialize: function() {},
    _isRspecFile: function(filename) {
      var rspec_filetype;
      rspec_filetype = 'spec.rb';
      return basename(filename).slice(-rspec_filetype.length) === rspec_filetype;
    }
  };

}).call(this);
