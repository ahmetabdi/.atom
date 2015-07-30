(function() {
  var BuildMatrixView, BuildStatusView, TravisCi, fs, path, shell;

  fs = require('fs');

  path = require('path');

  shell = require('shell');

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
      }
    },
    buildMatrixView: null,
    buildStatusView: null,
    activate: function() {
      if (BuildStatusView == null) {
        BuildStatusView = require('./build-status-view');
      }
      if (BuildMatrixView == null) {
        BuildMatrixView = require('./build-matrix-view');
      }
      return Promise.all(atom.project.getDirectories().map(atom.project.repositoryForDirectory.bind(atom.project))).then((function(_this) {
        return function(repos) {
          if (_this.hasGitHubRepo(repos)) {
            return _this.isTravisProject(function(config) {
              return config && _this.init();
            });
          }
        };
      })(this));
    },
    deactivate: function() {
      var _ref, _ref1;
      atom.travis = null;
      if ((_ref = this.buildStatusView) != null) {
        _ref.destroy();
      }
      return (_ref1 = this.buildMatrixView) != null ? _ref1.destroy() : void 0;
    },
    serialize: function() {},
    hasGitHubRepo: function(repos) {
      var repo, _i, _len;
      if (repos.length === 0) {
        return false;
      }
      for (_i = 0, _len = repos.length; _i < _len; _i++) {
        repo = repos[_i];
        if (/(.)*github\.com/i.test(repo.getOriginURL())) {
          return true;
        }
      }
      return false;
    },
    getNameWithOwner: function() {
      var repo, url;
      repo = atom.project.getRepositories()[0];
      url = repo.getOriginURL();
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
    init: function() {
      var createStatusEntry, statusBar;
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
      createStatusEntry = (function(_this) {
        return function() {
          var nwo;
          nwo = _this.getNameWithOwner();
          _this.buildMatrixView = new BuildMatrixView(nwo);
          return _this.buildStatusView = new BuildStatusView(nwo, _this.buildMatrixView);
        };
      })(this);
      statusBar = document.querySelector("status-bar");
      if (statusBar != null) {
        createStatusEntry();
      } else {
        atom.packages.once('activated', function() {
          return createStatusEntry();
        });
      }
      return null;
    },
    openOnTravis: function() {
      var domain, nwo;
      nwo = this.getNameWithOwner();
      domain = atom.travis.pro ? 'magnum.travis-ci.com' : 'travis-ci.org';
      return shell.openExternal("https://" + domain + "/" + nwo);
    }
  };

}).call(this);
