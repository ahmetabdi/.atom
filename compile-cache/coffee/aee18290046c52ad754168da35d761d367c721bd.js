(function() {
  var $, Config, Grim, KeymapManager, Point, Project, ServiceHub, TextEditor, TextEditorComponent, TextEditorElement, TextEditorView, TokenizedBuffer, Workspace, addCustomMatchers, clipboard, commandsToRestore, deprecationsSnapshot, documentTitle, emitObject, ensureNoDeprecatedFunctionsCalled, ensureNoPathSubscriptions, fixturePackagesPath, fs, isCoreSpec, keyBindingsToRestore, path, pathwatcher, resourcePath, specDirectory, specPackageName, specPackagePath, specProjectPath, styleElementsToRestore, _, _ref, _ref1,
    __slice = [].slice;

  require('../src/window');

  atom.initialize();

  atom.restoreWindowDimensions();

  require('jasmine-json');

  require('../vendor/jasmine-jquery');

  path = require('path');

  _ = require('underscore-plus');

  fs = require('fs-plus');

  Grim = require('grim');

  KeymapManager = require('../src/keymap-extensions');

  $ = require('../src/space-pen-extensions').$;

  Config = require('../src/config');

  Point = require('text-buffer').Point;

  Project = require('../src/project');

  Workspace = require('../src/workspace');

  ServiceHub = require('service-hub');

  TextEditor = require('../src/text-editor');

  TextEditorView = require('../src/text-editor-view');

  TextEditorElement = require('../src/text-editor-element');

  TokenizedBuffer = require('../src/tokenized-buffer');

  TextEditorComponent = require('../src/text-editor-component');

  pathwatcher = require('pathwatcher');

  clipboard = require('clipboard');

  atom.themes.loadBaseStylesheets();

  atom.themes.requireStylesheet('../static/jasmine');

  atom.themes.initialLoadComplete = true;

  fixturePackagesPath = path.resolve(__dirname, './fixtures/packages');

  atom.packages.packageDirPaths.unshift(fixturePackagesPath);

  atom.keymaps.loadBundledKeymaps();

  keyBindingsToRestore = atom.keymaps.getKeyBindings();

  commandsToRestore = atom.commands.getSnapshot();

  styleElementsToRestore = atom.styles.getSnapshot();

  window.addEventListener('core:close', function() {
    return window.close();
  });

  window.addEventListener('beforeunload', function() {
    atom.storeWindowDimensions();
    return atom.saveSync();
  });

  $('html,body').css('overflow', 'auto');

  documentTitle = null;

  Object.defineProperty(document, 'title', {
    get: function() {
      return documentTitle;
    },
    set: function(title) {
      return documentTitle = title;
    }
  });

  jasmine.getEnv().addEqualityTester(_.isEqual);

  if (process.env.JANKY_SHA1 && process.platform === 'win32') {
    jasmine.getEnv().defaultTimeoutInterval = 60000;
  } else {
    jasmine.getEnv().defaultTimeoutInterval = 5000;
  }

  specPackageName = null;

  specPackagePath = null;

  specProjectPath = null;

  isCoreSpec = false;

  _ref = atom.getLoadSettings(), specDirectory = _ref.specDirectory, resourcePath = _ref.resourcePath;

  if (specDirectory) {
    specPackagePath = path.resolve(specDirectory, '..');
    try {
      specPackageName = (_ref1 = JSON.parse(fs.readFileSync(path.join(specPackagePath, 'package.json')))) != null ? _ref1.name : void 0;
    } catch (_error) {}
    specProjectPath = path.join(specDirectory, 'fixtures');
  }

  isCoreSpec = specDirectory === fs.realpathSync(__dirname);

  beforeEach(function() {
    var clipboardContent, config, projectPath, resolvePackagePath, serializedWindowState, spy;
    if (isCoreSpec) {
      Grim.clearDeprecations();
    }
    $.fx.off = true;
    documentTitle = null;
    projectPath = specProjectPath != null ? specProjectPath : path.join(this.specDirectory, 'fixtures');
    atom.packages.serviceHub = new ServiceHub;
    atom.project = new Project({
      paths: [projectPath]
    });
    atom.workspace = new Workspace();
    atom.keymaps.keyBindings = _.clone(keyBindingsToRestore);
    atom.commands.restoreSnapshot(commandsToRestore);
    atom.styles.restoreSnapshot(styleElementsToRestore);
    atom.views.clearDocumentRequests();
    atom.workspaceViewParentSelector = '#jasmine-content';
    window.resetTimeouts();
    spyOn(_._, "now").andCallFake(function() {
      return window.now;
    });
    spyOn(window, "setTimeout").andCallFake(window.fakeSetTimeout);
    spyOn(window, "clearTimeout").andCallFake(window.fakeClearTimeout);
    atom.packages.packageStates = {};
    serializedWindowState = null;
    spyOn(atom, 'saveSync');
    atom.grammars.clearGrammarOverrides();
    spy = spyOn(atom.packages, 'resolvePackagePath').andCallFake(function(packageName) {
      if (specPackageName && packageName === specPackageName) {
        return resolvePackagePath(specPackagePath);
      } else {
        return resolvePackagePath(packageName);
      }
    });
    resolvePackagePath = _.bind(spy.originalValue, atom.packages);
    spyOn(atom.menu, 'sendToBrowserProcess');
    spyOn(Config.prototype, 'load');
    spyOn(Config.prototype, 'save');
    config = new Config({
      resourcePath: resourcePath,
      configDirPath: atom.getConfigDirPath()
    });
    atom.config = config;
    atom.loadConfig();
    config.set("core.destroyEmptyPanes", false);
    config.set("editor.fontFamily", "Courier");
    config.set("editor.fontSize", 16);
    config.set("editor.autoIndent", false);
    config.set("core.disabledPackages", ["package-that-throws-an-exception", "package-with-broken-package-json", "package-with-broken-keymap"]);
    config.set("editor.useShadowDOM", true);
    advanceClock(1000);
    window.setTimeout.reset();
    config.load.reset();
    config.save.reset();
    TextEditorElement.prototype.setUpdatedSynchronously(true);
    spyOn(atom, "setRepresentedFilename");
    spyOn(pathwatcher.File.prototype, "detectResurrectionAfterDelay").andCallFake(function() {
      return this.detectResurrection();
    });
    spyOn(TextEditor.prototype, "shouldPromptToSave").andReturn(false);
    TokenizedBuffer.prototype.chunkSize = Infinity;
    spyOn(TokenizedBuffer.prototype, "tokenizeInBackground").andCallFake(function() {
      return this.tokenizeNextChunk();
    });
    clipboardContent = 'initial clipboard content';
    spyOn(clipboard, 'writeText').andCallFake(function(text) {
      return clipboardContent = text;
    });
    spyOn(clipboard, 'readText').andCallFake(function() {
      return clipboardContent;
    });
    return addCustomMatchers(this);
  });

  afterEach(function() {
    var _ref2, _ref3;
    atom.packages.deactivatePackages();
    atom.menu.template = [];
    atom.contextMenu.clear();
    if ((_ref2 = atom.workspace) != null) {
      _ref2.destroy();
    }
    atom.workspace = null;
    atom.__workspaceView = null;
    delete atom.state.workspace;
    if ((_ref3 = atom.project) != null) {
      _ref3.destroy();
    }
    atom.project = null;
    atom.themes.removeStylesheet('global-editor-styles');
    delete atom.state.packageStates;
    if (!window.debugContent) {
      $('#jasmine-content').empty();
    }
    jasmine.unspy(atom, 'saveSync');
    ensureNoPathSubscriptions();
    atom.grammars.clearObservers();
    return waits(0);
  });

  ensureNoPathSubscriptions = function() {
    var watchedPaths;
    watchedPaths = pathwatcher.getWatchedPaths();
    pathwatcher.closeAllWatchers();
    if (watchedPaths.length > 0) {
      throw new Error("Leaking subscriptions for paths: " + watchedPaths.join(", "));
    }
  };

  ensureNoDeprecatedFunctionsCalled = function() {
    var deprecations, error, originalPrepareStackTrace;
    deprecations = Grim.getDeprecations();
    if (deprecations.length > 0) {
      originalPrepareStackTrace = Error.prepareStackTrace;
      Error.prepareStackTrace = function(error, stack) {
        var deprecation, functionName, location, output, _i, _j, _k, _len, _len1, _len2, _ref2, _ref3;
        output = [];
        for (_i = 0, _len = deprecations.length; _i < _len; _i++) {
          deprecation = deprecations[_i];
          output.push("" + deprecation.originName + " is deprecated. " + deprecation.message);
          output.push(_.multiplyString("-", output[output.length - 1].length));
          _ref2 = deprecation.getStacks();
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            stack = _ref2[_j];
            for (_k = 0, _len2 = stack.length; _k < _len2; _k++) {
              _ref3 = stack[_k], functionName = _ref3.functionName, location = _ref3.location;
              output.push("" + functionName + " -- " + location);
            }
          }
          output.push("");
        }
        return output.join("\n");
      };
      error = new Error("Deprecated function(s) " + (deprecations.map(function(_arg) {
        var originName;
        originName = _arg.originName;
        return originName;
      }).join(', ')) + ") were called.");
      error.stack;
      Error.prepareStackTrace = originalPrepareStackTrace;
      throw error;
    }
  };

  emitObject = jasmine.StringPrettyPrinter.prototype.emitObject;

  jasmine.StringPrettyPrinter.prototype.emitObject = function(obj) {
    if (obj.inspect) {
      return this.append(obj.inspect());
    } else {
      return emitObject.call(this, obj);
    }
  };

  jasmine.unspy = function(object, methodName) {
    if (!object[methodName].hasOwnProperty('originalValue')) {
      throw new Error("Not a spy");
    }
    return object[methodName] = object[methodName].originalValue;
  };

  jasmine.attachToDOM = function(element) {
    var jasmineContent;
    jasmineContent = document.querySelector('#jasmine-content');
    if (!jasmineContent.contains(element)) {
      return jasmineContent.appendChild(element);
    }
  };

  deprecationsSnapshot = null;

  jasmine.snapshotDeprecations = function() {
    return deprecationsSnapshot = _.clone(Grim.deprecations);
  };

  jasmine.restoreDeprecationsSnapshot = function() {
    return Grim.deprecations = deprecationsSnapshot;
  };

  jasmine.useRealClock = function() {
    jasmine.unspy(window, 'setTimeout');
    jasmine.unspy(window, 'clearTimeout');
    return jasmine.unspy(_._, 'now');
  };

  addCustomMatchers = function(spec) {
    return spec.addMatchers({
      toBeInstanceOf: function(expected) {
        var notText;
        notText = this.isNot ? " not" : "";
        this.message = (function(_this) {
          return function() {
            return "Expected " + (jasmine.pp(_this.actual)) + " to" + notText + " be instance of " + expected.name + " class";
          };
        })(this);
        return this.actual instanceof expected;
      },
      toHaveLength: function(expected) {
        var notText;
        if (this.actual == null) {
          this.message = (function(_this) {
            return function() {
              return "Expected object " + _this.actual + " has no length method";
            };
          })(this);
          return false;
        } else {
          notText = this.isNot ? " not" : "";
          this.message = (function(_this) {
            return function() {
              return "Expected object with length " + _this.actual.length + " to" + notText + " have length " + expected;
            };
          })(this);
          return this.actual.length === expected;
        }
      },
      toExistOnDisk: function(expected) {
        var notText;
        notText = this.isNot && " not" || "";
        this.message = function() {
          return "Expected path '" + this.actual + "'" + notText + " to exist.";
        };
        return fs.existsSync(this.actual);
      },
      toHaveFocus: function() {
        var element, notText;
        notText = this.isNot && " not" || "";
        if (!document.hasFocus()) {
          console.error("Specs will fail because the Dev Tools have focus. To fix this close the Dev Tools or click the spec runner.");
        }
        this.message = function() {
          return "Expected element '" + this.actual + "' or its descendants" + notText + " to have focus.";
        };
        element = this.actual;
        if (element.jquery) {
          element = element.get(0);
        }
        return element === document.activeElement || element.contains(document.activeElement);
      },
      toShow: function() {
        var element, notText, _ref2;
        notText = this.isNot ? " not" : "";
        element = this.actual;
        if (element.jquery) {
          element = element.get(0);
        }
        this.message = function() {
          return "Expected element '" + element + "' or its descendants" + notText + " to show.";
        };
        return (_ref2 = element.style.display) === 'block' || _ref2 === 'inline-block' || _ref2 === 'static' || _ref2 === 'fixed';
      }
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
    var originalEvent, originalEventProperties, _ref2, _ref3;
    if (properties == null) {
      properties = {};
    }
    originalEventProperties = {};
    originalEventProperties.ctrl = properties.ctrlKey;
    originalEventProperties.alt = properties.altKey;
    originalEventProperties.shift = properties.shiftKey;
    originalEventProperties.cmd = properties.metaKey;
    originalEventProperties.target = (_ref2 = (_ref3 = properties.target) != null ? _ref3[0] : void 0) != null ? _ref2 : properties.target;
    originalEventProperties.which = properties.which;
    originalEvent = KeymapManager.keydownEvent(key, originalEventProperties);
    properties = $.extend({
      originalEvent: originalEvent
    }, properties);
    return $.Event("keydown", properties);
  };

  window.mouseEvent = function(type, properties) {
    var editorView, left, point, top, _ref2;
    if (properties.point) {
      point = properties.point, editorView = properties.editorView;
      _ref2 = this.pagePixelPositionForPoint(editorView, point), top = _ref2.top, left = _ref2.left;
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

  window.clickEvent = function(properties) {
    if (properties == null) {
      properties = {};
    }
    return window.mouseEvent("click", properties);
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

  window.waitsForPromise = function() {
    var args, fn, shouldReject, timeout, _ref2;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (args.length > 1) {
      _ref2 = args[0], shouldReject = _ref2.shouldReject, timeout = _ref2.timeout;
    } else {
      shouldReject = false;
    }
    fn = _.last(args);
    return window.waitsFor(timeout, function(moveOn) {
      var promise;
      promise = fn();
      if (shouldReject) {
        promise["catch"].call(promise, moveOn);
        return promise.then(function() {
          jasmine.getEnv().currentSpec.fail("Expected promise to be rejected, but it was resolved");
          return moveOn();
        });
      } else {
        promise.then(moveOn);
        return promise["catch"].call(promise, function(error) {
          jasmine.getEnv().currentSpec.fail("Expected promise to be resolved, but it was rejected with " + (jasmine.pp(error)));
          return moveOn();
        });
      }
    });
  };

  window.resetTimeouts = function() {
    window.now = 0;
    window.timeoutCount = 0;
    window.intervalCount = 0;
    window.timeouts = [];
    return window.intervalTimeouts = {};
  };

  window.fakeSetTimeout = function(callback, ms) {
    var id;
    id = ++window.timeoutCount;
    window.timeouts.push([id, window.now + ms, callback]);
    return id;
  };

  window.fakeClearTimeout = function(idToClear) {
    return window.timeouts = window.timeouts.filter(function(_arg) {
      var id;
      id = _arg[0];
      return id !== idToClear;
    });
  };

  window.fakeSetInterval = function(callback, ms) {
    var action, id;
    id = ++window.intervalCount;
    action = function() {
      callback();
      return window.intervalTimeouts[id] = window.fakeSetTimeout(action, ms);
    };
    window.intervalTimeouts[id] = window.fakeSetTimeout(action, ms);
    return id;
  };

  window.fakeClearInterval = function(idToClear) {
    return window.fakeClearTimeout(this.intervalTimeouts[idToClear]);
  };

  window.advanceClock = function(delta) {
    var callback, callbacks, _i, _len, _results;
    if (delta == null) {
      delta = 1;
    }
    window.now += delta;
    callbacks = [];
    window.timeouts = window.timeouts.filter(function(_arg) {
      var callback, id, strikeTime;
      id = _arg[0], strikeTime = _arg[1], callback = _arg[2];
      if (strikeTime <= window.now) {
        callbacks.push(callback);
        return false;
      } else {
        return true;
      }
    });
    _results = [];
    for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
      callback = callbacks[_i];
      _results.push(callback());
    }
    return _results;
  };

  window.pagePixelPositionForPoint = function(editorView, point) {
    var left, top;
    point = Point.fromObject(point);
    top = editorView.renderedLines.offset().top + point.row * editorView.lineHeight;
    left = editorView.renderedLines.offset().left + point.column * editorView.charWidth - editorView.renderedLines.scrollLeft();
    return {
      top: top,
      left: left
    };
  };

  window.tokensText = function(tokens) {
    return _.pluck(tokens, 'value').join('');
  };

  window.setEditorWidthInChars = function(editorView, widthInChars, charWidth) {
    if (charWidth == null) {
      charWidth = editorView.charWidth;
    }
    editorView.width(charWidth * widthInChars + editorView.gutter.outerWidth());
    return $(window).trigger('resize');
  };

  window.setEditorHeightInLines = function(editorView, heightInLines, lineHeight) {
    var _ref2;
    if (lineHeight == null) {
      lineHeight = editorView.lineHeight;
    }
    editorView.height(editorView.getEditor().getLineHeightInPixels() * heightInLines);
    return (_ref2 = editorView.component) != null ? _ref2.measureHeightAndWidth() : void 0;
  };

  $.fn.resultOfTrigger = function(type) {
    var event;
    event = $.Event(type);
    this.trigger(event);
    return event.result;
  };

  $.fn.enableKeymap = function() {
    return this.on('keydown', function(e) {
      var originalEvent, _ref2;
      originalEvent = (_ref2 = e.originalEvent) != null ? _ref2 : e;
      if (originalEvent.target == null) {
        Object.defineProperty(originalEvent, 'target', {
          get: function() {
            return e.target;
          }
        });
      }
      atom.keymaps.handleKeyboardEvent(originalEvent);
      return !e.originalEvent.defaultPrevented;
    });
  };

  $.fn.attachToDom = function() {
    if (!this.isOnDom()) {
      return this.appendTo($('#jasmine-content'));
    }
  };

  $.fn.simulateDomAttachment = function() {
    return $('<html>').append(this);
  };

  $.fn.textInput = function(data) {
    return this.each(function() {
      var event;
      event = document.createEvent('TextEvent');
      event.initTextEvent('textInput', true, true, window, data);
      event = $.event.fix(event);
      return $(this).trigger(event);
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdnQkFBQTtJQUFBLGtCQUFBOztBQUFBLEVBQUEsT0FBQSxDQUFRLGVBQVIsQ0FBQSxDQUFBOztBQUFBLEVBQ0EsSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQURBLENBQUE7O0FBQUEsRUFFQSxJQUFJLENBQUMsdUJBQUwsQ0FBQSxDQUZBLENBQUE7O0FBQUEsRUFJQSxPQUFBLENBQVEsY0FBUixDQUpBLENBQUE7O0FBQUEsRUFLQSxPQUFBLENBQVEsMEJBQVIsQ0FMQSxDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBTlAsQ0FBQTs7QUFBQSxFQU9BLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FQSixDQUFBOztBQUFBLEVBUUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBUkwsQ0FBQTs7QUFBQSxFQVNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQVRQLENBQUE7O0FBQUEsRUFVQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSwwQkFBUixDQVZoQixDQUFBOztBQUFBLEVBYUMsSUFBSyxPQUFBLENBQVEsNkJBQVIsRUFBTCxDQWJELENBQUE7O0FBQUEsRUFlQSxNQUFBLEdBQVMsT0FBQSxDQUFRLGVBQVIsQ0FmVCxDQUFBOztBQUFBLEVBZ0JDLFFBQVMsT0FBQSxDQUFRLGFBQVIsRUFBVCxLQWhCRCxDQUFBOztBQUFBLEVBaUJBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FqQlYsQ0FBQTs7QUFBQSxFQWtCQSxTQUFBLEdBQVksT0FBQSxDQUFRLGtCQUFSLENBbEJaLENBQUE7O0FBQUEsRUFtQkEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSLENBbkJiLENBQUE7O0FBQUEsRUFvQkEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUixDQXBCYixD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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/spec-helper.coffee