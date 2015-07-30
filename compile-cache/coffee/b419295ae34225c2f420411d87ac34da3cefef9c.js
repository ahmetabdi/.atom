(function() {
  var Point, TagParser;

  Point = require('atom').Point;

  module.exports = TagParser = (function() {
    function TagParser(tags, grammar) {
      this.tags = tags;
      this.grammar = grammar;
      if (this.grammar === 'source.c++' || this.grammar === 'source.c' || this.grammar === 'source.cpp') {
        this.splitSymbol = '::';
      } else {
        this.splitSymbol = '.';
      }
    }

    TagParser.prototype.splitParentTag = function(parentTag) {
      var index;
      index = parentTag.indexOf(':');
      return {
        type: parentTag.substr(0, index),
        parent: parentTag.substr(index + 1)
      };
    };

    TagParser.prototype.splitNameTag = function(nameTag) {
      var index;
      index = nameTag.lastIndexOf(this.splitSymbol);
      return nameTag.substr(index + this.splitSymbol.length);
    };

    TagParser.prototype.buildMissedParent = function(parents) {
      var i, name, now, parentTags, pre, type, _i, _len, _ref, _ref1, _results;
      parentTags = Object.keys(parents);
      parentTags.sort((function(_this) {
        return function(a, b) {
          var nameA, nameB, typeA, typeB, _ref, _ref1;
          _ref = _this.splitParentTag(a), typeA = _ref.typeA, nameA = _ref.parent;
          _ref1 = _this.splitParentTag(b), typeB = _ref1.typeB, nameB = _ref1.parent;
          return nameA > nameB;
        };
      })(this));
      _results = [];
      for (i = _i = 0, _len = parentTags.length; _i < _len; i = ++_i) {
        now = parentTags[i];
        _ref = this.splitParentTag(now), type = _ref.type, name = _ref.parent;
        if (parents[now] === null) {
          parents[now] = {
            name: name,
            type: type,
            position: null,
            parent: null
          };
          this.tags.push(parents[now]);
        }
        if (i >= 1) {
          pre = parentTags[i - 1];
          _ref1 = this.splitParentTag(pre), type = _ref1.type, name = _ref1.parent;
          if (now.indexOf(name) >= 0) {
            parents[now].parent = pre;
            _results.push(parents[now].name = this.splitNameTag(parents[now].name));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    TagParser.prototype.parse = function() {
      var key, parent, parents, roots, tag, type, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4;
      roots = [];
      parents = {};
      this.tags.sort((function(_this) {
        return function(a, b) {
          return a.position.row - b.position.row;
        };
      })(this));
      _ref = this.tags;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        tag = _ref[_i];
        if (tag.parent) {
          parents[tag.parent] = null;
        }
      }
      _ref1 = this.tags;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        tag = _ref1[_j];
        if (tag.parent) {
          _ref2 = this.splitParentTag(tag.parent), type = _ref2.type, parent = _ref2.parent;
          key = tag.type + ':' + parent + this.splitSymbol + tag.name;
        } else {
          key = tag.type + ':' + tag.name;
        }
        if (key in parents) {
          parents[key] = tag;
        }
      }
      this.buildMissedParent(parents);
      _ref3 = this.tags;
      for (_k = 0, _len2 = _ref3.length; _k < _len2; _k++) {
        tag = _ref3[_k];
        if (tag.parent) {
          parent = parents[tag.parent];
          if (!parent.position) {
            parent.position = new Point(tag.position.row - 1);
          }
        }
      }
      this.tags.sort((function(_this) {
        return function(a, b) {
          return a.position.row - b.position.row;
        };
      })(this));
      _ref4 = this.tags;
      for (_l = 0, _len3 = _ref4.length; _l < _len3; _l++) {
        tag = _ref4[_l];
        tag.label = tag.name;
        tag.icon = "icon-" + tag.type;
        if (tag.parent) {
          parent = parents[tag.parent];
          if (parent.children == null) {
            parent.children = [];
          }
          parent.children.push(tag);
        } else {
          roots.push(tag);
        }
      }
      return {
        label: 'root',
        icon: null,
        children: roots
      };
    };

    TagParser.prototype.getNearestTag = function(row) {
      var left, mid, midRow, nearest, right;
      left = 0;
      right = this.tags.length - 1;
      while (left <= right) {
        mid = Math.floor((left + right) / 2);
        midRow = this.tags[mid].position.row;
        if (row < midRow) {
          right = mid - 1;
        } else {
          left = mid + 1;
        }
      }
      nearest = left - 1;
      return this.tags[nearest];
    };

    return TagParser;

  })();

}).call(this);
