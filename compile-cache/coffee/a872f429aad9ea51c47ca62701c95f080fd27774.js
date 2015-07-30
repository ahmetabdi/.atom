(function() {
  var CompositeDisposable, Emitter, SuggestionList, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Emitter = _ref.Emitter, CompositeDisposable = _ref.CompositeDisposable;

  module.exports = SuggestionList = (function() {
    function SuggestionList() {
      this.destroyOverlay = __bind(this.destroyOverlay, this);
      this.hide = __bind(this.hide, this);
      this.show = __bind(this.show, this);
      this.cancel = __bind(this.cancel, this);
      this.selectPrevious = __bind(this.selectPrevious, this);
      this.selectNext = __bind(this.selectNext, this);
      this.confirm = __bind(this.confirm, this);
      this.confirmSelection = __bind(this.confirmSelection, this);
      this.active = false;
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-text-editor.autocomplete-active', {
        'autocomplete-plus:confirm': this.confirmSelection,
        'autocomplete-plus:select-next': this.selectNext,
        'autocomplete-plus:select-previous': this.selectPrevious,
        'autocomplete-plus:cancel': this.cancel
      }));
    }

    SuggestionList.prototype.addKeyboardInteraction = function() {
      var completionKey, keys, navigationKey, _ref1;
      this.removeKeyboardInteraction();
      keys = {
        'escape': 'autocomplete-plus:cancel'
      };
      completionKey = atom.config.get('autocomplete-plus.confirmCompletion') || '';
      navigationKey = atom.config.get('autocomplete-plus.navigateCompletions') || '';
      if (completionKey.indexOf('tab') > -1) {
        keys['tab'] = 'autocomplete-plus:confirm';
      }
      if (completionKey.indexOf('enter') > -1) {
        keys['enter'] = 'autocomplete-plus:confirm';
      }
      if (((_ref1 = this.items) != null ? _ref1.length : void 0) > 1 && navigationKey === 'up,down') {
        keys['up'] = 'autocomplete-plus:select-previous';
        keys['down'] = 'autocomplete-plus:select-next';
      } else {
        keys['ctrl-n'] = 'autocomplete-plus:select-next';
        keys['ctrl-p'] = 'autocomplete-plus:select-previous';
      }
      this.keymaps = atom.keymaps.add('atom-text-editor.autocomplete-active', {
        'atom-text-editor.autocomplete-active': keys
      });
      return this.subscriptions.add(this.keymaps);
    };

    SuggestionList.prototype.removeKeyboardInteraction = function() {
      var _ref1;
      if ((_ref1 = this.keymaps) != null) {
        _ref1.dispose();
      }
      return this.subscriptions.remove(this.keymaps);
    };

    SuggestionList.prototype.confirmSelection = function() {
      return this.emitter.emit('did-confirm-selection');
    };

    SuggestionList.prototype.onDidConfirmSelection = function(fn) {
      return this.emitter.on('did-confirm-selection', fn);
    };

    SuggestionList.prototype.confirm = function(match) {
      return this.emitter.emit('did-confirm', match);
    };

    SuggestionList.prototype.onDidConfirm = function(fn) {
      return this.emitter.on('did-confirm', fn);
    };

    SuggestionList.prototype.selectNext = function() {
      return this.emitter.emit('did-select-next');
    };

    SuggestionList.prototype.onDidSelectNext = function(fn) {
      return this.emitter.on('did-select-next', fn);
    };

    SuggestionList.prototype.selectPrevious = function() {
      return this.emitter.emit('did-select-previous');
    };

    SuggestionList.prototype.onDidSelectPrevious = function(fn) {
      return this.emitter.on('did-select-previous', fn);
    };

    SuggestionList.prototype.cancel = function() {
      return this.emitter.emit('did-cancel');
    };

    SuggestionList.prototype.onDidCancel = function(fn) {
      return this.emitter.on('did-cancel', fn);
    };

    SuggestionList.prototype.isActive = function() {
      return this.active;
    };

    SuggestionList.prototype.show = function(editor) {
      var cursor, marker, position, _ref1;
      if (this.active) {
        return;
      }
      if (editor == null) {
        return;
      }
      this.destroyOverlay();
      if (atom.config.get('autocomplete-plus.suggestionListFollows') === 'Cursor') {
        marker = (_ref1 = editor.getLastCursor()) != null ? _ref1.getMarker() : void 0;
        if (marker == null) {
          return;
        }
      } else {
        cursor = editor.getLastCursor();
        if (cursor == null) {
          return;
        }
        position = cursor.getBeginningOfCurrentWordBufferPosition();
        marker = this.suggestionMarker = editor.markBufferPosition(position);
      }
      this.overlayDecoration = editor.decorateMarker(marker, {
        type: 'overlay',
        item: this
      });
      this.addKeyboardInteraction();
      return this.active = true;
    };

    SuggestionList.prototype.hide = function() {
      if (!this.active) {
        return;
      }
      this.destroyOverlay();
      this.removeKeyboardInteraction();
      return this.active = false;
    };

    SuggestionList.prototype.destroyOverlay = function() {
      var _ref1;
      if (this.suggestionMarker != null) {
        this.suggestionMarker.destroy();
      } else {
        if ((_ref1 = this.overlayDecoration) != null) {
          _ref1.destroy();
        }
      }
      this.suggestionMarker = void 0;
      return this.overlayDecoration = void 0;
    };

    SuggestionList.prototype.changeItems = function(items) {
      this.items = items;
      return this.emitter.emit('did-change-items', items);
    };

    SuggestionList.prototype.onDidChangeItems = function(fn) {
      return this.emitter.on('did-change-items', fn);
    };

    SuggestionList.prototype.dispose = function() {
      this.subscriptions.dispose();
      this.emitter.emit('did-dispose');
      return this.emitter.dispose();
    };

    SuggestionList.prototype.onDidDispose = function(fn) {
      return this.emitter.on('did-dispose', fn);
    };

    return SuggestionList;

  })();

}).call(this);
