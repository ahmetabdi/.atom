(function() {
  var KeySound, NUM_BUFFERS, VENDOR_DIR;

  VENDOR_DIR = __dirname + '/../sounds';

  NUM_BUFFERS = 10;

  module.exports = KeySound = (function() {
    KeySound.prototype.index = 0;

    KeySound.prototype.buffers = null;

    function KeySound(fileName) {
      var i;
      i = 0;
      this.buffers = (function() {
        var _results;
        _results = [];
        while (i++ < NUM_BUFFERS) {
          _results.push(new Audio(VENDOR_DIR + '/' + fileName));
        }
        return _results;
      })();
    }

    KeySound.prototype.play = function() {
      return this.buffers[this.index++ % NUM_BUFFERS].play();
    };

    return KeySound;

  })();

}).call(this);
