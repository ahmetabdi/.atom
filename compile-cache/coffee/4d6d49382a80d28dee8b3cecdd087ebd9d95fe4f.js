(function() {
  var SymbolIndex, fs, generate, minimatch, path, utils, _;

  fs = require('fs');

  path = require('path');

  _ = require('underscore');

  minimatch = require('minimatch');

  generate = require('./symbol-generator');

  utils = require('./symbol-utils');

  module.exports = SymbolIndex = (function() {
    function SymbolIndex(entries) {
      var n, _ref, _ref1, _ref2;
      this.entries = {};
      this.rescanDirectories = true;
      this.root = atom.project.getRootDirectory();
      this.repo = atom.project.getRepo();
      this.ignoredNames = (_ref = atom.config.get('core.ignoredNames')) != null ? _ref : [];
      if (typeof this.ignoredNames === 'string') {
        this.ignoredNames = [ignoredNames];
      }
      this.logToConsole = (_ref1 = atom.config.get('goto.logToConsole')) != null ? _ref1 : false;
      this.moreIgnoredNames = (_ref2 = atom.config.get('goto.moreIgnoredNames')) != null ? _ref2 : '';
      this.moreIgnoredNames = (function() {
        var _i, _len, _ref3, _results;
        _ref3 = this.moreIgnoredNames.split(/[, \t]+/);
        _results = [];
        for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
          n = _ref3[_i];
          if (n != null ? n.length : void 0) {
            _results.push(n);
          }
        }
        return _results;
      }).call(this);
      this.noGrammar = {};
      this.subscribe();
    }

    SymbolIndex.prototype.invalidate = function() {
      this.entries = {};
      return this.rescanDirectories = true;
    };

    SymbolIndex.prototype.subscribe = function() {
      atom.project.on('path-changed', (function(_this) {
        return function() {
          _this.root = atom.project.getRootDirectory();
          _this.repo = atom.project.getRepo();
          return _this.invalidate();
        };
      })(this));
      atom.config.observe('core.ignoredNames', (function(_this) {
        return function() {
          var _ref;
          _this.ignoredNames = (_ref = atom.config.get('core.ignoredNames')) != null ? _ref : [];
          if (typeof _this.ignoredNames === 'string') {
            _this.ignoredNames = [ignoredNames];
          }
          return _this.invalidate();
        };
      })(this));
      atom.config.observe('goto.moreIgnoredNames', (function(_this) {
        return function() {
          var n, _ref;
          _this.moreIgnoredNames = (_ref = atom.config.get('goto.moreIgnoredNames')) != null ? _ref : '';
          _this.moreIgnoredNames = (function() {
            var _i, _len, _ref1, _results;
            _ref1 = this.moreIgnoredNames.split(/[, \t]+/);
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              n = _ref1[_i];
              if (n != null ? n.length : void 0) {
                _results.push(n);
              }
            }
            return _results;
          }).call(_this);
          return _this.invalidate();
        };
      })(this));
      atom.project.eachBuffer((function(_this) {
        return function(buffer) {
          buffer.on('contents-modified', function() {
            return _this.entries[buffer.getPath()] = null;
          });
          return buffer.on('destroyed', function() {
            return buffer.off();
          });
        };
      })(this));
      return atom.workspace.eachEditor((function(_this) {
        return function(editor) {
          editor.on('grammar-changed', function() {
            return _this.entries[editor.getPath()] = null;
          });
          return editor.on('destroyed', function() {
            return editor.off();
          });
        };
      })(this));
    };

    SymbolIndex.prototype.destroy = function() {
      return this.entries = null;
    };

    SymbolIndex.prototype.getEditorSymbols = function(editor) {
      var fqn;
      fqn = editor.getPath();
      if (!this.entries[fqn] && this.keepPath(fqn)) {
        this.entries[fqn] = generate(fqn, editor.getGrammar(), editor.getText());
      }
      return this.entries[fqn];
    };

    SymbolIndex.prototype.getAllSymbols = function() {
      var fqn, s, symbols, _ref;
      this.update();
      s = [];
      _ref = this.entries;
      for (fqn in _ref) {
        symbols = _ref[fqn];
        Array.prototype.push.apply(s, symbols);
      }
      return s;
    };

    SymbolIndex.prototype.update = function() {
      var fqn, symbols, _ref, _results;
      if (this.rescanDirectories) {
        return this.rebuild();
      } else {
        _ref = this.entries;
        _results = [];
        for (fqn in _ref) {
          symbols = _ref[fqn];
          if (symbols === null && this.keepPath(fqn)) {
            _results.push(this.processFile(fqn));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    SymbolIndex.prototype.rebuild = function() {
      if (this.root) {
        this.processDirectory(this.root.path);
      }
      this.rescanDirectories = false;
      if (this.logToConsole) {
        return console.log('No Grammar:', Object.keys(this.noGrammar));
      }
    };

    SymbolIndex.prototype.gotoDeclaration = function() {
      var e, filePath, fqn, matches, symbols, word, _ref;
      e = atom.workspace.getActiveEditor();
      word = e != null ? e.getTextInRange(e.getCursor().getCurrentWordBufferRange()) : void 0;
      if (!(word != null ? word.length : void 0)) {
        return null;
      }
      this.update();
      filePath = e.getPath();
      matches = [];
      this.matchSymbol(matches, word, this.entries[filePath]);
      _ref = this.entries;
      for (fqn in _ref) {
        symbols = _ref[fqn];
        if (fqn !== filePath) {
          this.matchSymbol(matches, word, symbols);
        }
      }
      if (matches.length === 0) {
        return null;
      }
      if (matches.length > 1) {
        return matches;
      }
      return utils.gotoSymbol(matches[0]);
    };

    SymbolIndex.prototype.matchSymbol = function(matches, word, symbols) {
      var symbol, _i, _len, _results;
      if (symbols) {
        _results = [];
        for (_i = 0, _len = symbols.length; _i < _len; _i++) {
          symbol = symbols[_i];
          if (symbol.name === word) {
            _results.push(matches.push(symbol));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    };

    SymbolIndex.prototype.processDirectory = function(dirPath) {
      var dir, dirs, entries, entry, fqn, stats, _i, _j, _len, _len1, _results;
      if (this.logToConsole) {
        console.log('GOTO: directory', dirPath);
      }
      entries = fs.readdirSync(dirPath);
      dirs = [];
      for (_i = 0, _len = entries.length; _i < _len; _i++) {
        entry = entries[_i];
        fqn = path.join(dirPath, entry);
        stats = fs.statSync(fqn);
        if (this.keepPath(fqn, stats.isFile())) {
          if (stats.isDirectory()) {
            dirs.push(fqn);
          } else if (stats.isFile()) {
            this.processFile(fqn);
          }
        }
      }
      entries = null;
      _results = [];
      for (_j = 0, _len1 = dirs.length; _j < _len1; _j++) {
        dir = dirs[_j];
        _results.push(this.processDirectory(dir));
      }
      return _results;
    };

    SymbolIndex.prototype.processFile = function(fqn) {
      var grammar, text;
      if (this.logToConsole) {
        console.log('GOTO: file', fqn);
      }
      text = fs.readFileSync(fqn, {
        encoding: 'utf8'
      });
      grammar = atom.syntax.selectGrammar(fqn, text);
      if ((grammar != null ? grammar.name : void 0) !== "Null Grammar") {
        return this.entries[fqn] = generate(fqn, grammar, text);
      } else {
        return this.noGrammar[path.extname(fqn)] = true;
      }
    };

    SymbolIndex.prototype.keepPath = function(filePath, isFile) {
      var base, ext, glob, _i, _len, _ref;
      if (isFile == null) {
        isFile = true;
      }
      base = path.basename(filePath);
      ext = path.extname(base);
      if (isFile && (this.noGrammar[ext] != null)) {
        if (this.logToConsole) {
          console.log('GOTO: ignore/grammar', filePath);
        }
        return false;
      }
      _ref = this.moreIgnoredNames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        glob = _ref[_i];
        if (minimatch(base, glob)) {
          if (this.logToConsole) {
            console.log('GOTO: ignore/core', filePath);
          }
          return false;
        }
      }
      if (_.contains(this.ignoredNames, base)) {
        if (this.logToConsole) {
          console.log('GOTO: ignore/core', filePath);
        }
        return false;
      }
      if (ext && _.contains(this.ignoredNames, '*#{ext}')) {
        if (this.logToConsole) {
          console.log('GOTO: ignore/core', filePath);
        }
        return false;
      }
      if (this.repo && this.repo.isPathIgnored(filePath)) {
        if (this.logToConsole) {
          console.log('GOTO: ignore/git', filePath);
        }
        return false;
      }
      return true;
    };

    return SymbolIndex;

  })();

}).call(this);
