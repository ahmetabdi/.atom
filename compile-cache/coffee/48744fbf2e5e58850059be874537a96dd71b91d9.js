(function() {
  var WorkspaceView, fs, path, temp, _;

  WorkspaceView = require('atom').WorkspaceView;

  path = require('path');

  fs = require('fs');

  temp = require('temp');

  _ = require('lodash');

  window.prepareWorkspace = function(options) {
    var filePath, filename, projectPath;
    if (options == null) {
      options = {};
    }
    projectPath = temp.mkdirSync('lint-runner-spec-');
    atom.project.setPath(projectPath);
    filename = options.filename || 'sample.txt';
    filePath = path.join(projectPath, filename);
    fs.writeFileSync(filePath, 'This is a sample file.');
    atom.workspaceView = new WorkspaceView;
    atom.workspaceView.attachToDom();
    atom.workspaceView.openSync(filename);
    if (options.activatePackage) {
      waitsForPromise(function() {
        return atom.packages.activatePackage('atom-lint');
      });
    }
    return {
      editorView: atom.workspaceView.getActiveView()
    };
  };

  window.waitsForEventToBeEmitted = function(targetObject, eventName, context) {
    var emitted;
    emitted = false;
    targetObject.on(eventName, function() {
      return emitted = true;
    });
    context();
    return waitsFor(function() {
      return emitted;
    });
  };

  window.expectEventNotToBeEmitted = function(targetObject, eventName, context) {
    var emitted;
    emitted = false;
    targetObject.on(eventName, function() {
      return emitted = true;
    });
    context();
    waits(100);
    return runs(function() {
      return expect(emitted).toBe(false);
    });
  };

  window.loadGrammar = function(languageName) {
    var aPackage, packageName, scopeName;
    packageName = "language-" + languageName;
    atom.packages.loadPackage(packageName);
    aPackage = atom.packages.getLoadedPackage(packageName);
    if (!aPackage) {
      return null;
    }
    aPackage.loadGrammarsSync();
    scopeName = "source." + languageName;
    return _.find(aPackage.grammars, function(grammar) {
      return grammar.scopeName === scopeName;
    });
  };

}).call(this);
