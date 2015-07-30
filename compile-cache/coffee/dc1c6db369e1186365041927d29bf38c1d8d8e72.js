(function() {
  var SourceInfo, Utility, fs;

  fs = require('fs');

  Utility = require('./utility');

  module.exports = SourceInfo = (function() {
    function SourceInfo() {}

    SourceInfo.prototype.frameworkLookup = {
      test: 'test',
      spec: 'rspec',
      feature: 'cucumber',
      minitest: 'minitest'
    };

    SourceInfo.prototype.matchers = {
      method: /def\s(.*?)$/,
      spec: /(?:"|')(.*?)(?:"|')/
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
      return this._currentLine || (this._currentLine = !this._currentLine ? (editor = atom.workspace.getActiveTextEditor(), cursor = editor && editor.getLastCursor(), cursor ? cursor.getBufferRow() + 1 : null) : void 0);
    };

    SourceInfo.prototype.minitestRegExp = function(text, type) {
      var value;
      return this._minitestRegExp || (this._minitestRegExp = !this._minitestRegExp ? (text != null ? value = text.match(this.matchers[type]) : void 0, value ? value[1] : "") : void 0);
    };

    SourceInfo.prototype.isMiniTest = function() {
      var editor, i, isRSpec, isSpec, isUnit, minitestClassRegExp, minitestMethodRegExp, regExp, rspecRequireRegExp, specRegExp, text;
      editor = atom.workspace.getActiveTextEditor();
      i = this.currentLine() - 1;
      regExp = null;
      isSpec = false;
      isUnit = false;
      isRSpec = false;
      specRegExp = new RegExp(/^(\s+)(should|test|it)\s+['""'](.*)['""']\s+do\s*(?:#.*)?$/);
      rspecRequireRegExp = new RegExp(/^require(\s+)['"](rails|spec)_helper['"]$/);
      minitestClassRegExp = new RegExp(/class\s(.*)<(\s?|\s+)Minitest::Test/);
      minitestMethodRegExp = new RegExp(/^(\s+)def\s(.*)$/);
      while (i >= 0) {
        text = editor.lineTextForBufferRow(i);
        if (!regExp && specRegExp.test(text)) {
          isSpec = true;
          regExp = text;
        } else if (!regExp && minitestMethodRegExp.test(text)) {
          isUnit = true;
          regExp = text;
        } else if (rspecRequireRegExp.test(text)) {
          isRSpec = true;
          break;
        } else if (isUnit && minitestClassRegExp.test(text)) {
          this.minitestRegExp(regExp, "method");
          return true;
        }
        i--;
      }
      if (!isRSpec && isSpec) {
        this.minitestRegExp(regExp, "spec");
        return true;
      }
      return false;
    };

    SourceInfo.prototype.testFramework = function() {
      var t;
      return this._testFramework || (this._testFramework = !this._testFramework ? (fs.existsSync(this.cwd() + '/.rspec') && 'rspec') || ((t = this.fileType()) && this.frameworkLookup[t]) || this.projectType() : void 0);
    };

    SourceInfo.prototype.fileType = function() {
      var matches;
      return this._fileType || (this._fileType = this._fileType === void 0 ? !this.activeFile() ? null : (matches = this.activeFile().match(/_?(test|spec)_?(.*)\.rb$/)) ? this.isMiniTest() ? "minitest" : matches[1] : (matches = this.activeFile().match(/\.(feature)$/)) ? matches[1] : void 0 : void 0);
    };

    SourceInfo.prototype.projectType = function() {
      if (fs.existsSync(this.cwd() + '/test')) {
        return 'test';
      } else if (fs.existsSync(this.cwd() + '/spec')) {
        return 'rspec';
      } else if (fs.existsSync(this.cwd() + '/feature')) {
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
