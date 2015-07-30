(function() {
  "use strict";
  var prettydiff;

  prettydiff = require("prettydiff");

  module.exports = function(text, options, callback) {
    var args, output, result;
    args = {
      source: text,
      lang: "css",
      mode: "beautify",
      inchar: options.indent_character,
      insize: options.indent_size,
      alphasort: options.alphasort || false,
      preserve: (options.preserve_newlines === true ? "all" : "none")
    };
    output = prettydiff.api(args);
    result = output[0];
    callback(result);
    return result;
  };

}).call(this);
