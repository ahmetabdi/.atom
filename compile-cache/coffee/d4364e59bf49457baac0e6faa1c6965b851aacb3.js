(function() {
  var AtomLint;

  AtomLint = require('../lib/atom-lint');

  require('./spec-helper');

  describe('atom-lint', function() {
    var editorView;
    editorView = null;
    beforeEach(function() {
      var _ref;
      return _ref = prepareWorkspace({
        activatePackage: true
      }), editorView = _ref.editorView, _ref;
    });
    describe('by default', function() {
      return it('is enabled', function() {
        return expect(editorView.find('.lint').length).toBe(1);
      });
    });
    describe('when enabled', function() {
      return describe('and command "lint:toggle" is triggered', function() {
        beforeEach(function() {
          return atom.workspaceView.trigger('lint:toggle');
        });
        return it('becomes disabled', function() {
          return expect(editorView.find('.lint').length).toBe(0);
        });
      });
    });
    describe('when disabled', function() {
      return describe('and command "lint:toggle" is triggered', function() {
        beforeEach(function() {
          atom.workspaceView.trigger('lint:toggle');
          return atom.workspaceView.trigger('lint:toggle');
        });
        return it('becomes enabled', function() {
          return expect(editorView.find('.lint').length).toBe(1);
        });
      });
    });
    describe('after deactivation and re-activation', function() {
      beforeEach(function() {
        atom.packages.deactivatePackage('atom-lint');
        return atom.packages.activatePackage('atom-lint');
      });
      return describe('and command "lint:toggle" is triggered', function() {
        beforeEach(function() {
          return atom.workspaceView.trigger('lint:toggle');
        });
        return it('becomes disabled', function() {
          return expect(editorView.find('.lint').length).toBe(0);
        });
      });
    });
    return describe('::shouldRefleshWithConfigChange', function() {
      var current, previous;
      previous = null;
      current = null;
      describe('when nothing is changed', function() {
        beforeEach(function() {
          previous = {
            ignoredNames: [],
            showViolationMetadata: true,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
          return current = {
            ignoredNames: [],
            showViolationMetadata: true,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
        });
        return it('returns false', function() {
          var result;
          result = AtomLint.shouldRefleshWithConfigChange(previous, current);
          return expect(result).toBe(false);
        });
      });
      describe('when "ignoredNames" is changed', function() {
        beforeEach(function() {
          previous = {
            ignoredNames: [],
            showViolationMetadata: true,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
          return current = {
            ignoredNames: ['foo'],
            showViolationMetadata: true,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
        });
        return it('returns true', function() {
          var result;
          result = AtomLint.shouldRefleshWithConfigChange(previous, current);
          return expect(result).toBe(true);
        });
      });
      describe('when "showViolationMetadata" is changed', function() {
        beforeEach(function() {
          previous = {
            ignoredNames: [],
            showViolationMetadata: true,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
          return current = {
            ignoredNames: [],
            showViolationMetadata: false,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
        });
        return it('returns false', function() {
          var result;
          result = AtomLint.shouldRefleshWithConfigChange(previous, current);
          return expect(result).toBe(false);
        });
      });
      return describe('when "ignoredNames" and "showViolationMetadata" are changed', function() {
        beforeEach(function() {
          previous = {
            ignoredNames: ['foo'],
            showViolationMetadata: true,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
          return current = {
            ignoredNames: [],
            showViolationMetadata: false,
            rubocop: {
              path: '/path/to/rubocop'
            }
          };
        });
        return it('returns true', function() {
          var result;
          result = AtomLint.shouldRefleshWithConfigChange(previous, current);
          return expect(result).toBe(true);
        });
      });
    });
  });

}).call(this);
