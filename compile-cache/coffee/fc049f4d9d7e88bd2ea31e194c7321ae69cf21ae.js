(function() {
  var RubyTestView;

  RubyTestView = require('./ruby-test-view');

  module.exports = {
    config: {
      testAllCommand: {
        type: 'string',
        "default": "ruby -I test test"
      },
      testFileCommand: {
        type: 'string',
        "default": "ruby -I test {relative_path}"
      },
      testSingleCommand: {
        type: 'string',
        "default": "ruby -I test {relative_path}:{line_number}"
      },
      rspecAllCommand: {
        type: 'string',
        "default": "rspec --tty spec"
      },
      rspecFileCommand: {
        type: 'string',
        "default": "rspec --tty {relative_path}"
      },
      rspecSingleCommand: {
        type: 'string',
        "default": "rspec --tty {relative_path}:{line_number}"
      },
      cucumberAllCommand: {
        type: 'string',
        "default": "cucumber --color features"
      },
      cucumberFileCommand: {
        type: 'string',
        "default": "cucumber --color {relative_path}"
      },
      cucumberSingleCommand: {
        type: 'string',
        "default": "cucumber --color {relative_path}:{line_number}"
      },
      shell: {
        type: 'string',
        "default": "bash"
      }
    },
    rubyTestView: null,
    activate: function(state) {
      return this.rubyTestView = new RubyTestView(state.rubyTestViewState);
    },
    deactivate: function() {
      return this.rubyTestView.destroy();
    },
    serialize: function() {
      return {
        rubyTestViewState: this.rubyTestView.serialize()
      };
    }
  };

}).call(this);
