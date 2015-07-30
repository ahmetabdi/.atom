(function() {
  var StatsTracker;

  StatsTracker = require('./stats-tracker');

  module.exports = {
    activate: function() {
      this.stats = new StatsTracker();
      return atom.commands.add('atom-workspace', 'editor-stats:toggle', (function(_this) {
        return function() {
          return _this.createView().toggle(_this.stats);
        };
      })(this));
    },
    deactivate: function() {
      this.editorStatsView = null;
      return this.stats = null;
    },
    createView: function() {
      var EditorStatsView;
      if (!this.editorStatsView) {
        EditorStatsView = require('./editor-stats-view');
        this.editorStatsView = new EditorStatsView();
      }
      return this.editorStatsView;
    }
  };

}).call(this);
