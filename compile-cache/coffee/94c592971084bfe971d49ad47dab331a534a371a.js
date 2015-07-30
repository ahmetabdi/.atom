(function() {
  var $, CommandRunner, fs, os, path, rimraf;

  os = require('os');

  path = require('path');

  fs = require('fs');

  rimraf = require('rimraf');

  $ = require('atom').$;

  CommandRunner = require('../lib/command-runner');

  describe('CommandRunner', function() {
    var originalEnv, originalWorkingDirectory, workingDir;
    workingDir = path.join(os.tmpdir(), 'atom-lint-spec');
    originalWorkingDirectory = process.cwd();
    originalEnv = null;
    beforeEach(function() {
      originalEnv = $.extend(true, {}, process.env);
      return atom.project.path = process.cwd();
    });
    afterEach(function() {
      process.env = originalEnv;
      process.chdir(originalWorkingDirectory);
      return rimraf.sync(workingDir);
    });
    return describe('run', function() {
      var run;
      beforeEach(function() {
        return CommandRunner.cachedEnv = void 0;
      });
      run = function(command, callback) {
        var hasRun, runner;
        hasRun = false;
        runner = new CommandRunner(command);
        runner.run(function(error, result) {
          callback(error, result);
          return hasRun = true;
        });
        return waitsFor(function() {
          return hasRun;
        });
      };
      it('handles arguments include whitespaces', function() {
        return run(['echo', '-n', 'foo   bar'], function(error, result) {
          return expect(result.stdout).toBe('foo   bar');
        });
      });
      it('passes the executed command', function() {
        return run(['echo', '-n', 'foo'], function(error, result) {
          return expect(result.command).toEqual(['echo', '-n', 'foo']);
        });
      });
      it('passes the environment variables', function() {
        return run(['echo', '-n', 'foo'], function(error, result) {
          return expect(result.env.PATH).toContain('/bin');
        });
      });
      describe('when atom.project.path is set', function() {
        beforeEach(function() {
          if (fs.existsSync(workingDir)) {
            rimraf.sync(workingDir);
          }
          fs.mkdirSync(workingDir);
          return atom.project.path = workingDir;
        });
        return it('runs the command there', function() {
          return run(['pwd'], function(error, result) {
            return expect(result.stdout.trim()).toBe(fs.realpathSync(atom.project.path));
          });
        });
      });
      describe('when atom.project.path is not set', function() {
        beforeEach(function() {
          return atom.project.path = null;
        });
        return it('runs the command in the current working directory', function() {
          return run(['pwd'], function(error, result) {
            return expect(result.stdout.trim()).toBe(process.cwd());
          });
        });
      });
      describe('when the command run successfully', function() {
        it('passes stdout', function() {
          return run(['echo', '-n', 'foo'], function(error, result) {
            return expect(result.stdout).toBe('foo');
          });
        });
        it('passes stderr', function() {
          return run(['ls', 'non-existent-file'], function(error, result) {
            return expect(result.stderr).toMatch(/no such file/i);
          });
        });
        it('passes exit code', function() {
          run(['ls', '/'], function(error, result) {
            return expect(result.exitCode).toBe(0);
          });
          return run(['ls', 'non-existent-file'], function(error, result) {
            return expect(result.exitCode).toBe(1);
          });
        });
        return it('passes no error', function() {
          return run(['ls', '/'], function(error, result) {
            return expect(result.error).toBeFalsy();
          });
        });
      });
      return describe('when the command is not found', function() {
        it('invokes the callback only once', function() {
          var invocationCount, runner;
          invocationCount = 0;
          runner = new CommandRunner(['non-existent-command']);
          runner.run(function(error, result) {
            return invocationCount++;
          });
          waits(500);
          return runs(function() {
            return expect(invocationCount).toBe(1);
          });
        });
        it('passes empty stdout', function() {
          return run(['non-existent-command'], function(error, result) {
            return expect(result.stdout).toBe('');
          });
        });
        it('passes empty stderr', function() {
          return run(['non-existent-command'], function(error, result) {
            return expect(result.stderr).toBe('');
          });
        });
        it('passes undefined exit code', function() {
          return run(['non-existent-command'], function(error, result) {
            return expect(result.exitCode).toBeUndefined();
          });
        });
        return it('passes ENOENT error', function() {
          return run(['non-existent-command'], function(error, result) {
            return expect(error.code).toBe('ENOENT');
          });
        });
      });
    });
  });

}).call(this);
