
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var optionsStr, path;
    path = options.autopep8_path;
    optionsStr = "";
    if (options.max_line_length != null) {
      optionsStr += "--max-line-length " + options.max_line_length;
    }
    if (options.indent_size != null) {
      optionsStr += " --indent-size " + options.indent_size;
    }
    if (options.ignore != null) {
      optionsStr += " --ignore " + options.ignore.join(",");
    }
    if (path) {
      return "" + path + " \"" + inputPath + "\" " + optionsStr;
    } else {
      return "autopep8 \"" + inputPath + "\" " + optionsStr;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);
