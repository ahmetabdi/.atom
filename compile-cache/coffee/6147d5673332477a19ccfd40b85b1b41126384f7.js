(function() {
  var path;

  path = require('path');

  module.exports = {
    configDefaults: {
      rubyExecutablePath: null
    },
    activate: function() {
      return console.log('activate linter-ruby');
    }
  };

}).call(this);
