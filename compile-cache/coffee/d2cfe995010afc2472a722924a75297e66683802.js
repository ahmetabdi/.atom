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
        }
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
      var cursor;
      editor = {
        buffer: {
          file: {
            path: "foo_test.rb"
          }
        }
      };
      cursor = {
        getBufferRow: function() {
          return 99;
        }
      };
      editor.getLastCursor = function() {
        return cursor;
      };
      editor.lineTextForBufferRow = function(line) {
        return "";
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
    describe("::fileType", function() {
      return it("correctly detects a minitest file", function() {
        setUpWithOpenFile();
        editor.lineTextForBufferRow = function(line) {
          return " it \"test something\" do";
        };
        return expect(sourceInfo.fileType()).toBe("minitest");
      });
    });
    describe("::projectType", function() {
      it("correctly detects a test directory", function() {
        spyOn(fs, 'existsSync').andCallFake(function(filePath) {
          return filePath.match(/fooPath\/test$/);
        });
        setUpWithoutOpenFile();
        return expect(sourceInfo.projectType()).toBe("test");
      });
      it("correctly detecs a spec directory", function() {
        spyOn(fs, 'existsSync').andCallFake(function(filePath) {
          return filePath.match(/fooPath\/spec$/);
        });
        setUpWithoutOpenFile();
        return expect(sourceInfo.projectType()).toBe("rspec");
      });
      return it("correctly detects a cucumber directory", function() {
        spyOn(fs, 'existsSync').andCallFake(function(filePath) {
          return filePath.match(/fooPath\/feature$/);
        });
        setUpWithoutOpenFile();
        return expect(sourceInfo.projectType()).toBe("cucumber");
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
        editor.getLastCursor = function() {
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
    describe("::minitestRegExp", function() {
      it("correctly returns the matching regex for spec", function() {
        setUpWithoutOpenFile();
        return expect(sourceInfo.minitestRegExp(" it \"test something\" do", "spec")).toBe("test something");
      });
      it("correctly returns the matching regex for minitest unit", function() {
        setUpWithoutOpenFile();
        return expect(sourceInfo.minitestRegExp(" def test_something", "method")).toBe("test_something");
      });
      return it("should return empty string if no match", function() {
        setUpWithoutOpenFile();
        return expect(sourceInfo.minitestRegExp("test something", "spec")).toBe("");
      });
    });
    describe("::isMiniTest", function() {
      it("correctly returns true if it is minitest spec file", function() {
        var cursor;
        setUpWithOpenFile();
        cursor = {
          getBufferRow: function() {
            return 99;
          }
        };
        editor.lineTextForBufferRow = function(line) {
          if (line === 99) {
            return " it \"test something\" do";
          }
        };
        return expect(sourceInfo.isMiniTest("")).toBe(true);
      });
      it("correctly returns true if it is a minitest unit file", function() {
        var cursor;
        setUpWithOpenFile();
        cursor = {
          getBufferRow: function() {
            return 10;
          }
        };
        editor.getLastCursor = function() {
          return cursor;
        };
        editor.lineTextForBufferRow = function(line) {
          if (line === 10) {
            return " def something";
          } else if (line === 5) {
            return "class sometest < Minitest::Test";
          }
        };
        return expect(sourceInfo.isMiniTest("")).toBe(true);
      });
      it("correctly returns false if it is a rspec file", function() {
        var cursor;
        setUpWithOpenFile();
        cursor = {
          getBufferRow: function() {
            return 10;
          }
        };
        editor.getLastCursor = function() {
          return cursor;
        };
        editor.lineTextForBufferRow = function(line) {
          if (line === 10) {
            return " it \"test something\" do";
          } else if (line === 5) {
            return "require \"spec_helper\"";
          }
        };
        return expect(sourceInfo.isMiniTest("")).toBe(false);
      });
      return it("correctly returns false if it is a unit test file", function() {
        var cursor;
        setUpWithOpenFile();
        cursor = {
          getBufferRow: function() {
            return 10;
          }
        };
        editor.getLastCursor = function() {
          return cursor;
        };
        editor.lineTextForBufferRow = function(line) {
          if (line === 10) {
            return " def something";
          } else if (line === 5) {
            return "class sometest < Unit::Test";
          }
        };
        return expect(sourceInfo.isMiniTest("")).toBe(false);
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
