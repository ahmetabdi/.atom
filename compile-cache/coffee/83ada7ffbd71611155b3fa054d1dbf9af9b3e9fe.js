(function() {
  var TidyMarkdown;

  TidyMarkdown = require('./tidy-markdown');

  module.exports = {
    configDefaults: {
      runOnSave: true
    },
    activate: function() {
      return this.tidyMarkdown = new TidyMarkdown();
    },
    deactivate: function() {
      var _ref;
      if ((_ref = this.tidyMarkdown) != null) {
        _ref.destroy();
      }
      return this.tidyMarkdown = null;
    }
  };

}).call(this);
