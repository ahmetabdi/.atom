(function() {
  module.exports = {
    configDefaults: {
      rubocopExecutablePath: ''
    },
    activate: function() {
      return console.log('activate linter-rubocop');
    }
  };

}).call(this);
