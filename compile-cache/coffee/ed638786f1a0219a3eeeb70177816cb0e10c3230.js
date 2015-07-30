(function() {
  var fs, path;

  fs = require('fs-plus');

  path = require('path');

  module.exports = {
    get: function() {
      var persistentCache;
      if (this.ephemeralCache != null) {
        return this.ephemeralCache;
      }
      persistentCache = this.loadPersistentCache();
      this.ephemeralCache = this.selectRicherEnv(persistentCache);
      this.savePersistentCache(this.ephemeralCache);
      return this.ephemeralCache;
    },
    clear: function() {
      this.clearEphemeralCache();
      return this.clearPersistentCache();
    },
    clearEphemeralCache: function() {
      return this.ephemeralCache = null;
    },
    clearPersistentCache: function() {
      var cacheFilePath;
      cacheFilePath = this.getPersistentCacheFilePath();
      if (fs.existsSync(cacheFilePath)) {
        return fs.unlinkSync(cacheFilePath);
      }
    },
    selectRicherEnv: function(cached) {
      var current, _ref, _ref1;
      current = process.env;
      if (current.SHLVL != null) {
        return current;
      }
      if (cached.SHLVL != null) {
        return cached;
      }
      if (this.getKeyCount(current) === this.getKeyCount(cached)) {
        if (((_ref = current.PATH) != null ? _ref.length : void 0) >= ((_ref1 = cached.PATH) != null ? _ref1.length : void 0)) {
          return current;
        } else {
          return cached;
        }
      } else if (this.getKeyCount(current) > this.getKeyCount(cached)) {
        return current;
      } else {
        return cached;
      }
    },
    loadPersistentCache: function() {
      var cacheFilePath, json;
      cacheFilePath = this.getPersistentCacheFilePath();
      if (fs.existsSync(cacheFilePath)) {
        json = fs.readFileSync(cacheFilePath);
        return JSON.parse(json);
      } else {
        return {};
      }
    },
    savePersistentCache: function(env) {
      var json;
      json = JSON.stringify(env);
      return fs.writeFileSync(this.getPersistentCacheFilePath(), json);
    },
    getPersistentCacheFilePath: function() {
      var dotAtomPath;
      dotAtomPath = fs.absolute('~/.atom');
      return path.join(dotAtomPath, 'storage', 'atom-lint-env.json');
    },
    getKeyCount: function(object) {
      return Object.keys(object).length;
    }
  };

}).call(this);
