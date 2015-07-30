
/*
Requires https://github.com/erniebrodeur/ruby-beautify
 */

(function() {
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var path;
    path = options.rbeautify_path;
    if (path) {
      return "ruby \"" + path + "\" \"" + inputPath + "\"";
    } else {
      return "rbeautify \"" + inputPath + "\"";
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);
