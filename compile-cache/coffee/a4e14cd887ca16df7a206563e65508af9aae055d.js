(function() {
  var BuildMatrixView, BuildStatusView, Disposable, TravisCi, fs, path, shell;

  fs = require('fs');

  path = require('path');

  shell = require('shell');

  Disposable = require('atom').Disposable;

  TravisCi = null;

  BuildMatrixView = null;

  BuildStatusView = null;

  module.exports = {
    config: {
      useTravisCiPro: {
        type: 'boolean',
        "default": false
      },
      personalAccessToken: {
        type: 'string',
        "default": '<Your personal GitHub access token>'
      },
      travisCiRemoteName: {
        type: 'string',
        "default": 'origin'
      }
    },
    buildMatrixView: null,
    buildStatusView: null,
    activate: function() {
      return this.activationPromise = Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project))).then((function(_this) {
        return function(repos) {
          return new Promise(function(resolve) {
            if (_this.hasGitHubRepo(repos)) {
              return _this.isTravisProject(function(config) {
                if (config) {
                  return resolve();
                }
              });
            }
          });
        };
      })(this));
    },
    deactivate: function() {
      var _ref, _ref1;
      atom.travis = null;
      if ((_ref = this.statusBarSubscription) != null) {
        _ref.dispose();
      }
      return (_ref1 = this.buildMatrixView) != null ? _ref1.destroy() : void 0;
    },
    serialize: function() {},
    hasGitHubRepo: function(repos) {
      var name, repo, _i, _len;
      if (repos.length === 0) {
        return false;
      }
      name = atom.config.get('travis-ci-status.travisCiRemoteName');
      for (_i = 0, _len = repos.length; _i < _len; _i++) {
        repo = repos[_i];
        if (/(.)*github\.com/i.test(repo.getConfigValue("remote." + name + ".url"))) {
          return true;
        }
      }
      return false;
    },
    getNameWithOwner: function() {
      var name, repo, url;
      repo = atom.project.getRepositories()[0];
      name = atom.config.get('travis-ci-status.travisCiRemoteName');
      url = repo.getConfigValue("remote." + name + ".url");
      if (url == null) {
        return null;
      }
      return /([^\/:]+)\/([^\/]+)$/.exec(url.replace(/\.git$/, ''))[0];
    },
    isTravisProject: function(callback) {
      var conf, projPath;
      if (!(callback instanceof Function)) {
        return;
      }
      projPath = atom.project.getPaths()[0];
      if (projPath == null) {
        return callback(false);
      }
      conf = path.join(projPath, '.travis.yml');
      return fs.exists(conf, callback);
    },
    init: function(statusBar) {
      var nwo;
      if (TravisCi == null) {
        TravisCi = require('travis-ci');
      }
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: atom.config.get('travis-ci-status.useTravisCiPro')
      });
      atom.commands.add('atom-workspace', 'travis-ci-status:open-on-travis', (function(_this) {
        return function() {
          return _this.openOnTravis();
        };
      })(this));
      if (BuildStatusView == null) {
        BuildStatusView = require('./build-status-view');
      }
      if (BuildMatrixView == null) {
        BuildMatrixView = require('./build-matrix-view');
      }
      nwo = this.getNameWithOwner();
      this.buildMatrixView = new BuildMatrixView(nwo);
      this.buildStatusView = new BuildStatusView(nwo, this.buildMatrixView, statusBar);
    },
    openOnTravis: function() {
      var domain, nwo;
      nwo = this.getNameWithOwner();
      domain = atom.travis.pro ? 'magnum.travis-ci.com' : 'travis-ci.org';
      return shell.openExternal("https://" + domain + "/" + nwo);
    },
    consumeStatusBar: function(statusBar) {
      this.activationPromise.then((function(_this) {
        return function() {
          return _this.init(statusBar);
        };
      })(this));
      return this.statusBarSubscription = new Disposable((function(_this) {
        return function() {
          var _ref;
          return (_ref = _this.buildStatusView) != null ? _ref.destroy() : void 0;
        };
      })(this));
    }
  };

}).call(this);
