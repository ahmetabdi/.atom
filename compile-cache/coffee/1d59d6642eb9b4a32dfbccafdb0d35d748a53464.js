
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  "use strict";
  var exec, fs, temp;

  fs = require("fs");

  temp = require("temp").track();

  exec = require("child_process").exec;

  module.exports = function(getCmd, isStdout) {
    return function(text, options, callback) {
      temp.open("input", function(err, info) {
        if (!err) {
          fs.write(info.fd, text || "", function() {
            fs.close(info.fd, function(err) {
              var cmd, deleteOutputFile, e, outputPath, processCmd;
              if (!err) {
                outputPath = temp.path();
                deleteOutputFile = function() {
                  temp.cleanup();
                  fs.unlink(outputPath, function(err) {});
                };
                processCmd = function(cmd, optCallback) {
                  var $path, cb, config, isWin;
                  if ((optCallback != null) && typeof optCallback === "function") {
                    cb = callback;
                    callback = function(output) {
                      return optCallback(output, cb);
                    };
                  }
                  if (typeof cmd === "string") {
                    config = {
                      env: process.env
                    };
                    isWin = /^win/.test(process.platform);
                    if (!isWin) {
                      $path = "[ -f ~/.bash_profile ] && source ~/.bash_profile;";
                      $path += "[ -f ~/.bashrc ] && source ~/.bashrc;";
                      cmd = $path + cmd;
                    }
                    return exec(cmd, config, function(err, stdout, stderr) {
                      if (!err) {
                        if (isStdout) {
                          callback(stdout);
                          deleteOutputFile();
                        } else {
                          fs.readFile(outputPath, "utf8", function(err, newText) {
                            callback(newText);
                            deleteOutputFile();
                          });
                        }
                      } else {
                        console.error("Beautifcation Error: ", err);
                        callback(err);
                        deleteOutputFile();
                      }
                    });
                  } else if (cmd instanceof Error) {
                    return callback(cmd);
                  } else {
                    console.error("CLI Beautifier command not valid.");
                    return callback(new Error("CLI Beautifier command not valid." + (" Invalid command '" + cmd + "'.")));
                  }
                };
                try {
                  cmd = getCmd(info.path, outputPath, options, processCmd);
                } catch (_error) {
                  e = _error;
                  return callback(e);
                }
                if (typeof cmd === "string") {
                  processCmd(cmd);
                } else if (cmd instanceof Error) {
                  return callback(cmd);
                }
              }
            });
          });
        }
      });
    };
  };

}).call(this);
