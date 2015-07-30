(function() {
  module.exports = {
    name: "Fortran",
    namespace: "fortran",

    /*
    Supported Grammars
     */
    grammars: ["Fortran - Modern"],

    /*
    Supported extensions
     */
    extensions: ["f90"],

    /*
     */
    options: {
      emacs_path: {
        type: 'string',
        "default": "",
        description: "Path to the `emacs` executable"
      },
      emacs_script_path: {
        type: 'string',
        "default": "",
        description: "Path to the emacs script"
      }
    }
  };

}).call(this);
