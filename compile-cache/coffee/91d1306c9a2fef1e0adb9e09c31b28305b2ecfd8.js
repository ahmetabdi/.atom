(function() {
  var Config, path;

  Config = require('../lib/config');

  path = require('path');

  require('./spec-helper');

  describe('Config', function() {
    var linterConfig, originalAtomLintConfig;
    linterConfig = null;
    originalAtomLintConfig = atom.config.get('atom-lint');
    beforeEach(function() {
      atom.config.set('atom-lint', null);
      return linterConfig = new Config('some-linter');
    });
    afterEach(function() {
      return atom.config.set('atom-lint', originalAtomLintConfig);
    });
    describe('.onDidChange', function() {
      it('returns an subscription object', function() {
        var subscription;
        subscription = Config.onDidChange('foo', function() {});
        expect(subscription.off).not.toBeNull();
        return subscription.off();
      });
      it('invokes the callback when the key path under `atom-lint` key is modified', function() {
        var invoked, subscription;
        invoked = false;
        subscription = Config.onDidChange('foo', function() {
          invoked = true;
          return subscription.off();
        });
        atom.config.set('atom-lint.foo', 'bar');
        return waitsFor(function() {
          return invoked;
        });
      });
      return describe('when no key path is passed', function() {
        return it('invokes the callback when any key under `atom-lint` namespace is modified', function() {
          var invoked, subscription;
          invoked = false;
          subscription = Config.onDidChange(function() {
            invoked = true;
            return subscription.off();
          });
          atom.config.set('atom-lint.foo', 'bar');
          return waitsFor(function() {
            return invoked;
          });
        });
      });
    });
    return describe('::isFileToLint', function() {
      describe('when "atom-lint.some-linter.ignoredNames" is not set', function() {
        return it('returns true for "foo.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(true);
        });
      });
      describe('when "atom-lint.some-linter.ignoredNames" is ["foo.txt"]', function() {
        beforeEach(function() {
          return atom.config.pushAtKeyPath('atom-lint.some-linter.ignoredNames', 'foo.txt');
        });
        it('returns false for "foo.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(false);
        });
        return it('returns true for "bar.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'bar.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(true);
        });
      });
      describe('when "atom-lint.some-linter.ignoredNames" is ["*.txt"]', function() {
        beforeEach(function() {
          return atom.config.pushAtKeyPath('atom-lint.some-linter.ignoredNames', '*.txt');
        });
        it('returns false for "foo.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(false);
        });
        return it('returns true for "foo.rb" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.rb');
          return expect(linterConfig.isFileToLint(filePath)).toBe(true);
        });
      });
      describe('when "atom-lint.some-linter.ignoredNames" is ["*.txt", "foo.*"]', function() {
        beforeEach(function() {
          atom.config.pushAtKeyPath('atom-lint.some-linter.ignoredNames', '*.txt');
          return atom.config.pushAtKeyPath('atom-lint.some-linter.ignoredNames', 'foo.*');
        });
        it('returns false for "foo.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(false);
        });
        it('returns false for "foo.rb" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.rb');
          return expect(linterConfig.isFileToLint(filePath)).toBe(false);
        });
        return it('returns true for "bar.rb" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'bar.rb');
          return expect(linterConfig.isFileToLint(filePath)).toBe(true);
        });
      });
      return describe('when "atom-lint.ignoredNames" is ["foo.txt"]', function() {
        beforeEach(function() {
          return atom.config.pushAtKeyPath('atom-lint.ignoredNames', 'foo.txt');
        });
        it('returns false for "foo.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'foo.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(false);
        });
        return it('returns true for "bar.txt" in the current project', function() {
          var filePath;
          filePath = path.join(atom.project.getPath(), 'bar.txt');
          return expect(linterConfig.isFileToLint(filePath)).toBe(true);
        });
      });
    });
  });

}).call(this);
