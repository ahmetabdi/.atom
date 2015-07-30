
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var cfg, cliBeautify, expandHomeDir, getCmd, path;

  cliBeautify = require("../cli-beautify");

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  getCmd = function(inputPath, outputPath, options, cb) {
    var basePath, configPath, done, editor, lang, uncrustifyPath;
    uncrustifyPath = options.uncrustifyPath;
    done = function(configPath) {
      var cmd;
      configPath = expandHomeDir(configPath);
      if (uncrustifyPath) {
        cmd = "" + uncrustifyPath + " -c \"" + configPath + "\" -f \"" + inputPath + "\" -o \"" + outputPath + "\" -l \"" + lang + "\"";
      } else {
        cmd = "uncrustify -c \"" + configPath + "\" -f \"" + inputPath + "\" -o \"" + outputPath + "\" -l \"" + lang + "\"";
      }
      return cb(cmd);
    };
    configPath = options.configPath;
    lang = options.languageOverride || "C";
    if (!configPath) {
      cfg(options, function(error, cPath) {
        if (error) {
          throw error;
        }
        return done(cPath);
      });
    } else {
      editor = atom.workspace.getActiveEditor();
      if (editor != null) {
        basePath = path.dirname(editor.getPath());
        configPath = path.resolve(basePath, configPath);
        done(configPath);
      } else {
        cb(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
      }
    }
  };

  module.exports = cliBeautify(getCmd);

}).call(this);
