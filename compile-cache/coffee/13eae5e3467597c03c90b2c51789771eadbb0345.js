(function() {
  var __slice = [].slice;

  module.exports = {
    activate: function(state) {
      var commands, record, _fn, _i, _len, _ref;
      commands = {
        "pane:merge-all-panes": function() {
          var firstPane, item, pane, rest, _i, _len, _ref, _results;
          _ref = atom.workspace.getPanes(), firstPane = _ref[0], rest = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
          _results = [];
          for (_i = 0, _len = rest.length; _i < _len; _i++) {
            pane = rest[_i];
            _results.push((function() {
              var _j, _len1, _ref1, _results1;
              _ref1 = pane.getItems();
              _results1 = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                item = _ref1[_j];
                _results1.push(pane.moveItemToPane(item, firstPane));
              }
              return _results1;
            })());
          }
          return _results;
        }
      };
      _ref = [['left', 'splitLeft', 'Split Left'], ['right', 'splitRight', 'Split Right'], ['up', 'splitUp', 'Split Up'], ['down', 'splitDown', 'Split Down']];
      _fn = function(_arg) {
        var desc, dir, method;
        dir = _arg[0], method = _arg[1], desc = _arg[2];
        commands["pane:split-" + dir + "-creating-empty-pane"] = function() {
          var currentPane;
          currentPane = atom.workspace.getActivePane();
          return currentPane != null ? currentPane[method]() : void 0;
        };
        commands["pane:split-" + dir + "-creating-new-file"] = function() {
          var currentPane, newPane, _ref1;
          currentPane = atom.workspace.getActivePane();
          newPane = currentPane != null ? currentPane[method]() : void 0;
          return (_ref1 = atom.views.getView(newPane)) != null ? _ref1.dispatchEvent(new CustomEvent('application:new-file')) : void 0;
        };
        return commands["pane:split-" + dir + "-moving-current-tab"] = function() {
          var currentPane, currentTab, newPane;
          currentPane = atom.workspace.getActivePane();
          if (currentPane != null) {
            newPane = currentPane[method]();
            currentTab = currentPane.getActiveItem();
            if ((newPane != null) && (currentTab != null)) {
              return currentPane.moveItemToPane(currentTab, newPane);
            }
          }
        };
      };
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        record = _ref[_i];
        _fn(record);
      }
      return this.subscriptions = atom.commands.add('atom-pane', commands);
    },
    deactivate: function() {
      var _ref;
      return (_ref = this.subscriptions) != null ? _ref.dispose() : void 0;
    },
    serialize: function() {}
  };

}).call(this);
