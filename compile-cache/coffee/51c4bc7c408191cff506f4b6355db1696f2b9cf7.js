(function() {
  var Flake8, LintRunner, Rubocop, path;

  LintRunner = require('../lib/lint-runner');

  Rubocop = require('../lib/linter/rubocop');

  Flake8 = require('../lib/linter/flake8');

  path = require('path');

  require('./spec-helper');

  describe('LintRunner', function() {
    var buffer, editor, editorView, filename, lintRunner, originalAtomLintConfig;
    lintRunner = null;
    editorView = null;
    editor = null;
    buffer = null;
    filename = 'sample.txt';
    originalAtomLintConfig = atom.config.get('atom-lint');
    beforeEach(function() {
      atom.config.set('atom-lint', null);
      editorView = prepareWorkspace({
        'filename': filename
      }).editorView;
      editor = editorView.getEditor();
      buffer = editor.getBuffer();
      return lintRunner = new LintRunner(editor);
    });
    afterEach(function() {
      return atom.config.set('atom-lint', originalAtomLintConfig);
    });
    describe('initially', function() {
      return it('has no active linter', function() {
        return expect(lintRunner.getActiveLinter()).toBeFalsy();
      });
    });
    describe('::startWatching', function() {
      describe("when the editor's grammar is Ruby", function() {
        beforeEach(function() {
          return editor.setGrammar(loadGrammar('ruby'));
        });
        describe('and the filename is not specified in config "atom-lint.rubocop.ignoredNames"', function() {
          it('activates RuboCop', function() {
            lintRunner.startWatching();
            return expect(lintRunner.getActiveLinter()).toBe(Rubocop);
          });
          it('emits "activate" event', function() {
            return waitsForEventToBeEmitted(lintRunner, 'activate', function() {
              return lintRunner.startWatching();
            });
          });
          return it('emits "lint" event', function() {
            return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
              return lintRunner.startWatching();
            });
          });
        });
        return describe('and the filename is specified in config "atom-lint.rubocop.ignoredNames"', function() {
          beforeEach(function() {
            return atom.config.pushAtKeyPath('atom-lint.rubocop.ignoredNames', filename);
          });
          it('does not activate any linter', function() {
            lintRunner.startWatching();
            return expect(lintRunner.getActiveLinter()).toBeFalsy();
          });
          it('does not emit "activate" event', function() {
            return expectEventNotToBeEmitted(lintRunner, 'activate', function() {
              return lintRunner.startWatching();
            });
          });
          return it('does not emit "lint" event', function() {
            return expectEventNotToBeEmitted(lintRunner, 'lint', function() {
              return lintRunner.startWatching();
            });
          });
        });
      });
      describe("when the editor's grammar is Python", function() {
        beforeEach(function() {
          return editor.setGrammar(loadGrammar('python'));
        });
        it('activates flake8', function() {
          lintRunner.startWatching();
          return expect(lintRunner.getActiveLinter()).toBe(Flake8);
        });
        it('emits "activate" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'activate', function() {
            return lintRunner.startWatching();
          });
        });
        return it('emits "lint" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return lintRunner.startWatching();
          });
        });
      });
      describe("when the editor's grammar is unknown", function() {
        beforeEach(function() {
          return editor.setGrammar(loadGrammar('yaml'));
        });
        it('does not activate any linter', function() {
          lintRunner.startWatching();
          return expect(lintRunner.getActiveLinter()).toBeFalsy();
        });
        it('does not emit "activate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'activate', function() {
            return lintRunner.startWatching();
          });
        });
        return it('does not emit "lint" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'lint', function() {
            return lintRunner.startWatching();
          });
        });
      });
      return describe("when already watching and a linter is activated", function() {
        beforeEach(function() {
          editor.setGrammar(loadGrammar('ruby'));
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return lintRunner.startWatching();
          });
        });
        it('does not change linter', function() {
          lintRunner.startWatching();
          return expect(lintRunner.getActiveLinter()).toBe(Rubocop);
        });
        it('does not emit "activate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'activate', function() {
            return lintRunner.startWatching();
          });
        });
        return it('does not emit "lint" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'lint', function() {
            return lintRunner.startWatching();
          });
        });
      });
    });
    describe('::stopWatching', function() {
      describe('when any linter is already activated', function() {
        beforeEach(function() {
          editor.setGrammar(loadGrammar('ruby'));
          return lintRunner.startWatching();
        });
        it('deactivates the linter', function() {
          lintRunner.stopWatching();
          return expect(lintRunner.getActiveLinter()).toBeFalsy();
        });
        return it('emits "deactivate" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'deactivate', function() {
            return lintRunner.stopWatching();
          });
        });
      });
      return describe('when no linter is activated', function() {
        beforeEach(function() {
          return lintRunner.startWatching();
        });
        it('does nothing with linter', function() {
          lintRunner.stopWatching();
          return expect(lintRunner.getActiveLinter()).toBeFalsy();
        });
        return it('does not emit "deactivate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'deactivate', function() {
            return lintRunner.stopWatching();
          });
        });
      });
    });
    describe('::refresh', function() {
      describe('when RuboCop is already activated', function() {
        beforeEach(function() {
          editor.setGrammar(loadGrammar('ruby'));
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return lintRunner.startWatching();
          });
        });
        describe('then the filename is added to config "atom-lint.rubocop.ignoredNames"', function() {
          beforeEach(function() {
            return atom.config.pushAtKeyPath('atom-lint.rubocop.ignoredNames', filename);
          });
          return it('deactivates RuboCop', function() {
            lintRunner.refresh();
            return expect(lintRunner.getActiveLinter()).toBeFalsy();
          });
        });
        return describe('and config is not changed', function() {
          return it('does nothing with linter', function() {
            lintRunner.refresh();
            return expect(lintRunner.getActiveLinter()).toBe(Rubocop);
          });
        });
      });
      return describe('when not watching', function() {
        beforeEach(function() {
          return editor.setGrammar(loadGrammar('ruby'));
        });
        return it('does nothing with linter', function() {
          lintRunner.refresh();
          return expect(lintRunner.getActiveLinter()).toBeFalsy();
        });
      });
    });
    describe('when watching and RuboCop is already activated', function() {
      beforeEach(function() {
        editor.setGrammar(loadGrammar('ruby'));
        return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
          return lintRunner.startWatching();
        });
      });
      describe('and a file is saved', function() {
        return it('emits "lint" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return buffer.emit('saved');
          });
        });
      });
      describe('and a file is reloaded', function() {
        return it('emits "lint" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return buffer.emit('reloaded');
          });
        });
      });
      return describe("and the editor's grammar is changed to Python", function() {
        it('activates flake8', function() {
          editor.setGrammar(loadGrammar('python'));
          return expect(lintRunner.getActiveLinter()).toBe(Flake8);
        });
        it('does not emit "activate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'activate', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        it('does not emit "deactivate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'deactivate', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        it('emits "lint" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        return describe('and a file is saved', function() {
          beforeEach(function() {
            return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
              return editor.setGrammar(loadGrammar('python'));
            });
          });
          return it('emits "lint" event only once', function() {
            var emitCount;
            emitCount = 0;
            lintRunner.on('lint', function() {
              return emitCount++;
            });
            buffer.emit('saved');
            waits(500);
            return runs(function() {
              return expect(emitCount).toBe(1);
            });
          });
        });
      });
    });
    describe('when watching and no linter is activated', function() {
      beforeEach(function() {
        return lintRunner.startWatching();
      });
      describe('and a file is saved', function() {
        return it('does not emit "lint" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'lint', function() {
            return buffer.emit('saved');
          });
        });
      });
      return describe("and the editor's grammar is changed to Python", function() {
        it('activates flake8', function() {
          editor.setGrammar(loadGrammar('python'));
          return expect(lintRunner.getActiveLinter()).toBe(Flake8);
        });
        it('emits "activate" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'activate', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        it('does not emit "deactivate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'deactivate', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        return it('emits "lint" event', function() {
          return waitsForEventToBeEmitted(lintRunner, 'lint', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
      });
    });
    return describe('when not watching', function() {
      describe('and a file is saved', function() {
        return it('does not emit "lint" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'lint', function() {
            return buffer.emit('saved');
          });
        });
      });
      return describe("and the editor's grammar is changed to Python", function() {
        it('does not emits "lint" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'lint', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        it('does not emit "activate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'activate', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
        return it('does not emit "deactivate" event', function() {
          return expectEventNotToBeEmitted(lintRunner, 'deactivate', function() {
            return editor.setGrammar(loadGrammar('python'));
          });
        });
      });
    });
  });

}).call(this);
