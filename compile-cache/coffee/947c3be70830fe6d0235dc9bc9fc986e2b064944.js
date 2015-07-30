
/*
// Requires [perltidy](http://perltidy.sourceforge.net)
 */

(function() {
  "use strict";
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var args, cmd;
    if (options.perltidy_path == null) {
      return new Error("'Perl Perltidy Path' not set!" + " Please set this in the Atom Beautify package settings.");
    }
    args = ['"' + options.perltidy_path + '"', '--standard-output', '--standard-error-output', '--quiet'];
    if (options.perltidy_profile) {
      args.push('"--profile=' + options.perltidy_profile + '"');
    }
    args.push('"' + inputPath + '"');
    cmd = args.join(' ');
    return cmd;
  };

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);
