
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Languages, defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, extend, softTabs, tabLength, _;

  _ = require('lodash');

  extend = null;

  tabLength = atom.config.get('editor.tabLength');

  softTabs = atom.config.get('editor.softTabs');

  defaultIndentSize = (softTabs ? tabLength : 1);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = Languages = (function() {
    Languages.prototype.languageNames = ["c-sharp", "c", "coffeescript", "cpp", "css", "csv", "d", "ejs", "erb", "go", "handlebars", "html", "java", "javascript", "json", "jsx", "less", "markdown", 'marko', "mustache", "objective-c", "pawn", "perl", "php", "python", "ruby", "sass", "scss", "spacebars", "sql", "tss", "typescript", "vala", "xml"];


    /*
    Languages
     */

    Languages.prototype.languages = null;


    /*
    Namespaces
     */

    Languages.prototype.namespaces = null;


    /*
    Constructor
     */

    function Languages() {
      this.languages = _.map(this.languageNames, function(name) {
        return require("./" + name);
      });
      this.namespaces = _.map(this.languages, function(language) {
        return language.namespace;
      });
    }


    /*
    Get language for grammar and extension
     */

    Languages.prototype.getLanguages = function(_arg) {
      var extension, grammar, name, namespace;
      name = _arg.name, namespace = _arg.namespace, grammar = _arg.grammar, extension = _arg.extension;
      return _.union(_.filter(this.languages, function(language) {
        return _.isEqual(language.name, name);
      }), _.filter(this.languages, function(language) {
        return _.isEqual(language.namespace, namespace);
      }), _.filter(this.languages, function(language) {
        return _.contains(language.grammars, grammar);
      }), _.filter(this.languages, function(language) {
        return _.contains(language.extensions, extension);
      }));
    };

    return Languages;

  })();

}).call(this);
