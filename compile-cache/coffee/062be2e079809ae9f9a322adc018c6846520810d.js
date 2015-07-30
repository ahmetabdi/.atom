(function() {
  var DataManager, PostgresManager, pg,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  pg = require('pg');

  DataManager = require('./data-manager');

  module.exports = PostgresManager = (function(_super) {
    __extends(PostgresManager, _super);

    function PostgresManager(url) {
      PostgresManager.__super__.constructor.call(this, url);
    }

    PostgresManager.prototype.execute = function(query, onSuccess, onError) {
      return pg.connect(this.url, (function(_this) {
        return function(err, client, done) {
          if (err) {
            console.error('Error fetching client from pool', err);
            onError(err);
          }
          return client.query({
            text: query,
            rowMode: 'array'
          }, function(err, result) {
            done();
            if (err) {
              console.error('Query error - ' + err);
              if (!!onError) {
                return onError(err);
              }
            } else if (onSuccess) {
              return _this.callOnSuccess(result, onSuccess);
            }
          });
        };
      })(this));
    };

    PostgresManager.prototype.callOnSuccess = function(result, onSuccess) {
      if (result.command !== 'SELECT') {
        return onSuccess({
          message: this.buildMessage(result),
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

    PostgresManager.prototype.buildMessage = function(results) {
      switch (results.command) {
        case 'UPDATE':
          return results.rowCount + ' rows updated.';
        case 'DELETE':
          return results.rowCount + ' rows deleted.';
        default:
          return JSON.stringify(results);
      }
    };

    return PostgresManager;

  })(DataManager);

}).call(this);
