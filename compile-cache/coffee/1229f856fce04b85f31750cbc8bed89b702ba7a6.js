(function() {
  var findClosingIndex, split, _ref;

  _ref = require('../lib/utils'), findClosingIndex = _ref.findClosingIndex, split = _ref.split;

  describe('split', function() {
    return it('does not fail when there is parenthesis after', function() {
      var res, string;
      string = "a,)(";
      res = split(string);
      return expect(res).toEqual(['a', '']);
    });
  });

}).call(this);
