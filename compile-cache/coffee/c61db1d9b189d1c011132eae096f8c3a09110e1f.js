(function() {
  var HLint;

  HLint = require('../../lib/linter/hlint');

  describe('HLint', function() {
    var hlint;
    hlint = null;
    beforeEach(function() {
      return hlint = new HLint('/path/to/target.hs');
    });
    return describe('buildCommand', function() {
      var originalHLintPath;
      originalHLintPath = atom.config.get('atom-lint.hlint.path');
      afterEach(function() {
        return atom.config.set('atom-lint.hlint.path', originalHLintPath);
      });
      return describe('when the target file path is "/path/to/target.hs"', function() {
        describe('and config "atom-lint.hlint.path" is "/path/to/hlint"', function() {
          return it('returns ["/path/to/hlint", "/path/to/target.hs"]', function() {
            atom.config.set('atom-lint.hlint.path', '/path/to/hlint');
            return expect(hlint.buildCommand()).toEqual(['/path/to/hlint', '/path/to/target.hs']);
          });
        });
        return describe('and config "atom-lint.hlint.path" is not set', function() {
          return it('returns ["hlint", "/path/to/target.hs"]', function() {
            atom.config.set('atom-lint.hlint.path', null);
            return expect(hlint.buildCommand()).toEqual(['hlint', '/path/to/target.hs']);
          });
        });
      });
    });
  });

}).call(this);
