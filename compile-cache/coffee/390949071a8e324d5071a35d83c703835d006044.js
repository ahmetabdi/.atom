(function() {
  var disableFocusMethods, fs;

  fs = require('fs');

  module.exports.runSpecSuite = function(specSuite, logFile, logErrors) {
    var $, $$, AtomReporter, TerminalReporter, TimeReporter, jasmineEnv, key, log, logStream, reporter, timeReporter, value, _ref, _ref1;
    if (logErrors == null) {
      logErrors = true;
    }
    _ref = require('../src/space-pen-extensions'), $ = _ref.$, $$ = _ref.$$;
    _ref1 = require('../vendor/jasmine');
    for (key in _ref1) {
      value = _ref1[key];
      window[key] = value;
    }
    TerminalReporter = require('jasmine-tagged').TerminalReporter;
    if (process.env.JANKY_SHA1) {
      disableFocusMethods();
    }
    TimeReporter = require('./time-reporter');
    timeReporter = new TimeReporter();
    if (logFile != null) {
      logStream = fs.openSync(logFile, 'w');
    }
    log = function(str) {
      if (logStream != null) {
        return fs.writeSync(logStream, str);
      } else {
        return process.stderr.write(str);
      }
    };
    if (atom.getLoadSettings().exitWhenDone) {
      reporter = new TerminalReporter({
        print: function(str) {
          return log(str);
        },
        onComplete: function(runner) {
          var grim, _ref2;
          if (logStream != null) {
            fs.closeSync(logStream);
          }
          if (process.env.JANKY_SHA1) {
            grim = require('grim');
            if (grim.getDeprecationsLength() > 0) {
              grim.logDeprecations();
            }
          }
          return atom.exit((_ref2 = runner.results().failedCount > 0) != null ? _ref2 : {
            1: 0
          });
        }
      });
    } else {
      AtomReporter = require('./atom-reporter');
      reporter = new AtomReporter();
    }
    require(specSuite);
    jasmineEnv = jasmine.getEnv();
    jasmineEnv.addReporter(reporter);
    jasmineEnv.addReporter(timeReporter);
    jasmineEnv.setIncludedTags([process.platform]);
    $('body').append($$(function() {
      return this.div({
        id: 'jasmine-content'
      });
    }));
    return jasmineEnv.execute();
  };

  disableFocusMethods = function() {
    return ['fdescribe', 'ffdescribe', 'fffdescribe', 'fit', 'ffit', 'fffit'].forEach(function(methodName) {
      var focusMethod;
      focusMethod = window[methodName];
      return window[methodName] = function(description) {
        var error;
        error = new Error('Focused spec is running on CI');
        return focusMethod(description, function() {
          throw error;
        });
      };
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFPLENBQUMsWUFBZixHQUE4QixTQUFDLFNBQUQsRUFBWSxPQUFaLEVBQXFCLFNBQXJCLEdBQUE7QUFDNUIsUUFBQSxnSUFBQTs7TUFEaUQsWUFBVTtLQUMzRDtBQUFBLElBQUEsT0FBVSxPQUFBLENBQVEsNkJBQVIsQ0FBVixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFBSixDQUFBO0FBRUE7QUFBQSxTQUFBLFlBQUE7eUJBQUE7QUFBQSxNQUFBLE1BQU8sQ0FBQSxHQUFBLENBQVAsR0FBYyxLQUFkLENBQUE7QUFBQSxLQUZBO0FBQUEsSUFJQyxtQkFBb0IsT0FBQSxDQUFRLGdCQUFSLEVBQXBCLGdCQUpELENBQUE7QUFNQSxJQUFBLElBQXlCLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBckM7QUFBQSxNQUFBLG1CQUFBLENBQUEsQ0FBQSxDQUFBO0tBTkE7QUFBQSxJQVFBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FSZixDQUFBO0FBQUEsSUFTQSxZQUFBLEdBQW1CLElBQUEsWUFBQSxDQUFBLENBVG5CLENBQUE7QUFXQSxJQUFBLElBQXlDLGVBQXpDO0FBQUEsTUFBQSxTQUFBLEdBQVksRUFBRSxDQUFDLFFBQUgsQ0FBWSxPQUFaLEVBQXFCLEdBQXJCLENBQVosQ0FBQTtLQVhBO0FBQUEsSUFZQSxHQUFBLEdBQU0sU0FBQyxHQUFELEdBQUE7QUFDSixNQUFBLElBQUcsaUJBQUg7ZUFDRSxFQUFFLENBQUMsU0FBSCxDQUFhLFNBQWIsRUFBd0IsR0FBeEIsRUFERjtPQUFBLE1BQUE7ZUFHRSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/jasmine-helper.coffee