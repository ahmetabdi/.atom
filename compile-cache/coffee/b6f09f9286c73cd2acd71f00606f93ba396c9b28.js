(function() {
  var DataManager, URL, _s;

  URL = require('url');

  _s = require('underscore.string');

  module.exports = DataManager = (function() {
    function DataManager(url) {
      var urlObj;
      this.url = url;
      urlObj = URL.parse(url);
      this.config = {
        user: urlObj.auth.split(':')[0],
        password: urlObj.auth.split(':')[1],
        server: urlObj.hostname,
        database: _s.ltrim(urlObj.pathname, '/')
      };
      if (urlObj.port) {
        this.config.port = urlObj.port;
      }
    }

    DataManager.prototype.execute = function(query, onSuccess, onError) {};

    DataManager.prototype.destroy = function() {};

    DataManager.prototype.getConnectionName = function() {
      return this.config.user + '@' + this.config.server + '/' + this.config.database;
    };

    return DataManager;

  })();

}).call(this);
