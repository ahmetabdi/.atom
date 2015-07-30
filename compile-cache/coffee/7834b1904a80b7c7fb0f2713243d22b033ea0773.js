
/*
Language Support and default options.
 */

(function() {
  "use strict";
  var Analytics, allowUnsafeEval, analyticsWriteKey, beautifyCSS, beautifyCoffeeScript, beautifyHTML, beautifyHTMLERB, beautifyJS, beautifyLESS, beautifyMarkdown, beautifyPHP, beautifyPerl, beautifyPython, beautifyRuby, beautifySQL, beautifyTypeScript, defaultIndentChar, defaultIndentSize, defaultIndentWithTabs, extend, pkg, softTabs, tabLength, uncrustifyBeautifier, _;

  _ = null;

  extend = null;

  beautifyJS = null;

  beautifyHTML = null;

  beautifyCSS = null;

  beautifySQL = null;

  beautifyPerl = null;

  beautifyPHP = null;

  beautifyPython = null;

  beautifyRuby = null;

  beautifyLESS = null;

  beautifyCoffeeScript = null;

  uncrustifyBeautifier = null;

  beautifyHTMLERB = null;

  beautifyMarkdown = null;

  beautifyTypeScript = null;

  Analytics = null;

  allowUnsafeEval = require('loophole').allowUnsafeEval;

  allowUnsafeEval(function() {
    return Analytics = require("analytics-node");
  });

  pkg = require("../package.json");

  analyticsWriteKey = "u3c26xkae8";

  tabLength = atom.config.get('editor.tabLength');

  softTabs = atom.config.get('editor.softTabs');

  defaultIndentSize = (softTabs ? tabLength : 1);

  defaultIndentChar = (softTabs ? " " : "\t");

  defaultIndentWithTabs = !softTabs;

  module.exports = {
    languages: ["js", "html", "css", "sql", "perl", "php", "python", "ruby", "coffeescript", "c", "cpp", "cs", "markdown", "objectivec", "java", "d", "pawn", "vala", "typescript"],
    defaultLanguageOptions: {
      js_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      js_indent_char: {
        type: 'string',
        "default": defaultIndentChar,
        minimum: 0,
        description: "Indentation character"
      },
      js_indent_level: {
        type: 'integer',
        "default": 0,
        description: "Initial indentation level"
      },
      js_indent_with_tabs: {
        type: 'boolean',
        "default": defaultIndentWithTabs,
        description: "Indentation uses tabs, overrides `Indent Size` and `Indent Char`"
      },
      js_preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      js_max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      js_space_in_paren: {
        type: 'boolean',
        "default": false,
        description: "Add padding spaces within paren, ie. f( a, b )"
      },
      js_jslint_happy: {
        type: 'boolean',
        "default": false,
        description: "Enable jslint-stricter mode"
      },
      js_space_after_anon_function: {
        type: 'boolean',
        "default": false,
        description: "Add a space before an anonymous function's parens, ie. function ()"
      },
      js_brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "expand", "end-expand", "none"],
        description: "[collapse|expand|end-expand|none]"
      },
      js_break_chained_methods: {
        type: 'boolean',
        "default": false,
        description: "Break chained method calls across subsequent lines"
      },
      js_keep_array_indentation: {
        type: 'boolean',
        "default": false,
        description: "Preserve array indentation"
      },
      js_keep_function_indentation: {
        type: 'boolean',
        "default": false,
        description: ""
      },
      js_space_before_conditional: {
        type: 'boolean',
        "default": true,
        description: ""
      },
      js_eval_code: {
        type: 'boolean',
        "default": false,
        description: ""
      },
      js_unescape_strings: {
        type: 'boolean',
        "default": false,
        description: "Decode printable characters encoded in xNN notation"
      },
      js_wrap_line_length: {
        type: 'integer',
        "default": 0,
        description: "Wrap lines at next opportunity after N characters"
      },
      js_end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      css_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      css_indent_char: {
        type: 'string',
        "default": defaultIndentChar,
        minimum: 0,
        description: "Indentation character"
      },
      css_selector_separator_newline: {
        type: 'boolean',
        "default": false,
        description: "Add a newline between multiple selectors"
      },
      css_newline_between_rules: {
        type: 'boolean',
        "default": false,
        description: "Add a newline between CSS rules"
      },
      css_preserve_newlines: {
        type: 'boolean',
        "default": false,
        description: "(Only LESS/SASS/SCSS with Prettydiff) " + "Retain empty lines. " + "Consecutive empty lines will be converted to a single empty line."
      },
      html_htmlbeautifier_path: {
        title: "htmlbeautifier path",
        type: 'string',
        "default": "",
        description: "Path to the `htmlbeautifier` CLI executable"
      },
      html_indent_inner_html: {
        type: 'boolean',
        "default": false,
        description: "Indent <head> and <body> sections."
      },
      html_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      html_indent_char: {
        type: 'string',
        "default": defaultIndentChar,
        minimum: 0,
        description: "Indentation character"
      },
      html_brace_style: {
        type: 'string',
        "default": "collapse",
        "enum": ["collapse", "expand", "end-expand", "none"],
        description: "[collapse|expand|end-expand|none]"
      },
      html_indent_scripts: {
        type: 'string',
        "default": "normal",
        "enum": ["keep", "separate", "normal"],
        description: "[keep|separate|normal]"
      },
      html_wrap_line_length: {
        type: 'integer',
        "default": 250,
        description: "Maximum characters per line (0 disables)"
      },
      html_wrap_attributes: {
        type: 'string',
        "default": "auto",
        "enum": ["auto", "force"],
        description: "Wrap attributes to new lines [auto|force]"
      },
      html_wrap_attributes_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indent wrapped attributes to after N characters"
      },
      html_preserve_newlines: {
        type: 'boolean',
        "default": true,
        description: "Preserve line-breaks"
      },
      html_max_preserve_newlines: {
        type: 'integer',
        "default": 10,
        description: "Number of line-breaks to be preserved in one chunk"
      },
      html_unformatted: {
        type: 'array',
        "default": ['a', 'sub', 'sup', 'b', 'i', 'u'],
        items: {
          type: 'string'
        },
        description: "List of tags (defaults to inline) that should not be reformatted"
      },
      html_end_with_newline: {
        type: 'boolean',
        "default": false,
        description: "End output with newline"
      },
      sql_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      sql_keywords: {
        type: 'string',
        "default": "upper",
        description: "Change case of keywords",
        "enum": ["lower", "upper", "capitalize"]
      },
      sql_identifiers: {
        type: 'string',
        "default": "lower",
        description: "Change case of identifiers",
        "enum": ["lower", "upper", "capitalize"]
      },
      sql_sqlformat_path: {
        type: 'string',
        "default": "",
        description: "Path to the `sqlformat` CLI executable"
      },
      markdown_pandoc_path: {
        type: 'string',
        "default": "",
        description: "Path to the `pandoc` CLI executable"
      },
      markdown_yaml_front_matter: {
        type: 'boolean',
        "default": true,
        description: "Should also format YAML Front Matter (Jekyll) in Markdown"
      },
      perl_perltidy_path: {
        type: 'string',
        "default": "perltidy",
        description: "Path to the `perltidy` CLI executable"
      },
      perl_perltidy_profile: {
        type: 'string',
        "default": "",
        description: "Specify a configuration file which will override the default name of .perltidyrc"
      },
      php_cs_fixer_path: {
        type: 'string',
        "default": "",
        description: "Path to the `php-cs-fixer` CLI executable"
      },
      php_fixers: {
        type: 'string',
        "default": "",
        description: "Add fixer(s). i.e. linefeed,-short_tag,indentation"
      },
      php_level: {
        type: 'string',
        "default": "",
        description: "By default, all PSR-2 fixers and some additional ones are run."
      },
      python_autopep8_path: {
        type: 'string',
        "default": "",
        description: "Path to the `autopep8` CLI executable"
      },
      python_max_line_length: {
        type: 'integer',
        "default": 79,
        description: "set maximum allowed line length"
      },
      python_indent_size: {
        type: 'integer',
        "default": defaultIndentSize,
        minimum: 0,
        description: "Indentation size/length"
      },
      python_ignore: {
        type: 'array',
        "default": ["E24"],
        items: {
          type: 'string'
        },
        description: "do not fix these errors/warnings"
      },
      ruby_rbeautify_path: {
        type: 'string',
        "default": "",
        description: "Path to the `rbeautify` CLI executable"
      },
      c_uncrustifyPath: {
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      c_configPath: {
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      cpp_uncrustifyPath: {
        title: "C++ Uncrustify Path",
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      cpp_configPath: {
        title: "C++ Config Path",
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      objectivec_uncrustifyPath: {
        title: "Objective-C Uncrustify Path",
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      objectivec_configPath: {
        title: "Objective-C Config Path",
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      cs_uncrustifyPath: {
        title: "C# Uncrustify Path",
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      cs_configPath: {
        title: "C# Config Path",
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      d_uncrustifyPath: {
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      d_configPath: {
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      java_uncrustifyPath: {
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      java_configPath: {
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      pawn_uncrustifyPath: {
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      pawn_configPath: {
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      },
      vala_uncrustifyPath: {
        type: 'string',
        "default": "",
        description: "Path to the `uncrustify` CLI executable"
      },
      vala_configPath: {
        type: 'string',
        "default": "",
        description: "Path to uncrustify config file. i.e. uncrustify.cfg"
      }
    },
    beautify: function(text, grammar, allOptions, beautifyCompleted) {
      var analytics, options, self, unsupportedGrammar, userId, uuid, version, _ref;
      self = this;
      unsupportedGrammar = false;
      options = void 0;
      if (((_ref = atom.config.get("atom-beautify.disabledLanguages")) != null ? _ref.indexOf(grammar) : void 0) > -1) {
        return beautifyCompleted(null);
      }
      switch (grammar) {
        case "JSON":
        case "JavaScript":
          if (beautifyJS == null) {
            beautifyJS = require("js-beautify");
          }
          text = beautifyJS(text, self.getOptions("js", allOptions));
          beautifyCompleted(text);
          break;
        case "CoffeeScript":
          if (beautifyCoffeeScript == null) {
            beautifyCoffeeScript = require("./langs/coffeescript-beautify");
          }
          beautifyCoffeeScript(text, self.getOptions("js", allOptions), beautifyCompleted);
          break;
        case "Handlebars":
        case "HTML (Mustache)":
          allOptions.push({
            indent_handlebars: true
          });
          if (beautifyHTML == null) {
            beautifyHTML = require("js-beautify").html;
          }
          text = beautifyHTML(text, self.getOptions("html", allOptions));
          beautifyCompleted(text);
          break;
        case "HTML (Liquid)":
        case "HTML":
        case "XML":
        case "Marko":
        case "Web Form/Control (C#)":
        case "Web Handler (C#)":
          if (beautifyHTML == null) {
            beautifyHTML = require("js-beautify").html;
          }
          text = beautifyHTML(text, self.getOptions("html", allOptions));
          beautifyCompleted(text);
          break;
        case "HTML (Ruby - ERB)":
        case "HTML (Rails)":
          if (beautifyHTMLERB == null) {
            beautifyHTMLERB = require("./langs/html-erb-beautify");
          }
          beautifyHTMLERB(text, self.getOptions("html", allOptions), beautifyCompleted);
          break;
        case "CSS":
          if (beautifyCSS == null) {
            beautifyCSS = require("js-beautify").css;
          }
          text = beautifyCSS(text, self.getOptions("css", allOptions));
          beautifyCompleted(text);
          break;
        case "Sass":
        case "SCSS":
        case "LESS":
          if (beautifyLESS == null) {
            beautifyLESS = require("./langs/css-prettydiff-beautify");
          }
          beautifyLESS(text, self.getOptions("css", allOptions), beautifyCompleted);
          break;
        case "SQL (Rails)":
        case "SQL":
          if (beautifySQL == null) {
            beautifySQL = require("./langs/sql-beautify");
          }
          beautifySQL(text, self.getOptions("sql", allOptions), beautifyCompleted);
          break;
        case "Perl":
          if (beautifyPerl == null) {
            beautifyPerl = require("./langs/perl-beautify");
          }
          beautifyPerl(text, self.getOptions("perl", allOptions), beautifyCompleted);
          break;
        case "PHP":
          if (beautifyPHP == null) {
            beautifyPHP = require("./langs/php-beautify");
          }
          beautifyPHP(text, self.getOptions("php", allOptions), beautifyCompleted);
          break;
        case "Python":
          if (beautifyPython == null) {
            beautifyPython = require("./langs/python-beautify");
          }
          beautifyPython(text, self.getOptions("python", allOptions), beautifyCompleted);
          break;
        case "Ruby":
        case "Ruby on Rails":
          if (beautifyRuby == null) {
            beautifyRuby = require("./langs/ruby-beautify");
          }
          beautifyRuby(text, self.getOptions("ruby", allOptions), beautifyCompleted);
          break;
        case "GitHub Markdown":
          if (beautifyMarkdown == null) {
            beautifyMarkdown = require("./langs/markdown-beautify");
          }
          beautifyMarkdown(text, self.getOptions("markdown", allOptions), beautifyCompleted);
          break;
        case "C":
          options = self.getOptions("c", allOptions);
          options.languageOverride = "C";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "C++":
          options = self.getOptions("cpp", allOptions);
          options.languageOverride = "CPP";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "C#":
          options = self.getOptions("cs", allOptions);
          options.languageOverride = "CS";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Objective-C":
        case "Objective-C++":
          options = self.getOptions("objectivec", allOptions);
          options.languageOverride = "OC+";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "D":
          options = self.getOptions("d", allOptions);
          options.languageOverride = "D";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Pawn":
          options = self.getOptions("pawn", allOptions);
          options.languageOverride = "PAWN";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Vala":
          options = self.getOptions("vala", allOptions);
          options.languageOverride = "VALA";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "Java":
          options = self.getOptions("java", allOptions);
          options.languageOverride = "JAVA";
          if (uncrustifyBeautifier == null) {
            uncrustifyBeautifier = require("./langs/uncrustify/");
          }
          uncrustifyBeautifier(text, options, beautifyCompleted);
          break;
        case "TypeScript":
          if (beautifyTypeScript == null) {
            beautifyTypeScript = require("./langs/typescript-beautify");
          }
          beautifyTypeScript(text, self.getOptions("js", allOptions), beautifyCompleted);
          break;
        default:
          unsupportedGrammar = true;
      }
      if (atom.config.get("atom-beautify.analytics")) {
        analytics = new Analytics(analyticsWriteKey);
        if (!atom.config.get("atom-beautify._analyticsUserId")) {
          uuid = require("node-uuid");
          atom.config.set("atom-beautify._analyticsUserId", uuid.v4());
        }
        userId = atom.config.get("atom-beautify._analyticsUserId");
        analytics.identify({
          userId: userId
        });
        version = pkg.version;
        analytics.track({
          userId: atom.config.get("atom-beautify._analyticsUserId"),
          event: "Beautify",
          properties: {
            grammar: grammar,
            version: version,
            options: allOptions,
            label: grammar,
            category: version
          }
        });
      }
      if (unsupportedGrammar) {
        if (atom.config.get("atom-beautify.muteUnsupportedLanguageErrors")) {
          return beautifyCompleted(null);
        } else {
          throw new Error("Unsupported language for grammar '" + grammar + "'.");
        }
      }
    },
    getOptions: function(selection, allOptions) {
      var options, self;
      self = this;
      if (_ == null) {
        _ = require("lodash");
      }
      if (extend == null) {
        extend = require("extend");
      }
      options = _.reduce(allOptions, function(result, currOptions) {
        var collectedConfig, containsNested, key;
        containsNested = false;
        collectedConfig = {};
        key = void 0;
        for (key in currOptions) {
          if (_.indexOf(self.languages, key) >= 0 && typeof currOptions[key] === "object") {
            containsNested = true;
            break;
          }
        }
        if (!containsNested) {
          _.merge(collectedConfig, currOptions);
        } else {
          _.merge(collectedConfig, currOptions[selection]);
        }
        return extend(result, collectedConfig);
      }, {});
      return options;
    }
  };

}).call(this);
