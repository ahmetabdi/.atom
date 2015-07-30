(function() {
  var beautifier, editorconfig, fs, languages, path, strip, yaml, _;

  _ = require("lodash");

  path = require("path");

  fs = null;

  strip = null;

  yaml = null;

  editorconfig = null;

  beautifier = require("./language-options");

  languages = beautifier.languages;

  module.exports = {
    findFileResults: {},
    getUserHome: function() {
      return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    },
    verifyExists: function(fullPath) {
      if (fs == null) {
        fs = require("fs");
      }
      if (fs.existsSync(fullPath)) {
        return fullPath;
      } else {
        return null;
      }
    },

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
    findFile: function(name, dir, upwards) {
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
    },

    /*
    Tries to find a configuration file in either project directory
    or in the home directory. Configuration files are named
    '.jsbeautifyrc'.
    
    @param {string} config name of the configuration file
    @param {string} file path to the file to be linted
    @param {boolean} upwards should recurse upwards on failure? (default: true)
    
    @returns {string} a path to the config file
     */
    findConfig: function(config, file, upwards) {
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
    },
    getConfigOptionsFromSettings: function(langs) {
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
    },
    getConfig: function(startPath, upwards) {
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
              console.log("Failed parsing config as YAML and JSON: " + configPath);
              externalOptions = {};
            }
          }
        }
      } else {
        externalOptions = {};
      }
      return externalOptions;
    },
    getOptionsForPath: function(editedFilePath, editor) {
      var allOptions, configOptions, editorConfigOptions, editorOptions, homeOptions, isSelection, p, pc, pf, projectOptions, softTabs, tabLength, userHome;
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
      configOptions = this.getConfigOptionsFromSettings(languages);
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
    }
  };

}).call(this);
