(function() {
  module.exports = {
    capitalize: function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    punctuate: function(string) {
      if (string.match(/[\.,\?!:;]$/)) {
        return string;
      } else {
        return string + '.';
      }
    }
  };

}).call(this);
