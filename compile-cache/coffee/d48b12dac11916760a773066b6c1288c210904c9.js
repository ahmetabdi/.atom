(function() {
  var CommandRunner, EnvStore, child_process;

  child_process = require('child_process');

  EnvStore = require('./env-store');

  module.exports = CommandRunner = (function() {
    function CommandRunner(command) {
      this.command = command;
    }

    CommandRunner.prototype.run = function(callback) {
      var env;
      env = EnvStore.get();
      return this.runWithEnv(env, callback);
    };

    CommandRunner.prototype.runWithEnv = function(env, callback) {
      var hasInvokedCallback, proc, result;
      proc = this.createChildProcess(env);
      result = {
        command: this.command,
        env: env,
        stdout: '',
        stderr: ''
      };
      hasInvokedCallback = false;
      proc.stdout.on('data', function(data) {
        return result.stdout += data;
      });
      proc.stderr.on('data', function(data) {
        return result.stderr += data;
      });
      proc.on('close', function(exitCode) {
        if (hasInvokedCallback) {
          return;
        }
        result.exitCode = exitCode;
        callback(null, result);
        return hasInvokedCallback = true;
      });
      return proc.on('error', function(error) {
        if (hasInvokedCallback) {
          return;
        }
        callback(error, result);
        return hasInvokedCallback = true;
      });
    };

    CommandRunner.prototype.createChildProcess = function(env) {
      var options;
      options = {
        env: env
      };
      if (atom.project.path) {
        options.cwd = atom.project.path;
      }
      if (process.platform === 'win32') {
        options.windowsVerbatimArguments = true;
        return child_process.spawn('cmd', ['/s', '/c', '"' + this.command.join(' ') + '"'], options);
      } else {
        return child_process.spawn(this.command[0], this.command.slice(1), options);
      }
    };

    return CommandRunner;

  })();

}).call(this);
