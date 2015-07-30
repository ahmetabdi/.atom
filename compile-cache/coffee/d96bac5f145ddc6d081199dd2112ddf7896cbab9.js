(function() {
  var DataAtomView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = DataAtomView = (function(_super) {
    __extends(DataAtomView, _super);

    function DataAtomView() {
      return DataAtomView.__super__.constructor.apply(this, arguments);
    }

    DataAtomView.content = function() {
      return this.div({
        "class": 'panel-heading padded heading header-view results-header'
      }, (function(_this) {
        return function() {
          _this.span('Data Results on', {
            "class": 'heading-title',
            outlet: 'title'
          });
          _this.span({
            "class": ''
          }, function() {
            _this.select({
              outlet: 'connectionList',
              "class": '',
              change: 'onConnectionSelected'
            }, function() {
              return _this.option('Select connection...', {
                value: '0',
                disabled: true
              });
            });
            _this.button('New Connection...', {
              "class": 'btn btn-default',
              click: 'onNewConnection',
              outlet: 'connectionBtn'
            });
            return _this.button('Disconnect', {
              "class": 'btn btn-default',
              click: 'onDisconnect',
              outlet: 'disconnectBtn'
            });
          });
          return _this.span({
            "class": 'heading-close icon-remove-close pull-right',
            outlet: 'closeButton',
            click: 'close'
          });
        };
      })(this));
    };

    DataAtomView.prototype.close = function() {
      return atom.workspaceView.trigger('data-atom:toggle-results-view');
    };

    DataAtomView.prototype.initialize = function() {
      this.connectionList.disable();
      return this.disconnectBtn.disable();
    };

    DataAtomView.prototype.onConnectionSelected = function(e) {
      return this.trigger('data-atom:connection-changed');
    };

    DataAtomView.prototype.addConnection = function(connectionName) {
      this.connectionList.append('<option value="' + connectionName + '">' + connectionName + '</option>');
      this.connectionList.children("option[value='" + connectionName + "']").prop('selected', true);
      this.connectionList.enable();
      return this.disconnectBtn.enable();
    };

    DataAtomView.prototype.setConnection = function(connectionName) {
      return this.connectionList.children("option[value='" + connectionName + "']").prop('selected', true);
    };

    DataAtomView.prototype.getSelectedConnection = function() {
      return this.connectionList.children(":selected").attr('value');
    };

    DataAtomView.prototype.onNewConnection = function() {
      return this.trigger('data-atom:new-connection');
    };

    DataAtomView.prototype.onDisconnect = function() {
      this.connectionList.children(":selected").remove();
      if (!(this.connectionList.children().length > 1)) {
        this.disconnectBtn.disable();
        this.connectionList.disable();
      }
      this.connectionList.children("option[value='0']").prop('selected', true);
      return this.trigger('data-atom:disconnect');
    };

    return DataAtomView;

  })(View);

}).call(this);
