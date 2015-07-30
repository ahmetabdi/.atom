(function() {
  var $, Point, Range, View, ViolationTooltip, ViolationView, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  _ref = require('atom'), $ = _ref.$, View = _ref.View, Range = _ref.Range, Point = _ref.Point;

  ViolationTooltip = require('./violation-tooltip');

  module.exports = ViolationView = (function(_super) {
    __extends(ViolationView, _super);

    function ViolationView() {
      return ViolationView.__super__.constructor.apply(this, arguments);
    }

    ViolationView.content = function() {
      return this.div({
        "class": 'violation'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'violation-arrow'
          });
          return _this.div({
            "class": 'violation-area'
          });
        };
      })(this));
    };

    ViolationView.prototype.initialize = function(violation, lintView) {
      this.violation = violation;
      this.lintView = lintView;
      this.lintView.append(this);
      this.editorView = this.lintView.editorView;
      this.editor = this.editorView.getEditor();
      this.initializeSubviews();
      this.initializeStates();
      this.trackEdit();
      this.trackCursor();
      this.showHighlight();
      return this.toggleTooltipWithCursorPosition();
    };

    ViolationView.prototype.initializeSubviews = function() {
      this.arrow = this.find('.violation-arrow');
      this.arrow.addClass("violation-" + this.violation.severity);
      this.area = this.find('.violation-area');
      return this.area.addClass("violation-" + this.violation.severity);
    };

    ViolationView.prototype.initializeStates = function() {
      var screenRange;
      screenRange = this.editor.screenRangeForBufferRange(this.violation.bufferRange);
      this.screenStartPosition = screenRange.start;
      this.screenEndPosition = screenRange.end;
      return this.isValid = true;
    };

    ViolationView.prototype.trackEdit = function() {
      var options;
      options = {
        invalidate: 'inside',
        persistent: false
      };
      this.marker = this.editor.markScreenRange(this.getCurrentScreenRange(), options);
      this.editor.decorateMarker(this.marker, {
        type: 'gutter',
        "class": "lint-" + this.violation.severity
      });
      return this.marker.on('changed', (function(_this) {
        return function(event) {
          var _ref1;
          _this.screenStartPosition = event.newTailScreenPosition;
          _this.screenEndPosition = event.newHeadScreenPosition;
          _this.isValid = event.isValid;
          if (_this.isValid) {
            if (_this.isVisibleMarkerChange(event)) {
              return setImmediate(function() {
                _this.showHighlight();
                return _this.toggleTooltipWithCursorPosition();
              });
            } else {
              _this.hide();
              if (_this.scheduleDeferredShowHighlight == null) {
                _this.scheduleDeferredShowHighlight = _.debounce(_this.showHighlight, 500);
              }
              return _this.scheduleDeferredShowHighlight();
            }
          } else {
            _this.hideHighlight();
            return (_ref1 = _this.violationTooltip) != null ? _ref1.hide() : void 0;
          }
        };
      })(this));
    };

    ViolationView.prototype.isVisibleMarkerChange = function(event) {
      var editorFirstVisibleRow, editorLastVisibleRow;
      editorFirstVisibleRow = this.editorView.getFirstVisibleScreenRow();
      editorLastVisibleRow = this.editorView.getLastVisibleScreenRow();
      return [event.oldTailScreenPosition, event.newTailScreenPosition].some(function(position) {
        var _ref1;
        return (editorFirstVisibleRow <= (_ref1 = position.row) && _ref1 <= editorLastVisibleRow);
      });
    };

    ViolationView.prototype.trackCursor = function() {
      return this.subscribe(this.editor.getCursor(), 'moved', (function(_this) {
        return function() {
          var _ref1;
          if (_this.isValid) {
            return _this.toggleTooltipWithCursorPosition();
          } else {
            return (_ref1 = _this.violationTooltip) != null ? _ref1.hide() : void 0;
          }
        };
      })(this));
    };

    ViolationView.prototype.showHighlight = function() {
      this.updateHighlight();
      return this.show();
    };

    ViolationView.prototype.hideHighlight = function() {
      return this.hide();
    };

    ViolationView.prototype.updateHighlight = function() {
      var arrowSize, borderOffset, borderThickness, endPixelPosition, startPixelPosition, verticalOffset;
      startPixelPosition = this.editorView.pixelPositionForScreenPosition(this.screenStartPosition);
      endPixelPosition = this.editorView.pixelPositionForScreenPosition(this.screenEndPosition);
      arrowSize = this.editorView.charWidth / 2;
      verticalOffset = this.editorView.lineHeight + Math.floor(arrowSize / 4);
      this.css({
        'top': startPixelPosition.top,
        'left': startPixelPosition.left,
        'width': this.editorView.charWidth - (this.editorView.charWidth % 2),
        'height': verticalOffset
      });
      this.arrow.css({
        'border-right-width': arrowSize,
        'border-bottom-width': arrowSize,
        'border-left-width': arrowSize
      });
      borderThickness = 1;
      borderOffset = arrowSize / 2;
      this.area.css({
        'left': borderOffset,
        'width': endPixelPosition.left - startPixelPosition.left - borderOffset,
        'height': verticalOffset
      });
      if (this.screenEndPosition.column - this.screenStartPosition.column > 1) {
        return this.area.addClass("violation-border");
      } else {
        return this.area.removeClass("violation-border");
      }
    };

    ViolationView.prototype.toggleTooltipWithCursorPosition = function() {
      var cursorPosition, _ref1;
      cursorPosition = this.editor.getCursor().getScreenPosition();
      if (cursorPosition.row === this.screenStartPosition.row && cursorPosition.column === this.screenStartPosition.column) {
        if (this.violationTooltip == null) {
          this.violationTooltip = this.createViolationTooltip();
        }
        return this.violationTooltip.show();
      } else {
        return (_ref1 = this.violationTooltip) != null ? _ref1.hide() : void 0;
      }
    };

    ViolationView.prototype.getCurrentBufferStartPosition = function() {
      return this.editor.bufferPositionForScreenPosition(this.screenStartPosition);
    };

    ViolationView.prototype.getCurrentScreenRange = function() {
      return new Range(this.screenStartPosition, this.screenEndPosition);
    };

    ViolationView.prototype.beforeRemove = function() {
      var _ref1, _ref2;
      if ((_ref1 = this.marker) != null) {
        _ref1.destroy();
      }
      return (_ref2 = this.violationTooltip) != null ? _ref2.destroy() : void 0;
    };

    ViolationView.prototype.createViolationTooltip = function() {
      var options;
      options = {
        violation: this.violation,
        container: this.lintView,
        selector: this.find('.violation-area'),
        editorView: this.editorView
      };
      return new ViolationTooltip(this, options);
    };

    return ViolationView;

  })(View);

}).call(this);
