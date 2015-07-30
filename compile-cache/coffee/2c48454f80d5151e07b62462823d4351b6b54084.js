(function() {
  var $, Point, Project, TokenizedBuffer, defaultCount, fs, path, _,
    __slice = [].slice;

  require('../spec/spec-helper');

  path = require('path');

  $ = require('../src/space-pen-extensions').$;

  Point = require('atom').Point;

  _ = require('underscore-plus');

  fs = require('fs-plus');

  Project = require('../src/project');

  TokenizedBuffer = require('../src/tokenized-buffer');

  defaultCount = 100;

  window.pbenchmark = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return window.benchmark.apply(window, __slice.call(args).concat([{
      profile: true
    }]));
  };

  window.fbenchmark = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return window.benchmark.apply(window, __slice.call(args).concat([{
      focused: true
    }]));
  };

  window.fpbenchmark = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return window.benchmark.apply(window, __slice.call(args).concat([{
      profile: true,
      focused: true
    }]));
  };

  window.pfbenchmark = window.fpbenchmark;

  window.benchmarkFixturesProject = new Project(path.join(__dirname, 'fixtures'));

  beforeEach(function() {
    window.project = window.benchmarkFixturesProject;
    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');
    return jasmine.unspy(TokenizedBuffer.prototype, 'tokenizeInBackground');
  });

  window.benchmark = function() {
    var args, count, description, fn, focused, method, options, profile, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    description = args.shift();
    if (typeof args[0] === 'number') {
      count = args.shift();
    } else {
      count = defaultCount;
    }
    fn = args[0], options = args[1];
    _ref = options != null ? options : {}, profile = _ref.profile, focused = _ref.focused;
    method = focused ? fit : it;
    return method(description, function() {
      var avg, data, fullname, report, total, url;
      total = measure(function() {
        if (profile) {
          console.profile(description);
        }
        _.times(count, fn);
        if (profile) {
          return console.profileEnd(description);
        }
      });
      avg = total / count;
      fullname = this.getFullName().replace(/\s|\.$/g, "");
      report = "" + fullname + ": " + total + " / " + count + " = " + avg + "ms";
      console.log(report);
      if (atom.getLoadSettings().exitWhenDone) {
        url = "https://github.com/_stats";
        data = [
          {
            type: 'timing',
            metric: "atom." + fullname,
            ms: avg
          }
        ];
        return $.ajax(url, {
          async: false,
          data: JSON.stringify(data),
          error: function() {
            var args;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            return console.log("Failed to send atom." + fullname + "\n" + (JSON.stringify(args)));
          }
        });
      }
    });
  };

  window.measure = function(fn) {
    var start;
    start = new Date().getTime();
    fn();
    return new Date().getTime() - start;
  };

  window.waitsForPromise = function(fn) {
    return window.waitsFor(function(moveOn) {
      return fn().done(moveOn);
    });
  };

  window.keyIdentifierForKey = function(key) {
    var charCode;
    if (key.length > 1) {
      return key;
    } else {
      charCode = key.toUpperCase().charCodeAt(0);
      return "U+00" + charCode.toString(16);
    }
  };

  window.keydownEvent = function(key, properties) {
    if (properties == null) {
      properties = {};
    }
    return $.Event("keydown", _.extend({
      originalEvent: {
        keyIdentifier: keyIdentifierForKey(key)
      }
    }, properties));
  };

  window.clickEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return $.Event("click", properties);
  };

  window.mouseEvent = function(type, properties) {
    var editorView, left, point, top, _ref;
    if (properties.point) {
      point = properties.point, editorView = properties.editorView;
      _ref = this.pagePixelPositionForPoint(editorView, point), top = _ref.top, left = _ref.left;
      properties.pageX = left + 1;
      properties.pageY = top + 1;
    }
    if (properties.originalEvent == null) {
      properties.originalEvent = {
        detail: 1
      };
    }
    return $.Event(type, properties);
  };

  window.mousedownEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return window.mouseEvent('mousedown', properties);
  };

  window.mousemoveEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return window.mouseEvent('mousemove', properties);
  };

  window.pagePixelPositionForPoint = function(editorView, point) {
    var left, top;
    point = Point.fromObject(point);
    top = editorView.lines.offset().top + point.row * editorView.lineHeight;
    left = editorView.lines.offset().left + point.column * editorView.charWidth - editorView.lines.scrollLeft();
    return {
      top: top,
      left: left
    };
  };

  window.seteditorViewWidthInChars = function(editorView, widthInChars, charWidth) {
    if (charWidth == null) {
      charWidth = editorView.charWidth;
    }
    return editorView.width(charWidth * widthInChars + editorView.lines.position().left);
  };

  $.fn.resultOfTrigger = function(type) {
    var event;
    event = $.Event(type);
    this.trigger(event);
    return event.result;
  };

  $.fn.enableKeymap = function() {
    return this.on('keydown', function(e) {
      return window.keymap.handleKeyEvent(e);
    });
  };

  $.fn.attachToDom = function() {
    return $('#jasmine-content').append(this);
  };

  $.fn.textInput = function(data) {
    var event;
    event = document.createEvent('TextEvent');
    event.initTextEvent('textInput', true, true, window, data);
    return this.each(function() {
      return this.dispatchEvent(event);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUEsa0JBQUE7O0FBQUEsRUFBQSxPQUFBLENBQVEscUJBQVIsQ0FBQSxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdDLElBQUssT0FBQSxDQUFRLDZCQUFSLEVBQUwsQ0FIRCxDQUFBOztBQUFBLEVBSUMsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBSkQsQ0FBQTs7QUFBQSxFQUtBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FMSixDQUFBOztBQUFBLEVBTUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBTkwsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FQVixDQUFBOztBQUFBLEVBUUEsZUFBQSxHQUFrQixPQUFBLENBQVEseUJBQVIsQ0FSbEIsQ0FBQTs7QUFBQSxFQVVBLFlBQUEsR0FBZSxHQVZmLENBQUE7O0FBQUEsRUFXQSxNQUFNLENBQUMsVUFBUCxHQUFvQixTQUFBLEdBQUE7QUFBYSxRQUFBLElBQUE7QUFBQSxJQUFaLDhEQUFZLENBQUE7V0FBQSxNQUFNLENBQUMsU0FBUCxlQUFpQixhQUFBLElBQUEsQ0FBQSxRQUFTLENBQUE7QUFBQSxNQUFBLE9BQUEsRUFBUyxJQUFUO0tBQUEsQ0FBVCxDQUFqQixFQUFiO0VBQUEsQ0FYcEIsQ0FBQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CLFNBQUEsR0FBQTtBQUFhLFFBQUEsSUFBQTtBQUFBLElBQVosOERBQVksQ0FBQTtXQUFBLE1BQU0sQ0FBQyxTQUFQLGVBQWlCLGFBQUEsSUFBQSxDQUFBLFFBQVMsQ0FBQTtBQUFBLE1BQUEsT0FBQSxFQUFTLElBQVQ7S0FBQSxDQUFULENBQWpCLEVB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/benchmark/benchmark-helper.coffee