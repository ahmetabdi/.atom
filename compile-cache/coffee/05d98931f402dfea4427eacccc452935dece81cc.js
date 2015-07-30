(function() {
  var GotoView, SymbolIndex;

  SymbolIndex = require('./symbol-index');

  GotoView = require('./goto-view');

  module.exports = {
    configDefaults: {
      logToConsole: false,
      moreIgnoredNames: '',
      autoScroll: true
    },
    index: null,
    gotoView: null,
    activate: function(state) {
      this.index = new SymbolIndex(state != null ? state.entries : void 0);
      this.gotoView = new GotoView();
      atom.workspaceView.command("goto:project-symbol", (function(_this) {
        return function() {
          return _this.gotoProjectSymbol();
        };
      })(this));
      atom.workspaceView.command("goto:file-symbol", (function(_this) {
        return function() {
          return _this.gotoFileSymbol();
        };
      })(this));
      atom.workspaceView.command("goto:declaration", (function(_this) {
        return function() {
          return _this.gotoDeclaration();
        };
      })(this));
      atom.workspaceView.command("goto:rebuild-index", (function(_this) {
        return function() {
          return _this.index.rebuild();
        };
      })(this));
      return atom.workspaceView.command("goto:invalidate-index", (function(_this) {
        return function() {
          return _this.index.invalidate();
        };
      })(this));
    },
    deactivate: function() {
      var _ref, _ref1;
      if ((_ref = this.index) != null) {
        _ref.destroy();
      }
      this.index = null;
      if ((_ref1 = this.gotoView) != null) {
        _ref1.destroy();
      }
      return this.gotoView = null;
    },
    serialize: function() {
      return {
        'entries': this.index.entries
      };
    },
    gotoDeclaration: function() {
      var symbols;
      symbols = this.index.gotoDeclaration();
      if (symbols) {
        return this.gotoView.populate(symbols);
      }
    },
    gotoProjectSymbol: function() {
      var symbols;
      symbols = this.index.getAllSymbols();
      return this.gotoView.populate(symbols);
    },
    gotoFileSymbol: function() {
      var e, filePath, symbols, v;
      v = atom.workspaceView.getActiveView();
      e = v != null ? v.getEditor() : void 0;
      filePath = e != null ? e.getPath() : void 0;
      if (filePath) {
        symbols = this.index.getEditorSymbols(e);
        return this.gotoView.populate(symbols, v);
      }
    }
  };

}).call(this);
