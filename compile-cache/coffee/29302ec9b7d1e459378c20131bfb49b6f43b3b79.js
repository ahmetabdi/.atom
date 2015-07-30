(function() {
  var $, EditorView, Q, SymbolGenView, View, fs, path, spawn, swapFile, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, EditorView = _ref.EditorView, View = _ref.View;

  path = require('path');

  fs = require('fs');

  Q = require('q');

  spawn = require('child_process').spawn;

  swapFile = '.tags_swap';

  module.exports = SymbolGenView = (function(_super) {
    __extends(SymbolGenView, _super);

    function SymbolGenView() {
      return SymbolGenView.__super__.constructor.apply(this, arguments);
    }

    SymbolGenView.content = function() {
      return this.div({
        "class": 'symbol-gen overlay from-top mini'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'message',
            outlet: 'message'
          });
        };
      })(this));
    };

    SymbolGenView.prototype.initialize = function(serializeState) {
      return atom.workspaceView.command("symbol-gen:generate", (function(_this) {
        return function() {
          return _this.generate();
        };
      })(this));
    };

    SymbolGenView.prototype.serialize = function() {};

    SymbolGenView.prototype.destroy = function() {
      return this.detach();
    };

    SymbolGenView.prototype.generate = function() {
      var args, command, ctags, defaultCtagsFile, deferred, projectPath, swapFilePath, tagsFilePath;
      if (this.hasParent()) {
        return this.detach();
      } else {
        deferred = Q.defer();
        atom.workspaceView.append(this);
        this.message.text('Generating Symbols\u2026');
        projectPath = atom.project.getPath();
        swapFilePath = path.resolve(projectPath, swapFile);
        tagsFilePath = path.resolve(projectPath, 'tags');
        command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
        defaultCtagsFile = require.resolve('./.ctags');
        args = ["--options=" + defaultCtagsFile, '-R', "-f" + swapFilePath];
        ctags = spawn(command, args, {
          cwd: projectPath
        });
        ctags.stdout.on('data', function(data) {
          return console.log('stdout ' + data);
        });
        ctags.stderr.on('data', function(data) {
          return console.log('stderr ' + data);
        });
        ctags.on('close', (function(_this) {
          return function(data) {
            console.log('Ctags process finished.  Tags swap file created.');
            return fs.rename(swapFilePath, tagsFilePath, function(err) {
              if (err) {
                console.log('Error swapping file: ', err);
              }
              console.log('Tags file swapped.  Generation complete.');
              _this.detach();
              return deferred.resolve();
            });
          };
        })(this));
        return deferred.promise;
      }
    };

    return SymbolGenView;

  })(View);

}).call(this);
