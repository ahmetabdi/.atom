(function() {
  var TagGenerator, matchOpt;

  TagGenerator = null;

  matchOpt = {
    matchBase: true
  };

  module.exports = {
    activate: function() {
      this.cachedTags = {};
      return this.extraTags = {};
    },
    deactivate: function() {
      return this.cachedTags = null;
    },
    initExtraTags: function(paths) {
      var path, _i, _len, _results;
      this.extraTags = {};
      _results = [];
      for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        path = path.trim();
        if (!path) {
          continue;
        }
        _results.push(this.readTags(path));
      }
      return _results;
    },
    readTags: function(path) {
      if (!TagGenerator) {
        TagGenerator = require('./tag-generator');
      }
      return new TagGenerator(path).read().done((function(_this) {
        return function(tags) {
          var data, tag, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = tags.length; _i < _len; _i++) {
            tag = tags[_i];
            data = _this.extraTags[tag.file];
            if (!data) {
              data = [];
              _this.extraTags[tag.file] = data;
            }
            _results.push(data.push(tag));
          }
          return _results;
        };
      })(this));
    },
    findTags: function(prefix, options) {
      var tags;
      tags = [];
      if (this.findOf(this.cachedTags, tags, prefix, options)) {
        return tags;
      }
      if (this.findOf(this.extraTags, tags, prefix, options)) {
        return tags;
      }
      if (tags.length === 0) {
        console.warn("[atom-ctags:findTags] tags empty, did you RebuildTags or set extraTagFiles?");
      }
      return tags;
    },
    findOf: function(source, tags, prefix, options) {
      var key, tag, value, _i, _len;
      for (key in source) {
        value = source[key];
        for (_i = 0, _len = value.length; _i < _len; _i++) {
          tag = value[_i];
          if ((options != null ? options.partialMatch : void 0) && tag.name.indexOf(prefix) === 0) {
            tags.push(tag);
          } else if (tag.name === prefix) {
            tags.push(tag);
          }
          if ((options != null ? options.maxItems : void 0) && tags.length === options.maxItems) {
            return true;
          }
        }
      }
      return false;
    },
    generateTags: function(path, callback) {
      var cmdArgs, scopeName, startTime, _ref, _ref1;
      delete this.cachedTags[path];
      scopeName = (_ref = atom.workspace.getActiveEditor()) != null ? (_ref1 = _ref.getGrammar()) != null ? _ref1.scopeName : void 0 : void 0;
      if (!TagGenerator) {
        TagGenerator = require('./tag-generator');
      }
      startTime = Date.now();
      console.log("[atom-ctags:rebuild] start @" + path + "@ tags...");
      cmdArgs = atom.config.get("atom-ctags.cmdArgs");
      if (cmdArgs) {
        cmdArgs = cmdArgs.split(" ");
      }
      return new TagGenerator(path, scopeName, this.cmdArgs || cmdArgs).generate().done((function(_this) {
        return function(tags) {
          var data, tag, _i, _len;
          console.log("[atom-ctags:rebuild] command done @" + path + "@ tags. cost: " + (Date.now() - startTime) + "ms");
          startTime = Date.now();
          for (_i = 0, _len = tags.length; _i < _len; _i++) {
            tag = tags[_i];
            data = _this.cachedTags[tag.file];
            if (!data) {
              data = [];
              _this.cachedTags[tag.file] = data;
            }
            data.push(tag);
          }
          console.log("[atom-ctags:rebuild] parse end @" + path + "@ tags. cost: " + (Date.now() - startTime) + "ms");
          return typeof callback === "function" ? callback(tags) : void 0;
        };
      })(this));
    },
    getOrCreateTags: function(filePath, callback) {
      var tags;
      tags = this.cachedTags[filePath];
      if (tags) {
        return typeof callback === "function" ? callback(tags) : void 0;
      }
      return this.generateTags(filePath, callback);
    }
  };

}).call(this);
