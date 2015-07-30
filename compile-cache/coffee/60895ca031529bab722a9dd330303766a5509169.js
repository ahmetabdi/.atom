(function() {
  var CommandRunner, LinterError;

  LinterError = require('../lib/linter-error');

  CommandRunner = require('../lib/command-runner');

  describe('LinterError', function() {
    var commandResult;
    commandResult = {
      command: ['rubocop', '--foo'],
      env: {
        PATH: '/Users/me/.rbenv/bin:/Users/me/.cabal/bin:/Users/me/bin:/Users/me/.dotfiles/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/Users/me/.rbenv/shims:/Users/me/.go/bin'
      },
      exitCode: 123,
      stdout: 'foo',
      stderr: "invalid option: --foo\n/Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/lib/rubocop/options.rb:82:in `parse'\n/Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/lib/rubocop/cli.rb:19:in `run'\n/Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/bin/rubocop:14:in `block in <top (required)>'\n/Users/me/.rbenv/versions/2.1.2/lib/ruby/2.1.0/benchmark.rb:294:in `realtime'\n/Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/bin/rubocop:13:in `<top (required)>'\n/Users/me/.rbenv/versions/2.1.2/bin/rubocop:23:in `load'\n/Users/me/.rbenv/versions/2.1.2/bin/rubocop:23:in `<main>'"
    };
    beforeEach(function() {});
    describe('name', function() {
      return it('always returns "LinterError"', function() {
        var error;
        error = new LinterError;
        return expect(error.name).toBe('LinterError');
      });
    });
    describe('stack', function() {
      return it('returns stacktrace', function() {
        var error;
        error = new LinterError;
        return expect(error.stack).toContain(' at ');
      });
    });
    describe('message', function() {
      describe('when a string message is passed to constructor', function() {
        return it('returns the message', function() {
          var error;
          error = new LinterError('This is a message');
          return expect(error.message).toBe('This is a message');
        });
      });
      describe('when null is passed to constructor', function() {
        return it('returns an empty string', function() {
          var error;
          error = new LinterError(null);
          return expect(error.message).toBe('');
        });
      });
      return describe('when no message is passed to constructor', function() {
        return it('returns an empty string', function() {
          var error;
          error = new LinterError;
          return expect(error.message).toBe('');
        });
      });
    });
    return describe('::toString', function() {
      describe('when the error has a message', function() {
        return it('returns a string including the message', function() {
          var error;
          error = new LinterError('some message');
          return expect(error.toString()).toMatch(/^LinterError: some message/);
        });
      });
      return describe('when the error has a command result', function() {
        return it('returns a string including the command execution result', function() {
          var error;
          error = new LinterError(null, commandResult);
          return expect(error.toString()).toBe("LinterError\n    command: [\"rubocop\",\"--foo\"]\n    PATH: /Users/me/.rbenv/bin:/Users/me/.cabal/bin:/Users/me/bin:/Users/me/.dotfiles/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/opt/X11/bin:/Users/me/.rbenv/shims:/Users/me/.go/bin\n    exit code: 123\n    stdout:\n        foo\n    stderr:\n        invalid option: --foo\n        /Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/lib/rubocop/options.rb:82:in `parse'\n        /Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/lib/rubocop/cli.rb:19:in `run'\n        /Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/bin/rubocop:14:in `block in <top (required)>'\n        /Users/me/.rbenv/versions/2.1.2/lib/ruby/2.1.0/benchmark.rb:294:in `realtime'\n        /Users/me/.rbenv/versions/2.1.2/lib/ruby/gems/2.1.0/gems/rubocop-0.24.1/bin/rubocop:13:in `<top (required)>'\n        /Users/me/.rbenv/versions/2.1.2/bin/rubocop:23:in `load'\n        /Users/me/.rbenv/versions/2.1.2/bin/rubocop:23:in `<main>'");
        });
      });
    });
  });

}).call(this);
