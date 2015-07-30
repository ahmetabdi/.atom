(function() {
  var BufferedProcess, ShellRunner,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BufferedProcess = require('./buffered-process');

  module.exports = ShellRunner = (function() {
    ShellRunner.prototype.processor = BufferedProcess;

    function ShellRunner(params) {
      this.stderr = __bind(this.stderr, this);
      this.stdout = __bind(this.stdout, this);
      this.initialize(params);
    }

    ShellRunner.prototype.initialize = function(params) {
      this.params = params || (function() {
        throw "Missing ::params argument";
      })();
      this.write = params.write || (function() {
        throw "Missing ::write parameter";
      })();
      this.exit = params.exit || (function() {
        throw "Missing ::exit parameter";
      })();
      this.command = params.command || (function() {
        throw "Missing ::command parameter";
      })();
      return this.currentShell = params.currentShell || (function() {
        throw "Missing ::currentShell parameter";
      })();
    };

    ShellRunner.prototype.run = function() {
      var fullCommand;
      fullCommand = "cd " + (this.params.cwd()) + " && " + (this.params.command()) + "; exit\n";
      return this.process = this.newProcess(fullCommand);
    };

    ShellRunner.prototype.kill = function() {
      if (this.process != null) {
        return this.process.kill('SIGKILL');
      }
    };

    ShellRunner.prototype.stdout = function(output) {
      return this.params.write(output);
    };

    ShellRunner.prototype.stderr = function(output) {
      return this.params.write(output);
    };

    ShellRunner.prototype.newProcess = function(testCommand) {
      var args, command, options, outputCharacters, params, process;
      command = this.currentShell;
      args = ['-c', '-l', testCommand];
      options = {
        cwd: this.params.cwd
      };
      params = {
        command: command,
        args: args,
        options: options,
        stdout: this.stdout,
        stderr: this.stderr,
        exit: this.exit
      };
      outputCharacters = true;
      process = new this.processor(params, outputCharacters);
      return process;
    };

    return ShellRunner;

  })();

}).call(this);
