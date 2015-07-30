(function() {
  var $, DataAtomController, DataAtomView, DataResultView, DbFactory, NewConnectionView;

  $ = require('atom').$;

  DataAtomView = require('./data-atom-view');

  DataResultView = require('./data-result-view');

  NewConnectionView = require('./new-connection-view');

  DbFactory = require('./data-managers/db-factory');


  /*
  The main entry and controller for Data Atom.
  - A single DataAtomView is used, shown or hidden based on the state of a editor
  - A DataResultView is kept for each editor and swapped in/out of the DataAtomView as required
  - This gives the feeling that each editor has their own results but we only have 1 single toolbar for connections etc.
   */

  module.exports = DataAtomController = (function() {
    function DataAtomController(serializeState) {
      this.viewToEditor = {};
      this.mainView = new DataAtomView();
      this.mainView.on('data-atom:new-connection', (function(_this) {
        return function() {
          return _this.createNewConnection();
        };
      })(this));
      this.mainView.on('data-atom:disconnect', (function(_this) {
        return function() {
          return _this.onDisconnect();
        };
      })(this));
      this.mainView.on('data-atom:connection-changed', (function(_this) {
        return function() {
          return _this.onConnectionChanged();
        };
      })(this));
      this.mainView.on('data-atom:result-view-height-changed', (function(_this) {
        return function(e) {
          return _this.currentViewState.height = $(e.target).height();
        };
      })(this));
      atom.workspaceView.command("data-atom:execute", (function(_this) {
        return function() {
          return _this.execute();
        };
      })(this));
      atom.workspaceView.command('data-atom:toggle-results-view', (function(_this) {
        return function() {
          return _this.toggleView();
        };
      })(this));
      atom.workspaceView.on('pane-container:active-pane-item-changed', (function(_this) {
        return function() {
          return _this.updateResultsView();
        };
      })(this));
    }

    DataAtomController.prototype.updateResultsView = function() {
      this.mainView.hide();
      this.currentViewState = null;
      if (atom.workspace.getActiveEditor() && atom.workspace.getActiveEditor().getPath()) {
        this.currentViewState = this.viewToEditor[atom.workspace.getActiveEditor().getPath()];
        if (this.currentViewState && this.currentViewState.isShowing) {
          return this.show();
        }
      }
    };

    DataAtomController.prototype.destroy = function() {
      this.mainView.off('data-atom:new-connection');
      return this.currentViewState = null;
    };

    DataAtomController.prototype.serialize = function() {};

    DataAtomController.prototype.getOrCreateCurrentResultView = function() {
      if (!this.currentViewState && !this.viewToEditor[atom.workspace.getActiveEditor().getPath()]) {
        this.viewToEditor[atom.workspace.getActiveEditor().getPath()] = {
          view: new DataResultView(),
          isShowing: false,
          dataManager: null
        };
      }
      return this.currentViewState = this.viewToEditor[atom.workspace.getActiveEditor().getPath()];
    };

    DataAtomController.prototype.show = function() {
      var _ref, _ref1;
      this.mainView.setResultView(this.getOrCreateCurrentResultView().view);
      this.mainView.headerView.setConnection((_ref = (_ref1 = this.currentViewState.dataManager) != null ? _ref1.getConnectionName() : void 0) != null ? _ref : '0');
      this.mainView.show();
      this.mainView.height(this.currentViewState.height);
      return this.currentViewState.isShowing = true;
    };

    DataAtomController.prototype.toggleView = function() {
      if (this.mainView.isShowing) {
        this.mainView.hide();
      } else {
        this.show();
      }
      return this.getOrCreateCurrentResultView().isShowing = this.mainView.isShowing;
    };

    DataAtomController.prototype.onConnectionChanged = function() {
      var key, selectedName, value, _ref, _ref1, _results;
      selectedName = this.mainView.headerView.getSelectedConnection();
      _ref = this.viewToEditor;
      _results = [];
      for (key in _ref) {
        value = _ref[key];
        if (((_ref1 = value.dataManager) != null ? _ref1.getConnectionName() : void 0) === selectedName) {
          this.currentViewState.dataManager = value.dataManager;
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    DataAtomController.prototype.onDisconnect = function() {
      var key, value, _ref, _ref1;
      this.currentViewState.dataManager.destroy();
      _ref = this.viewToEditor;
      for (key in _ref) {
        value = _ref[key];
        if (((_ref1 = value.dataManager) != null ? _ref1.getConnectionName() : void 0) === this.currentViewState.dataManager.getConnectionName()) {
          value.dataManager = null;
        }
      }
      return this.currentViewState.dataManager = null;
    };

    DataAtomController.prototype.createNewConnection = function(thenDo) {
      var ncv;
      ncv = new NewConnectionView((function(_this) {
        return function(url) {
          var dbmanager;
          dbmanager = DbFactory.createDataManagerForUrl(url);
          _this.getOrCreateCurrentResultView().dataManager = dbmanager;
          _this.mainView.headerView.addConnection(dbmanager.getConnectionName());
          if (thenDo) {
            return thenDo();
          }
        };
      })(this));
      return ncv.show();
    };

    DataAtomController.prototype.execute = function() {
      if (!this.currentViewState || !this.currentViewState.dataManager) {
        return this.createNewConnection((function(_this) {
          return function() {
            return _this.actuallyExecute(_this.currentViewState);
          };
        })(this));
      } else {
        return this.actuallyExecute(this.currentViewState);
      }
    };

    DataAtomController.prototype.actuallyExecute = function(executingViewState) {
      var editor, query;
      this.show();
      executingViewState.view.clear();
      editor = atom.workspace.getActiveEditor();
      query = editor.getSelectedText() ? editor.getSelectedText() : editor.getText();
      return executingViewState.dataManager.execute(query, (function(_this) {
        return function(result) {
          if (result.message) {
            return executingViewState.view.setMessage(result.message);
          } else {
            return executingViewState.view.setResults(result);
          }
        };
      })(this), (function(_this) {
        return function(err) {
          return executingViewState.view.setMessage(err);
        };
      })(this));
    };

    return DataAtomController;

  })();

}).call(this);
