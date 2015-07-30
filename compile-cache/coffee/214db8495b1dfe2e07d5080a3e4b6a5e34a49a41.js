(function() {
  var ShellRunner, SourceInfo, TestRunner;

  TestRunner = require('../lib/test-runner');

  SourceInfo = require('../lib/source-info');

  ShellRunner = require('../lib/shell-runner');

  describe("TestRunner", function() {
    beforeEach(function() {
      spyOn(ShellRunner.prototype, 'initialize').andCallThrough();
      this.testRunnerParams = {
        write: (function(_this) {
          return function() {
            return null;
          };
        })(this),
        exit: (function(_this) {
          return function() {
            return null;
          };
        })(this),
        shellRunnerParams: (function(_this) {
          return function() {
            return null;
          };
        })(this),
        setTestInfo: (function(_this) {
          return function() {
            return null;
          };
        })(this)
      };
      spyOn(this.testRunnerParams, 'shellRunnerParams');
      spyOn(this.testRunnerParams, 'setTestInfo');
      spyOn(SourceInfo.prototype, 'activeFile').andReturn('fooTestFile');
      spyOn(SourceInfo.prototype, 'currentLine').andReturn(100);
      spyOn(SourceInfo.prototype, 'testFileCommand').andReturn('fooTestCommand {relative_path}');
      return spyOn(SourceInfo.prototype, 'testSingleCommand').andReturn('fooTestCommand {relative_path}:{line_number}');
    });
    return describe("::run", function() {
      it("Instantiates ShellRunner with expected params", function() {
        var runner;
        runner = new TestRunner(this.testRunnerParams);
        runner.run();
        expect(ShellRunner.prototype.initialize).toHaveBeenCalledWith(runner.shellRunnerParams());
        return expect(this.testRunnerParams.setTestInfo).toHaveBeenCalledWith("fooTestCommand fooTestFile");
      });
      return it("constructs a single-test command when testScope is 'single'", function() {
        var runner;
        this.testRunnerParams.testScope = "single";
        runner = new TestRunner(this.testRunnerParams);
        runner.run();
        return expect(this.testRunnerParams.setTestInfo).toHaveBeenCalledWith("fooTestCommand fooTestFile:100");
      });
    });
  });

}).call(this);
