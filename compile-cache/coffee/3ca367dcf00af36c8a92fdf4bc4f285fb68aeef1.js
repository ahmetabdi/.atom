(function() {
  var $, DataResultView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  module.exports = DataResultView = (function(_super) {
    __extends(DataResultView, _super);

    function DataResultView() {
      return DataResultView.__super__.constructor.apply(this, arguments);
    }

    DataResultView.content = function() {
      return this.div({
        "class": 'scrollable'
      }, (function(_this) {
        return function() {
          _this.table({
            outlet: 'resultTable'
          }, function() {
            _this.thead(function() {
              return _this.tr({
                outlet: 'header'
              });
            });
            return _this.tbody({
              outlet: 'resultBody'
            });
          });
          return _this.span({
            outlet: 'message'
          });
        };
      })(this));
    };

    DataResultView.prototype.initialize = function() {};

    DataResultView.prototype.updateHeight = function(height) {
      return this.height(height);
    };

    DataResultView.prototype.clear = function() {
      this.message.empty();
      this.header.empty();
      return this.resultBody.empty();
    };

    DataResultView.prototype.setResults = function(results) {
      var cnt, data, field, row, rowEle, _i, _j, _len, _len1, _ref1, _ref2, _results;
      this.message.hide();
      this.resultTable.show();
      this.header.empty();
      this.resultBody.empty();
      this.header.append('<th>&nbsp;</th>');
      _ref1 = results.fields;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        field = _ref1[_i];
        this.header.append('<th>' + field.name + '</th>');
      }
      cnt = 1;
      _ref2 = results.rows;
      _results = [];
      for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
        row = _ref2[_j];
        rowEle = $(document.createElement('tr'));
        rowEle.append('<td>' + cnt++ + '</td>');
        this.resultBody.append(rowEle);
        _results.push((function() {
          var _k, _len2, _results1;
          _results1 = [];
          for (_k = 0, _len2 = row.length; _k < _len2; _k++) {
            data = row[_k];
            _results1.push(rowEle.append('<td>' + data + '</td>'));
          }
          return _results1;
        })());
      }
      return _results;
    };

    DataResultView.prototype.setMessage = function(msg) {
      this.resultTable.hide();
      this.message.empty();
      this.message.show();
      return this.message.append(msg);
    };

    return DataResultView;

  })(View);

}).call(this);
