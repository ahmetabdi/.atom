
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var cliBeautify, getCmd;

  cliBeautify = require("./cli-beautify");

  getCmd = function(inputPath, outputPath, options) {
    return "htmlbeautifier < \"" + inputPath + "\" > \"" + outputPath + "\"";
  };

  module.exports = cliBeautify(getCmd);

}).call(this);
