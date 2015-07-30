(function() {
  var BufferedProcess, Point, Q, TagGenerator, path, _ref;

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, Point = _ref.Point;

  Q = require('q');

  path = require('path');

  module.exports = TagGenerator = (function() {
    function TagGenerator(path, scopeName) {
      this.path = path;
      this.scopeName = scopeName;
    }

    TagGenerator.prototype.parseTagLine = function(line) {
      var sections, tag;
      sections = line.split('\t');
      if (sections.length > 3) {
        tag = {
          position: new Point(parseInt(sections[2]) - 1),
          name: sections[0],
          type: sections[3],
          parent: null
        };
        if (sections.length > 4 && sections[4].search('signature:') === -1) {
          tag.parent = sections[4];
        }
        return tag;
      } else {
        return null;
      }
    };

    TagGenerator.prototype.getLanguage = function() {
      var _ref1;
      if ((_ref1 = path.extname(this.path)) === '.cson' || _ref1 === '.gyp') {
        return 'Cson';
      }
      switch (this.scopeName) {
        case 'source.c':
          return 'C';
        case 'source.cpp':
          return 'C++';
        case 'source.clojure':
          return 'Lisp';
        case 'source.coffee':
          return 'CoffeeScript';
        case 'source.css':
          return 'Css';
        case 'source.css.less':
          return 'Css';
        case 'source.css.scss':
          return 'Css';
        case 'source.gfm':
          return 'Markdown';
        case 'source.go':
          return 'Go';
        case 'source.java':
          return 'Java';
        case 'source.js':
          return 'JavaScript';
        case 'source.js.jsx':
          return 'JavaScript';
        case 'source.jsx':
          return 'JavaScript';
        case 'source.json':
          return 'Json';
        case 'source.makefile':
          return 'Make';
        case 'source.objc':
          return 'C';
        case 'source.objcpp':
          return 'C++';
        case 'source.python':
          return 'Python';
        case 'source.ruby':
          return 'Ruby';
        case 'source.sass':
          return 'Sass';
        case 'source.yaml':
          return 'Yaml';
        case 'text.html':
          return 'Html';
        case 'text.html.php':
          return 'Php';
        case 'source.c++':
          return 'C++';
        case 'source.objc++':
          return 'C++';
      }
    };

    TagGenerator.prototype.generate = function() {
      var args, command, defaultCtagsFile, deferred, exit, language, stdout, tags;
      deferred = Q.defer();
      tags = [];
      command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
      defaultCtagsFile = require.resolve('./.ctags');
      args = ["--options=" + defaultCtagsFile, '--fields=KsS'];
      if (atom.config.get('symbols-view.useEditorGrammarAsCtagsLanguage')) {
        if (language = this.getLanguage()) {
          args.push("--language-force=" + language);
        }
      }
      args.push('-nf', '-', this.path);
      stdout = (function(_this) {
        return function(lines) {
          var line, tag, _i, _len, _ref1, _results;
          _ref1 = lines.split('\n');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            line = _ref1[_i];
            if (tag = _this.parseTagLine(line.trim())) {
              _results.push(tags.push(tag));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this);
      exit = function() {
        return deferred.resolve(tags);
      };
      new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        exit: exit
      });
      return deferred.promise;
    };

    return TagGenerator;

  })();

}).call(this);
