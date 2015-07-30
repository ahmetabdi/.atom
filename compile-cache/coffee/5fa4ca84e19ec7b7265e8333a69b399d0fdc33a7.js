(function() {
  var Convert, ResizeHandle, RubyTestView, TestRunner, Utility, View, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  View = require('atom-space-pen-views').View;

  TestRunner = require('./test-runner');

  ResizeHandle = require('./resize-handle');

  Utility = require('./utility');

  Convert = require('ansi-to-html');

  module.exports = RubyTestView = (function(_super) {
    __extends(RubyTestView, _super);

    function RubyTestView() {
      this.write = __bind(this.write, this);
      this.onTestRunEnd = __bind(this.onTestRunEnd, this);
      this.setTestInfo = __bind(this.setTestInfo, this);
      return RubyTestView.__super__.constructor.apply(this, arguments);
    }

    RubyTestView.content = function() {
      return this.div({
        "class": "ruby-test inset-panel panel-bottom"
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "ruby-test-resize-handle"
          });
          _this.div({
            "class": "panel-heading"
          }, function() {
            _this.span('Running tests: ');
            _this.span({
              outlet: 'header'
            });
            return _this.div({
              "class": "heading-buttons pull-right inline-block"
            }, function() {
              return _this.div({
                click: 'closePanel',
                "class": "heading-close icon-x inline-block"
              });
            });
          });
          return _this.div({
            "class": "panel-body"
          }, function() {
            _this.div({
              "class": 'ruby-test-spinner'
            }, 'Starting...');
            return _this.pre("", {
              outlet: 'results'
            });
          });
        };
      })(this));
    };

    RubyTestView.prototype.initialize = function(serializeState) {
      atom.commands.add("atom-workspace", "ruby-test:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-file", (function(_this) {
        return function() {
          return _this.testFile();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-single", (function(_this) {
        return function() {
          return _this.testSingle();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-previous", (function(_this) {
        return function() {
          return _this.testPrevious();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:test-all", (function(_this) {
        return function() {
          return _this.testAll();
        };
      })(this));
      atom.commands.add("atom-workspace", "ruby-test:cancel", (function(_this) {
        return function() {
          return _this.cancelTest();
        };
      })(this));
      return new ResizeHandle(this);
    };

    RubyTestView.prototype.serialize = function() {};

    RubyTestView.prototype.destroy = function() {
      this.output = '';
      return this.detach();
    };

    RubyTestView.prototype.closePanel = function() {
      if (this.hasParent()) {
        return this.detach();
      }
    };

    RubyTestView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        this.showPanel();
        if (!this.runner) {
          this.spinner.hide();
          return this.setTestInfo("No tests running");
        }
      }
    };

    RubyTestView.prototype.testFile = function() {
      return this.runTest();
    };

    RubyTestView.prototype.testSingle = function() {
      return this.runTest({
        testScope: "single"
      });
    };

    RubyTestView.prototype.testAll = function() {
      return this.runTest({
        testScope: "all"
      });
    };

    RubyTestView.prototype.testPrevious = function() {
      if (!this.runner) {
        return;
      }
      this.saveFile();
      this.newTestView();
      return this.runner.run();
    };

    RubyTestView.prototype.runTest = function(overrideParams) {
      var params;
      this.saveFile();
      this.newTestView();
      params = _.extend({}, this.testRunnerParams(), overrideParams || {});
      this.runner = new TestRunner(params);
      this.runner.run();
      return this.spinner.show();
    };

    RubyTestView.prototype.newTestView = function() {
      this.output = '';
      this.flush();
      return this.showPanel();
    };

    RubyTestView.prototype.testRunnerParams = function() {
      return {
        write: this.write,
        exit: this.onTestRunEnd,
        setTestInfo: this.setTestInfo
      };
    };

    RubyTestView.prototype.setTestInfo = function(infoStr) {
      return this.header.text(infoStr);
    };

    RubyTestView.prototype.onTestRunEnd = function() {
      return null;
    };

    RubyTestView.prototype.showPanel = function() {
      if (!this.hasParent()) {
        atom.workspace.addBottomPanel({
          item: this
        });
        return this.spinner = this.find('.ruby-test-spinner');
      }
    };

    RubyTestView.prototype.write = function(str) {
      var convert, converted;
      if (this.spinner) {
        this.spinner.hide();
      }
      this.output || (this.output = '');
      convert = new Convert({
        escapeXML: true
      });
      converted = convert.toHtml(str);
      this.output += converted;
      return this.flush();
    };

    RubyTestView.prototype.flush = function() {
      this.results.html(this.output);
      return this.results.parent().scrollTop(this.results.innerHeight());
    };

    RubyTestView.prototype.cancelTest = function() {
      var _ref;
      this.runner.cancel();
      if ((_ref = this.spinner) != null) {
        _ref.hide();
      }
      return this.write('\nTests canceled');
    };

    RubyTestView.prototype.saveFile = function() {
      var util;
      util = new Utility;
      return util.saveFile();
    };

    return RubyTestView;

  })(View);

}).call(this);
