(function() {
  var ShellRunner, SourceInfo, TestRunner,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ShellRunner = require('./shell-runner');

  SourceInfo = require('./source-info');

  module.exports = TestRunner = (function() {
    function TestRunner(params) {
      this.command = __bind(this.command, this);
      this.initialize(params);
    }

    TestRunner.prototype.initialize = function(params) {
      this.params = params;
      return this.testParams = new SourceInfo();
    };

    TestRunner.prototype.run = function() {
      this.shell = new ShellRunner(this.shellRunnerParams());
      this.params.setTestInfo(this.command());
      return this.shell.run();
    };

    TestRunner.prototype.shellRunnerParams = function() {
      return {
        write: this.params.write,
        exit: this.params.exit,
        command: this.command,
        cwd: this.testParams.cwd,
        currentShell: this.testParams.currentShell()
      };
    };

    TestRunner.prototype.command = function() {
      var cmd;
      cmd = this.params.testScope === "single" ? this.testParams.testSingleCommand() : this.params.testScope === "all" ? this.testParams.testAllCommand() : this.testParams.testFileCommand();
      return cmd.replace('{relative_path}', this.testParams.activeFile()).replace('{line_number}', this.testParams.currentLine()).replace('{regex}', this.testParams.minitestRegExp());
    };

    TestRunner.prototype.cancel = function() {
      return this.shell.kill();
    };

    return TestRunner;

  })();

}).call(this);
