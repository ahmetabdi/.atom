(function() {
  var $$, GotoView, SelectListView, fs, path, utils, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  fs = require('fs');

  _ref = require('atom'), $$ = _ref.$$, SelectListView = _ref.SelectListView;

  utils = require('./symbol-utils');

  module.exports = GotoView = (function(_super) {
    __extends(GotoView, _super);

    function GotoView() {
      return GotoView.__super__.constructor.apply(this, arguments);
    }

    GotoView.prototype.initialize = function() {
      GotoView.__super__.initialize.apply(this, arguments);
      this.addClass('goto-view overlay from-top');
      this.currentView = null;
      return this.cancelPosition = null;
    };

    GotoView.prototype.destroy = function() {
      this.cancel();
      return this.detach();
    };

    GotoView.prototype.cancel = function() {
      GotoView.__super__.cancel.apply(this, arguments);
      this.restoreCancelPosition();
      this.currentView = null;
      return this.cancelPosition = null;
    };

    GotoView.prototype.attach = function() {
      this.storeFocusedElement();
      atom.workspaceView.appendToTop(this);
      return this.focusFilterEditor();
    };

    GotoView.prototype.populate = function(symbols, view) {
      this.rememberCancelPosition(view);
      this.setItems(symbols);
      return this.attach();
    };

    GotoView.prototype.rememberCancelPosition = function(view) {
      if (!view || !atom.config.get('goto.autoScroll')) {
        return;
      }
      this.currentView = view;
      return this.cancelPosition = {
        top: view.scrollTop(),
        selections: view.getEditor().getSelectedBufferRanges()
      };
    };

    GotoView.prototype.restoreCancelPosition = function() {
      if (this.currentView && this.cancelPosition) {
        this.currentView.getEditor().setSelectedBufferRanges(this.cancelPosition.selections);
        return this.currentView.scrollTop(this.cancelPosition.top);
      }
    };

    GotoView.prototype.forgetCancelPosition = function() {
      this.currentView = null;
      return this.cancelPosition = null;
    };

    GotoView.prototype.getFilterKey = function() {
      return 'name';
    };

    GotoView.prototype.scrollToItemView = function(view) {
      var symbol;
      GotoView.__super__.scrollToItemView.apply(this, arguments);
      symbol = this.getSelectedItem();
      return this.onItemSelected(view, symbol);
    };

    GotoView.prototype.onItemSelected = function(view, symbol) {
      var editor;
      if (this.currentView) {
        editor = this.currentView.getEditor();
        this.currentView.scrollToBufferPosition(symbol.position, {
          center: true
        });
        editor.setCursorBufferPosition(symbol.position);
        return editor.moveCursorToFirstCharacterOfLine();
      }
    };

    GotoView.prototype.viewForItem = function(symbol) {
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            var dir, text;
            _this.div(symbol.name, {
              "class": 'primary-line'
            });
            dir = path.basename(symbol.path);
            text = "" + dir + " " + (symbol.position.row + 1);
            return _this.div(text, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    GotoView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No symbols found';
      } else {
        return GotoView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    GotoView.prototype.confirmed = function(symbol) {
      this.forgetCancelPosition();
      if (!fs.existsSync(atom.project.resolve(symbol.path))) {
        this.setError('Selected file does not exist');
        return setTimeout(((function(_this) {
          return function() {
            return _this.setError();
          };
        })(this)), 2000);
      } else {
        this.cancel();
        return utils.gotoSymbol(symbol);
      }
    };

    return GotoView;

  })(SelectListView);

}).call(this);
