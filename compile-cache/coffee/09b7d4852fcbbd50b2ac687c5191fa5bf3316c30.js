(function() {
  var KeySound, KeyboardListener, deleteKey, keyCode, otherKey, spaceBarKey;

  KeySound = require('./key-sound');

  keyCode = {
    DELETE: 8,
    SPACEBAR: 32
  };

  deleteKey = new KeySound('laptop_notebook_delete_key_press.mp3');

  spaceBarKey = new KeySound('laptop_notebook_spacebar_press.mp3');

  otherKey = new KeySound('laptop_notebook_return_or_enter_key_press.mp3');

  module.exports = KeyboardListener = (function() {
    function KeyboardListener(editorView) {
      this.editorView = editorView;
    }

    KeyboardListener.prototype.subscribe = function() {
      return this.editorView.on('keydown.mechanicalkeyboard', function(e) {
        var keySound;
        keySound = (function() {
          switch (e.which) {
            case keyCode.DELETE:
              return deleteKey;
            case keyCode.SPACEBAR:
              return spaceBarKey;
            default:
              return otherKey;
          }
        })();
        return keySound.play();
      });
    };

    KeyboardListener.prototype.unsubscribe = function() {
      return this.editorView.off('keydown.mechanicalkeyboard');
    };

    return KeyboardListener;

  })();

}).call(this);
