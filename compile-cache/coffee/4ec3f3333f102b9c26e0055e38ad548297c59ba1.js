(function() {
  var SpecMaker;

  SpecMaker = require('../lib/spec-maker');

  describe("SpecMaker", function() {
    var activeEditor, activeEditorView, defaultOpts, openFile, triggerOpenEvent, workspaceView;
    activeEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };
    activeEditorView = function() {
      return atom.views.getView(activeEditor());
    };
    workspaceView = function() {
      return atom.views.getView(atom.workspace);
    };
    triggerOpenEvent = function() {
      return atom.commands.dispatch(activeEditorView(), 'spec-maker:open-or-create-spec');
    };
    openFile = function(file) {
      if (file == null) {
        file = 'lib/sample.js';
      }
      return atom.workspace.open(file);
    };
    defaultOpts = function() {
      return {
        split: 'right'
      };
    };
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('spec-maker');
      });
      waitsForPromise(function() {
        return openFile();
      });
      return runs(function() {
        jasmine.attachToDOM(workspaceView());
        return spyOn(atom.workspace, 'open').andCallThrough();
      });
    });
    describe('creating and opening new specs', function() {
      return it('creates/opens a new spec for the current file', function() {
        triggerOpenEvent();
        return expect(atom.workspace.open).toHaveBeenCalledWith('spec/sample-spec.js', defaultOpts());
      });
    });
    describe('returning from a spec to the source file', function() {
      return it('returns to the source file for the spec', function() {
        waitsForPromise(function() {
          return openFile('spec/some-path/sample-spec.js');
        });
        return runs(function() {
          atom.config.set('spec-maker.houseOfPane', 'none');
          triggerOpenEvent();
          return expect(atom.workspace.open).toHaveBeenCalledWith('lib/some-path/sample.js', void 0);
        });
      });
    });
    describe('user suffix and location settings', function() {
      it('uses user settings to name the spec file', function() {
        atom.config.set('spec-maker.specSuffix', '.specification');
        triggerOpenEvent();
        return expect(atom.workspace.open).toHaveBeenCalledWith('spec/sample.specification.js', defaultOpts());
      });
      it('uses user settings to place the spec file', function() {
        atom.config.set('spec-maker.specLocation', 'tests');
        triggerOpenEvent();
        return expect(atom.workspace.open).toHaveBeenCalledWith('tests/sample-spec.js', defaultOpts());
      });
      return it('uses user settings to place the spec file from source files', function() {
        waitsForPromise(function() {
          return openFile('source/js/some-path/sample.js');
        });
        return runs(function() {
          atom.config.set('spec-maker.srcLocation', 'source/js');
          triggerOpenEvent();
          return expect(atom.workspace.open).toHaveBeenCalledWith('spec/some-path/sample-spec.js', defaultOpts());
        });
      });
    });
    return describe('user settings pane settings', function() {
      it('opens in a specified pane', function() {
        atom.config.set('spec-maker.houseOfPane', 'left');
        triggerOpenEvent();
        return expect(atom.workspace.open).toHaveBeenCalledWith('spec/sample-spec.js', {
          split: 'left'
        });
      });
      return it('opens in no pane', function() {
        atom.config.set('spec-maker.houseOfPane', 'none');
        triggerOpenEvent();
        return expect(atom.workspace.open).toHaveBeenCalledWith('spec/sample-spec.js', void 0);
      });
    });
  });

}).call(this);
