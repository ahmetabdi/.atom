(function() {
  var SCSSLint;

  SCSSLint = require('../../lib/linter/scss-lint');

  describe('SCSSLint', function() {
    var scssLint;
    scssLint = null;
    beforeEach(function() {
      return scssLint = new SCSSLint('/path/to/target.scss');
    });
    return describe('isValidExitCode', function() {
      describe('with 0', function() {
        return it('returns true', function() {
          return expect(scssLint.isValidExitCode(0)).toBeTruthy();
        });
      });
      describe('with 1', function() {
        return it('returns true', function() {
          return expect(scssLint.isValidExitCode(1)).toBeTruthy();
        });
      });
      describe('with 2', function() {
        return it('returns true', function() {
          return expect(scssLint.isValidExitCode(2)).toBeTruthy();
        });
      });
      describe('with 65', function() {
        return it('returns true for older SCSSLint versions', function() {
          return expect(scssLint.isValidExitCode(65)).toBeTruthy();
        });
      });
      return describe('with any other value', function() {
        return it('returns false', function() {
          expect(scssLint.isValidExitCode(-1)).toBeFalsy();
          expect(scssLint.isValidExitCode(3)).toBeFalsy();
          return expect(scssLint.isValidExitCode(66)).toBeFalsy();
        });
      });
    });
  });

}).call(this);
