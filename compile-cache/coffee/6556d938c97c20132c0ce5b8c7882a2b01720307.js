(function() {
  var TimeReporter, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  module.exports = TimeReporter = (function(_super) {
    __extends(TimeReporter, _super);

    function TimeReporter() {
      window.timedSpecs = [];
      window.timedSuites = {};
      window.logLongestSpec = (function(_this) {
        return function() {
          return _this.logLongestSpecs(1);
        };
      })(this);
      window.logLongestSpecs = (function(_this) {
        return function(number) {
          return _this.logLongestSpecs(number);
        };
      })(this);
      window.logLongestSuite = (function(_this) {
        return function() {
          return _this.logLongestSuites(1);
        };
      })(this);
      window.logLongestSuites = (function(_this) {
        return function(number) {
          return _this.logLongestSuites(number);
        };
      })(this);
    }

    TimeReporter.prototype.logLongestSuites = function(number, log) {
      var suite, suites, time, _i, _len, _ref;
      if (number == null) {
        number = 10;
      }
      if (!(window.timedSuites.length > 0)) {
        return;
      }
      if (log == null) {
        log = function(line) {
          return console.log(line);
        };
      }
      log("Longest running suites:");
      suites = _.map(window.timedSuites, function(key, value) {
        return [value, key];
      });
      _ref = _.sortBy(suites, function(suite) {
        return -suite[1];
      }).slice(0, number);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        suite = _ref[_i];
        time = Math.round(suite[1] / 100) / 10;
        log("  " + suite[0] + " (" + time + "s)");
      }
      return void 0;
    };

    TimeReporter.prototype.logLongestSpecs = function(number, log) {
      var spec, time, _i, _len, _ref;
      if (number == null) {
        number = 10;
      }
      if (!(window.timedSpecs.length > 0)) {
        return;
      }
      if (log == null) {
        log = function(line) {
          return console.log(line);
        };
      }
      log("Longest running specs:");
      _ref = _.sortBy(window.timedSpecs, function(spec) {
        return -spec.time;
      }).slice(0, number);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        spec = _ref[_i];
        time = Math.round(spec.time / 100) / 10;
        log("" + spec.description + " (" + time + "s)");
      }
      return void 0;
    };

    TimeReporter.prototype.reportSpecStarting = function(spec) {
      var reducer, stack, suite;
      stack = [spec.description];
      suite = spec.suite;
      while (suite) {
        stack.unshift(suite.description);
        this.suite = suite.description;
        suite = suite.parentSuite;
      }
      reducer = function(memo, description, index) {
        if (index === 0) {
          return "" + description;
        } else {
          return "" + memo + "\n" + (_.multiplyString('  ', index)) + description;
        }
      };
      this.description = _.reduce(stack, reducer, '');
      return this.time = Date.now();
    };

    TimeReporter.prototype.reportSpecResults = function(spec) {
      var duration;
      if (!((this.time != null) && (this.description != null))) {
        return;
      }
      duration = Date.now() - this.time;
      if (duration > 0) {
        window.timedSpecs.push({
          description: this.description,
          time: duration,
          fullName: spec.getFullName()
        });
        if (timedSuites[this.suite]) {
          window.timedSuites[this.suite] += duration;
        } else {
          window.timedSuites[this.suite] = duration;
        }
      }
      this.time = null;
      return this.description = null;
    };

    return TimeReporter;

  })(jasmine.Reporter);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG1DQUFBLENBQUE7O0FBQWEsSUFBQSxzQkFBQSxHQUFBO0FBQ1gsTUFBQSxNQUFNLENBQUMsVUFBUCxHQUFvQixFQUFwQixDQUFBO0FBQUEsTUFDQSxNQUFNLENBQUMsV0FBUCxHQUFxQixFQURyQixDQUFBO0FBQUEsTUFHQSxNQUFNLENBQUMsY0FBUCxHQUF3QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxlQUFELENBQWlCLENBQWpCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUh4QixDQUFBO0FBQUEsTUFJQSxNQUFNLENBQUMsZUFBUCxHQUF5QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxNQUFELEdBQUE7aUJBQVksS0FBQyxDQUFBLGVBQUQsQ0FBaUIsTUFBakIsRUFBWjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBSnpCLENBQUE7QUFBQSxNQUtBLE1BQU0sQ0FBQyxlQUFQLEdBQXlCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQWtCLENBQWxCLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUx6QixDQUFBO0FBQUEsTUFNQSxNQUFNLENBQUMsZ0JBQVAsR0FBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUFZLEtBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/time-reporter.coffee