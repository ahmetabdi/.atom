(function() {
  var addSuffix, config, createSpec, deduceSpecPath, ensureTrailingSlashes, getCurrentPath, getRelPath, removeLeadingSlashes, removeTrailingSlashes, replaceSrcLocWithSpecLoc, warnOfUnreplacement;

  config = function(prop) {
    return atom.config.get("spec-maker." + prop);
  };

  removeLeadingSlashes = function(path) {
    return path.replace(/^\/+/, '');
  };

  removeTrailingSlashes = function(path) {
    return path.replace(/\/+$/, '');
  };

  ensureTrailingSlashes = function(path) {
    return removeTrailingSlashes(path) + '/';
  };

  getCurrentPath = function() {
    var _ref;
    return ((_ref = atom.workspace.getActiveTextEditor()) != null ? _ref.getPath() : void 0) || '';
  };

  getRelPath = function(path) {
    return path.replace(atom.project.getPaths()[0], '');
  };

  warnOfUnreplacement = function() {
    return console.warn(["Spec Maker: no replacement made between", "`srcLocation` (" + (config('srcLocation')) + ") and", "`specLocation` (" + (config('specLocation')) + ").", "Are you sure your config is correct?"].join(" "));
  };

  replaceSrcLocWithSpecLoc = function(path) {
    var fromPath, isPathSpec, newPath, origPath, toPath, _ref;
    fromPath = config('srcLocation');
    toPath = config('specLocation');
    isPathSpec = new RegExp(toPath).test(path);
    if (isPathSpec) {
      _ref = [toPath, fromPath], fromPath = _ref[0], toPath = _ref[1];
    }
    origPath = path;
    newPath = path.replace(ensureTrailingSlashes(fromPath), ensureTrailingSlashes(toPath));
    if (newPath === origPath) {
      warnOfUnreplacement();
    }
    return newPath;
  };

  addSuffix = function(path) {
    var specSuffix;
    specSuffix = config('specSuffix');
    if (new RegExp(specSuffix).test(path)) {
      return path.replace(specSuffix, '');
    } else {
      return path.replace('.', specSuffix + '.');
    }
  };

  deduceSpecPath = function() {
    return [getCurrentPath, getRelPath, replaceSrcLocWithSpecLoc, removeLeadingSlashes, addSuffix].reduce((function(path, fn) {
      return fn(path);
    }), '');
  };

  createSpec = function() {
    var opts, path;
    path = deduceSpecPath();
    if (config('houseOfPane') !== 'none') {
      opts = {
        split: config('houseOfPane')
      };
    }
    return atom.workspace.open(path, opts);
  };

  module.exports = {
    activate: function(state) {
      return atom.commands.add('atom-text-editor', {
        'spec-maker:open-or-create-spec': function(event) {
          return createSpec();
        }
      });
    },
    deactivate: function() {},
    serialize: function() {},
    config: {
      specSuffix: {
        type: 'string',
        "default": '-spec'
      },
      specLocation: {
        type: 'string',
        "default": 'spec/'
      },
      srcLocation: {
        type: 'string',
        "default": 'lib/'
      },
      houseOfPane: {
        type: 'string',
        "default": 'right'
      }
    }
  };

}).call(this);
