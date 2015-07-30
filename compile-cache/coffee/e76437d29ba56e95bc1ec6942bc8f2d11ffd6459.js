(function() {
  var $, $$, Emitter, ScrollView, TreeNode, TreeView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, $$ = _ref.$$, View = _ref.View, ScrollView = _ref.ScrollView;

  Emitter = require('event-kit').Emitter;

  module.exports = {
    TreeNode: TreeNode = (function(_super) {
      __extends(TreeNode, _super);

      function TreeNode() {
        this.dblClickItem = __bind(this.dblClickItem, this);
        this.clickItem = __bind(this.clickItem, this);
        return TreeNode.__super__.constructor.apply(this, arguments);
      }

      TreeNode.content = function(_arg) {
        var children, icon, label;
        label = _arg.label, icon = _arg.icon, children = _arg.children;
        if (children) {
          return this.li({
            "class": 'list-nested-item list-selectable-item'
          }, (function(_this) {
            return function() {
              _this.div({
                "class": 'list-item'
              }, function() {
                return _this.span({
                  "class": "icon " + icon
                }, label);
              });
              return _this.ul({
                "class": 'list-tree'
              }, function() {
                var child, _i, _len, _results;
                _results = [];
                for (_i = 0, _len = children.length; _i < _len; _i++) {
                  child = children[_i];
                  _results.push(_this.subview('child', new TreeNode(child)));
                }
                return _results;
              });
            };
          })(this));
        } else {
          return this.li({
            "class": 'list-item list-selectable-item'
          }, (function(_this) {
            return function() {
              return _this.span({
                "class": "icon " + icon
              }, label);
            };
          })(this));
        }
      };

      TreeNode.prototype.initialize = function(item) {
        this.emitter = new Emitter;
        this.item = item;
        this.item.view = this;
        this.on('dblclick', this.dblClickItem);
        return this.on('click', this.clickItem);
      };

      TreeNode.prototype.setCollapsed = function() {
        if (this.item.children) {
          return this.toggleClass('collapsed');
        }
      };

      TreeNode.prototype.setSelected = function() {
        return this.addClass('selected');
      };

      TreeNode.prototype.onDblClick = function(callback) {
        var child, _i, _len, _ref1, _results;
        this.emitter.on('on-dbl-click', callback);
        if (this.item.children) {
          _ref1 = this.item.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            _results.push(child.view.onDblClick(callback));
          }
          return _results;
        }
      };

      TreeNode.prototype.onSelect = function(callback) {
        var child, _i, _len, _ref1, _results;
        this.emitter.on('on-select', callback);
        if (this.item.children) {
          _ref1 = this.item.children;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            child = _ref1[_i];
            _results.push(child.view.onSelect(callback));
          }
          return _results;
        }
      };

      TreeNode.prototype.clickItem = function(event) {
        var $target, left, right, selected, width;
        if (this.item.children) {
          selected = this.hasClass('selected');
          this.removeClass('selected');
          $target = this.find('.list-item:first');
          left = $target.position().left;
          right = $target.children('span').position().left;
          width = right - left;
          if (event.offsetX <= width) {
            this.toggleClass('collapsed');
          }
          if (selected) {
            this.addClass('selected');
          }
          if (event.offsetX <= width) {
            return false;
          }
        }
        this.emitter.emit('on-select', {
          node: this,
          item: this.item
        });
        return false;
      };

      TreeNode.prototype.dblClickItem = function(event) {
        this.emitter.emit('on-dbl-click', {
          node: this,
          item: this.item
        });
        return false;
      };

      return TreeNode;

    })(View),
    TreeView: TreeView = (function(_super) {
      __extends(TreeView, _super);

      function TreeView() {
        this.onSelect = __bind(this.onSelect, this);
        return TreeView.__super__.constructor.apply(this, arguments);
      }

      TreeView.content = function() {
        return this.div({
          "class": '-tree-view-'
        }, (function(_this) {
          return function() {
            return _this.ul({
              "class": 'list-tree has-collapsable-children',
              outlet: 'root'
            });
          };
        })(this));
      };

      TreeView.prototype.initialize = function() {
        TreeView.__super__.initialize.apply(this, arguments);
        return this.emitter = new Emitter;
      };

      TreeView.prototype.deactivate = function() {
        return this.remove();
      };

      TreeView.prototype.onSelect = function(callback) {
        return this.emitter.on('on-select', callback);
      };

      TreeView.prototype.setRoot = function(root, ignoreRoot) {
        var rootNode;
        if (ignoreRoot == null) {
          ignoreRoot = true;
        }
        rootNode = new TreeNode(root);
        rootNode.onDblClick((function(_this) {
          return function(_arg) {
            var item, node;
            node = _arg.node, item = _arg.item;
            return node.setCollapsed();
          };
        })(this));
        rootNode.onSelect((function(_this) {
          return function(_arg) {
            var item, node;
            node = _arg.node, item = _arg.item;
            _this.clearSelect();
            node.setSelected();
            return _this.emitter.emit('on-select', {
              node: node,
              item: item
            });
          };
        })(this));
        this.root.empty();
        return this.root.append($$(function() {
          return this.div((function(_this) {
            return function() {
              var child, _i, _len, _ref1, _results;
              if (ignoreRoot) {
                _ref1 = root.children;
                _results = [];
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  child = _ref1[_i];
                  _results.push(_this.subview('child', child.view));
                }
                return _results;
              } else {
                return _this.subview('root', rootNode);
              }
            };
          })(this));
        }));
      };

      TreeView.prototype.clearSelect = function() {
        return $('.list-selectable-item').removeClass('selected');
      };

      TreeView.prototype.select = function(item) {
        this.clearSelect();
        return item != null ? item.view.setSelected() : void 0;
      };

      return TreeView;

    })(ScrollView)
  };

}).call(this);
