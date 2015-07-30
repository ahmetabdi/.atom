(function() {
  var Atom, runSpecSuite;

  require('../src/window');

  Atom = require('../src/atom');

  window.atom = Atom.loadOrCreate('spec');

  if (!atom.getLoadSettings().exitWhenDone) {
    atom.show();
  }

  window.atom = atom;

  runSpecSuite = require('../spec/jasmine-helper').runSpecSuite;

  atom.openDevTools();

  document.title = "Benchmark Suite";

  runSpecSuite('../benchmark/benchmark-suite', atom.getLoadSettings().logFile);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFRLGVBQVIsQ0FBQSxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxhQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxJQUFQLEdBQWMsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsTUFBbEIsQ0FGZCxDQUFBOztBQUdBLEVBQUEsSUFBQSxDQUFBLElBQXVCLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsWUFBMUM7QUFBQSxJQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxDQUFBO0dBSEE7O0FBQUEsRUFJQSxNQUFNLENBQUMsSUFBUCxHQUFjLElBSmQsQ0FBQTs7QUFBQSxFQU1DLGVBQWdCLE9BQUEsQ0FBUSx3QkFBUixFQUFoQixZQU5ELENBQUE7O0FBQUEsRUFRQSxJQUFJLENBQUMsWUFBTCxDQUFBLENBUkEsQ0FBQTs7QUFBQSxFQVVBLFFBQVEsQ0FBQyxLQUFULEdBQWlCLGlCQVZqQixDQUFBOztBQUFBLEVBV0EsWUFBQSxDQUFhLDhCQUFiLEVBQTZDLElBQUksQ0FBQyxlQUFMLENBQUEsQ0FBc0IsQ0FBQyxPQUFwRSxDQVhBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/benchmark/benchmark-bootstrap.coffee