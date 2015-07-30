(function() {
  var util;

  util = require('../lib/util');

  require('./spec-helper');

  describe('util', function() {
    return describe('.punctuate', function() {
      var eachPunctuation, _i, _len, _ref;
      _ref = ['.', ',', '!', '?', ':', ';'];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        eachPunctuation = _ref[_i];
        describe("when the text ends with a " + eachPunctuation, function() {
          var punctuation;
          punctuation = eachPunctuation;
          return it('does nothing', function() {
            var text;
            text = "Hi" + punctuation;
            return expect(util.punctuate(text)).toBe(text);
          });
        });
      }
      return describe('when the text does not end with a punctuation', function() {
        return it('adds a period to the end', function() {
          return expect(util.punctuate('Hi')).toBe('Hi.');
        });
      });
    });
  });

}).call(this);
