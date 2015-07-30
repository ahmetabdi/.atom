(function() {
  var DataManager, SqlServerManager, sql,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  sql = require('mssql');

  DataManager = require('./data-manager');

  module.exports = SqlServerManager = (function(_super) {
    __extends(SqlServerManager, _super);

    function SqlServerManager(url) {
      this.execute = __bind(this.execute, this);
      SqlServerManager.__super__.constructor.call(this, url);
    }

    SqlServerManager.prototype.buildError = function(err) {
      return 'Error (' + err.code + ') - ' + err.message;
    };

    SqlServerManager.prototype.execute = function(query, onSuccess, onError) {
      var connection;
      return connection = new sql.Connection(this.config, (function(_this) {
        return function(err) {
          var request;
          if (err) {
            console.error(err);
            onError(_this.buildError(err));
            return;
          }
          request = connection.request();
          return request.query(query, function(err, recordset) {
            if (err) {
              console.error(err);
              onError(_this.buildError(err));
              return;
            }
            console.log(recordset);
            return callOnSuccess(recordset, onSuccess);
          });
        };
      })(this));
    };

    SqlServerManager.prototype.callOnSuccess = function(result, onSuccess) {
      if (results.command !== 'SELECT') {
        return onSuccess({
          message: this.buildMessage(results),
          command: result.command,
          fields: result.fields,
          rowCount: result.rowCount,
          rows: result.rows
        });
      } else {
        return onSuccess({
          command: result.command,
          fields: result.fields,
          rowCount: result.rowCount,
          rows: result.rows
        });
      }
    };

    SqlServerManager.prototype.buildMessage = function(results) {
      switch (results.command) {
        case 'UPDATE':
          return results.rowCount + ' rows updated.';
        case 'DELETE':
          return results.rowCount + ' rows deleted.';
        default:
          return JSON.stringify(results);
      }
    };

    return SqlServerManager;

  })(DataManager);

}).call(this);
