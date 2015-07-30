(function() {
  module.exports = {
    configDefaults: {
      erbExecutablePath: null,
      rubyOnRailsMode: false
    },
    activate: function() {
      return console.log('activate linter-erb');
    }
  };

}).call(this);
