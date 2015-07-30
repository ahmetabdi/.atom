(function() {
  var BufferedProcess, PlainMessageView, Point, Q, TagGenerator, error, fs, panel, path, _ref;

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, Point = _ref.Point;

  Q = require('q');

  path = require('path');

  fs = null;

  module.exports = TagGenerator = (function() {
    function TagGenerator(path, scopeName, cmdArgs) {
      this.path = path;
      this.scopeName = scopeName;
      this.cmdArgs = cmdArgs;
    }

    TagGenerator.prototype.parseTagLine = function(line) {
      var end, file, idx, matches, name, pattern, patternStr, row, sections, start, _ref1;
      matches = line.match(/\t\/\^(.*)\$\/;"/);
      if (!matches) {
        matches = line.match(/\t\/\^(.*)\/;"/);
      }
      if (!matches) {
        return;
      }
      pattern = matches[1];
      patternStr = matches[0];
      idx = line.indexOf(patternStr);
      start = line.substr(0, idx);
      end = line.substr(idx + patternStr.length);
      row = 0;
      row = (_ref1 = end.match(/line:(\d+)/)) != null ? _ref1[1] : void 0;
      --row;
      sections = start.split(/\t+/);
      file = sections.pop();
      name = sections.join("\t");
      if (!name) {
        return;
      }
      return {
        file: file,
        position: new Point(row, pattern.indexOf(name)),
        pattern: pattern,
        name: name
      };
    };

    TagGenerator.prototype.getLanguage = function() {
      var _ref1;
      if ((_ref1 = path.extname(this.path)) === '.cson' || _ref1 === '.gyp') {
        return 'Cson';
      }
      switch (this.scopeName) {
        case 'source.c++':
          return 'C++';
        case 'source.objc++':
          return 'C++';
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
      }
    };

    TagGenerator.prototype.read = function() {
      var deferred, tags;
      deferred = Q.defer();
      tags = [];
      if (!fs) {
        fs = require("fs");
      }
      fs.readFile(this.path, 'utf-8', (function(_this) {
        return function(err, lines) {
          var line, tag, _i, _len;
          if (!err) {
            lines = lines.replace(/\\\\/g, "\\");
            lines = lines.replace(/\\\//g, "/");
            lines = lines.split('\n');
            if (lines[lines.length - 1] === "") {
              lines.pop();
            }
            err = [];
            for (_i = 0, _len = lines.length; _i < _len; _i++) {
              line = lines[_i];
              if (line.indexOf('!_TAG_') === 0) {
                continue;
              }
              tag = _this.parseTagLine(line);
              if (tag) {
                tags.push(tag);
              } else {
                err.push("failed to parseTagLine: @" + line + "@");
              }
            }
            if (err.length > 0) {
              error(("please create a new issue:<br> path: " + _this.path + " <br>") + err.join("<br>"));
            }
          } else {
            error(err);
          }
          return deferred.resolve(tags);
        };
      })(this));
      return deferred.promise;
    };

    TagGenerator.prototype.generate = function() {
      var args, childProcess, command, defaultCtagsFile, deferred, exit, stderr, stdout, t, tags, timeout;
      deferred = Q.defer();
      tags = [];
      command = atom.config.get("atom-ctags.cmd").trim();
      if (command === "") {
        command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
      }
      defaultCtagsFile = require.resolve('./.ctags');
      args = [];
      if (this.cmdArgs) {
        args.push.apply(args, this.cmdArgs);
      }
      args.push("--options=" + defaultCtagsFile, '--fields=+KSn', '--excmd=p');
      args.push('-R', '-f', '-', this.path);
      stdout = (function(_this) {
        return function(lines) {
          var err, line, tag, _i, _len;
          lines = lines.replace(/\\\\/g, "\\");
          lines = lines.replace(/\\\//g, "/");
          lines = lines.split('\n');
          if (lines[lines.length - 1] === "") {
            lines.pop();
          }
          err = [];
          for (_i = 0, _len = lines.length; _i < _len; _i++) {
            line = lines[_i];
            tag = _this.parseTagLine(line);
            if (tag) {
              tags.push(tag);
            } else {
              line = JSON.stringify(line);
              err.push("failed to parseTagLine: @" + line + "@");
            }
          }
          if (err.length > 0) {
            return error(("please create a new issue:<br> command: @" + command + " " + (args.join(' ')) + "@") + err.join("<br>"));
          }
        };
      })(this);
      stderr = function(lines) {
        lines = JSON.stringify(lines);
        return console.warn("command: @" + command + " " + (args.join(' ')) + "@\nerr: @" + lines + "@");
      };
      exit = function() {
        clearTimeout(t);
        return deferred.resolve(tags);
      };
      childProcess = new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      timeout = atom.config.get('atom-ctags.buildTimeout');
      t = setTimeout((function(_this) {
        return function() {
          childProcess.kill();
          return error("Stopped: Build more than " + (timeout / 1000) + " seconds, check if " + _this.path + " contain too many file.<br>\n        Suggest that add CmdArgs at atom-ctags package setting, example:<br>\n            --exclude=some/path --exclude=some/other");
        };
      })(this), timeout);
      return deferred.promise;
    };

    return TagGenerator;

  })();

  PlainMessageView = null;

  panel = null;

  error = function(message, className) {
    var MessagePanelView, _ref1;
    if (!panel) {
      _ref1 = require("atom-message-panel"), MessagePanelView = _ref1.MessagePanelView, PlainMessageView = _ref1.PlainMessageView;
      panel = new MessagePanelView({
        title: "Atom Ctags"
      });
    }
    panel.attach();
    return panel.add(new PlainMessageView({
      message: message,
      className: className || "text-error",
      raw: true
    }));
  };

}).call(this);
