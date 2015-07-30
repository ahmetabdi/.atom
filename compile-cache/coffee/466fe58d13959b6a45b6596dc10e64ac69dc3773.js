(function() {
  var Analytics, Beautifiers, Languages, Promise, allowUnsafeEval, analyticsWriteKey, editorconfig, extend, fs, logger, path, pkg, strip, yaml, _, _plus,
    __slice = [].slice;

  _ = require('lodash');

  _plus = require('underscore-plus');

  Promise = require('bluebird');

  Languages = require('../languages/');

  path = require('path');

  logger = require('../logger')(__filename);

  extend = null;

  Analytics = null;

  fs = null;

  strip = null;

  yaml = null;

  editorconfig = null;

  allowUnsafeEval = require('loophole').allowUnsafeEval;

  allowUnsafeEval(function() {
    return Analytics = require("analytics-node");
  });

  pkg = require("../../package.json");

  analyticsWriteKey = "u3c26xkae8";


  /*
  Register all supported beautifiers
   */

  module.exports = Beautifiers = (function() {

    /*
    List of beautifier names
    
    To register a beautifier add it's name here
     */
    Beautifiers.prototype.beautifierNames = ['uncrustify', 'autopep8', 'coffee-formatter', 'coffee-fmt', 'htmlbeautifier', 'csscomb', 'gofmt', 'js-beautify', 'perltidy', 'php-cs-fixer', 'prettydiff', 'rubocop', 'ruby-beautify', 'sqlformat', 'tidy-markdown', 'typescript-formatter'];


    /*
    List of loaded beautifiers
    
    Autogenerated in `constructor` from `beautifierNames`
     */

    Beautifiers.prototype.beautifiers = null;


    /*
    All beautifier options
    
    Autogenerated in `constructor`
     */

    Beautifiers.prototype.options = null;


    /*
    Languages
     */

    Beautifiers.prototype.languages = new Languages();


    /*
    Constructor
     */

    function Beautifiers() {
      this.beautifiers = _.map(this.beautifierNames, function(name) {
        var Beautifier;
        Beautifier = require("./" + name);
        return new Beautifier();
      });
      this.options = this.buildOptionsForBeautifiers(this.beautifiers);
    }


    /*
     */

    Beautifiers.prototype.buildOptionsForBeautifiers = function(beautifiers) {
      var allOptions, beautifier, beautifierName, f, field, fields, flatOptions, fn, laOp, lang, langName, langOptions, languageName, languages, name, op, ops, optionName, options, prefix, _i, _j, _k, _l, _len, _len1, _len2, _name, _name1, _ref, _ref1, _ref10, _ref11, _ref12, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      langOptions = {};
      languages = {};
      _ref = this.languages.languages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        lang = _ref[_i];
        if (langOptions[_name = lang.name] == null) {
          langOptions[_name] = {};
        }
        if (languages[_name1 = lang.name] == null) {
          languages[_name1] = lang;
        }
        options = langOptions[lang.name];
        lang.beautifiers = [];
        _ref1 = lang.options;
        for (field in _ref1) {
          op = _ref1[field];
          if (op.title == null) {
            op.title = _plus.uncamelcase(field).split('.').map(_plus.capitalize).join(' ');
          }
          op.title = "" + lang.name + " - " + op.title;
          op.beautifiers = [];
          options[field] = op;
        }
      }
      for (_j = 0, _len1 = beautifiers.length; _j < _len1; _j++) {
        beautifier = beautifiers[_j];
        beautifierName = beautifier.name;
        _ref2 = beautifier.options;
        for (languageName in _ref2) {
          options = _ref2[languageName];
          laOp = langOptions[languageName];
          if (typeof options === "boolean") {
            if ((_ref3 = languages[languageName]) != null) {
              _ref3.beautifiers.push(beautifierName);
            }
            if (options === true) {
              if (laOp) {
                for (field in laOp) {
                  op = laOp[field];
                  op.beautifiers.push(beautifierName);
                }
              } else {
                logger.warn("Could not find options for language: " + languageName);
              }
            }
          } else if (typeof options === "object") {
            for (field in options) {
              op = options[field];
              if (typeof op === "boolean") {
                if (op === true) {
                  if ((_ref4 = languages[languageName]) != null) {
                    _ref4.beautifiers.push(beautifierName);
                  }
                  if (laOp != null) {
                    if ((_ref5 = laOp[field]) != null) {
                      _ref5.beautifiers.push(beautifierName);
                    }
                  }
                }
              } else if (typeof op === "string") {
                if ((_ref6 = languages[languageName]) != null) {
                  _ref6.beautifiers.push(beautifierName);
                }
                if (laOp != null) {
                  if ((_ref7 = laOp[op]) != null) {
                    _ref7.beautifiers.push(beautifierName);
                  }
                }
              } else if (typeof op === "function") {
                if ((_ref8 = languages[languageName]) != null) {
                  _ref8.beautifiers.push(beautifierName);
                }
                if (laOp != null) {
                  if ((_ref9 = laOp[field]) != null) {
                    _ref9.beautifiers.push(beautifierName);
                  }
                }
              } else if (_.isArray(op)) {
                fields = 2 <= op.length ? __slice.call(op, 0, _k = op.length - 1) : (_k = 0, []), fn = op[_k++];
                if ((_ref10 = languages[languageName]) != null) {
                  _ref10.beautifiers.push(beautifierName);
                }
                for (_l = 0, _len2 = fields.length; _l < _len2; _l++) {
                  f = fields[_l];
                  if (laOp != null) {
                    if ((_ref11 = laOp[f]) != null) {
                      _ref11.beautifiers.push(beautifierName);
                    }
                  }
                }
              } else {
                logger.warn("Unsupported option:", beautifierName, languageName, field, op, langOptions);
              }
            }
          }
        }
      }
      for (langName in langOptions) {
        ops = langOptions[langName];
        lang = languages[langName];
        prefix = lang.namespace;
        for (field in ops) {
          op = ops[field];
          delete ops[field];
          ops["" + prefix + "_" + field] = op;
        }
      }
      allOptions = _.values(langOptions);
      flatOptions = _.reduce(allOptions, (function(result, languageOptions, language) {
        return _.reduce(languageOptions, (function(result, optionDef, optionName) {
          if (optionDef.beautifiers.length > 0) {
            optionDef.description = "" + optionDef.description + " (Supported by " + (optionDef.beautifiers.join(', ')) + ")";
          } else {
            optionDef.description = "" + optionDef.description + " (Not supported by any beautifiers)";
          }
          if (result[optionName] != null) {
            logger.warn("Duplicate option detected: ", optionName, optionDef);
          }
          result[optionName] = optionDef;
          return result;
        }), result);
      }), {});
      for (langName in languages) {
        lang = languages[langName];
        name = lang.name;
        beautifiers = lang.beautifiers;
        optionName = "language_" + lang.namespace;
        flatOptions["" + optionName + "_disabled"] = {
          title: "Language Config - " + name + " - Disable Beautifying Language",
          type: 'boolean',
          "default": false,
          description: "Disable " + name + " Beautification"
        };
        flatOptions["" + optionName + "_default_beautifier"] = {
          title: "Language Config - " + name + " - Default Beautifier",
          type: 'string',
          "default": (_ref12 = lang.defaultBeautifier) != null ? _ref12 : beautifiers[0],
          description: "Default Beautifier to be used for " + name,
          "enum": _.uniq(beautifiers)
        };
      }
      return flatOptions;
    };


    /*
     */

    Beautifiers.prototype.getBeautifiers = function(language, options) {
      return _.filter(this.beautifiers, function(beautifier) {
        return _.contains(beautifier.languages, language);
      });
    };

    Beautifiers.prototype.beautify = function(text, allOptions, grammar, filePath) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var analytics, beautifier, beautifiers, fallback, fileExtension, langDisabled, language, languages, options, preferredBeautifierName, transformOptions, unsupportedGrammar, userId, uuid, version, _i, _len, _ref;
          logger.info('beautify', text, allOptions, grammar, filePath);
          fileExtension = path.extname(filePath);
          languages = _this.languages.getLanguages({
            grammar: grammar,
            fileExtension: fileExtension
          });
          if (languages.length < 1) {
            unsupportedGrammar = true;
          } else {
            language = languages[0];
            langDisabled = atom.config.get("atom-beautify.language_" + language.namespace + "_disabled");
            preferredBeautifierName = atom.config.get("atom-beautify.language_" + language.namespace + "_default_beautifier");
            unsupportedGrammar = false;
            if (langDisabled) {
              return resolve(null);
            }
            options = _this.getOptions(language.namespace, allOptions) || {};
            if (language.fallback != null) {
              _ref = language.fallback;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                fallback = _ref[_i];
                options = _.merge(_this.getOptions(fallback, allOptions) || {}, options);
              }
            }
            logger.verbose(grammar, language);
            beautifiers = _this.getBeautifiers(language.name, options);
            if (beautifiers.length < 1) {
              unsupportedGrammar = true;
            } else {
              beautifier = _.find(beautifiers, function(beautifier) {
                return beautifier.name === preferredBeautifierName;
              }) || beautifiers[0];
              logger.verbose('beautifier', beautifier.name, beautifiers);
              transformOptions = function(beautifier, languageName, options) {
                var beautifierOptions, field, fields, fn, op, transformedOptions, vals, _j;
                beautifierOptions = beautifier.options[languageName];
                if (typeof beautifierOptions === "boolean") {
                  return options;
                } else if (typeof beautifierOptions === "object") {
                  transformedOptions = {};
                  for (field in beautifierOptions) {
                    op = beautifierOptions[field];
                    if (typeof op === "string") {
                      transformedOptions[field] = options[op];
                    } else if (typeof op === "function") {
                      transformedOptions[field] = op(options[field]);
                    } else if (typeof op === "boolean") {
                      if (op === true) {
                        transformedOptions[field] = options[field];
                      }
                    } else if (_.isArray(op)) {
                      fields = 2 <= op.length ? __slice.call(op, 0, _j = op.length - 1) : (_j = 0, []), fn = op[_j++];
                      vals = _.map(fields, function(f) {
                        return options[f];
                      });
                      transformedOptions[field] = fn.apply(null, vals);
                    }
                  }
                  return transformedOptions;
                } else {
                  logger.warn("Unsupported Language options: ", beautifierOptions);
                  return options;
                }
              };
              options = transformOptions(beautifier, language.name, options);
              beautifier.beautify(text, language.name, options).then(resolve)["catch"](reject);
            }
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
                language: language != null ? language.name : void 0,
                grammar: grammar,
                extension: fileExtension,
                version: version,
                options: allOptions,
                label: language != null ? language.name : void 0,
                category: version
              }
            });
          }
          if (unsupportedGrammar) {
            if (atom.config.get("atom-beautify.muteUnsupportedLanguageErrors")) {
              return resolve(null);
            } else {
              return reject(new Error("Unsupported language for grammar '" + grammar + "' with extension '" + fileExtension + "'."));
            }
          }
        };
      })(this));
    };

    Beautifiers.prototype.findFileResults = {};

    Beautifiers.prototype.getUserHome = function() {
      return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    };

    Beautifiers.prototype.verifyExists = function(fullPath) {
      if (fs == null) {
        fs = require("fs");
      }
      if (fs.existsSync(fullPath)) {
        return fullPath;
      } else {
        return null;
      }
    };


    /*
    Searches for a file with a specified name starting with
    'dir' and going all the way up either until it finds the file
    or hits the root.
    
    @param {string} name filename to search for (e.g. .jshintrc)
    @param {string} dir directory to start search from (default:
    current working directory)
    @param {boolean} upwards should recurse upwards on failure? (default: true)
    
    @returns {string} normalized filename
     */

    Beautifiers.prototype.findFile = function(name, dir, upwards) {
      var filename, parent;
      if (upwards == null) {
        upwards = true;
      }
      if (path == null) {
        path = require("path");
      }
      dir = dir || process.cwd();
      filename = path.normalize(path.join(dir, name));
      if (this.findFileResults[filename] !== undefined) {
        return this.findFileResults[filename];
      }
      parent = path.resolve(dir, "../");
      if (this.verifyExists(filename)) {
        this.findFileResults[filename] = filename;
        return filename;
      }
      if (dir === parent) {
        this.findFileResults[filename] = null;
        return null;
      }
      if (upwards) {
        return findFile(name, parent);
      } else {
        return null;
      }
    };


    /*
    Tries to find a configuration file in either project directory
    or in the home directory. Configuration files are named
    '.jsbeautifyrc'.
    
    @param {string} config name of the configuration file
    @param {string} file path to the file to be linted
    @param {boolean} upwards should recurse upwards on failure? (default: true)
    
    @returns {string} a path to the config file
     */

    Beautifiers.prototype.findConfig = function(config, file, upwards) {
      var dir, envs, home, proj;
      if (upwards == null) {
        upwards = true;
      }
      if (path == null) {
        path = require("path");
      }
      dir = path.dirname(path.resolve(file));
      envs = this.getUserHome();
      home = path.normalize(path.join(envs, config));
      proj = this.findFile(config, dir, upwards);
      if (proj) {
        return proj;
      }
      if (this.verifyExists(home)) {
        return home;
      }
      return null;
    };

    Beautifiers.prototype.getConfigOptionsFromSettings = function(langs) {
      var config, options;
      config = atom.config.get('atom-beautify');
      options = {};
      _.every(_.keys(config), function(k) {
        var idx, lang, opt, p;
        p = k.split("_")[0];
        idx = _.indexOf(langs, p);
        if (idx >= 0) {
          lang = langs[idx];
          opt = k.replace(new RegExp("^" + lang + "_"), "");
          options[lang] = options[lang] || {};
          options[lang][opt] = config[k];
        }
        return true;
      });
      return options;
    };

    Beautifiers.prototype.getConfig = function(startPath, upwards) {
      var configPath, contents, e, externalOptions;
      if (upwards == null) {
        upwards = true;
      }
      startPath = (typeof startPath === "string" ? startPath : "");
      if (!startPath) {
        return {};
      }
      configPath = this.findConfig(".jsbeautifyrc", startPath, upwards);
      externalOptions = void 0;
      if (configPath) {
        if (fs == null) {
          fs = require("fs");
        }
        contents = fs.readFileSync(configPath, {
          encoding: "utf8"
        });
        if (!contents) {
          externalOptions = {};
        } else {
          try {
            if (strip == null) {
              strip = require("strip-json-comments");
            }
            externalOptions = JSON.parse(strip(contents));
          } catch (_error) {
            e = _error;
            try {
              if (yaml == null) {
                yaml = require("yaml-front-matter");
              }
              externalOptions = yaml.safeLoad(contents);
            } catch (_error) {
              e = _error;
              logger.verbose("Failed parsing config as YAML and JSON: " + configPath);
              externalOptions = {};
            }
          }
        }
      } else {
        externalOptions = {};
      }
      return externalOptions;
    };

    Beautifiers.prototype.getOptionsForPath = function(editedFilePath, editor) {
      var allOptions, configOptions, editorConfigOptions, editorOptions, homeOptions, isSelection, languageNamespaces, p, pc, pf, projectOptions, softTabs, tabLength, userHome;
      languageNamespaces = this.languages.namespaces;
      editorOptions = {};
      if (editor != null) {
        isSelection = !!editor.getSelectedText();
        softTabs = editor.softTabs;
        tabLength = editor.getTabLength();
        editorOptions = {
          indent_size: (softTabs ? tabLength : 1),
          indent_char: (softTabs ? " " : "\t"),
          indent_with_tabs: !softTabs
        };
      }
      configOptions = this.getConfigOptionsFromSettings(languageNamespaces);
      userHome = this.getUserHome();
      homeOptions = this.getConfig(path.join(userHome, "FAKEFILENAME"), false);
      if (editedFilePath != null) {
        if (editorconfig == null) {
          editorconfig = require('editorconfig');
        }
        editorConfigOptions = editorconfig.parse(editedFilePath);
        if (editorConfigOptions.indent_style === 'space') {
          editorConfigOptions.indent_char = " ";
        } else if (editorConfigOptions.indent_style === 'tab') {
          editorConfigOptions.indent_char = "\t";
          editorConfigOptions.indent_with_tabs = true;
          if (editorConfigOptions.tab_width) {
            editorConfigOptions.indent_size = editorConfigOptions.tab_width;
          }
        }
        projectOptions = [];
        p = path.dirname(editedFilePath);
        while (p !== path.resolve(p, "../")) {
          pf = path.join(p, "FAKEFILENAME");
          pc = this.getConfig(pf, false);
          projectOptions.push(pc);
          p = path.resolve(p, "../");
        }
      } else {
        editorConfigOptions = {};
        projectOptions = [];
      }
      allOptions = [editorOptions, configOptions, homeOptions, editorConfigOptions];
      allOptions = allOptions.concat(projectOptions);
      return allOptions;
    };

    Beautifiers.prototype.getOptions = function(selection, allOptions) {
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
          if (_.indexOf(self.languages.namespaces, key) >= 0 && typeof currOptions[key] === "object") {
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
    };

    return Beautifiers;

  })();

}).call(this);
