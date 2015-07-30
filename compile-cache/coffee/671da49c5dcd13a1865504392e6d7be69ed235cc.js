(function() {
  var parser, _;

  _ = require('underscore');

  parser = require('../lib/parser');

  describe('js-parser', function() {
    return it('should convert javascript spec source to object', function() {
      var expected, res;
      res = parser.parse('describe(\'describe 1\', function() {\n  beforeEach(function() {\n  });\n  context(\'context 1\', () => {\n    it(\'it 1\', function() {});\n  });\n  it(\'it 2\', function(done) {});\n  it(\'it 3\', function() { new Error(\'err\'); });\n});\ndescribe(\'describe 2\', function() {\n  it(\'it 4\', function() {});\n});');
      expected = [
        {
          type: 'describe',
          text: 'describe 1',
          line: 1,
          children: [
            {
              type: 'context',
              text: 'context 1',
              line: 4,
              children: [
                {
                  type: 'it',
                  text: 'it 1',
                  line: 5
                }
              ]
            }, {
              type: 'it',
              text: 'it 2',
              line: 7
            }, {
              type: 'it',
              text: 'it 3',
              line: 8
            }
          ]
        }, {
          type: 'describe',
          text: 'describe 2',
          line: 10,
          children: [
            {
              type: 'it',
              text: 'it 4',
              line: 11
            }
          ]
        }
      ];
      return expect(_.isEqual(res, expected)).toBe(true);
    });
  });

}).call(this);
