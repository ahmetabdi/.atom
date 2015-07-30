(function() {
  var CelebrateView;

  module.exports = CelebrateView = (function() {
    function CelebrateView(serializeState) {
      var message;
      this.element = document.createElement('div');
      this.element.classList.add('celebrate');
      message = document.createElement('div');
      message.textContent = "The Celebrate package is Alive! It's ALIVE!";
      message.classList.add('message');
      this.element.appendChild(message);
    }

    CelebrateView.prototype.serialize = function() {};

    CelebrateView.prototype.destroy = function() {
      return this.element.remove();
    };

    CelebrateView.prototype.getElement = function() {
      return this.element;
    };

    return CelebrateView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGFBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ1MsSUFBQSx1QkFBQyxjQUFELEdBQUE7QUFFWCxVQUFBLE9BQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsS0FBdkIsQ0FBWCxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFuQixDQUF1QixXQUF2QixDQURBLENBQUE7QUFBQSxNQUlBLE9BQUEsR0FBVSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUpWLENBQUE7QUFBQSxNQUtBLE9BQU8sQ0FBQyxXQUFSLEdBQXNCLDZDQUx0QixDQUFBO0FBQUEsTUFNQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQWxCLENBQXNCLFNBQXRCLENBTkEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxXQUFULENBQXFCLE9BQXJCLENBUEEsQ0FGVztJQUFBLENBQWI7O0FBQUEsNEJBWUEsU0FBQSxHQUFXLFNBQUEsR0FBQSxDQVpYLENBQUE7O0FBQUEsNEJBZUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxPQUFPLENBQUMsTUFBVCxDQUFBLEVBRE87SUFBQSxDQWZULENBQUE7O0FBQUEsNEJBa0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsUUFEUztJQUFBLENBbEJaLENBQUE7O3lCQUFBOztNQUZGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/ahmet/Projects/celebrate/lib/celebrate-view.coffee