(function() {
  var Point, Range, Violation, _ref;

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  Violation = require('../lib/violation');

  describe('Violation', function() {
    var bufferRange;
    bufferRange = null;
    beforeEach(function() {
      var bufferPoint;
      bufferPoint = new Point(1, 2);
      return bufferRange = new Range(bufferPoint, bufferPoint);
    });
    describe('constructor', function() {
      it('sets properties', function() {
        var violation;
        violation = new Violation('warning', bufferRange, 'This is a message');
        expect(violation.severity).toBe('warning');
        expect(violation.bufferRange).toBe(bufferRange);
        return expect(violation.message).toBe('This is a message');
      });
      return describe('when unknown severity is passed', function() {
        return it('throws exception', function() {
          return expect(function() {
            return new Violation('foo', bufferRange, 'This is a message');
          }).toThrow();
        });
      });
    });
    describe('::getMessageHTML', function() {
      it('escapes HTML entities in the message', function() {
        var violation;
        violation = new Violation('warning', bufferRange, 'Do not use <font> tag.');
        return expect(violation.getMessageHTML()).toBe('Do not use &lt;font&gt; tag.');
      });
      it('marks up backquotes with <code> tag', function() {
        var message, violation;
        message = 'Favor `unless` over `if` for negative conditions.';
        violation = new Violation('warning', bufferRange, message);
        return expect(violation.getMessageHTML()).toBe('Favor <code>unless</code> over <code>if</code> for negative conditions.');
      });
      it('marks up single quotes with <code> tag', function() {
        var message, violation;
        message = "Background image 'bg_fallback.png' was used multiple times, " + 'first declared at line 42, col 2.';
        violation = new Violation('warning', bufferRange, message);
        return expect(violation.getMessageHTML()).toBe("Background image <code>bg_fallback.png</code> was used multiple times, " + 'first declared at line 42, col 2.');
      });
      it('does not confuse single quotes used as apostrophe with quotation', function() {
        var message, violation;
        message = "I don't and won't do this.";
        violation = new Violation('warning', bufferRange, message);
        return expect(violation.getMessageHTML()).toBe("I don&#39;t and won&#39;t do this.");
      });
      it('handles single quotes from the beginning to the end of the message', function() {
        var message, violation;
        message = "'this_is_a_snippet'";
        violation = new Violation('warning', bufferRange, message);
        return expect(violation.getMessageHTML()).toBe('<code>this_is_a_snippet</code>.');
      });
      return it('handles backquotes next to non-whitespaces', function() {
        var message, violation;
        message = 'Another good alternative is the usage of control flow `&&`/`||`.';
        violation = new Violation('warning', bufferRange, message);
        return expect(violation.getMessageHTML()).toBe('Another good alternative is ' + 'the usage of control flow <code>&amp;&amp;</code>/<code>||</code>.');
      });
    });
    describe('::getAttachmentHTML', function() {
      return it('returns null by default', function() {
        var violation;
        violation = new Violation('warning', bufferRange, 'This is a message.');
        return expect(violation.getAttachmentHTML()).toBeNull();
      });
    });
    return describe('::getMetadataHTML', function() {
      it('returns span elements for each metadata item', function() {
        var metadata, violation;
        metadata = ['foo', 'bar'];
        violation = new Violation('warning', bufferRange, 'This is a message.', metadata);
        return expect(violation.getMetadataHTML()).toBe('<span class="item">foo</span><span class="item">bar</span>');
      });
      return it('escapes HTML entities in the metadata', function() {
        var metadata, violation;
        metadata = ['<foo>'];
        violation = new Violation('warning', bufferRange, 'This is a message.', metadata);
        return expect(violation.getMetadataHTML()).toBe('<span class="item">&lt;foo&gt;</span>');
      });
    });
  });

}).call(this);
