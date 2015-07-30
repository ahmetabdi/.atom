(function() {
  "use strict";
  var Beautifier, PrettyDiff,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Beautifier = require('./beautifier');

  module.exports = PrettyDiff = (function(_super) {
    __extends(PrettyDiff, _super);

    function PrettyDiff() {
      return PrettyDiff.__super__.constructor.apply(this, arguments);
    }

    PrettyDiff.prototype.name = "Pretty Diff";

    PrettyDiff.prototype.options = {
      _: {
        inchar: "indent_char",
        insize: "indent_size",
        alphasort: function(alphasort) {
          return alphasort || false;
        },
        preserve: [
          'preserve_newlines', function(preserve_newlines) {
            if (preserve_newlines === true) {
              return "all";
            } else {
              return "none";
            }
          }
        ]
      },
      CSV: true,
      ERB: true,
      EJS: true,
      HTML: true,
      XML: true,
      Spacebars: true,
      JSX: true,
      JavaScript: true,
      CSS: true,
      SCSS: true,
      Sass: true,
      JSON: true,
      TSS: true,
      LESS: true
    };

    PrettyDiff.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var args, lang, output, prettydiff, result, _;
        prettydiff = require("prettydiff");
        _ = require('lodash');
        lang = "auto";
        switch (language) {
          case "CSV":
            lang = "csv";
            break;
          case "EJS":
          case "ERB":
          case "Handlebars":
          case "Mustache":
          case "Spacebars":
          case "XML":
            lang = "markup";
            break;
          case "HTML":
            lang = "html";
            break;
          case "JavaScript":
          case "JSON":
          case "JSX":
            lang = "javascript";
            break;
          case "CSS":
          case "LESS":
          case "SCSS":
          case "Sass":
            lang = "css";
            break;
          case "TSS":
            lang = "tss";
            break;
          default:
            lang = "auto";
        }
        args = {
          source: text,
          lang: lang,
          mode: "beautify"
        };
        _.merge(options, args);
        output = prettydiff.api(options);
        result = output[0];
        return resolve(result);
      });
    };

    return PrettyDiff;

  })(Beautifier);

}).call(this);
