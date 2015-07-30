(function() {
  var $$, RubyTestView, TestRunner, _;

  _ = require('underscore-plus');

  $$ = require('atom-space-pen-views').$$;

  RubyTestView = require('../lib/ruby-test-view');

  TestRunner = require('../lib/test-runner');

  describe("RubyTestView", function() {
    var activeEditor, fileOpened, setUpActiveEditor, spyOnTestRunnerInitialize, spyOnTestRunnerRun, testRunnerInitializeParams, validateTestRunnerInitialize, validateTestRunnerRun, view;
    activeEditor = null;
    testRunnerInitializeParams = null;
    view = null;
    fileOpened = false;
    spyOnTestRunnerInitialize = function() {
      spyOn(activeEditor, 'save');
      spyOn(TestRunner.prototype, 'initialize').andCallFake(function(params) {
        return testRunnerInitializeParams = params;
      });
      return spyOn(TestRunner.prototype, 'run').andReturn(null);
    };
    validateTestRunnerInitialize = function() {
      expect(testRunnerInitializeParams).toBeDefined();
      expect(testRunnerInitializeParams).not.toBe(null);
      expect(testRunnerInitializeParams.write).toEqual(view.write);
      expect(testRunnerInitializeParams.exit).toEqual(view.onTestRunEnd);
      return expect(testRunnerInitializeParams.setTestInfo).toEqual(view.setTestInfo);
    };
    spyOnTestRunnerRun = function() {
      spyOn(activeEditor, 'save');
      spyOn(TestRunner.prototype, 'initialize').andCallThrough();
      spyOn(TestRunner.prototype, 'run').andCallThrough();
      return spyOn(TestRunner.prototype, 'command').andReturn('fooTestCommand');
    };
    validateTestRunnerRun = function() {
      expect(TestRunner.prototype.initialize).toHaveBeenCalled();
      expect(TestRunner.prototype.run).toHaveBeenCalledWith();
      return expect(activeEditor.save).toHaveBeenCalled();
    };
    setUpActiveEditor = function() {
      atom.workspace.open('/tmp/text.txt').then(function(editor) {
        activeEditor = editor;
        return fileOpened = true;
      });
      return waitsFor(function() {
        return fileOpened === true;
      });
    };
    describe("with open editor", function() {
      beforeEach(function() {
        fileOpened = false;
        testRunnerInitializeParams = null;
        view = null;
        activeEditor = null;
        return setUpActiveEditor();
      });
      describe("::testAll", function() {
        it("instantiates TestRunner with specific arguments", function() {
          spyOnTestRunnerInitialize();
          view = new RubyTestView();
          view.testAll();
          validateTestRunnerInitialize();
          return expect(testRunnerInitializeParams.testScope).toEqual('all');
        });
        return it("instantiates TestRunner and calls ::run on it", function() {
          spyOnTestRunnerRun();
          view = new RubyTestView();
          view.testAll();
          return validateTestRunnerRun();
        });
      });
      describe("::testFile", function() {
        it("instantiates TestRunner with specific arguments", function() {
          spyOnTestRunnerInitialize();
          view = new RubyTestView();
          view.testFile();
          validateTestRunnerInitialize();
          return expect(testRunnerInitializeParams.testScope).not.toBeDefined();
        });
        return it("calls ::run on the TestRunner instance", function() {
          spyOnTestRunnerRun();
          view = new RubyTestView();
          spyOn(view, 'setTestInfo').andCallThrough();
          view.testFile();
          validateTestRunnerRun();
          return expect(view.setTestInfo).toHaveBeenCalled();
        });
      });
      describe("::testSingle", function() {
        it("instantiates TestRunner with specific arguments", function() {
          spyOnTestRunnerInitialize();
          view = new RubyTestView();
          view.testSingle();
          validateTestRunnerInitialize();
          return expect(testRunnerInitializeParams.testScope).toEqual('single');
        });
        return it("instantiates TestRunner and calls ::run on it", function() {
          spyOnTestRunnerRun();
          view = new RubyTestView();
          view.testSingle();
          return validateTestRunnerRun();
        });
      });
      return describe("::testPrevious", function() {
        return it("intantiates TestRunner and calls ::run on it with specific arguments", function() {
          var previousRunner;
          spyOn(activeEditor, 'save');
          view = new RubyTestView();
          previousRunner = new TestRunner(view.testRunnerParams());
          previousRunner.command = function() {
            return "foo";
          };
          view.runner = previousRunner;
          view.testPrevious();
          expect(view.output).toBe("");
          expect(view.runner).toBe(previousRunner);
          return expect(activeEditor.save).toHaveBeenCalled();
        });
      });
    });
    describe("without open editor", function() {
      beforeEach(function() {
        fileOpened = false;
        testRunnerInitializeParams = null;
        return view = null;
      });
      return describe("::testAll", function() {
        return it("instantiates TestRunner and calls ::run on it", function() {
          spyOnTestRunnerRun();
          view = new RubyTestView();
          view.testAll();
          expect(TestRunner.prototype.initialize).toHaveBeenCalled();
          return expect(TestRunner.prototype.run).toHaveBeenCalledWith();
        });
      });
    });
    return describe("::write", function() {
      return it("appends content to results element", function() {
        view = new RubyTestView();
        view.write("foo");
        return expect(view.results.text()).toBe("foo");
      });
    });
  });

}).call(this);
