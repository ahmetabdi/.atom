(function() {
  module.exports = {
    config: {
      rubocopExecutablePath: {
        type: 'string',
        "default": ''
      }
    },
    activate: function() {
      return console.log('activate linter-rubocop');
    }
  };

}).call(this);
