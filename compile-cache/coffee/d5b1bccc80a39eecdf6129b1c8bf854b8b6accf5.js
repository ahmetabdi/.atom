(function() {
  var JsHint;

  JsHint = require('../../lib/linter/jshint');

  describe('JsHint', function() {
    var jsHint;
    jsHint = null;
    beforeEach(function() {
      return jsHint = new JsHint('/path/to/target.js');
    });
    return describe('buildCommand', function() {
      var originalJSHintPath;
      originalJSHintPath = atom.config.get('atom-lint.jshint.path');
      afterEach(function() {
        return atom.config.set('atom-lint.jshint.path', originalJSHintPath);
      });
      return describe('when the target file path is "/path/to/target.js"', function() {
        describe('and config "atom-lint.jshint.path" is "/path/to/jshint"', function() {
          return it('returns ["/path/to/jshint", "--reporter", "checkstyle", "/path/to/target.js"]', function() {
            atom.config.set('atom-lint.jshint.path', '/path/to/jshint');
            return expect(jsHint.buildCommand()).toEqual(['/path/to/jshint', '--reporter', 'checkstyle', '/path/to/target.js']);
          });
        });
        return describe('and config "atom-lint.jshint.path" is not set', function() {
          return it('returns ["jshint", "--reporter", "checkstyle", "/path/to/target.js"]', function() {
            atom.config.set('atom-lint.jshint.path', null);
            return expect(jsHint.buildCommand()).toEqual(['jshint', '--reporter', 'checkstyle', '/path/to/target.js']);
          });
        });
      });
    });
  });

}).call(this);
