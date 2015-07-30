
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  var cliBeautify, getCmd;

  getCmd = function(inputPath, outputPath, options) {
    var cmd, directoryFilters, filters, phpBeautifierPath;
    phpBeautifierPath = options.beautifier_path;
    filters = options.filters;
    directoryFilters = options.directory_filters;
    cmd = "--input \"" + inputPath + "\" --output \"" + outputPath + "\"";
    if (filters) {
      cmd += " --filters \"" + filters + "\"";
    }
    if (directoryFilters) {
      cmd += " --directory_filters \"" + directoryFilters + "\"";
    }
    if (phpBeautifierPath) {
      return "php \"" + phpBeautifierPath + "\" " + cmd;
    } else {
      return "php_beautifier " + cmd;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  module.exports = cliBeautify(getCmd);

}).call(this);
