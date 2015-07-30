(function() {
  var ShellRunner, SourceInfo,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  ShellRunner = require('./../lib/shell-runner');

  SourceInfo = (function() {
    function SourceInfo() {
      this.cwd = __bind(this.cwd, this);
      this.command = __bind(this.command, this);
      this.exit = __bind(this.exit, this);
      this.write = __bind(this.write, this);
    }

    SourceInfo.prototype.file = 'Hello, World!';

    SourceInfo.prototype.output = '';

    SourceInfo.prototype.currentShell = "bash";

    SourceInfo.prototype.write = function(str) {
      return this.output += str;
    };

    SourceInfo.prototype.exit = function() {
      return this.exited = true;
    };

    SourceInfo.prototype.command = function() {
      return "echo -n " + this.file;
    };

    SourceInfo.prototype.cwd = function() {
      return "/tmp";
    };

    return SourceInfo;

  })();

  describe("ShellRunner", function() {
    beforeEach(function() {
      this.params = new SourceInfo();
      return this.runner = new ShellRunner(this.params);
    });
    return describe('::run', function() {
      return it("appends to writer", function() {
        this.runner.run();
        waitsFor(function() {
          return this.params.exited;
        });
        return runs(function() {
          return expect(this.params.output).toBe("Hello, World!");
        });
      });
    });
  });

}).call(this);
