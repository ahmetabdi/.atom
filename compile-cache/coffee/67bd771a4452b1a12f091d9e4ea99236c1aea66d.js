(function() {
  var NewConnectionView, WorkspaceView;

  WorkspaceView = require('atom').WorkspaceView;

  NewConnectionView = require('../lib/new-connection-view');

  describe("NewConnectionView", function() {
    beforeEach(function() {
      var activationPromise;
      atom.workspaceView = new WorkspaceView;
      return activationPromise = atom.packages.activatePackage('data-atom');
    });
    describe("when calling show and close", function() {
      return it("shows then closes", function() {
        var view;
        view = new NewConnectionView((function(_this) {
          return function() {};
        })(this));
        expect(atom.workspaceView.find('.connection-dialog')).not.toExist();
        view.show();
        expect(atom.workspaceView.find('.connection-dialog')).toExist();
        view.close();
        return expect(atom.workspaceView.find('.connection-dialog')).not.toExist();
      });
    });
    describe("when modifying the URL it updates the other fields", function() {
      var modifiedDelay, view;
      modifiedDelay = null;
      view = null;
      beforeEach(function() {
        view = new NewConnectionView((function(_this) {
          return function() {};
        })(this));
        view.show();
        view.url.isFocused = true;
        return modifiedDelay = view.url.getEditor().getBuffer().stoppedChangingDelay;
      });
      it("updates the server field", function() {
        expect(view.dbServer.getText()).toEqual('');
        view.url.setText('postgresql://localhost');
        advanceClock(modifiedDelay);
        return expect(view.dbServer.getText()).toEqual('localhost');
      });
      it("updates the server field with full url", function() {
        expect(view.dbServer.getText()).toEqual('');
        view.url.setText('postgresql://user:password1@server:9873/awesomeDb');
        advanceClock(modifiedDelay);
        return expect(view.dbServer.getText()).toEqual('server');
      });
      it("updates the port field with full url", function() {
        expect(view.dbPort.getText()).toEqual('');
        view.url.setText('postgresql://user:password1@server:9873/awesomeDb');
        advanceClock(modifiedDelay);
        return expect(view.dbPort.getText()).toEqual('9873');
      });
      it("updates the db name field with full url", function() {
        expect(view.dbName.getText()).toEqual('');
        view.url.setText('postgresql://user:password1@server:9873/myDb');
        advanceClock(modifiedDelay);
        return expect(view.dbName.getText()).toEqual('myDb');
      });
      it("updates the user & password field with full url", function() {
        expect(view.dbUser.getText()).toEqual('');
        expect(view.dbPassword.getText()).toEqual('');
        view.url.setText('postgresql://me:password1@server:9873/myDb');
        advanceClock(modifiedDelay);
        expect(view.dbUser.getText()).toEqual('me');
        return expect(view.dbPassword.getText()).toEqual('password1');
      });
      return it("updates the options from url", function() {
        expect(view.dbOptions.getText()).toEqual('');
        view.url.setText('postgresql://me:password1@server/myDb?o=v&hello=world');
        advanceClock(modifiedDelay);
        return expect(view.dbOptions.getText()).toEqual('o=v, hello=world');
      });
    });
    return describe("when modifying values other than URL", function() {
      var modifiedDelay, view;
      modifiedDelay = null;
      view = null;
      beforeEach(function() {
        view = new NewConnectionView((function(_this) {
          return function() {};
        })(this));
        view.show();
        return modifiedDelay = view.url.getEditor().getBuffer().stoppedChangingDelay;
      });
      it("reads the server value", function() {
        view.dbServer.setText('my-server');
        advanceClock(modifiedDelay);
        return expect(view.url.getText()).toEqual('postgresql://my-server/');
      });
      it("reads the port value", function() {
        view.dbServer.setText('my-server');
        view.dbPort.setText('1122');
        advanceClock(modifiedDelay);
        return expect(view.url.getText()).toEqual('postgresql://my-server:1122/');
      });
      it("reads the username & password value", function() {
        view.dbServer.setText('my-server');
        view.dbUser.setText('admin');
        view.dbPassword.setText('badPass');
        advanceClock(modifiedDelay);
        return expect(view.url.getText()).toEqual('postgresql://admin:badPass@my-server/');
      });
      it("reads the db name value", function() {
        view.dbServer.setText('my-server');
        view.dbName.setText('places');
        advanceClock(modifiedDelay);
        return expect(view.url.getText()).toEqual('postgresql://my-server/places');
      });
      it("reads the options", function() {
        view.dbOptions.setText('ssl=true');
        view.dbServer.setText('places');
        advanceClock(modifiedDelay);
        return expect(view.url.getText()).toEqual('postgresql://places/?ssl=true');
      });
      return it("reads multiple options", function() {
        view.dbOptions.setText('ssl=true, option=val');
        view.dbServer.setText('places');
        advanceClock(modifiedDelay);
        return expect(view.url.getText()).toEqual('postgresql://places/?ssl=true&option=val');
      });
    });
  });

}).call(this);
