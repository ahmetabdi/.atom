(function() {
  var $, BuildStatusView, TravisCi, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom-space-pen-views'), $ = _ref.$, View = _ref.View;

  TravisCi = require('travis-ci');

  module.exports = BuildStatusView = (function(_super) {
    __extends(BuildStatusView, _super);

    function BuildStatusView() {
      this.repoStatus = __bind(this.repoStatus, this);
      this.update = __bind(this.update, this);
      this.subscribeToRepo = __bind(this.subscribeToRepo, this);
      return BuildStatusView.__super__.constructor.apply(this, arguments);
    }

    BuildStatusView.content = function() {
      return this.div({
        "class": 'travis-ci-status inline-block'
      }, (function(_this) {
        return function() {
          return _this.span({
            "class": 'build-status icon icon-history',
            outlet: 'status',
            tabindex: -1
          }, '');
        };
      })(this));
    };

    BuildStatusView.prototype.initialize = function(nwo, matrix, statusBar) {
      this.nwo = nwo;
      this.matrix = matrix;
      this.statusBar = statusBar;
      atom.commands.add('atom-workspace', 'travis-ci-status:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.on('click', (function(_this) {
        return function() {
          return _this.matrix.toggle();
        };
      })(this));
      this.attach();
      return this.subscribeToRepo();
    };

    BuildStatusView.prototype.serialize = function() {};

    BuildStatusView.prototype.attach = function() {
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this,
        priority: 100
      });
    };

    BuildStatusView.prototype.detach = function() {
      var _ref1;
      return (_ref1 = this.statusBarTile) != null ? _ref1.destroy() : void 0;
    };

    BuildStatusView.prototype.destroy = function() {
      return this.detach();
    };

    BuildStatusView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    BuildStatusView.prototype.getActiveItemPath = function() {
      var _ref1;
      return (_ref1 = this.getActiveItem()) != null ? typeof _ref1.getPath === "function" ? _ref1.getPath() : void 0 : void 0;
    };

    BuildStatusView.prototype.getActiveItem = function() {
      return atom.workspace.getActivePaneItem();
    };

    BuildStatusView.prototype.subscribeToRepo = function() {
      var name, repo, repos;
      if (this.repo != null) {
        this.unsubscribe(this.repo);
      }
      repos = atom.project.getRepositories();
      console.log("DEBUG:", repos);
      name = atom.config.get('travis-ci-status.travisCiRemoteName');
      repo = repos.filter(function(r) {
        return /(.)*github\.com/i.test(r.getConfigValue("remote." + name + ".url"));
      });
      this.repo = repo[0];
      $(this.repo).on('status-changed', (function(_this) {
        return function(path, status) {
          if (path === _this.getActiveItemPath()) {
            return _this.update();
          }
        };
      })(this));
      $(this.repo).on('statuses-changed', this.update);
      return this.update();
    };

    BuildStatusView.prototype.update = function() {
      var details, token, updateRepo, _ref1;
      if (!this.hasParent()) {
        return;
      }
      this.status.addClass('pending');
      details = this.nwo.split('/');
      updateRepo = (function(_this) {
        return function() {
          return atom.travis.repos(details[0], details[1]).get(_this.repoStatus);
        };
      })(this);
      if (((_ref1 = atom.travis) != null ? _ref1.pro : void 0) != null) {
        token = atom.config.get('travis-ci-status.personalAccessToken');
        return atom.travis.authenticate({
          github_token: token
        }, updateRepo);
      } else {
        return updateRepo();
      }
    };

    BuildStatusView.prototype.fallback = function() {
      atom.travis = new TravisCi({
        version: '2.0.0',
        pro: false
      });
      return this.update();
    };

    BuildStatusView.prototype.repoStatus = function(err, data) {
      var _ref1;
      if ((err != null) && (((_ref1 = atom.travis) != null ? _ref1.pro : void 0) != null)) {
        return this.fallback();
      }
      if (data['files'] === 'not found') {
        return;
      }
      if (err != null) {
        return console.log("Error:", err);
      }
      data = data['repo'];
      this.status.removeClass('pending success fail');
      if (data && data['last_build_state'] === "passed") {
        this.matrix.update(data['last_build_id']);
        return this.status.addClass('success');
      } else {
        return this.status.addClass('fail');
      }
    };

    return BuildStatusView;

  })(View);

}).call(this);
