(function() {
  var Rubocop;

  Rubocop = require('../../lib/linter/rubocop');

  describe('Rubocop', function() {
    var rubocop;
    rubocop = null;
    beforeEach(function() {
      return rubocop = new Rubocop('/path/to/target.rb');
    });
    return describe('buildCommand', function() {
      var originalRubocopPath;
      originalRubocopPath = atom.config.get('atom-lint.rubocop.path');
      afterEach(function() {
        return atom.config.set('atom-lint.rubocop.path', originalRubocopPath);
      });
      return describe('when the target file path is "/path/to/target.rb"', function() {
        describe('and config "atom-lint.rubocop.path" is "/path/to/rubocop"', function() {
          return it('returns ["/path/to/rubocop", "--format", "json", "/path/to/target.rb"]', function() {
            atom.config.set('atom-lint.rubocop.path', '/path/to/rubocop');
            return expect(rubocop.buildCommand()).toEqual(['/path/to/rubocop', '--format', 'json', '/path/to/target.rb']);
          });
        });
        return describe('and config "atom-lint.rubocop.path" is not set', function() {
          return it('returns ["rubocop", "--format", "json", "/path/to/target.rb"]', function() {
            atom.config.set('atom-lint.rubocop.path', null);
            return expect(rubocop.buildCommand()).toEqual(['rubocop', '--format', 'json', '/path/to/target.rb']);
          });
        });
      });
    });
  });

}).call(this);
