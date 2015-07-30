(function() {
  var fs, helper, path, temp;

  fs = require('fs');

  path = require('path');

  temp = require('temp');

  helper = require('./spec-helper');

  describe('Tabs to Spaces', function() {
    var buffer, directory, editor, filePath, workspaceElement, _ref;
    _ref = [], buffer = _ref[0], directory = _ref[1], editor = _ref[2], filePath = _ref[3], workspaceElement = _ref[4];
    beforeEach(function() {
      directory = temp.mkdirSync();
      atom.project.setPaths(directory);
      workspaceElement = atom.views.getView(atom.workspace);
      filePath = path.join(directory, 'tabs-to-spaces.txt');
      fs.writeFileSync(filePath, '');
      atom.config.set('editor.tabLength', 4);
      waitsForPromise(function() {
        return atom.workspace.open(filePath).then(function(e) {
          return editor = e;
        });
      });
      runs(function() {
        return buffer = editor.getBuffer();
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('tabs-to-spaces');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
    });
    describe('activate', function() {
      return it('creates the commands', function() {
        expect(helper.hasCommand(workspaceElement, 'tabs-to-spaces:tabify')).toBeTruthy();
        expect(helper.hasCommand(workspaceElement, 'tabs-to-spaces:untabify')).toBeTruthy();
        return expect(helper.hasCommand(workspaceElement, 'tabs-to-spaces:untabify-all')).toBeTruthy();
      });
    });
    describe('deactivate', function() {
      beforeEach(function() {
        return atom.packages.deactivatePackage('tabs-to-spaces');
      });
      return it('destroys the commands', function() {
        expect(helper.hasCommand(workspaceElement, 'tabs-to-spaces:tabify')).toBeFalsy();
        expect(helper.hasCommand(workspaceElement, 'tabs-to-spaces:untabify')).toBeFalsy();
        return expect(helper.hasCommand(workspaceElement, 'tabs-to-spaces:untabify-all')).toBeFalsy();
      });
    });
    describe('tabify', function() {
      beforeEach(function() {
        return editor.setTabLength(3);
      });
      it('does not change an empty file', function() {
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('');
      });
      it('does not change spaces at the end of a line', function() {
        buffer.setText('foobarbaz     ');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('foobarbaz     ');
      });
      it('does not change spaces in the middle of a line', function() {
        buffer.setText('foo  bar  baz');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('foo  bar  baz');
      });
      it('converts one tab worth of spaces to a tab', function() {
        editor.setTabLength(2);
        buffer.setText('  foo');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('\tfoo');
      });
      it('converts almost two tabs worth of spaces to one tab and some spaces', function() {
        editor.setTabLength(4);
        buffer.setText('       foo');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('\t   foo');
      });
      it('changes multiple lines of leading spaces to tabs', function() {
        editor.setTabLength(4);
        buffer.setText('    foo\n       bar');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('\tfoo\n\t   bar');
      });
      it('leaves successive newlines alone', function() {
        editor.setTabLength(2);
        buffer.setText('  foo\n\n  bar\n\n  baz\n\n');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('\tfoo\n\n\tbar\n\n\tbaz\n\n');
      });
      return it('changes mixed spaces and tabs to uniform whitespace', function() {
        editor.setTabLength(2);
        buffer.setText('\t \tfoo\n');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:tabify');
        return expect(editor.getText()).toBe('\t\t foo\n');
      });
    });
    describe('untabify', function() {
      beforeEach(function() {
        return editor.setTabLength(3);
      });
      it('does not change an empty file', function() {
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('');
      });
      it('does not change tabs at the end of a string', function() {
        buffer.setText('foobarbaz\t');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('foobarbaz\t');
      });
      it('does not change tabs in the middle of a string', function() {
        buffer.setText('foo\tbar\tbaz');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('foo\tbar\tbaz');
      });
      it('changes one tab to the correct number of spaces', function() {
        editor.setTabLength(2);
        buffer.setText('\tfoo');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('  foo');
      });
      it('changes two tabs to the correct number of spaces', function() {
        editor.setTabLength(2);
        buffer.setText('\t\tfoo');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('    foo');
      });
      it('changes multiple lines of leading tabs to spaces', function() {
        editor.setTabLength(2);
        buffer.setText('\t\tfoo\n\t\tbar\n\n');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('    foo\n    bar\n\n');
      });
      return it('changes mixed spaces and tabs to uniform whitespace', function() {
        editor.setTabLength(2);
        buffer.setText(' \t foo\n');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify');
        return expect(editor.getText()).toBe('    foo\n');
      });
    });
    describe('untabify all', function() {
      beforeEach(function() {
        return editor.setTabLength(3);
      });
      it('does not change an empty file', function() {
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('');
      });
      it('does change tabs at the end of a string', function() {
        buffer.setText('foobarbaz\t');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('foobarbaz   ');
      });
      it('does change tabs in the middle of a string', function() {
        buffer.setText('foo\tbar\tbaz');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('foo   bar   baz');
      });
      it('changes one tab to the correct number of spaces', function() {
        editor.setTabLength(2);
        buffer.setText('\tfoo');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('  foo');
      });
      it('changes two tabs to the correct number of spaces', function() {
        editor.setTabLength(2);
        buffer.setText('\t\tfoo');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('    foo');
      });
      it('changes multiple lines of leading tabs to spaces', function() {
        editor.setTabLength(2);
        buffer.setText('\t\tfoo\n\t\tbar\n\n');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('    foo\n    bar\n\n');
      });
      return it('changes mixed spaces and tabs to uniform whitespace', function() {
        editor.setTabLength(2);
        buffer.setText(' \t foo\n');
        atom.commands.dispatch(workspaceElement, 'tabs-to-spaces:untabify-all');
        return expect(editor.getText()).toBe('    foo\n');
      });
    });
    return describe('on save', function() {
      beforeEach(function() {
        return atom.config.set('tabs-to-spaces.onSave', 'none');
      });
      it('will untabify before an editor saves a buffer', function() {
        atom.config.set('tabs-to-spaces.onSave', 'untabify');
        buffer.setText('\t\tfoo\n\t\tbar\n\n');
        editor.save();
        return expect(editor.getText()).toBe('        foo\n        bar\n\n');
      });
      it('will tabify before an editor saves a buffer', function() {
        atom.config.set('tabs-to-spaces.onSave', 'tabify');
        buffer.setText('        foo\n        bar\n\n');
        editor.save();
        return expect(editor.getText()).toBe('\t\tfoo\n\t\tbar\n\n');
      });
      return describe('with scope-specific configuration', function() {
        beforeEach(function() {
          atom.config.set('editor.tabLength', 2, {
            scope: '.text.plain'
          });
          atom.config.set('tabs-to-spaces.onSave', 'tabify', {
            scope: '.text.plain'
          });
          filePath = path.join(directory, 'sample.txt');
          fs.writeFileSync(filePath, 'Some text.\n');
          waitsForPromise(function() {
            return atom.workspace.open(filePath).then(function(e) {
              return editor = e;
            });
          });
          return runs(function() {
            return buffer = editor.getBuffer();
          });
        });
        it('respects the overridden configuration', function() {
          buffer.setText('    foo\n    bar\n\n');
          editor.save();
          return expect(editor.getText()).toBe('\t\tfoo\n\t\tbar\n\n');
        });
        return it('does not modify the contents of the user configuration file', function() {
          spyOn(atom.config, 'getUserConfigPath').andReturn(filePath);
          spyOn(editor, 'getPath').andReturn(filePath);
          buffer.setText('    foo\n    bar\n\n');
          editor.save();
          return expect(editor.getText()).toBe('    foo\n    bar\n\n');
        });
      });
    });
  });

}).call(this);
