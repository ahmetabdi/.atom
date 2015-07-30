(function() {
  var ResizeHandle, RubyTestView;

  ResizeHandle = require('../lib/resize-handle');

  RubyTestView = require('../lib/ruby-test-view');

  describe("ResizeHandle", function() {
    var activationPromise;
    activationPromise = null;
    beforeEach(function() {
      this.view = new RubyTestView;
      return this.resize = new ResizeHandle(this.view);
    });
    return describe("when the resize handle is double clicked", function() {
      beforeEach(function() {
        this.view.showPanel();
        this.panelBody = this.view.find('.panel-body');
        return this.panelBody.height(10);
      });
      return it("sets the height of the panel to be the height of the content", function() {
        this.view.results.text("line1\nline2\nline3\nline4");
        this.view.find('.ruby-test-resize-handle').trigger('dblclick');
        expect(this.panelBody.height()).toBeGreaterThan(10);
        this.panelBody.height(1000);
        this.view.find('.ruby-test-resize-handle').trigger('dblclick');
        return expect(this.view.height()).toBeLessThan(1000);
      });
    });
  });

}).call(this);
