(function() {
  var LinterError, indent,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  indent = function(string, width) {
    var indentation;
    indentation = ' '.repeat(width);
    return indentation + string.split("\n").join("\n" + indentation);
  };

  module.exports = LinterError = (function(_super) {
    __extends(LinterError, _super);

    function LinterError(message, commandResult) {
      if (message == null) {
        message = void 0;
      }
      if (commandResult == null) {
        commandResult = void 0;
      }
      if (message != null) {
        this.message = message.toString();
      }
      this.commandResult = commandResult;
      Error.captureStackTrace(this, this.constructor);
    }

    LinterError.prototype.name = LinterError.name;

    LinterError.prototype.toString = function() {
      var string;
      string = this.name;
      if (this.message) {
        string += ": " + this.message;
      }
      if (this.commandResult != null) {
        string += '\n';
        string += "    command: " + (JSON.stringify(this.commandResult.command)) + "\n";
        string += "    PATH: " + this.commandResult.env.PATH + "\n";
        string += "    exit code: " + this.commandResult.exitCode + "\n";
        string += '    stdout:\n';
        string += indent(this.commandResult.stdout, 8) + '\n';
        string += '    stderr:\n';
        string += indent(this.commandResult.stderr, 8);
      }
      return string;
    };

    return LinterError;

  })(Error);

}).call(this);
