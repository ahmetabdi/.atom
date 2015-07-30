(function() {
  var $, DataAtomView, DataResultView, HeaderView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  DataResultView = require('./data-result-view');

  HeaderView = require('./header-view');

  module.exports = DataAtomView = (function(_super) {
    __extends(DataAtomView, _super);

    function DataAtomView() {
      this.resizeTreeView = __bind(this.resizeTreeView, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      return DataAtomView.__super__.constructor.apply(this, arguments);
    }

    DataAtomView.content = function() {
      return this.div({
        "class": 'data-atom tool-panel panel panel-bottom padding native-key-bindings'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'resize-handle'
          });
          return _this.subview('headerView', new HeaderView());
        };
      })(this));
    };

    DataAtomView.prototype.initialize = function(serializeState) {
      this.isShowing = false;
      return this.on('mousedown', '.resize-handle', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
    };

    DataAtomView.prototype.setResultView = function(resultView) {
      if (this.resultView) {
        this.resultView.detach();
      }
      this.resultView = resultView;
      return this.append(this.resultView);
    };

    DataAtomView.prototype.serialize = function() {};

    DataAtomView.prototype.destroy = function() {
      return this.detach();
    };

    DataAtomView.prototype.show = function() {
      if (!this.hasParent()) {
        return this.toggleView();
      }
    };

    DataAtomView.prototype.hide = function() {
      if (this.hasParent()) {
        return this.toggleView();
      }
    };

    DataAtomView.prototype.toggleView = function() {
      if (this.hasParent()) {
        this.detach();
        return this.isShowing = false;
      } else {
        atom.workspaceView.prependToBottom(this);
        if (this.resultView) {
          this.resultView.updateHeight(this.height() - this.headerView.height() - 20);
        }
        return this.isShowing = true;
      }
    };

    DataAtomView.prototype.resizeStarted = function() {
      $(document.body).on('mousemove', this.resizeTreeView);
      return $(document.body).on('mouseup', this.resizeStopped);
    };

    DataAtomView.prototype.resizeStopped = function() {
      $(document.body).off('mousemove', this.resizeTreeView);
      return $(document.body).off('mouseup', this.resizeStopped);
    };

    DataAtomView.prototype.resizeTreeView = function(_arg) {
      var height, pageY;
      pageY = _arg.pageY;
      height = $(document.body).height() - pageY;
      this.height(height);
      if (this.resultView) {
        this.resultView.updateHeight(this.height() - this.headerView.height() - 20);
      }
      return this.trigger('data-atom:result-view-height-changed');
    };

    DataAtomView.prototype.clear = function() {
      return this.resultView.clear();
    };

    DataAtomView.prototype.setMessage = function(message) {
      return this.resultView.setMessage(message);
    };

    DataAtomView.prototype.setResults = function(result) {
      return this.resultView.setResults(result);
    };

    return DataAtomView;

  })(View);

}).call(this);
