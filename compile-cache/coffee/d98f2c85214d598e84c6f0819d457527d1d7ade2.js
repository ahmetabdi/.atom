(function() {
  var path;

  path = require('path');

  module.exports = {
    config: {
      rubyExecutablePath: {
        "default": '',
        type: 'string'
      }
    },
    activate: function() {
      return console.log('activate linter-ruby');
    }
  };

}).call(this);
