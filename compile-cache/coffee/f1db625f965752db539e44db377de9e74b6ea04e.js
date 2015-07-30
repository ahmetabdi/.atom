(function() {
  var $, AnnotationTooltip, Color, Config, ViolationTooltip,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Color = require('color');

  $ = require('atom').$;

  AnnotationTooltip = require('./annotation-tooltip');

  Config = require('./config');

  module.exports = ViolationTooltip = (function(_super) {
    __extends(ViolationTooltip, _super);

    function ViolationTooltip() {
      return ViolationTooltip.__super__.constructor.apply(this, arguments);
    }

    ViolationTooltip.DEFAULTS = $.extend({}, AnnotationTooltip.DEFAULTS, {
      violation: null,
      template: '<div class="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner">' + '<span class="message"></span><wbr><span class="metadata"></span>' + '<div class="attachment"></div>' + '</div>' + '</div>'
    });

    ViolationTooltip.prototype.init = function(type, element, options) {
      ViolationTooltip.__super__.init.call(this, type, element, options);
      this.violation = options.violation;
      return this.configSubscription = Config.onDidChange('showViolationMetadata', (function(_this) {
        return function(event) {
          return _this.switchMetadataDisplay();
        };
      })(this));
    };

    ViolationTooltip.prototype.getDefaults = function() {
      return ViolationTooltip.DEFAULTS;
    };

    ViolationTooltip.prototype.setContent = function() {
      this.setMessageContent();
      this.setMetadataContent();
      this.setAttachmentContent();
      return this.tip().removeClass('fade in top bottom left right');
    };

    ViolationTooltip.prototype.setMessageContent = function() {
      return this.content().find('.message').html(this.violation.getMessageHTML() || '');
    };

    ViolationTooltip.prototype.setMetadataContent = function() {
      return this.content().find('.metadata').html(this.violation.getMetadataHTML() || '');
    };

    ViolationTooltip.prototype.setAttachmentContent = function() {
      var $attachment, HTML;
      $attachment = this.content().find('.attachment');
      HTML = this.violation.getAttachmentHTML();
      if (HTML != null) {
        return $attachment.html(HTML);
      } else {
        return $attachment.hide();
      }
    };

    ViolationTooltip.prototype.hasContent = function() {
      return this.violation != null;
    };

    ViolationTooltip.prototype.applyAdditionalStyle = function() {
      var $code, frontColor;
      ViolationTooltip.__super__.applyAdditionalStyle.call(this);
      $code = this.content().find('code, pre');
      if ($code.length > 0) {
        frontColor = Color(this.content().css('color'));
        $code.css('color', frontColor.clone().rgbaString());
        $code.css('background-color', frontColor.clone().clearer(0.96).rgbaString());
        $code.css('border-color', frontColor.clone().clearer(0.86).rgbaString());
      }
      return this.switchMetadataDisplay();
    };

    ViolationTooltip.prototype.switchMetadataDisplay = function() {
      if (this.shouldShowMetadata()) {
        if (!this.metadataFitInLastLineOfMessage()) {
          return this.content().find('.metadata').addClass('block-metadata');
        }
      } else {
        return this.content().find('.metadata').hide();
      }
    };

    ViolationTooltip.prototype.shouldShowMetadata = function() {
      return Config.get('showViolationMetadata');
    };

    ViolationTooltip.prototype.metadataFitInLastLineOfMessage = function() {
      var $message, $metadata, messageBottom, metadataBottom;
      $metadata = this.content().find('.metadata');
      $metadata.css('display', 'inline');
      $message = this.content().find('.message');
      messageBottom = $message.position().top + $message.height();
      $metadata = this.content().find('.metadata');
      metadataBottom = $metadata.position().top + $metadata.height();
      $metadata.css('display', '');
      return messageBottom === metadataBottom;
    };

    ViolationTooltip.prototype.content = function() {
      return this.contentElement != null ? this.contentElement : this.contentElement = this.tip().find('.tooltip-inner');
    };

    ViolationTooltip.prototype.destroy = function() {
      ViolationTooltip.__super__.destroy.call(this);
      return this.configSubscription.off();
    };

    return ViolationTooltip;

  })(AnnotationTooltip);

}).call(this);
