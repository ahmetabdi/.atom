(function() {
  var FailureTree, coffeestack, path, sourceMaps, _,
    __slice = [].slice;

  path = require('path');

  _ = require('underscore');

  coffeestack = require('coffeestack');

  sourceMaps = {};

  module.exports = FailureTree = (function() {
    FailureTree.prototype.suites = null;

    function FailureTree() {
      this.suites = [];
    }

    FailureTree.prototype.isEmpty = function() {
      return this.suites.length === 0;
    };

    FailureTree.prototype.add = function(spec) {
      var failure, failurePath, item, parent, parentSuite, _base, _base1, _i, _j, _len, _len1, _name, _name1, _ref, _results;
      _ref = spec.results().items_;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (!(item.passed_ === false)) {
          continue;
        }
        failurePath = [];
        parent = spec.suite;
        while (parent) {
          failurePath.unshift(parent);
          parent = parent.parentSuite;
        }
        parentSuite = this;
        for (_j = 0, _len1 = failurePath.length; _j < _len1; _j++) {
          failure = failurePath[_j];
          if ((_base = parentSuite.suites)[_name = failure.id] == null) {
            _base[_name] = {
              spec: failure,
              suites: [],
              specs: []
            };
          }
          parentSuite = parentSuite.suites[failure.id];
        }
        if ((_base1 = parentSuite.specs)[_name1 = spec.id] == null) {
          _base1[_name1] = {
            spec: spec,
            failures: []
          };
        }
        parentSuite.specs[spec.id].failures.push(item);
        _results.push(this.filterStackTrace(item));
      }
      return _results;
    };

    FailureTree.prototype.filterJasmineLines = function(stackTraceLines) {
      var index, jasminePattern, _results;
      jasminePattern = /^\s*at\s+.*\(?.*[\\/]jasmine(-[^\\/]*)?\.js:\d+:\d+\)?\s*$/;
      index = 0;
      _results = [];
      while (index < stackTraceLines.length) {
        if (jasminePattern.test(stackTraceLines[index])) {
          _results.push(stackTraceLines.splice(index, 1));
        } else {
          _results.push(index++);
        }
      }
      return _results;
    };

    FailureTree.prototype.filterTrailingTimersLine = function(stackTraceLines) {
      if (/^(\s*at .* )\(timers\.js:\d+:\d+\)/.test(_.last(stackTraceLines))) {
        return stackTraceLines.pop();
      }
    };

    FailureTree.prototype.filterSetupLines = function(stackTraceLines) {
      var index, removeLine, _results;
      removeLine = false;
      index = 0;
      _results = [];
      while (index < stackTraceLines.length) {
        removeLine || (removeLine = /^\s*at Object\.jasmine\.executeSpecsInFolder/.test(stackTraceLines[index]));
        if (removeLine) {
          _results.push(stackTraceLines.splice(index, 1));
        } else {
          _results.push(index++);
        }
      }
      return _results;
    };

    FailureTree.prototype.filterFailureMessageLine = function(failure, stackTraceLines) {
      var errorLines, message, stackTraceErrorMessage;
      errorLines = [];
      while (stackTraceLines.length > 0) {
        if (/^\s+at\s+.*\((.*):(\d+):(\d+)\)\s*$/.test(stackTraceLines[0])) {
          break;
        } else {
          errorLines.push(stackTraceLines.shift());
        }
      }
      stackTraceErrorMessage = errorLines.join('\n');
      message = failure.message;
      if (stackTraceErrorMessage !== message && stackTraceErrorMessage !== ("Error: " + message)) {
        return stackTraceLines.splice.apply(stackTraceLines, [0, 0].concat(__slice.call(errorLines)));
      }
    };

    FailureTree.prototype.filterOriginLine = function(failure, stackTraceLines) {
      var column, filePath, line, match;
      if (stackTraceLines.length !== 1) {
        return stackTraceLines;
      }
      if (match = /^\s*at\s+((\[object Object\])|(null))\.<anonymous>\s+\((.*):(\d+):(\d+)\)\s*$/.exec(stackTraceLines[0])) {
        stackTraceLines.shift();
        filePath = path.relative(process.cwd(), match[4]);
        line = match[5];
        column = match[6];
        return failure.messageLine = "" + filePath + ":" + line + ":" + column;
      }
    };

    FailureTree.prototype.filterStackTrace = function(failure) {
      var stackTrace, stackTraceLines;
      stackTrace = failure.trace.stack;
      if (!stackTrace) {
        return;
      }
      stackTraceLines = stackTrace.split('\n').filter(function(line) {
        return line;
      });
      this.filterJasmineLines(stackTraceLines);
      this.filterTrailingTimersLine(stackTraceLines);
      this.filterSetupLines(stackTraceLines);
      stackTrace = coffeestack.convertStackTrace(stackTraceLines.join('\n'), sourceMaps);
      if (!stackTrace) {
        return;
      }
      stackTraceLines = stackTrace.split('\n').filter(function(line) {
        return line;
      });
      this.filterFailureMessageLine(failure, stackTraceLines);
      this.filterOriginLine(failure, stackTraceLines);
      return failure.filteredStackTrace = stackTraceLines.join('\n');
    };

    FailureTree.prototype.forEachSpec = function(_arg, callback, depth) {
      var child, failure, failures, spec, specs, suites, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results, _results1;
      _ref = _arg != null ? _arg : {}, spec = _ref.spec, suites = _ref.suites, specs = _ref.specs, failures = _ref.failures;
      if (depth == null) {
        depth = 0;
      }
      if (failures != null) {
        callback(spec, null, depth);
        _results = [];
        for (_i = 0, _len = failures.length; _i < _len; _i++) {
          failure = failures[_i];
          _results.push(callback(spec, failure, depth));
        }
        return _results;
      } else {
        callback(spec, null, depth);
        depth++;
        _ref1 = _.compact(suites);
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          child = _ref1[_j];
          this.forEachSpec(child, callback, depth);
        }
        _ref2 = _.compact(specs);
        _results1 = [];
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          child = _ref2[_k];
          _results1.push(this.forEachSpec(child, callback, depth));
        }
        return _results1;
      }
    };

    FailureTree.prototype.forEach = function(callback) {
      var suite, _i, _len, _ref, _results;
      _ref = _.compact(this.suites);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        suite = _ref[_i];
        _results.push(this.forEachSpec(suite, callback));
      }
      return _results;
    };

    return FailureTree;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBRUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBRkosQ0FBQTs7QUFBQSxFQUdBLFdBQUEsR0FBYyxPQUFBLENBQVEsYUFBUixDQUhkLENBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsRUFMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBCQUFBLE1BQUEsR0FBUSxJQUFSLENBQUE7O0FBRWEsSUFBQSxxQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLEVBQVYsQ0FEVztJQUFBLENBRmI7O0FBQUEsMEJBS0EsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixLQUFrQixFQUFyQjtJQUFBLENBTFQsQ0FBQTs7QUFBQSwwQkFPQSxHQUFBLEdBQUssU0FBQyxJQUFELEdBQUE7QUFDSCxVQUFBLGtIQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3dCQUFBO2NBQXVDLElBQUksQ0FBQyxPQUFMLEtBQWdCOztTQUNyRDtBQUFBLFFBQUEsV0FBQSxHQUFjLEVBQWQsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxHQUFTLElBQUksQ0FBQyxLQURkLENBQUE7QUFFQSxlQUFNLE1BQU4sR0FBQTtBQUNFLFVBQUEsV0FBVyxDQUFDLE9BQVosQ0FBb0IsTUFBcEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLFdBRGhCLENBREY7UUFBQSxDQUZBO0FBQUEsUUFNQSxXQUFBLEdBQWMsSUFOZCxDQUFBO0FBT0EsYUFBQSxvREFBQTtvQ0FBQTs7MkJBQ29DO0FBQUEs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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/node_modules/jasmine-tagged/node_modules/jasmine-focused/node_modules/jasmine-node/lib/jasmine-node/failure-tree.coffee