(function() {
  var DataAtomController, dataAtomController;

  DataAtomController = require('./data-atom-controller');

  dataAtomController = null;

  module.exports = {
    dataAtomController: null,
    activate: function(state) {
      return dataAtomController = new DataAtomController(state);
    },
    deactivate: function() {
      dataAtomController.destroy();
      return console.log("Data Atom off");
    },
    serialize: function() {
      return {
        dataAtomConrtollerState: dataAtomController.serialize()
      };
    }
  };

}).call(this);
