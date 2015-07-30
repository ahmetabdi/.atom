(function() {
  var esprima, estraverse, isFinish, isTarget, traverse, types;

  esprima = require('esprima');

  estraverse = require('estraverse');

  types = ['describe', 'context', 'it'];

  module.exports.parse = function(source) {
    return traverse(esprima.parse(source, {
      loc: true
    }));
  };

  isTarget = function(node) {
    return node.type === 'CallExpression' && types.indexOf(node.callee.name) !== -1;
  };

  isFinish = function(node) {
    return node.callee.name === 'it';
  };

  traverse = function(ast) {
    var children;
    children = [];
    estraverse.traverse(ast, {
      enter: function(node) {
        var child;
        if (!isTarget(node)) {
          return;
        }
        child = {
          type: node.callee.name,
          text: node["arguments"][0].value,
          line: node.loc.start.line
        };
        if (!isFinish(node)) {
          child.children = traverse(node["arguments"][1].body);
        }
        children.push(child);
        return this.skip();
      }
    });
    return children;
  };

}).call(this);
