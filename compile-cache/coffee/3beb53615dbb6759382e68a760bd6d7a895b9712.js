(function() {
  var Point, Range, Violation, ViolationTooltip, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  ViolationTooltip = require('../lib/violation-tooltip');

  Violation = require('../lib/violation');

  describe('ViolationTooltip', function() {
    var bufferPoint, bufferRange, originalAtomLintConfig, tooltip, violation;
    tooltip = null;
    bufferPoint = new Point(1, 2);
    bufferRange = new Range(bufferPoint, bufferPoint);
    violation = new Violation('warning', bufferRange, 'This is a message');
    originalAtomLintConfig = atom.config.get('atom-lint');
    beforeEach(function() {
      var editorView, options;
      atom.config.set('atom-lint', null);
      editorView = prepareWorkspace().editorView;
      options = {
        violation: violation,
        container: editorView,
        editorView: editorView
      };
      return tooltip = new ViolationTooltip(editorView, options);
    });
    afterEach(function() {
      if (tooltip != null) {
        tooltip.destroy();
      }
      return atom.config.set('atom-lint', originalAtomLintConfig);
    });
    describe('::show', function() {
      describe('when config "atom-lint.showViolationMetadata" is true', function() {
        beforeEach(function() {
          return atom.config.set('atom-lint.showViolationMetadata', true);
        });
        return it('shows metadata of the violation', function() {
          var $metadata;
          tooltip.show();
          $metadata = tooltip.content().find('.metadata');
          return expect($metadata.css('display')).not.toBe('none');
        });
      });
      return describe('when config "atom-lint.showViolationMetadata" is false', function() {
        beforeEach(function() {
          return atom.config.set('atom-lint.showViolationMetadata', false);
        });
        return it('hides metadata of the violation', function() {
          var $metadata;
          tooltip.show();
          $metadata = tooltip.content().find('.metadata');
          return expect($metadata.css('display')).toBe('none');
        });
      });
    });
    return describe('when the tooltip is shown', function() {
      describe('and config "atom-lint.showViolationMetadata" is changed from true to false', function() {
        beforeEach(function() {
          atom.config.set('atom-lint.showViolationMetadata', true);
          tooltip.show();
          return atom.config.set('atom-lint.showViolationMetadata', false);
        });
        return it('hides metadata of the violation', function() {
          var $metadata;
          $metadata = tooltip.content().find('.metadata');
          return expect($metadata.css('display')).toBe('none');
        });
      });
      return describe('and config "atom-lint.showViolationMetadata" is changed from false to true', function() {
        beforeEach(function() {
          atom.config.set('atom-lint.showViolationMetadata', false);
          tooltip.show();
          return atom.config.set('atom-lint.showViolationMetadata', true);
        });
        return it('shows metadata of the violation', function() {
          var $metadata;
          $metadata = tooltip.content().find('.metadata');
          return expect($metadata.css('display')).not.toBe('none');
        });
      });
    });
  });

}).call(this);
