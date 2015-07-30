(function() {
  var isFunction, isString, isType;

  isFunction = function(value) {
    return isType(value, 'function');
  };

  isString = function(value) {
    return isType(value, 'string');
  };

  isType = function(value, typeName) {
    var t;
    t = typeof value;
    if (t == null) {
      return false;
    }
    return t === typeName;
  };

  module.exports = {
    isFunction: isFunction,
    isString: isString
  };

}).call(this);
