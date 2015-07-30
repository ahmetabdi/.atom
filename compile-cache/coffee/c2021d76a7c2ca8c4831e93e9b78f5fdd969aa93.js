(function() {
  "use strict";
  var Beautifier, JSBeautify,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = JSBeautify = (function(_super) {
    __extends(JSBeautify, _super);

    function JSBeautify() {
      return JSBeautify.__super__.constructor.apply(this, arguments);
    }

    JSBeautify.prototype.name = "JS Beautify";

    JSBeautify.prototype.options = {
      HTML: true,
      Handlebars: true,
      Mustache: true,
      Marko: true,
      JavaScript: true,
      JSON: true,
      CSS: true
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var beautifyCSS, beautifyHTML, beautifyJS, err;
        try {
          switch (language) {
            case "JSON":
            case "JavaScript":
              beautifyJS = require("js-beautify");
              text = beautifyJS(text, options);
              return resolve(text);
            case "Handlebars":
            case "Mustache":
              options.indent_handlebars = true;
              beautifyHTML = require("js-beautify").html;
              text = beautifyHTML(text, options);
              return resolve(text);
            case "HTML (Liquid)":
            case "HTML":
            case "XML":
            case "Marko":
            case "Web Form/Control (C#)":
            case "Web Handler (C#)":
              beautifyHTML = require("js-beautify").html;
              text = beautifyHTML(text, options);
              return resolve(text);
            case "CSS":
              beautifyCSS = require("js-beautify").css;
              text = beautifyCSS(text, options);
              return resolve(text);
          }
        } catch (_error) {
          err = _error;
          return reject(err);
        }
      });
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);
