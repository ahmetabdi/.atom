Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _keyboardSoundsJs = require('./keyboard-sounds.js');

var _keyboardSoundsJs2 = _interopRequireDefault(_keyboardSoundsJs);

var _atom = require('atom');

'use babel';

exports['default'] = {
  keyboardSounds: null,
  subscriptions: null,

  activate: function activate(state) {
    var _this = this;

    this.keyboardSounds = new _keyboardSoundsJs2['default'](state);
    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'keyboard-sounds:toggle': function keyboardSoundsToggle() {
        return _this.toggle();
      },
      'keyboard-sounds:volume-up': function keyboardSoundsVolumeUp() {
        return _this.increaseVolume();
      },
      'keyboard-sounds:volume-down': function keyboardSoundsVolumeDown() {
        return _this.increaseVolume(-0.2);
      }
    }));

    if (state.isActive || state.isActive === undefined) this.keyboardSounds.activate();
  },

  deactivate: function deactivate() {
    this.keyboardSounds.deactivate();
    this.subscriptions.dispose();
  },

  serialize: function serialize() {
    return this.keyboardSounds.serialize();
  },

  toggle: function toggle() {
    if (this.keyboardSounds.isActive) this.keyboardSounds.deactivate();else this.keyboardSounds.activate();
  },

  increaseVolume: function increaseVolume(by) {
    this.keyboardSounds.increaseVolume(by);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1zb3VuZHMvbGliL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztnQ0FFMkIsc0JBQXNCOzs7O29CQUNiLE1BQU07O0FBSDFDLFdBQVcsQ0FBQzs7cUJBS0c7QUFDYixnQkFBYyxFQUFFLElBQUk7QUFDcEIsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7OztBQUNkLFFBQUksQ0FBQyxjQUFjLEdBQUcsa0NBQW1CLEtBQUssQ0FBQyxDQUFDO0FBQ2hELFFBQUksQ0FBQyxhQUFhLEdBQUcsVUFSaEIsbUJBQW1CLEVBUXNCLENBQUM7O0FBRS9DLFFBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ3pELDhCQUF3QixFQUFFO2VBQU0sTUFBSyxNQUFNLEVBQUU7T0FBQTtBQUM3QyxpQ0FBMkIsRUFBRTtlQUFNLE1BQUssY0FBYyxFQUFFO09BQUE7QUFDeEQsbUNBQTZCLEVBQUU7ZUFBTSxNQUFLLGNBQWMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztPQUFBO0tBQy9ELENBQUMsQ0FBQyxDQUFDOztBQUVKLFFBQUksS0FBSyxDQUFDLFFBQVEsSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsRUFDaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUNsQzs7QUFFRCxZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2pDLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDOUI7O0FBRUQsV0FBUyxFQUFBLHFCQUFHO0FBQ1YsV0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDO0dBQ3hDOztBQUVELFFBQU0sRUFBQSxrQkFBRztBQUNQLFFBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQzlCLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLENBQUMsS0FFakMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztHQUNsQzs7QUFFRCxnQkFBYyxFQUFBLHdCQUFDLEVBQUUsRUFBRTtBQUNqQixRQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQztHQUN4QztDQUNGIiwiZmlsZSI6Ii9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9rZXlib2FyZC1zb3VuZHMvbGliL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCBLZXlib2FyZFNvdW5kcyBmcm9tICcuL2tleWJvYXJkLXNvdW5kcy5qcyc7XG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAga2V5Ym9hcmRTb3VuZHM6IG51bGwsXG4gIHN1YnNjcmlwdGlvbnM6IG51bGwsXG5cbiAgYWN0aXZhdGUoc3RhdGUpIHtcbiAgICB0aGlzLmtleWJvYXJkU291bmRzID0gbmV3IEtleWJvYXJkU291bmRzKHN0YXRlKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAna2V5Ym9hcmQtc291bmRzOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKCksXG4gICAgICAna2V5Ym9hcmQtc291bmRzOnZvbHVtZS11cCc6ICgpID0+IHRoaXMuaW5jcmVhc2VWb2x1bWUoKSxcbiAgICAgICdrZXlib2FyZC1zb3VuZHM6dm9sdW1lLWRvd24nOiAoKSA9PiB0aGlzLmluY3JlYXNlVm9sdW1lKC0wLjIpXG4gICAgfSkpO1xuXG4gICAgaWYgKHN0YXRlLmlzQWN0aXZlIHx8IHN0YXRlLmlzQWN0aXZlID09PSB1bmRlZmluZWQpXG4gICAgICB0aGlzLmtleWJvYXJkU291bmRzLmFjdGl2YXRlKCk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLmtleWJvYXJkU291bmRzLmRlYWN0aXZhdGUoKTtcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9LFxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5rZXlib2FyZFNvdW5kcy5zZXJpYWxpemUoKTtcbiAgfSxcblxuICB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMua2V5Ym9hcmRTb3VuZHMuaXNBY3RpdmUpXG4gICAgICB0aGlzLmtleWJvYXJkU291bmRzLmRlYWN0aXZhdGUoKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLmtleWJvYXJkU291bmRzLmFjdGl2YXRlKCk7XG4gIH0sXG5cbiAgaW5jcmVhc2VWb2x1bWUoYnkpIHtcbiAgICB0aGlzLmtleWJvYXJkU291bmRzLmluY3JlYXNlVm9sdW1lKGJ5KTtcbiAgfVxufVxuIl19