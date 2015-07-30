Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _AUDIO_MAP;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _atom = require('atom');

var _path = require('path');

var _memoizee = require('memoizee');

var _memoizee2 = _interopRequireDefault(_memoizee);

'use babel';

var KEYS = {
  DELETE: 8,
  ENTER: 13,
  SPACE: 32
};

var AUDIO_MAP = (_AUDIO_MAP = {}, _defineProperty(_AUDIO_MAP, KEYS.DELETE, 'delete_press.mp3'), _defineProperty(_AUDIO_MAP, KEYS.ENTER, 'spacebar_press.mp3'), _defineProperty(_AUDIO_MAP, KEYS.SPACE, 'spacebar_press.mp3'), _defineProperty(_AUDIO_MAP, 'DEFAULT', 'key_press.mp3'), _AUDIO_MAP);

var getAudio = (0, _memoizee2['default'])(function (name) {
  return new Audio((0, _path.join)(__dirname, '../audio', name));
}, { primitive: true });

function playAudio(name, volume) {
  var audio = getAudio(name);

  audio.currentTime = 0;
  audio.volume = volume;
  audio.play();
}

var _default = (function () {
  function _default(_ref) {
    var _ref$isActive = _ref.isActive;
    var isActive = _ref$isActive === undefined ? false : _ref$isActive;
    var _ref$volume = _ref.volume;
    var volume = _ref$volume === undefined ? 1 : _ref$volume;

    _classCallCheck(this, _default);

    this.subscriptions = new _atom.CompositeDisposable();
    this.isActive = isActive;
    this.volume = volume;

    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  _createClass(_default, [{
    key: 'activate',
    value: function activate() {
      var _this = this;

      this.subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
        var view = atom.views.getView(editor);
        view.addEventListener('keydown', _this.handleKeyDown);
      }));

      this.isActive = true;
    }
  }, {
    key: 'deactivate',
    value: function deactivate() {
      var _this2 = this;

      atom.workspace.getTextEditors().forEach(function (editor) {
        var view = atom.views.getView(editor);
        view.removeEventListener('keydown', _this2.handleKeyDown);
      });

      this.subscriptions.dispose();
      this.isActive = false;
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return { isActive: this.isActive, volume: this.volume };
    }
  }, {
    key: 'increaseVolume',
    value: function increaseVolume() {
      var by = arguments.length <= 0 || arguments[0] === undefined ? 0.1 : arguments[0];

      this.volume = Math.min(Math.max(this.volume + by, 0), 1);
    }
  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(_ref2) {
      var keyCode = _ref2.keyCode;

      playAudio(AUDIO_MAP[keyCode] || AUDIO_MAP.DEFAULT, this.volume);
    }
  }]);

  return _default;
})();

exports['default'] = _default;
;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1zb3VuZHMvbGliL2tleWJvYXJkLXNvdW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztvQkFFb0MsTUFBTTs7b0JBQ3JCLE1BQU07O3dCQUNQLFVBQVU7Ozs7QUFKOUIsV0FBVyxDQUFDOztBQU1aLElBQU0sSUFBSSxHQUFHO0FBQ1gsUUFBTSxFQUFFLENBQUM7QUFDVCxPQUFLLEVBQUcsRUFBRTtBQUNWLE9BQUssRUFBRyxFQUFFO0NBQ1gsQ0FBQzs7QUFFRixJQUFNLFNBQVMsaURBQ1osSUFBSSxDQUFDLE1BQU0sRUFBRyxrQkFBa0IsK0JBQ2hDLElBQUksQ0FBQyxLQUFLLEVBQUksb0JBQW9CLCtCQUNsQyxJQUFJLENBQUMsS0FBSyxFQUFJLG9CQUFvQiwwQ0FDcEIsZUFBZSxjQUMvQixDQUFDOztBQUVGLElBQUksUUFBUSxHQUFHLDJCQUFRLFVBQUEsSUFBSTtTQUFJLElBQUksS0FBSyxDQUFDLFVBaEJoQyxJQUFJLEVBZ0JpQyxTQUFTLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQUEsRUFDcEQsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzs7QUFFNUMsU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUMvQixNQUFJLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTNCLE9BQUssQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLE9BQUssQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3RCLE9BQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztDQUNkOzs7QUFHWSxvQkFBQyxJQUE0QixFQUFFO3dCQUE5QixJQUE0QixDQUExQixRQUFRO1FBQVIsUUFBUSxpQ0FBQyxLQUFLO3NCQUFoQixJQUE0QixDQUFWLE1BQU07UUFBTixNQUFNLCtCQUFDLENBQUM7Ozs7QUFDcEMsUUFBSSxDQUFDLGFBQWEsR0FBRyxVQTlCaEIsbUJBQW1CLEVBOEJzQixDQUFDO0FBQy9DLFFBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFFBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDOztBQUVyQixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BEOzs7O1dBRU8sb0JBQUc7OztBQUNULFVBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsa0JBQWtCLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDakUsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsWUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxNQUFLLGFBQWEsQ0FBQyxDQUFDO09BQ3RELENBQUMsQ0FBQyxDQUFDOztBQUVKLFVBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0tBQ3RCOzs7V0FFUyxzQkFBRzs7O0FBQ1gsVUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNLEVBQUk7QUFDaEQsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDdEMsWUFBSSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxPQUFLLGFBQWEsQ0FBQyxDQUFDO09BQ3pELENBQUMsQ0FBQzs7QUFFSCxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFVBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO0tBQ3ZCOzs7V0FFUSxxQkFBRztBQUNWLGFBQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ3pEOzs7V0FFYSwwQkFBUztVQUFSLEVBQUUseURBQUMsR0FBRzs7QUFDbkIsVUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDMUQ7OztXQUVZLHVCQUFDLEtBQVcsRUFBRTtVQUFYLE9BQU8sR0FBVCxLQUFXLENBQVQsT0FBTzs7QUFDckIsZUFBUyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNqRTs7Ozs7OztBQUNGLENBQUMiLCJmaWxlIjoiL1VzZXJzL2FobWV0Ly5hdG9tL3BhY2thZ2VzL2tleWJvYXJkLXNvdW5kcy9saWIva2V5Ym9hcmQtc291bmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcbmltcG9ydCB7IGpvaW4gfSBmcm9tICdwYXRoJztcbmltcG9ydCBtZW1vaXplIGZyb20gJ21lbW9pemVlJztcblxuY29uc3QgS0VZUyA9IHtcbiAgREVMRVRFOiA4LFxuICBFTlRFUiA6IDEzLFxuICBTUEFDRSA6IDMyXG59O1xuXG5jb25zdCBBVURJT19NQVAgPSB7XG4gIFtLRVlTLkRFTEVURV06ICdkZWxldGVfcHJlc3MubXAzJyxcbiAgW0tFWVMuRU5URVJdIDogJ3NwYWNlYmFyX3ByZXNzLm1wMycsXG4gIFtLRVlTLlNQQUNFXSA6ICdzcGFjZWJhcl9wcmVzcy5tcDMnLFxuICBERUZBVUxUICAgICAgOiAna2V5X3ByZXNzLm1wMydcbn07XG5cbmxldCBnZXRBdWRpbyA9IG1lbW9pemUobmFtZSA9PiBuZXcgQXVkaW8oam9pbihfX2Rpcm5hbWUsICcuLi9hdWRpbycsIG5hbWUpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgeyBwcmltaXRpdmU6IHRydWUgfSk7XG5cbmZ1bmN0aW9uIHBsYXlBdWRpbyhuYW1lLCB2b2x1bWUpIHtcbiAgbGV0IGF1ZGlvID0gZ2V0QXVkaW8obmFtZSk7XG5cbiAgYXVkaW8uY3VycmVudFRpbWUgPSAwO1xuICBhdWRpby52b2x1bWUgPSB2b2x1bWU7XG4gIGF1ZGlvLnBsYXkoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuICBjb25zdHJ1Y3Rvcih7IGlzQWN0aXZlPWZhbHNlLCB2b2x1bWU9MSB9KSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLmlzQWN0aXZlID0gaXNBY3RpdmU7XG4gICAgdGhpcy52b2x1bWUgPSB2b2x1bWU7XG5cbiAgICB0aGlzLmhhbmRsZUtleURvd24gPSB0aGlzLmhhbmRsZUtleURvd24uYmluZCh0aGlzKTtcbiAgfVxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKGVkaXRvciA9PiB7XG4gICAgICBsZXQgdmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICAgICAgdmlldy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlEb3duKTtcbiAgICB9KSk7XG5cbiAgICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKS5mb3JFYWNoKGVkaXRvciA9PiB7XG4gICAgICBsZXQgdmlldyA9IGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpO1xuICAgICAgdmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5oYW5kbGVLZXlEb3duKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7IGlzQWN0aXZlOiB0aGlzLmlzQWN0aXZlLCB2b2x1bWU6IHRoaXMudm9sdW1lIH07XG4gIH1cblxuICBpbmNyZWFzZVZvbHVtZShieT0wLjEpIHtcbiAgICB0aGlzLnZvbHVtZSA9IE1hdGgubWluKE1hdGgubWF4KHRoaXMudm9sdW1lICsgYnksIDApLCAxKTtcbiAgfVxuXG4gIGhhbmRsZUtleURvd24oeyBrZXlDb2RlIH0pIHtcbiAgICBwbGF5QXVkaW8oQVVESU9fTUFQW2tleUNvZGVdIHx8IEFVRElPX01BUC5ERUZBVUxULCB0aGlzLnZvbHVtZSk7XG4gIH1cbn07XG4iXX0=