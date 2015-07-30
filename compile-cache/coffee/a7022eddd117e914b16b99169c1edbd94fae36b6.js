(function() {
  "use strict";
  var $, LoadingView, MessagePanelView, PlainMessageView, Subscriber, async, beautifier, beautify, beautifyDirectory, beautifyFile, beautifyFilePath, debug, defaultLanguageOptions, dir, fs, getCursors, handleSaveEvent, languages, options, path, pkg, plugin, setCursors, strip, yaml, _;

  pkg = require('../package.json');

  plugin = module.exports;

  _ = require("lodash");

  beautifier = require("./language-options");

  languages = beautifier.languages;

  defaultLanguageOptions = beautifier.defaultLanguageOptions;

  options = require("./options");

  fs = null;

  path = require("path");

  strip = null;

  yaml = null;

  async = null;

  dir = null;

  LoadingView = null;

  MessagePanelView = null;

  PlainMessageView = null;

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
    var allOptions, beautifyCompleted, e, editedFilePath, editor, forceEntireFile, grammarName, isSelection, oldText, onSave, showError, text;
    onSave = _arg.onSave;
    if (path == null) {
      path = require("path");
    }
    if (MessagePanelView == null) {
      MessagePanelView = require('atom-message-panel').MessagePanelView;
    }
    if (PlainMessageView == null) {
      PlainMessageView = require('atom-message-panel').PlainMessageView;
    }
    if (LoadingView == null) {
      LoadingView = require("./loading-view");
    }
    if (this.messagePanel == null) {
      this.messagePanel = new MessagePanelView({
        title: 'Atom Beautify Error Messages'
      });
    }
    if (this.loadingView == null) {
      this.loadingView = new LoadingView();
    }
    this.loadingView.show();
    forceEntireFile = onSave && atom.config.get("atom-beautify.beautifyEntireFileOnSave");
    showError = (function(_this) {
      return function(e) {
        _this.loadingView.hide();
        if (!atom.config.get("atom-beautify.muteAllErrors")) {
          _this.messagePanel.attach();
          return _this.messagePanel.add(new PlainMessageView({
            message: e.message,
            className: 'text-error'
          }));
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
    allOptions = options.getOptionsForPath(editedFilePath, editor);
    text = void 0;
    if (!forceEntireFile && isSelection) {
      text = editor.getSelectedText();
    } else {
      text = editor.getText();
    }
    oldText = text;
    grammarName = editor.getGrammar().name;
    try {
      beautifier.beautify(text, grammarName, allOptions, beautifyCompleted);
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
      allOptions = options.getOptionsForPath(filePath);
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
        return beautifier.beautify(input, grammarName, allOptions, completionFun);
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
    var addHeader, addInfo, allOptions, configOptions, debugInfo, editor, editorConfigOptions, editorOptions, filePath, grammarName, homeOptions, projectOptions, text;
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
    addInfo('Original File Contents', "\n```" + grammarName + "\n" + text + "\n```");
    addHeader(2, "Beautification options");
    allOptions = options.getOptionsForPath(filePath, editor);
    editorOptions = allOptions[0], configOptions = allOptions[1], homeOptions = allOptions[2], editorConfigOptions = allOptions[3];
    projectOptions = allOptions.slice(4);
    addInfo('Editor Options', "\n" + "Options from Atom Editor settings\n" + ("```json\n" + (JSON.stringify(editorOptions, void 0, 4)) + "\n```"));
    addInfo('Config Options', "\n" + "Options from Atom Beautify package settings\n" + ("```json\n" + (JSON.stringify(configOptions, void 0, 4)) + "\n```"));
    addInfo('Home Options', "\n" + ("Options from `" + (path.resolve(options.getUserHome(), '.jsbeautifyrc')) + "`\n") + ("```json\n" + (JSON.stringify(homeOptions, void 0, 4)) + "\n```"));
    addInfo('EditorConfig Options', "\n" + "Options from [EditorConfig](http://editorconfig.org/) file\n" + ("```json\n" + (JSON.stringify(editorConfigOptions, void 0, 4)) + "\n```"));
    addInfo('Project Options', "\n" + ("Options from `.jsbeautifyrc` files starting from directory `" + (path.dirname(filePath)) + "` and going up to root\n") + ("```json\n" + (JSON.stringify(projectOptions, void 0, 4)) + "\n```"));
    addHeader(2, "Logs");
    addInfo('Error logs', '*Not yet supported*');
    atom.clipboard.write(debugInfo);
    return confirm('Atom Beautify debugging information is now in your clipboard.\n' + 'You can now paste this into an Issue you are reporting here\n' + 'https://github.com/Glavin001/atom-beautify/issues/ \n\n' + 'Warning: Be sure to look over the debug info before you send it, to ensure you are not sharing undesirable private information.');
  };

  handleSaveEvent = (function(_this) {
    return function() {
      atom.workspace.observeTextEditors(function(editor) {
        var buffer, events;
        buffer = editor.getBuffer();
        plugin.unsubscribe(buffer);
        if (atom.config.get("atom-beautify.beautifyOnSave")) {
          events = "will-be-saved";
          plugin.subscribe(buffer, events, beautify.bind(_this, {
            onSave: true
          }));
        }
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
    beautifyOnSave: {
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
    },
    disabledLanguages: {
      type: 'array',
      "default": [],
      items: {
        type: 'string'
      },
      description: "An array of languages/grammars to disable Beautification for"
    }
  }, defaultLanguageOptions);

  plugin.activate = function() {
    handleSaveEvent();
    plugin.subscribe(atom.config.observe("atom-beautify.beautifyOnSave", handleSaveEvent));
    atom.commands.add("atom-workspace", "beautify:beautify-editor", beautify);
    atom.commands.add("atom-workspace", "beautify:debug", debug);
    atom.commands.add(".tree-view .file .name", "beautify:beautify-file", beautifyFile);
    return atom.commands.add(".tree-view .directory .name", "beautify:beautify-directory", beautifyDirectory);
  };

}).call(this);
