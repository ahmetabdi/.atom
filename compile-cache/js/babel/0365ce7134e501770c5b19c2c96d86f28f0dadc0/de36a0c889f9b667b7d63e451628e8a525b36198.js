'use babel';
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.activate = activate;
exports.deactivate = deactivate;
var disposable;

function activate() {
  disposable = atom.commands.add('atom-pane', {
    'pane:split-up': splitPane,
    'pane:split-down': splitPane,
    'pane:split-left': splitPane,
    'pane:split-right': splitPane
  });
}

function deactivate() {
  disposable.dispose();
}

function splitPane(_ref) {
  var paneView = _ref.currentTarget;

  process.nextTick(function destroyPane() {
    paneView.getModel().destroyActiveItem();
  });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9wYW5lLXNwbGl0LW1vdmVzLXRhYi9saWIvcGFuZS1zcGxpdC1tb3Zlcy10YWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7O1FBR0ksUUFBUSxHQUFSLFFBQVE7UUFTUixVQUFVLEdBQVYsVUFBVTtBQVgxQixJQUFJLFVBQVUsQ0FBQzs7QUFFUixTQUFTLFFBQVEsR0FBRztBQUN6QixZQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFO0FBQzFDLG1CQUFlLEVBQUUsU0FBUztBQUMxQixxQkFBaUIsRUFBRSxTQUFTO0FBQzVCLHFCQUFpQixFQUFFLFNBQVM7QUFDNUIsc0JBQWtCLEVBQUUsU0FBUztHQUM5QixDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLFVBQVUsR0FBRztBQUMzQixZQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Q0FDdEI7O0FBRUQsU0FBUyxTQUFTLENBQUMsSUFBeUIsRUFBRTtNQUFYLFFBQVEsR0FBeEIsSUFBeUIsQ0FBeEIsYUFBYTs7QUFDL0IsU0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLFdBQVcsR0FBRztBQUN0QyxZQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztHQUN6QyxDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiIvVXNlcnMvYWhtZXQvLmF0b20vcGFja2FnZXMvcGFuZS1zcGxpdC1tb3Zlcy10YWIvbGliL3BhbmUtc3BsaXQtbW92ZXMtdGFiLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG52YXIgZGlzcG9zYWJsZTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlID0gYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20tcGFuZScsIHtcbiAgICAncGFuZTpzcGxpdC11cCc6IHNwbGl0UGFuZSxcbiAgICAncGFuZTpzcGxpdC1kb3duJzogc3BsaXRQYW5lLFxuICAgICdwYW5lOnNwbGl0LWxlZnQnOiBzcGxpdFBhbmUsXG4gICAgJ3BhbmU6c3BsaXQtcmlnaHQnOiBzcGxpdFBhbmVcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCkge1xuICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbn1cblxuZnVuY3Rpb24gc3BsaXRQYW5lKHtjdXJyZW50VGFyZ2V0OiBwYW5lVmlld30pIHtcbiAgcHJvY2Vzcy5uZXh0VGljayhmdW5jdGlvbiBkZXN0cm95UGFuZSgpIHtcbiAgICBwYW5lVmlldy5nZXRNb2RlbCgpLmRlc3Ryb3lBY3RpdmVJdGVtKCk7XG4gIH0pO1xufVxuIl19