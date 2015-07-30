(function() {
  var SourceInfo, fs;

  SourceInfo = require('../lib/source-info');

  fs = require('fs');

  describe("SourceInfo", function() {
    var editor, frameworks, savedCommands, setUpOpenFile, setUpPackageConfig, setUpProjectPaths, setUpWithOpenFile, setUpWithoutOpenFile, sourceInfo;
    frameworks = ['test', 'rspec', 'cucumber'];
    savedCommands = {};
    editor = null;
    sourceInfo = null;
    setUpProjectPaths = function() {
      return atom.project = {
        getPaths: function() {
          return ["fooPath"];
        },
        relativize: function(filePath) {
          return "fooDirectory/" + filePath;
        },
        path: "project/path"
      };
    };
    setUpPackageConfig = function() {
      var framework, _i, _len, _results;
      savedCommands = {};
      _results = [];
      for (_i = 0, _len = frameworks.length; _i < _len; _i++) {
        framework = frameworks[_i];
        savedCommands["" + framework + "-all"] = atom.config.get("ruby-test." + framework + "AllCommand");
        atom.config.set("ruby-test." + framework + "AllCommand", "foo-" + framework + "AllCommand");
        savedCommands["" + framework + "-file"] = atom.config.get("ruby-test." + framework + "FileCommand");
        atom.config.set("ruby-test." + framework + "FileCommand", "foo-" + framework + "FileCommand");
        savedCommands["" + framework + "-single"] = atom.config.get("ruby-test." + framework + "SingleCommand");
        _results.push(atom.config.set("ruby-test." + framework + "SingleCommand", "foo-" + framework + "SingleCommand"));
      }
      return _results;
    };
    setUpOpenFile = function() {
      editor = {
        buffer: {
          file: {
            path: "foo_test.rb"
          }
        }
      };
      return spyOn(atom.workspace, 'getActiveTextEditor').andReturn(editor);
    };
    setUpWithOpenFile = function() {
      setUpProjectPaths();
      setUpPackageConfig();
      setUpOpenFile();
      return sourceInfo = new SourceInfo();
    };
    setUpWithoutOpenFile = function() {
      setUpProjectPaths();
      setUpPackageConfig();
      return sourceInfo = new SourceInfo();
    };
    beforeEach(function() {
      editor = null;
      sourceInfo = null;
      savedCommands = {};
      return atom.project = null;
    });
    describe("::cwd", function() {
      return it("is atom.project.getPaths()[0]", function() {
        setUpWithoutOpenFile();
        return expect(sourceInfo.cwd()).toBe("fooPath");
      });
    });
    describe("::testAllCommand", function() {
      return it("is the atom config for 'ruby-test.testAllCommand'", function() {
        spyOn(fs, 'existsSync').andCallFake(function(filePath) {
          return filePath.match(/test$/);
        });
        setUpWithoutOpenFile();
        return expect(sourceInfo.testAllCommand()).toBe("foo-testAllCommand");
      });
    });
    describe("::rspecAllCommand", function() {
      return it("is the atom config for 'ruby-test.rspecAllCommand'", function() {
        spyOn(fs, 'existsSync').andCallFake(function(filePath) {
          return filePath.match(/spec$/);
        });
        setUpWithoutOpenFile();
        return expect(sourceInfo.testAllCommand()).toBe("foo-rspecAllCommand");
      });
    });
    describe("::testFileCommand", function() {
      it("is the atom config for 'ruby-test.testFileCommand'", function() {
        setUpWithOpenFile();
        return expect(sourceInfo.testFileCommand()).toBe("foo-testFileCommand");
      });
      return it("is the atom config for 'ruby-test.rspecFileCommand' for an rspec file", function() {
        setUpWithOpenFile();
        editor.buffer.file.path = 'foo_spec.rb';
        return expect(sourceInfo.testFileCommand()).toBe("foo-rspecFileCommand");
      });
    });
    describe("::testSingleCommand", function() {
      return it("is the atom config for 'ruby-test.testSingleCommand'", function() {
        setUpWithOpenFile();
        return expect(sourceInfo.testSingleCommand()).toBe("foo-testSingleCommand");
      });
    });
    describe("::activeFile", function() {
      return it("is the project-relative path for the current file path", function() {
        setUpWithOpenFile();
        return expect(sourceInfo.activeFile()).toBe("fooDirectory/foo_test.rb");
      });
    });
    describe("::currentLine", function() {
      it("is the cursor getBufferRow() plus 1", function() {
        var cursor;
        setUpWithOpenFile();
        cursor = {
          getBufferRow: function() {
            return 99;
          }
        };
        editor.getCursor = function() {
          return cursor;
        };
        return expect(sourceInfo.currentLine()).toBe(100);
      });
      return describe("without editor", function() {
        return it("is null", function() {
          setUpWithoutOpenFile();
          return expect(sourceInfo.currentLine()).toBeNull();
        });
      });
    });
    describe("::currentShell", function() {
      return it("when ruby-test.shell is null", function() {
        setUpWithoutOpenFile();
        return expect(sourceInfo.currentShell()).toBe('bash');
      });
    });
    return afterEach(function() {
      var framework, _i, _len, _results;
      delete atom.project;
      _results = [];
      for (_i = 0, _len = frameworks.length; _i < _len; _i++) {
        framework = frameworks[_i];
        atom.config.set("ruby-test." + framework + "AllCommand", savedCommands["" + framework + "-all"]);
        atom.config.set("ruby-test." + framework + "FileCommand", savedCommands["" + framework + "-file"]);
        _results.push(atom.config.set("ruby-test." + framework + "SingleCommand", savedCommands["" + framework + "-single"]));
      }
      return _results;
    });
  });

}).call(this);
