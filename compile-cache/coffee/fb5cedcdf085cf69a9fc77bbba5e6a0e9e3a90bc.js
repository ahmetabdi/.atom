(function() {
  var $, ResizeHandle,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('atom-space-pen-views').$;

  module.exports = ResizeHandle = (function() {
    function ResizeHandle(view) {
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      this.resizeTreeView = __bind(this.resizeTreeView, this);
      this.resizeToFitContent = __bind(this.resizeToFitContent, this);
      this.view = view;
      this.view.on('dblclick', '.ruby-test-resize-handle', this.resizeToFitContent);
      this.view.on('mousedown', '.ruby-test-resize-handle', this.resizeStarted);
      this.panelBody = this.view.find('.panel-body');
      this.resultsEl = this.view.results;
    }

    ResizeHandle.prototype.resizeToFitContent = function() {
      this.panelBody.height(1);
      return this.panelBody.height(Math.max(this.resultsEl.outerHeight(), 40));
    };

    ResizeHandle.prototype.resizeTreeView = function(_arg) {
      var statusBarHeight, testBarHeight, workspaceHeight;
      workspaceHeight = $('.workspace').outerHeight();
      statusBarHeight = $('.status-bar').outerHeight();
      testBarHeight = $('.ruby-test .panel-heading').outerHeight();
      return this.panelBody.height(workspaceHeight - _arg.pageY - statusBarHeight - testBarHeight - 28);
    };

    ResizeHandle.prototype.resizeStarted = function() {
      $(document.body).on('mousemove', this.resizeTreeView);
      return $(document.body).on('mouseup', this.resizeStopped);
    };

    ResizeHandle.prototype.resizeStopped = function() {
      $(document.body).off('mousemove', this.resizeTreeView);
      return $(document.body).off('mouseup', this.resizeStopped);
    };

    return ResizeHandle;

  })();

}).call(this);
