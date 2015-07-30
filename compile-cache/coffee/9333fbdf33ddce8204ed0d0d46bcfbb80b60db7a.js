(function() {
  var CompositeDisposable;

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = {
    disposables: new CompositeDisposable,
    config: {
      autoBuildTagsWhenActive: {
        title: 'Automatically rebuild tags',
        description: 'Rebuild tags file each time a project path changes',
        type: 'boolean',
        "default": false
      },
      buildTimeout: {
        title: 'Build timeout',
        description: 'Time (in milliseconds) to wait for a tags rebuild to finish',
        type: 'integer',
        "default": 5000
      },
      cmd: {
        type: 'string',
        "default": ""
      },
      cmdArgs: {
        type: 'string',
        "default": ""
      },
      extraTagFiles: {
        type: 'string',
        "default": ""
      }
    },
    provider: null,
    activate: function() {
      var initExtraTagsTime;
      this.stack = [];
      this.ctagsCache = require("./ctags-cache");
      this.ctagsCache.activate();
      if (atom.config.get('atom-ctags.autoBuildTagsWhenActive')) {
        if (atom.project.getPath()) {
          this.createFileView().rebuild();
        }
        this.disposables.add(atom.project.onDidChangePaths((function(_this) {
          return function(paths) {
            return _this.createFileView().rebuild();
          };
        })(this)));
      }
      atom.workspaceView.command('atom-ctags:rebuild', (function(_this) {
        return function(e, cmdArgs) {
          var t;
          if (Array.isArray(cmdArgs)) {
            _this.ctagsCache.cmdArgs = cmdArgs;
          }
          _this.createFileView().rebuild();
          if (t) {
            clearTimeout(t);
            return t = null;
          }
        };
      })(this));
      atom.workspaceView.command('atom-ctags:toggle-file-symbols', (function(_this) {
        return function() {
          return _this.createFileView().toggle();
        };
      })(this));
      atom.workspaceView.command('atom-ctags:toggle-project-symbols', (function(_this) {
        return function() {
          return _this.createFileView().toggleAll();
        };
      })(this));
      atom.workspaceView.command('atom-ctags:go-to-declaration', (function(_this) {
        return function() {
          return _this.createFileView().goto();
        };
      })(this));
      atom.workspaceView.command('atom-ctags:return-from-declaration', (function(_this) {
        return function() {
          return _this.createGoBackView().toggle();
        };
      })(this));
      atom.workspaceView.eachEditorView(function(editorView) {
        return editorView.on('mousedown', function(event) {
          if (!(event.altKey && event.which === 1)) {
            return;
          }
          return atom.workspaceView.trigger('atom-ctags:go-to-declaration');
        });
      });
      if (!atom.packages.isPackageDisabled("symbols-view")) {
        atom.packages.disablePackage("symbols-view");
        alert("Warning from atom-ctags: atom-ctags replaces and enhances the symbols-view package. Therefore, symbols-view has been disabled.");
      }
      initExtraTagsTime = null;
      return atom.config.observe('atom-ctags.extraTagFiles', (function(_this) {
        return function() {
          if (initExtraTagsTime) {
            clearTimeout(initExtraTagsTime);
          }
          return initExtraTagsTime = setTimeout((function() {
            _this.ctagsCache.initExtraTags(atom.config.get('atom-ctags.extraTagFiles').split(" "));
            return initExtraTagsTime = null;
          }), 1000);
        };
      })(this));
    },
    deactivate: function() {
      this.disposables.dispose();
      if (this.fileView != null) {
        this.fileView.destroy();
        this.fileView = null;
      }
      if (this.projectView != null) {
        this.projectView.destroy();
        this.projectView = null;
      }
      if (this.goToView != null) {
        this.goToView.destroy();
        this.goToView = null;
      }
      if (this.goBackView != null) {
        this.goBackView.destroy();
        this.goBackView = null;
      }
      return this.ctagsCache.deactivate();
    },
    createFileView: function() {
      var FileView;
      if (this.fileView == null) {
        FileView = require('./file-view');
        this.fileView = new FileView(this.stack);
        this.fileView.ctagsCache = this.ctagsCache;
      }
      return this.fileView;
    },
    createGoBackView: function() {
      var GoBackView;
      if (this.goBackView == null) {
        GoBackView = require('./go-back-view');
        this.goBackView = new GoBackView(this.stack);
      }
      return this.goBackView;
    },
    getProvider: function() {
      var CtagsProvider;
      if (this.provider != null) {
        return this.provider;
      }
      CtagsProvider = require('./ctags-provider');
      this.provider = new CtagsProvider();
      this.provider.ctagsCache = this.ctagsCache;
      return this.provider;
    },
    provide: function() {
      return {
        provider: this.getProvider()
      };
    }
  };

}).call(this);
