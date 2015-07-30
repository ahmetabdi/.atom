(function() {
  var $, StatsTracker;

  $ = require('atom-space-pen-views').$;

  module.exports = StatsTracker = (function() {
    StatsTracker.prototype.startDate = new Date;

    StatsTracker.prototype.hours = 6;

    StatsTracker.prototype.eventLog = {};

    function StatsTracker() {
      var date, future, workspaceView;
      date = new Date(this.startDate);
      future = new Date(date.getTime() + (36e5 * this.hours));
      this.eventLog[this.time(date)] = 0;
      while (date < future) {
        this.eventLog[this.time(date)] = 0;
      }
      workspaceView = atom.views.getView(atom.workspace);
      $(workspaceView).on('keydown', (function(_this) {
        return function() {
          return _this.track();
        };
      })(this));
      $(workspaceView).on('mouseup', (function(_this) {
        return function() {
          return _this.track();
        };
      })(this));
    }

    StatsTracker.prototype.clear = function() {
      return this.eventLog = {};
    };

    StatsTracker.prototype.track = function() {
      var date, times, _base;
      date = new Date;
      times = this.time(date);
      if ((_base = this.eventLog)[times] == null) {
        _base[times] = 0;
      }
      this.eventLog[times] += 1;
      if (this.eventLog.length > (this.hours * 60)) {
        return this.eventLog.shift();
      }
    };

    StatsTracker.prototype.time = function(date) {
      var hour, minute;
      date.setTime(date.getTime() + 6e4);
      hour = date.getHours();
      minute = date.getMinutes();
      return "" + hour + ":" + minute;
    };

    return StatsTracker;

  })();

}).call(this);
