(function() {
  var mouseEvent, objectCenterCoordinates;

  mouseEvent = function(type, properties) {
    var defaults, k, v;
    defaults = {
      bubbles: true,
      cancelable: type !== "mousemove",
      view: window,
      detail: 0,
      pageX: 0,
      pageY: 0,
      clientX: 0,
      clientY: 0,
      ctrlKey: false,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      button: 0,
      relatedTarget: undefined
    };
    for (k in defaults) {
      v = defaults[k];
      if (properties[k] == null) {
        properties[k] = v;
      }
    }
    return new MouseEvent(type, properties);
  };

  objectCenterCoordinates = function(obj) {
    var height, left, top, width, _ref;
    _ref = obj.getBoundingClientRect(), top = _ref.top, left = _ref.left, width = _ref.width, height = _ref.height;
    return {
      x: left + width / 2,
      y: top + height / 2
    };
  };

  module.exports = {
    objectCenterCoordinates: objectCenterCoordinates,
    mouseEvent: mouseEvent
  };

  ['mousedown', 'mousemove', 'mouseup', 'click'].forEach(function(key) {
    return module.exports[key] = function(obj, x, y, cx, cy) {
      var _ref;
      if (!((x != null) && (y != null))) {
        _ref = objectCenterCoordinates(obj), x = _ref.x, y = _ref.y;
      }
      if (!((cx != null) && (cy != null))) {
        cx = x;
        cy = y;
      }
      return obj.dispatchEvent(mouseEvent(key, {
        pageX: x,
        pageY: y,
        clientX: cx,
        clientY: cy
      }));
    };
  });

  module.exports.mousewheel = function(obj, deltaX, deltaY) {
    if (deltaX == null) {
      deltaX = 0;
    }
    if (deltaY == null) {
      deltaY = 0;
    }
    return obj.dispatchEvent(mouseEvent('mousewheel', {
      deltaX: deltaX,
      deltaY: deltaY
    }));
  };

}).call(this);
