
/*
Requires http: //johnmacfarlane.net/pandoc/
 */

(function() {
  var allowUnsafeNewFunction, cliBeautify, fs, getCmd, yaml;

  fs = null;

  yaml = null;

  allowUnsafeNewFunction = null;

  getCmd = function(inputPath, outputPath, options, cb) {
    var cmd, optionsStr, pandocPath, yamlFrontMatter;
    optionsStr = " --read markdown --write markdown --output \"" + outputPath + "\" \"" + inputPath + "\"";
    pandocPath = options.pandoc_path;
    yamlFrontMatter = options.yaml_front_matter;
    cmd = "";
    if (!pandocPath) {
      cmd = "pandoc" + optionsStr;
    } else {
      cmd = pandocPath + optionsStr;
    }
    if (yamlFrontMatter != null) {
      if (fs == null) {
        fs = require("fs");
      }
      fs.readFile(inputPath, function(err, contents) {
        var e, newContents, results;
        if (err) {
          return cb(err);
        }
        if (yaml == null) {
          yaml = require("yaml-front-matter");
        }
        if (allowUnsafeNewFunction == null) {
          allowUnsafeNewFunction = require("loophole").allowUnsafeNewFunction;
        }
        results = null;
        try {
          allowUnsafeNewFunction(function() {
            return results = yaml.loadFront(contents);
          });
        } catch (_error) {
          e = _error;
          return cb(e);
        }
        newContents = results.__content;
        delete results.__content;
        return fs.writeFile(inputPath, newContents, function(err) {
          var completionCallback;
          if (err) {
            return cb(err);
          }
          completionCallback = function(output, callback) {
            var front;
            try {
              front = yaml.dump(results);
              if (front !== "{}\n") {
                output = "---\n" + front + "---\n\n" + output;
              }
              return callback(output);
            } catch (_error) {
              e = _error;
              return callback(e);
            }
          };
          return cb(cmd, completionCallback);
        });
      });
    } else {
      return cmd;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  module.exports = cliBeautify(getCmd);

}).call(this);
