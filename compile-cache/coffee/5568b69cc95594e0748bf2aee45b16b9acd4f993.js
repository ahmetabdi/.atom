(function() {
  var $, AnnotationTooltip, Color, Tooltip,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = require('atom').$;

  Color = require('color');

  window.jQuery = $;

  require('../vendor/bootstrap/js/tooltip');

  Tooltip = $.fn.tooltip.Constructor;

  module.exports = AnnotationTooltip = (function(_super) {
    __extends(AnnotationTooltip, _super);

    function AnnotationTooltip() {
      return AnnotationTooltip.__super__.constructor.apply(this, arguments);
    }

    AnnotationTooltip.DEFAULTS = $.extend({}, Tooltip.DEFAULTS, {
      placement: 'bottom-right auto'
    });

    AnnotationTooltip.prototype.getDefaults = function() {
      return AnnotationTooltip.DEFAULTS;
    };

    AnnotationTooltip.prototype.show = function() {
      
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return
      var that = this;

      var $tip = this.tip()

      this.setContent()

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'bottom-right'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)

      if (this.options.container) {
        $tip.appendTo(this.options.container)
      } else {
        $tip.insertAfter(this.$element)
      }

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        placement = this.autoPlace(orgPlacement, actualWidth, actualHeight)
        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)
      this.hoverState = null

      var complete = function() {
        that.$element.trigger('shown.bs.' + that.type)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one($.support.transition.end, complete)
          .emulateTransitionEnd(150) :
        complete()
    }
    ;
      return this.applyAdditionalStyle();
    };

    AnnotationTooltip.prototype.autoPlace = function(orgPlacement, actualWidth, actualHeight) {
      var editorRegion, placement, pos;
      editorRegion = this.getEditorRegion();
      pos = this.getLogicalPosition();
      placement = orgPlacement.split('-');
      if (placement[0] === 'bottom' && (pos.top + pos.height + actualHeight > editorRegion.height)) {
        placement[0] = 'top';
      } else if (placement[0] === 'top' && (pos.top - actualHeight < 0)) {
        placement[0] = 'bottom';
      }
      if (placement[1] === 'right' && (pos.right + actualWidth > editorRegion.width)) {
        placement[1] = 'left';
      } else if (placement[1] === 'left' && (pos.left - actualWidth < editorRegion.left)) {
        placement[1] = 'right';
      }
      return placement.join('-');
    };

    AnnotationTooltip.prototype.applyPlacement = function(offset, placement) {
      
    var replace
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  = offset.top  + marginTop
    offset.left = offset.left + marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      replace = true
      offset.top = offset.top + height - actualHeight
    }

    if (/bottom|top/.test(placement)) {
      var delta = 0

      if (offset.left < 0) {
        delta       = offset.left * -2
        offset.left = 0

        $tip.offset(offset)

        actualWidth  = $tip[0].offsetWidth
        actualHeight = $tip[0].offsetHeight
      }

      this.replaceArrow(delta - width + actualWidth, actualWidth, 'left')
    } else {
      this.replaceArrow(actualHeight - height, actualHeight, 'top')
    }

    if (replace) $tip.offset(offset)
    ;
    };

    AnnotationTooltip.prototype.setContent = function() {
      var $tip, title;
      $tip = this.tip();
      title = this.getTitle();
      $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title);
      return $tip.removeClass('fade in top-left top-right bottom-left bottom-right');
    };

    AnnotationTooltip.prototype.getLogicalPosition = function() {
      var el, position;
      el = this.$element[0];
      position = this.$element.position();
      position.width = el.offsetWidth;
      position.height = el.offsetHeight;
      position.right = position.left + position.width;
      position.bottom = position.top + position.height;
      return position;
    };

    AnnotationTooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
      switch (placement) {
        case 'bottom-right':
          return {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2
          };
        case 'top-right':
          return {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2
          };
        case 'bottom-left':
          return {
            top: pos.top + pos.height,
            left: pos.left + pos.width / 2 - actualWidth
          };
        case 'top-left':
          return {
            top: pos.top - actualHeight,
            left: pos.left + pos.width / 2 - actualWidth
          };
      }
    };

    AnnotationTooltip.prototype.applyAdditionalStyle = function() {
      var editorBackgroundColor, shadow;
      editorBackgroundColor = Color(this.getEditorView().css('background-color'));
      shadow = "0 0 3px " + (editorBackgroundColor.clearer(0.1).rgbaString());
      return this.tip().find('.tooltip-inner').css('box-shadow', shadow);
    };

    AnnotationTooltip.prototype.getEditorRegion = function() {
      var underlayer;
      if (this.editorRegion != null) {
        return this.editorRegion;
      }
      underlayer = this.getEditorView().find('.underlayer');
      return this.editorRegion = {
        width: underlayer.outerWidth(),
        height: underlayer.outerHeight(),
        left: underlayer.offset().left
      };
    };

    AnnotationTooltip.prototype.getEditorView = function() {
      return this.options.editorView;
    };

    return AnnotationTooltip;

  })(Tooltip);

}).call(this);
