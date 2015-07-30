(function() {
  var $, DbFactory, EditorView, NewConnectionView, URL, View, _, _ref, _s,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  URL = require('url');

  _ref = require('atom'), $ = _ref.$, View = _ref.View, EditorView = _ref.EditorView;

  _ = require('underscore');

  _s = require('underscore.string');

  DbFactory = require('./data-managers/db-factory');

  module.exports = NewConnectionView = (function(_super) {
    __extends(NewConnectionView, _super);

    function NewConnectionView() {
      return NewConnectionView.__super__.constructor.apply(this, arguments);
    }

    NewConnectionView.content = function() {
      return this.div({
        "class": 'connection-dialog overlay from-top padded'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'inset-panel'
          }, function() {
            return _this.div({
              "class": 'panel-heading heading header-view'
            }, function() {
              return _this.span('New Connection', {
                "class": 'heading-title',
                outlet: 'title'
              });
            });
          });
          return _this.div({
            "class": 'panel-body padded form-horizontal'
          }, function() {
            _this.div({
              "class": 'form-group'
            }, function() {
              _this.label('URL', {
                "class": 'col-md-2 control-label'
              });
              return _this.div({
                "class": 'col-md-10'
              }, function() {
                return _this.subview('url', new EditorView({
                  mini: true
                }));
              });
            });
            _this.div({
              "class": 'form-group'
            }, function() {
              _this.label('DB Type', {
                "class": 'col-md-2 control-label'
              });
              return _this.div({
                "class": 'col-md-4'
              }, function() {
                return _this.select({
                  outlet: 'dbType',
                  "class": 'form-control'
                });
              });
            });
            _this.div({
              "class": 'form-group'
            }, function() {
              _this.label('Server', {
                "class": 'col-md-2 control-label'
              });
              _this.div({
                "class": 'col-md-5'
              }, function() {
                return _this.subview('dbServer', new EditorView({
                  mini: true,
                  placeholderText: 'localhost',
                  change: 'buildUrl'
                }));
              });
              _this.label('Port', {
                "class": 'col-md-2 control-label'
              });
              return _this.div({
                "class": 'col-md-3'
              }, function() {
                return _this.subview('dbPort', new EditorView({
                  mini: true
                }));
              });
            });
            _this.div({
              "class": 'form-group'
            }, function() {
              _this.label('Auth', {
                "class": 'col-md-2 control-label'
              });
              _this.div({
                "class": 'col-md-5'
              }, function() {
                return _this.subview('dbUser', new EditorView({
                  mini: true,
                  placeholderText: 'username'
                }));
              });
              return _this.div({
                "class": 'col-md-5'
              }, function() {
                return _this.subview('dbPassword', new EditorView({
                  mini: true,
                  placeholderText: 'password'
                }));
              });
            });
            _this.div({
              "class": 'form-group'
            }, function() {
              _this.label('Database', {
                "class": 'col-md-2 control-label'
              });
              return _this.div({
                "class": 'col-md-10'
              }, function() {
                return _this.subview('dbName', new EditorView({
                  mini: true,
                  placeholderText: 'database-name'
                }));
              });
            });
            _this.div({
              "class": 'form-group'
            }, function() {
              _this.label('Options', {
                "class": 'col-md-2 control-label'
              });
              return _this.div({
                "class": 'col-md-10'
              }, function() {
                return _this.subview('dbOptions', new EditorView({
                  mini: true,
                  placeholderText: 'option=value,ssl=true'
                }));
              });
            });
            return _this.div({
              "class": 'pull-right'
            }, function() {
              _this.button('Connect', {
                "class": 'btn btn-default',
                click: 'connect'
              });
              return _this.button('Close', {
                "class": 'btn btn-default btn-padding-left',
                click: 'close'
              });
            });
          });
        };
      })(this));
    };

    NewConnectionView.prototype.initialize = function(onConnectClicked) {
      var supportedDbs, type, _i, _len;
      this.onConnectClicked = onConnectClicked;
      this.placeholderUrlPart = '://user:pass@server/db-name';
      this.dbUser.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.buildUrl();
        };
      })(this));
      this.dbPassword.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.buildUrl();
        };
      })(this));
      this.dbServer.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.buildUrl();
        };
      })(this));
      this.dbPort.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.buildUrl();
        };
      })(this));
      this.dbName.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.buildUrl();
        };
      })(this));
      this.dbOptions.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.buildUrl();
        };
      })(this));
      this.url.getEditor().on('contents-modified', (function(_this) {
        return function() {
          return _this.seperateUrl();
        };
      })(this));
      supportedDbs = DbFactory.getSupportedDatabases();
      for (_i = 0, _len = supportedDbs.length; _i < _len; _i++) {
        type = supportedDbs[_i];
        this.dbType.append('<option value="' + type.prefix + '" data-port="' + type.port + '">' + type.name + '</option>');
      }
      this.urlPrefix = supportedDbs[0].prefix;
      this.url.setPlaceholderText(this.urlPrefix + this.placeholderUrlPart);
      this.dbPort.setPlaceholderText(supportedDbs[0].port);
      this.dbType.on('change', (function(_this) {
        return function(e) {
          return _this.updateDbType(e);
        };
      })(this));
      return this.on('core:cancel core:close', this.detach);
    };

    NewConnectionView.prototype.show = function() {
      atom.workspaceView.appendToTop(this);
      return this.url.focus();
    };

    NewConnectionView.prototype.close = function() {
      return this.detach();
    };

    NewConnectionView.prototype.detch = function() {
      if (!this.hasParent()) {
        return;
      }
      this.off('core:cancel core:close');
      return NewConnectionView.__super__.detch.call(this);
    };

    NewConnectionView.prototype.seperateUrl = function() {
      var auth, urlObj;
      if (!this.url.isFocused) {
        return;
      }
      urlObj = URL.parse(this.url.getText());
      if (urlObj) {
        if (urlObj.query) {
          this.dbOptions.setText(urlObj.query.replace('&', ', '));
        }
        if (!!urlObj.hostname) {
          this.dbServer.setText(urlObj.hostname);
        }
        if (!!urlObj.port) {
          this.dbPort.setText(urlObj.port);
        }
        this.dbName.setText(_s.ltrim(urlObj.pathname, '/'));
        if (urlObj.auth) {
          auth = urlObj.auth.split(':');
          if (auth) {
            this.dbUser.setText(auth[0]);
            if (auth.length !== 1) {
              return this.dbPassword.setText(auth[1]);
            }
          }
        }
      }
    };

    NewConnectionView.prototype.buildUrl = function() {
      var urlStr, userPass;
      if (this.url.isFocused) {
        return;
      }
      urlStr = this.urlPrefix + '://';
      userPass = this.dbUser.getText() + ':' + this.dbPassword.getText();
      if (userPass !== ':') {
        urlStr += userPass + '@';
      }
      urlStr += this.dbServer.getText();
      if (this.dbPort.getText() !== '') {
        urlStr += ':' + this.dbPort.getText();
      }
      urlStr += '/' + this.dbName.getText();
      if (this.dbOptions.getText()) {
        urlStr += '?';
        _.each(this.dbOptions.getText().split(','), (function(_this) {
          return function(s) {
            return urlStr += _s.trim(s) + '&';
          };
        })(this));
        urlStr = _s.rtrim(urlStr, '&');
      }
      return this.url.setText(urlStr);
    };

    NewConnectionView.prototype.updateDbType = function(e) {
      var n, _i, _len, _ref1;
      _ref1 = this.dbType.children();
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        n = _ref1[_i];
        if (n.selected) {
          this.urlPrefix = $(n).attr('value');
          this.dbPort.setPlaceholderText($(n).attr('data-port'));
          this.url.setPlaceholderText(this.urlPrefix + this.placeholderUrlPart);
          return;
        }
      }
    };

    NewConnectionView.prototype.connect = function() {
      if (!!this.onConnectClicked) {
        this.onConnectClicked(this.url.getText());
      }
      return this.close();
    };

    return NewConnectionView;

  })(View);

}).call(this);
