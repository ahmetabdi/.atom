(function() {
  "use strict";
  var TF;

  TF = require("typescript-formatter/typescript-toolbox/lib/formatter");

  module.exports = function(text, options, callback) {
    var opts, result;
    opts = TF.createDefaultFormatCodeOptions();
    opts.TabSize = options.tab_width;
    opts.IndentSize = options.indent_size;
    result = TF.applyFormatterToContent(text, opts);
    callback(result);
    return result;
  };

}).call(this);
