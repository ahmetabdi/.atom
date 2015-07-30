(function() {
  var $, EditorStatsView, ScrollView, d3, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('atom-space-pen-views'), $ = _ref.$, ScrollView = _ref.ScrollView;

  d3 = require('d3-browserify');

  module.exports = EditorStatsView = (function(_super) {
    __extends(EditorStatsView, _super);

    function EditorStatsView() {
      return EditorStatsView.__super__.constructor.apply(this, arguments);
    }

    EditorStatsView.activate = function() {
      return new EditorStatsView;
    };

    EditorStatsView.content = function() {
      return this.div({
        "class": 'editor-stats-wrapper',
        tabindex: -1
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'editor-stats',
            outlet: 'editorStats'
          });
        };
      })(this));
    };

    EditorStatsView.prototype.pt = 15;

    EditorStatsView.prototype.pl = 10;

    EditorStatsView.prototype.pb = 3;

    EditorStatsView.prototype.pr = 25;

    EditorStatsView.prototype.initialize = function() {
      var resizer;
      EditorStatsView.__super__.initialize.apply(this, arguments);
      resizer = (function(_this) {
        return function() {
          if (!_this.isOnDom()) {
            return;
          }
          _this.draw();
          return _this.update();
        };
      })(this);
      return $(window).on('resize', _.debounce(resizer, 300));
    };

    EditorStatsView.prototype.draw = function() {
      var data, h, max, updater, vis, w;
      this.editorStats.empty();
      if (this.x == null) {
        this.x = d3.scale.ordinal().domain(d3.range(this.stats.hours * 60));
      }
      if (this.y == null) {
        this.y = d3.scale.linear();
      }
      w = $(atom.views.getView(atom.workspace)).find('.vertical').width();
      h = this.height();
      data = d3.entries(this.stats.eventLog);
      max = d3.max(data, function(d) {
        return d.value;
      });
      this.x.rangeBands([0, w - this.pl - this.pr], 0.2);
      this.y.domain([0, max]).range([h - this.pt - this.pb, 0]);
      if (this.xaxis == null) {
        this.xaxis = d3.svg.axis().scale(this.x).orient('top').tickSize(-h + this.pt + this.pb).tickFormat((function(_this) {
          return function(d) {
            var mins;
            d = new Date(_this.stats.startDate.getTime() + (d * 6e4));
            mins = d.getMinutes();
            if (mins <= 9) {
              mins = "0" + mins;
            }
            return "" + (d.getHours()) + ":" + mins;
          };
        })(this));
      }
      vis = d3.select(this.editorStats.get(0)).append('svg').attr('width', w).attr('height', h).append('g').attr('transform', "translate(" + this.pl + "," + this.pt + ")");
      vis.append('g').attr('class', 'x axis').call(this.xaxis).selectAll('g').classed('minor', function(d, i) {
        return i % 5 === 0 && i % 15 !== 0;
      }).style('display', function(d, i) {
        if (i % 15 === 0 || i % 5 === 0 || i === data.length - 1) {
          return 'block';
        } else {
          return 'none';
        }
      });
      this.bars = vis.selectAll('rect.bar').data(data).enter().append('rect').attr('x', (function(_this) {
        return function(d, i) {
          return _this.x(i);
        };
      })(this)).attr('height', (function(_this) {
        return function(d, i) {
          return h - _this.y(d.value) - _this.pt - _this.pb;
        };
      })(this)).attr('y', (function(_this) {
        return function(d) {
          return _this.y(d.value);
        };
      })(this)).attr('width', this.x.rangeBand()).attr('class', 'bar');
      clearInterval(this.updateInterval);
      updater = (function(_this) {
        return function() {
          if (_this.isOnDom()) {
            return _this.update();
          }
        };
      })(this);
      setTimeout(updater, 100);
      return this.updateInterval = setInterval(updater, 5000);
    };

    EditorStatsView.prototype.update = function() {
      var h, max, newData;
      newData = d3.entries(this.stats.eventLog);
      max = d3.max(newData, function(d) {
        return d.value;
      });
      this.y.domain([0, max]);
      h = this.height();
      this.bars.data(newData).transition().attr('height', (function(_this) {
        return function(d, i) {
          return h - _this.y(d.value) - _this.pt - _this.pb;
        };
      })(this)).attr('y', (function(_this) {
        return function(d, i) {
          return _this.y(d.value);
        };
      })(this));
      return this.bars.classed('max', function(d, i) {
        return d.value === max;
      });
    };

    EditorStatsView.prototype.toggle = function(stats) {
      var _ref1;
      this.stats = stats;
      if ((_ref1 = this.panel) != null ? _ref1.isVisible() : void 0) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    EditorStatsView.prototype.attach = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addBottomPanel({
          item: this
        });
      }
      this.panel.show();
      return this.draw();
    };

    EditorStatsView.prototype.detach = function() {
      var _ref1;
      if ((_ref1 = this.panel) != null) {
        _ref1.hide();
      }
      clearInterval(this.updateInterval);
      return $(atom.views.getView(atom.workspace)).focus();
    };

    return EditorStatsView;

  })(ScrollView);

}).call(this);
