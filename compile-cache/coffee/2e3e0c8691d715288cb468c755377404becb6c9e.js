(function() {
  var Config, minimatch,
    __slice = [].slice;

  minimatch = require('minimatch');

  module.exports = Config = (function() {
    Config.ROOT_KEY = 'atom-lint';

    Config.getAbsoluteKeyPath = function() {
      var keys;
      keys = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      keys.unshift(this.ROOT_KEY);
      return keys.join('.');
    };

    Config.get = function(keyPath) {
      var absoluteKeyPath;
      absoluteKeyPath = this.getAbsoluteKeyPath(keyPath);
      return atom.config.get(absoluteKeyPath);
    };

    Config.set = function(keyPath, value) {
      var absoluteKeyPath;
      absoluteKeyPath = this.getAbsoluteKeyPath(keyPath);
      return atom.config.set(absoluteKeyPath, value);
    };

    Config.onDidChange = function() {
      var absoluteKeyPath, args, callback, keyPath;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      callback = args.pop();
      keyPath = args;
      absoluteKeyPath = this.getAbsoluteKeyPath.apply(this, keyPath);
      return atom.config.onDidChange(absoluteKeyPath, callback);
    };

    function Config(subKey) {
      this.subKey = subKey;
    }

    Config.prototype.get = function(keyPath) {
      var absoluteKeyPath;
      absoluteKeyPath = Config.getAbsoluteKeyPath(this.subKey, keyPath);
      return atom.config.get(absoluteKeyPath);
    };

    Config.prototype.isFileToLint = function(absolutePath) {
      var globalIgnoredNames, ignoredNames, linterIgnoredNames, relativePath;
      linterIgnoredNames = this.get('ignoredNames') || [];
      globalIgnoredNames = Config.get('ignoredNames') || [];
      ignoredNames = linterIgnoredNames.concat(globalIgnoredNames);
      relativePath = atom.project.relativize(absolutePath);
      return ignoredNames.every(function(ignoredName) {
        return !minimatch(relativePath, ignoredName);
      });
    };

    return Config;

  })();

}).call(this);
