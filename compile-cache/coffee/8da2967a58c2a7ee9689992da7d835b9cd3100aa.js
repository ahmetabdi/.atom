
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var optionsStr, path;
    path = options.sqlformat_path;
    optionsStr = "--reindent";
    if (options.indent_size != null) {
      optionsStr += " --indent_width=" + options.indent_size;
    }
    if (options.keywords != null) {
      optionsStr += " --keywords=" + options.keywords;
    }
    if (options.identifiers) {
      optionsStr += " --identifiers=" + options.identifiers;
    }
    if (path) {
      return "python \"" + path + "\" \"" + inputPath + "\" " + optionsStr;
    } else {
      return "sqlformat \"" + inputPath + "\" " + optionsStr;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);
