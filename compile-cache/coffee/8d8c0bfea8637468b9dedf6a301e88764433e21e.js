(function() {
  var DbFactory, URL, factory;

  URL = require('url');

  DbFactory = (function() {
    function DbFactory() {}

    DbFactory.prototype.getSupportedDatabases = function() {
      return [
        {
          name: 'PostgreSQL',
          prefix: 'postgresql',
          port: 5432
        }, {
          name: 'MS SQL Server',
          prefix: 'sqlserver',
          port: 1433
        }
      ];
    };

    DbFactory.prototype.createDataManagerForUrl = function(url) {
      var PostgresManager, SqlServerManager;
      switch (URL.parse(url).protocol.replace(':', '')) {
        case 'postgresql':
          PostgresManager = require('./postgres-manager');
          return new PostgresManager(url);
        case 'sqlserver':
          SqlServerManager = require('./sqlserver-manager');
          return new SqlServerManager(url);
        default:
          throw Error('Unsupported database: ' + URL.parse(url).protocol);
      }
    };

    return DbFactory;

  })();

  factory = new DbFactory();

  module.exports = factory;

}).call(this);
