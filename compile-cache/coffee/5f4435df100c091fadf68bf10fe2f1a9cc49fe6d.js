
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  var cliBeautify, getCmd;

  getCmd = function(inputPath, outputPath, options) {
    var cmd, fixerOption, fixers, level, levelOption, phpCsFixerPath;
    phpCsFixerPath = options.cs_fixer_path;
    fixers = options.fixers;
    level = options.level;
    levelOption = "";
    fixerOption = "";
    if (level) {
      levelOption = " --level=" + level + " ";
    }
    if (fixers) {
      fixerOption = " --fixers=" + fixers + " ";
    }
    if (process.platform === 'win32') {
      cmd = "" + levelOption + " " + fixerOption + " \"" + inputPath + "\") & move \"" + inputPath + "\" \"" + outputPath + "\"";
    } else {
      cmd = "" + levelOption + " " + fixerOption + " \"" + inputPath + "\") || (mv \"" + inputPath + "\" \"" + outputPath + "\")";
    }
    if (phpCsFixerPath) {
      return "(php \"" + phpCsFixerPath + "\" fix " + cmd;
    } else {
      return "(php-cs-fixer fix " + cmd;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  module.exports = cliBeautify(getCmd);

}).call(this);
