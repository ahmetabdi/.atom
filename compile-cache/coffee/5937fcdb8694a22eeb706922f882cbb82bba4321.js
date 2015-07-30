(function() {
  "use strict";
  var $, Beautifiers, LoadingView, Subscriber, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, handleSaveEvent, path, pkg, plugin, setCursors, strip, yaml, _;

  pkg = require('../package.json');

  plugin = module.exports;

  _ = require("lodash");

  Beautifiers = require("./beautifiers");

  beautifier = new Beautifiers();

  defaultLanguageOptions = beautifier.options;

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  $ = null;

  getCursors = function(editor) {
    var bufferPosition, cursor, cursors, posArray, _i, _len;
    cursors = editor.getCursors();
    posArray = [];
    for (_i = 0, _len = cursors.length; _i < _len; _i++) {
      cursor = cursors[_i];
      bufferPosition = cursor.getBufferPosition();
      posArray.push([bufferPosition.row, bufferPosition.column]);
    }
    return posArray;
  };

  setCursors = function(editor, posArray) {
    var bufferPosition, i, _i, _len;
    for (i = _i = 0, _len = posArray.length; _i < _len; i = ++_i) {
      bufferPosition = posArray[i];
      if (i === 0) {
        editor.setCursorBufferPosition(bufferPosition);
        continue;
      }
      editor.addCursorAtBufferPosition(bufferPosition);
    }
  };

  beautify = function(_arg) {
    var allOptions, beautifyCompleted, detail, e, editedFilePath, editor, forceEntireFile, grammarName, isSelection, oldText, onSave, showError, text;
    onSave = _arg.onSave;
    if (atom.config.get("atom-beautify.beautifyOnSave") === true) {
      detail = "See issue https://github.com/Glavin001/atom-beautify/issues/308\n\nTo stop seeing this message:\n- Uncheck (disable) the deprecated \"Beautify On Save\" option\n\nTo enable Beautify on Save for a particular language:\n- Go to Atom Beautify's package settings\n- Find option for \"Language Config - <Your Language> - Beautify On Save\"\n- Check (enable) Beautify On Save option for that particular language\n";
      if (typeof atom !== "undefined" && atom !== null) {
        atom.notifications.addWarning("The option \"atom-beautify.beautifyOnSave\" has been deprecated", {
          detail: detail,
          dismissable: true
        });
      }
    }
    if (path == null) {
      path = require("path");
    }
    if (LoadingView == null) {
      LoadingView = require("./views/loading-view");
    }
    if (this.loadingView == null) {
      this.loadingView = new LoadingView();
    }
    this.loadingView.show();
    forceEntireFile = onSave && atom.config.get("atom-beautify.beautifyEntireFileOnSave");
    showError = (function(_this) {
      return function(error) {
        var stack, _ref;
        _this.loadingView.hide();
        if (!atom.config.get("atom-beautify.muteAllErrors")) {
          stack = error.stack;
          detail = error.message;
          return (_ref = atom.notifications) != null ? _ref.addError(error.message, {
            stack: stack,
            detail: detail,
            dismissable: true
          }) : void 0;
        }
      };
    })(this);
    beautifyCompleted = (function(_this) {
      return function(text) {
        var origScrollTop, posArray, selectedBufferRange;
        if (text == null) {

        } else if (text instanceof Error) {
          showError(text);
        } else if (typeof text === "string") {
          if (oldText !== text) {
            posArray = getCursors(editor);
            origScrollTop = editor.getScrollTop();
            if (!forceEntireFile && isSelection) {
              selectedBufferRange = editor.getSelectedBufferRange();
              editor.setTextInBufferRange(selectedBufferRange, text);
            } else {
              editor.setText(text);
            }
            setCursors(editor, posArray);
            setTimeout((function() {
              editor.setScrollTop(origScrollTop);
            }), 0);
          }
        } else {
          showError(new Error("Unsupported beautification result '" + text + "'."));
        }
        _this.loadingView.hide();
      };
    })(this);
    editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return showError(new Error("Active Editor not found. ", "Please select a Text Editor first to beautify."));
    }
    isSelection = !!editor.getSelectedText();
    editedFilePath = editor.getPath();
    allOptions = beautifier.getOptionsForPath(editedFilePath, editor);
    text = void 0;
    if (!forceEntireFile && isSelection) {
      text = editor.getSelectedText();
    } else {
      text = editor.getText();
    }
    oldText = text;
    grammarName = editor.getGrammar().name;
    try {
      beautifier.beautify(text, allOptions, grammarName, editedFilePath, {
        onSave: onSave
      }).then(beautifyCompleted)["catch"](beautifyCompleted);
    } catch (_error) {
      e = _error;
      showError(e);
    }
  };

  beautifyFilePath = function(filePath, callback) {
    var $el, cb;
    if ($ == null) {
      $ = require("space-pen").$;
    }
    $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
    $el.addClass('beautifying');
    cb = function(err, result) {
      $el = $(".icon-file-text[data-path=\"" + filePath + "\"]");
      $el.removeClass('beautifying');
      return callback(err, result);
    };
    if (fs == null) {
      fs = require("fs");
    }
    return fs.readFile(filePath, function(err, data) {
      var allOptions, completionFun, e, grammar, grammarName, input;
      if (err) {
        return cb(err);
      }
      input = data != null ? data.toString() : void 0;
      grammar = atom.grammars.selectGrammar(filePath, input);
      grammarName = grammar.name;
      allOptions = beautifier.getOptionsForPath(filePath);
      completionFun = function(output) {
        if (output instanceof Error) {
          return cb(output, null);
        } else if (typeof output === "string") {
          return fs.writeFile(filePath, output, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, output);
          });
        } else {
          return cb(new Error("Unknown beautification result " + output + "."), output);
        }
      };
      try {
        return beautifier.beautify(input, allOptions, grammarName, filePath).then(completionFun)["catch"](completionFun);
      } catch (_error) {
        e = _error;
        return cb(e);
      }
    });
  };

  beautifyFile = function(_arg) {
    var filePath, target;
    target = _arg.target;
    filePath = target.dataset.path;
    if (!filePath) {
      return;
    }
    beautifyFilePath(filePath, function(err, result) {
      if (err) {
        return console.error('beautifyFile error', err, result);
      }
    });
  };

  beautifyDirectory = function(_arg) {
    var $el, dirPath, target;
    target = _arg.target;
    dirPath = target.dataset.path;
    if (!dirPath) {
      return;
    }
    if ($ == null) {
      $ = require("space-pen").$;
    }
    $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
    $el.addClass('beautifying');
    if (dir == null) {
      dir = require("node-dir");
    }
    if (async == null) {
      async = require("async");
    }
    dir.files(dirPath, function(err, files) {
      if (err) {
        return console.error('beautifyDirectory error', err);
      }
      return async.each(files, function(filePath, callback) {
        return beautifyFilePath(filePath, function() {
          return callback();
        });
      }, function(err) {
        $el = $(".icon-file-directory[data-path=\"" + dirPath + "\"]");
        return $el.removeClass('beautifying');
      });
    });
  };

  debug = function() {
    var addHeader, addInfo, allOptions, cb, codeBlockSyntax, configOptions, debugInfo, e, editor, editorConfigOptions, editorOptions, filePath, grammarName, homeOptions, logger, logs, projectOptions, subscription, text;
    editor = atom.workspace.getActiveTextEditor();
    if (editor == null) {
      return confirm("Active Editor not found.\n" + "Please select a Text Editor first to beautify.");
    }
    if (!confirm('Are you ready to debug Atom Beautify?\n\n' + 'Warning: This will change your current clipboard contents.')) {
      return;
    }
    debugInfo = "";
    addInfo = function(key, val) {
      return debugInfo += "**" + key + "**: " + val + "\n\n";
    };
    addHeader = function(level, title) {
      return debugInfo += "" + (Array(level + 1).join('#')) + " " + title + "\n\n";
    };
    addHeader(1, "Atom Beautify - Debugging information");
    debugInfo += "The following debugging information was " + ("generated by `Atom Beautify` on `" + (new Date()) + "`.") + "\n\n---\n\n";
    addInfo('Platform', process.platform);
    addHeader(2, "Versions");
    addInfo('Atom Version', atom.appVersion);
    addInfo('Atom Beautify Version', pkg.version);
    addHeader(2, "Original file to be beautified");
    filePath = editor.getPath();
    addInfo('Original File Path', "`" + filePath + "`");
    grammarName = editor.getGrammar().name;
    addInfo('Original File Grammar', grammarName);
    text = editor.getText();
    codeBlockSyntax = grammarName.toLowerCase().split(' ')[0];
    addInfo('Original File Contents', "\n```" + codeBlockSyntax + "\n" + text + "\n```");
    addHeader(2, "Beautification options");
    allOptions = beautifier.getOptionsForPath(filePath, editor);
    editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
    projectOptions = allOptions.slice(4);
    addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
    addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
    addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(beautifier.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
    addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
    addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
    logs = "";
    logger = require('./logger')(__filename);
    subscription = logger.onLogging(function(msg) {
      return logs += msg;
    });
    cb = function(result) {
      subscription.dispose();
      addHeader(2, "Results");
      addInfo('Beautified File Contents', "\n```" + codeBlockSyntax + "\n" + result + "\n```");
      addInfo('Logs', "\n```\n" + logs + "\n```");
      atom.clipboard.write(debugInfo);
      return confirm('Atom Beautify debugging information is now in your clipboard.\n' + 'You can now paste this into an Issue you are reporting here\n' + 'https://github.com/Glavin001/atom-beautify/issues/ \n\n' + 'Warning: Be sure to look over the debug info before you send it, to ensure you are not sharing undesirable private information.');
    };
    try {
      return beautifier.beautify(text, allOptions, grammarName, filePath).then(cb)["catch"](cb);
    } catch (_error) {
      e = _error;
      return cb(e);
    }
  };

  handleSaveEvent = (function(_this) {
    return function() {
      return atom.workspace.observeTextEditors(function(editor) {
        var buffer, disposable;
        buffer = editor.getBuffer();
        disposable = buffer.onDidSave(function(_arg) {
          var beautifyOnSave, fileExtension, filePath, grammar, language, languages;
          filePath = _arg.path;
          if (path == null) {
            path = require('path');
          }
          grammar = editor.getGrammar().name;
          fileExtension = path.extname(filePath);
          languages = beautifier.languages.getLanguages({
            grammar: grammar,
            fileExtension: fileExtension
          });
          if (languages.length < 1) {
            return;
          }
          language = languages[0];
          beautifyOnSave = atom.config.get("atom-beautify.language_" + language.namespace + "_beautify_on_save");
          if (beautifyOnSave) {
            return beautifyFilePath(filePath, function() {
              return buffer.reload();
            });
          }
        });
        return plugin.subscribe(disposable);
      });
    };
  })(this);

  Subscriber = require(path.join(atom.packages.resourcePath, 'node_modules', 'emissary')).Subscriber;

  Subscriber.extend(plugin);

  plugin.config = _.merge({
    analytics: {
      type: 'boolean',
      "default": true,
      description: "Automatically send usage information (NEVER CODE) to Google Analytics"
    },
    _analyticsUserId: {
      type: 'string',
      "default": "",
      description: "Unique identifier for this user for tracking usage analytics"
    },
    _loggerLevel: {
      type: 'string',
      "default": 'warn',
      description: 'Set the level for the logger',
      "enum": ['verbose', 'debug', 'info', 'warn', 'error']
    },
    beautifyOnSave: {
      title: "DEPRECATED: Beautfy On Save",
      type: 'boolean',
      "default": false,
      description: "Beautify active editor on save"
    },
    beautifyEntireFileOnSave: {
      type: 'boolean',
      "default": true,
      description: "When beautifying on save, use the entire file, even if there is selected text in the editor"
    },
    muteUnsupportedLanguageErrors: {
      type: 'boolean',
      "default": false,
      description: "Do not show \"Unsupported Language\" errors when they occur"
    },
    muteAllErrors: {
      type: 'boolean',
      "default": false,
      description: "Do not show any/all errors when they occur"
    }
  }, defaultLanguageOptions);

  plugin.activate = function() {
    handleSaveEvent();
    plugin.subscribe(atom.config.observe("atom-beautify.beautifyOnSave", handleSaveEvent));
    atom.commands.add("atom-workspace", "atom-beautify:beautify-editor", beautify);
    atom.commands.add("atom-workspace", "atom-beautify:help-debug-editor", debug);
    atom.commands.add(".tree-view .file .name", "atom-beautify:beautify-file", beautifyFile);
    atom.commands.add(".tree-view .directory .name", "atom-beautify:beautify-directory", beautifyDirectory);
    return atom.commands.add("atom-workspace", "beautify:beautify-editor", function() {
      return typeof atom !== "undefined" && atom !== null ? atom.notifications.addWarning("The command \"beautify:beautify-editor\" has been removed and changed to \"atom-beautify:beautify-editor\".", {
        dismissable: true
      }) : void 0;
    });
  };

}).call(this);
