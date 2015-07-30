(function() {
  var addClass, removeClass;

  addClass = function(el, klass) {
    if (!el) {
      return;
    }
    return el.className = "" + el.className + " " + klass;
  };

  removeClass = function(el, klass) {
    var classes, index;
    if (!el) {
      return;
    }
    classes = el.className.split(' ');
    index = classes.indexOf(klass);
    if (index >= 0) {
      classes.splice(index, 1);
    }
    return el.className = classes.join(' ');
  };

  module.exports = {
    configDefaults: {
      showIcons: false,
      colorStatusIndicatorsInTreeView: false
    },
    activate: function(state) {
      atom.config.observe('unity-ui.showIcons', function() {
        var body;
        body = document.body;
        if (atom.config.get('unity-ui.showIcons')) {
          return addClass(body, 'unity-ui-show-icons');
        } else {
          return removeClass(body, 'unity-ui-show-icons');
        }
      });
      return atom.config.observe('unity-ui.colorStatusIndicatorsInTreeView', function() {
        var treeView;
        treeView = document.querySelector('.tree-view');
        if (atom.config.get('unity-ui.colorStatusIndicatorsInTreeView')) {
          return removeClass(treeView, 'unity-ui-fade-status');
        } else {
          return addClass(treeView, 'unity-ui-fade-status');
        }
      });
    }
  };

}).call(this);
