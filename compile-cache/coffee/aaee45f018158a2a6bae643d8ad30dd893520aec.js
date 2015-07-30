(function() {
  var Point, cleanSymbol, isbefore, issymbol, mergeAdjacent, rebefore, resym;

  Point = require('atom').Point;

  resym = /^(entity.name.type.class|entity.name.function|entity.other.attribute-name.class)/;

  rebefore = /^(meta.rspec.behaviour)/;

  module.exports = function(path, grammar, text) {
    var lineno, lines, nextIsSymbol, offset, prev, symbol, symbols, token, tokens, _i, _j, _len, _len1;
    lines = grammar.tokenizeLines(text);
    symbols = [];
    nextIsSymbol = false;
    for (lineno = _i = 0, _len = lines.length; _i < _len; lineno = ++_i) {
      tokens = lines[lineno];
      offset = 0;
      prev = null;
      for (_j = 0, _len1 = tokens.length; _j < _len1; _j++) {
        token = tokens[_j];
        if (nextIsSymbol || issymbol(token)) {
          nextIsSymbol = false;
          symbol = cleanSymbol(token);
          if (symbol) {
            if (!mergeAdjacent(prev, token, symbols, offset)) {
              symbols.push({
                name: token.value,
                path: path,
                position: new Point(lineno, offset)
              });
              prev = token;
            }
          }
        }
        nextIsSymbol = isbefore(token);
        offset += token.bufferDelta;
      }
    }
    return symbols;
  };

  cleanSymbol = function(token) {
    var name, _ref;
    name = token.value.trim().replace(/"/g, '');
    return (_ref = name.length) != null ? _ref : {
      name: null
    };
  };

  issymbol = function(token) {
    var scope, _i, _len, _ref;
    if (token.value.trim().length && token.scopes) {
      _ref = token.scopes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        scope = _ref[_i];
        if (resym.test(scope)) {
          return true;
        }
      }
    }
    return false;
  };

  isbefore = function(token) {
    var scope, _i, _len, _ref;
    if (token.value.trim().length && token.scopes) {
      _ref = token.scopes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        scope = _ref[_i];
        console.log('checking', scope, '=', rebefore.test(scope));
        if (rebefore.test(scope)) {
          return true;
        }
      }
    }
    return false;
  };

  mergeAdjacent = function(prevToken, thisToken, symbols, offset) {
    var prevSymbol;
    if (offset && prevToken) {
      prevSymbol = symbols[symbols.length - 1];
      if (offset === prevSymbol.position.column + prevToken.value.length) {
        prevSymbol.name += thisToken.value;
        return true;
      }
    }
    return false;
  };

}).call(this);
