(function() {
  String.prototype.pluralize = function(number) {
    return this + (number !== 1 ? 's' : '');
  };

  String.prototype.formattedDuration = function() {
    var duration, hours, mins, seconds, secs;
    seconds = parseInt(this, 10);
    hours = Math.floor(seconds / 3600);
    mins = Math.floor((seconds - (hours * 3600)) / 60);
    secs = seconds - (hours * 3600) - (mins * 60);
    duration = '';
    if (hours > 0) {
      duration += "" + hours + " " + ("hour".pluralize(hours)) + " ";
    }
    if (mins > 0) {
      duration += "" + mins + " " + ("min".pluralize(mins)) + " ";
    }
    if (secs > 0) {
      duration += "" + secs + " " + ("sec".pluralize(secs));
    }
    return duration;
  };

}).call(this);
