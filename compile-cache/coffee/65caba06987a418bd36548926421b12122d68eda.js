(function() {
  var Flake8;

  Flake8 = require('../../lib/linter/flake8');

  describe('Flake8', function() {
    var flake8;
    flake8 = null;
    beforeEach(function() {
      return flake8 = new Flake8('/path/to/target.py');
    });
    return describe('buildCommand', function() {
      var originalFlake8Path;
      originalFlake8Path = atom.config.get('atom-lint.flake8.path');
      afterEach(function() {
        return atom.config.set('atom-lint.flake8.path', originalFlake8Path);
      });
      return describe('when the target file path is "/path/to/target.py"', function() {
        describe('and config "atom-lint.flake8.path" is "/path/to/flake8"', function() {
          return it('returns ["/path/to/flake8", "/path/to/target.py"]', function() {
            atom.config.set('atom-lint.flake8.path', '/path/to/flake8');
            return expect(flake8.buildCommand()).toEqual(['/path/to/flake8', '/path/to/target.py']);
          });
        });
        return describe('and config "atom-lint.flake8.path" is not set', function() {
          return it('returns ["flake8", "/path/to/target.py"]', function() {
            atom.config.set('atom-lint.flake8.path', null);
            return expect(flake8.buildCommand()).toEqual(['flake8', '/path/to/target.py']);
          });
        });
      });
    });
  });

}).call(this);
