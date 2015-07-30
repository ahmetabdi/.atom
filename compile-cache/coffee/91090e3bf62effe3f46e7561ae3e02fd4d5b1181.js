
/*
Global Logger
 */

(function() {
  module.exports = (function() {
    var Emitter, emitter, stream, winston, writable;
    Emitter = require('event-kit').Emitter;
    emitter = new Emitter();
    winston = require('winston');
    stream = require('stream');
    writable = new stream.Writable({
      write: function(chunk, encoding, next) {
        var msg;
        msg = chunk.toString();
        emitter.emit('logging', msg);
        return next();
      }
    });
    return function(label) {
      var logger, loggerMethods, method, transport, wlogger, _i, _len;
      transport = new winston.transports.File({
        label: label,
        level: 'debug',
        timestamp: true,
        stream: writable,
        json: false
      });
      wlogger = new winston.Logger({
        transports: [transport]
      });
      loggerMethods = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];
      logger = {};
      for (_i = 0, _len = loggerMethods.length; _i < _len; _i++) {
        method = loggerMethods[_i];
        logger[method] = wlogger[method];
      }
      logger.onLogging = function(handler) {
        var subscription;
        subscription = emitter.on('logging', handler);
        return subscription;
      };
      return logger;
    };
  })();

}).call(this);
