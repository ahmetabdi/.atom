(function() {
  var CommandRunner, ERROR_PATTERN, Gc, Point, Range, Violation, fs, path, _ref,
    __slice = [].slice;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  CommandRunner = require('../command-runner');

  Violation = require('../violation');

  path = require('path');

  fs = require('fs');

  ERROR_PATTERN = /^\/+([^:]+):(\d+)(:(\d+))?: (.*)$/;

  module.exports = Gc = (function() {
    Gc.canonicalName = 'gc';

    Gc._cachedEnv = void 0;

    Gc.getEnv = function(callback) {
      var runner;
      if (this._cachedEnv !== void 0) {
        callback(null, this._cachedEnv);
      }
      runner = new CommandRunner(['go', 'env', 'GOARCH', 'GOOS', 'GOPATH', 'GOCHAR']);
      return runner.run((function(_this) {
        return function(error, result) {
          var GOARCH, GOCHAR, GOOS, GOPATH, _ref1;
          if (error != null) {
            return callback(error);
          }
          _ref1 = result.stdout.split('\n'), GOARCH = _ref1[0], GOOS = _ref1[1], GOPATH = _ref1[2], GOCHAR = _ref1[3];
          _this._cachedEnv = {
            'GOARCH': GOARCH,
            'GOOS': GOOS,
            'GOPATH': GOPATH,
            'GOCHAR': GOCHAR
          };
          return callback(null, _this._cachedEnv);
        };
      })(this));
    };

    function Gc(filePath) {
      this.filePath = filePath;
    }

    Gc.prototype.run = function(callback) {
      return Gc.getEnv((function(_this) {
        return function(error, env) {
          if (error != null) {
            return callback(error);
          }
          return _this.runGoLint(env, function(error, violations) {
            if (error != null) {
              return callback(error);
            } else {
              return callback(null, violations);
            }
          });
        };
      })(this));
    };

    Gc.prototype.runGoLint = function(env, callback) {
      var runner;
      runner = new CommandRunner(this.buildCommand(env));
      return runner.run((function(_this) {
        return function(error, result) {
          var bufferPoint, bufferRange, col, filePath, item, items, line, matches, msg, skippingIndented, violations, _, _i, _len;
          if (error != null) {
            return callback(error);
          }
          violations = [];
          items = result.stdout.split('\n');
          skippingIndented = false;
          for (_i = 0, _len = items.length; _i < _len; _i++) {
            item = items[_i];
            if (!item) {
              continue;
            }
            if (item[0] === '\t' && violations.length > 0) {
              if (!skippingIndented) {
                violations[violations.length - 1].message += '\n' + item;
              }
            } else {
              matches = item.match(ERROR_PATTERN);
              if (!matches) {
                continue;
              }
              _ = matches[0], filePath = matches[1], line = matches[2], _ = matches[3], col = matches[4], msg = matches[5];
              filePath = '/' + filePath;
              if (filePath !== _this.filePath) {
                skippingIndented = true;
                continue;
              }
              skippingIndented = false;
              line || (line = '1');
              col || (col = '1');
              bufferPoint = new Point(parseInt(line) - 1, parseInt(col) - 1);
              bufferRange = new Range(bufferPoint, bufferPoint);
              violations.push(new Violation('error', bufferRange, msg));
            }
          }
          return callback(null, violations);
        };
      })(this));
    };

    Gc.prototype.buildCommand = function(env) {
      var files, here, importSearchPath;
      here = path.dirname(this.filePath);
      files = fs.readdirSync(here).filter(function(file) {
        return path.extname(file) === '.go';
      }).map(function(file) {
        return path.join(here, file);
      });
      importSearchPath = "" + env.GOPATH + "/pkg/" + env.GOOS + "_" + env.GOARCH;
      return [atom.config.get('atom-lint.gc.path') || 'go', "tool", env.GOCHAR + 'g', "-L", "-e", "-s", "-o", "/dev/null", "-I", importSearchPath].concat(__slice.call(files));
    };

    return Gc;

  })();

}).call(this);
