(function() {
  var Housekeeping, Mixin,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mixin = require('mixto');

  module.exports = Housekeeping = (function(_super) {
    __extends(Housekeeping, _super);

    function Housekeeping() {
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      return Housekeeping.__super__.constructor.apply(this, arguments);
    }

    Housekeeping.prototype.initializeHousekeeping = function() {
      this.subscribe(this.editorView, 'editor:path-changed', this.subscribeToBuffer);
      this.subscribe(atom.project.getRepo(), 'statuses-changed', (function(_this) {
        return function() {
          return _this.scheduleUpdate();
        };
      })(this));
      this.subscribe(atom.project.getRepo(), 'status-changed', (function(_this) {
        return function(path) {
          if (path === _this.editor.getPath()) {
            return _this.scheduleUpdate();
          }
        };
      })(this));
      this.subscribeToCommand(this.editorView, 'git-diff-details:toggle-git-diff-details', (function(_this) {
        return function() {
          return _this.toggleShowDiffDetails();
        };
      })(this));
      this.subscribeToCommand(this.editorView, 'git-diff-details:close-git-diff-details', (function(_this) {
        return function() {
          return _this.closeDiffDetails();
        };
      })(this));
      this.subscribe(this.editorView, 'editor:will-be-removed', (function(_this) {
        return function() {
          _this.cancelUpdate();
          _this.unsubscribe();
          return _this.unsubscribeFromBuffer();
        };
      })(this));
      this.subscribeToBuffer();
      return this.subscribeToCursor();
    };

    Housekeeping.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        this.scheduleUpdate();
        return this.buffer.on('contents-modified', this.notifyContentsModified);
      }
    };

    Housekeeping.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.removeDecorations();
        this.buffer.off('contents-modified', this.notifyContentsModified);
        return this.buffer = null;
      }
    };

    Housekeeping.prototype.subscribeToCursor = function() {
      var _ref, _ref1;
      if ((_ref = this.cursorSubscription) != null) {
        _ref.dispose();
      }
      return this.cursorSubscription = (_ref1 = this.getActiveTextEditor()) != null ? _ref1.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.notifyChangeCursorPosition();
        };
      })(this)) : void 0;
    };

    Housekeeping.prototype.unsubscribeFromCursor = function() {
      var _ref;
      if ((_ref = this.cursorSubscription) != null) {
        _ref.dispose();
      }
      return this.cursorSubscription = null;
    };

    Housekeeping.prototype.scheduleUpdate = function() {
      this.cancelUpdate();
      return this.immediateId = setImmediate(this.notifyContentsModified);
    };

    Housekeeping.prototype.cancelUpdate = function() {
      return clearImmediate(this.immediateId);
    };

    return Housekeeping;

  })(Mixin);

}).call(this);
