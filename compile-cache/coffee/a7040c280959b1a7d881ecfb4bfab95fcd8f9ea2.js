(function() {
  var SourceInfo, Utility, fs;

  fs = require('fs');

  Utility = require('./utility');

  module.exports = SourceInfo = (function() {
    function SourceInfo() {}

    SourceInfo.prototype.frameworkLookup = {
      test: 'test',
      spec: 'rspec',
      feature: 'cucumber'
    };

    SourceInfo.prototype.currentShell = function() {
      return atom.config.get('ruby-test.shell') || 'bash';
    };

    SourceInfo.prototype.cwd = function() {
      return atom.project.getPaths()[0];
    };

    SourceInfo.prototype.testFileCommand = function() {
      return atom.config.get("ruby-test." + (this.testFramework()) + "FileCommand");
    };

    SourceInfo.prototype.testAllCommand = function() {
      var configName;
      configName = "ruby-test." + (this.testFramework()) + "AllCommand";
      return atom.config.get("ruby-test." + (this.testFramework()) + "AllCommand");
    };

    SourceInfo.prototype.testSingleCommand = function() {
      return atom.config.get("ruby-test." + (this.testFramework()) + "SingleCommand");
    };

    SourceInfo.prototype.activeFile = function() {
      var fp;
      return this._activeFile || (this._activeFile = (fp = this.filePath()) && atom.project.relativize(fp));
    };

    SourceInfo.prototype.currentLine = function() {
      var cursor, editor;
      return this._currentLine || (this._currentLine = !this._currentLine ? (editor = atom.workspace.getActiveTextEditor(), cursor = editor && editor.getCursor(), cursor ? cursor.getBufferRow() + 1 : null) : void 0);
    };

    SourceInfo.prototype.testFramework = function() {
      var t;
      return this._testFramework || (this._testFramework = !this._testFramework ? (t = this.fileType()) && this.frameworkLookup[t] || this.projectType() : void 0);
    };

    SourceInfo.prototype.fileType = function() {
      var matches;
      return this._fileType || (this._fileType = this._fileType === void 0 ? !this.activeFile() ? null : (matches = this.activeFile().match(/_(test|spec)\.rb$/)) ? matches[1] : (matches = this.activeFile().match(/\.(feature)$/)) ? matches[1] : void 0 : void 0);
    };

    SourceInfo.prototype.projectType = function() {
      if (fs.existsSync(atom.project.path + '/test')) {
        return 'test';
      } else if (fs.existsSync(atom.project.path + '/spec')) {
        return 'rspec';
      } else if (fs.existsSync(atom.project.path + '/feature')) {
        return 'cucumber';
      } else {
        return null;
      }
    };

    SourceInfo.prototype.filePath = function() {
      var util;
      util = new Utility;
      return util.filePath();
    };

    return SourceInfo;

  })();

}).call(this);
