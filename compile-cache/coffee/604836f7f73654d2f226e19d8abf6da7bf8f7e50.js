
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var cliBeautify, getCmd;

  cliBeautify = require("./cli-beautify");

  getCmd = function(inputPath, outputPath, options) {
    var cmd, htmlBeautifierPath;
    htmlBeautifierPath = options.htmlbeautifier_path;
    cmd = "< \"" + inputPath + "\" > \"" + outputPath + "\"";
    if (htmlBeautifierPath) {
      return "\"" + htmlBeautifierPath + "\" " + cmd;
    } else {
      return "htmlbeautifier " + cmd;
    }
  };

  module.exports = cliBeautify(getCmd);

}).call(this);
