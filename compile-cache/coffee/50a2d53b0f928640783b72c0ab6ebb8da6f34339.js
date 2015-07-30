(function() {
  var TravisCiStatus;

  TravisCiStatus = require('../lib/travis-ci-status');

  describe("TravisCiStatus", function() {
    var workspaceElement;
    workspaceElement = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('status-bar');
      });
      spyOn(TravisCiStatus, "isTravisProject").andCallFake(function(cb) {
        return cb(true);
      });
      workspaceElement = atom.views.getView(atom.workspace);
      return jasmine.attachToDOM(workspaceElement);
    });
    describe("when the travis-ci-status:toggle event is triggered", function() {
      beforeEach(function() {
        return spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "git@github.com:test/test.git";
            }
          }
        ]);
      });
      return it("attaches and then detaches the view", function() {
        expect(workspaceElement.querySelector(".travis-ci-status")).not.toExist();
        waitsForPromise(function() {
          return atom.packages.activatePackage("travis-ci-status");
        });
        return runs(function() {
          return expect(workspaceElement.querySelector(".travis-ci-status")).toExist();
        });
      });
    });
    return describe("can get the nwo if the project is a github repo", function() {
      it("gets nwo of https repo ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "https://github.com/tombell/travis-ci-status.git";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/travis-ci-status");
      });
      it("gets nwo of https repo not ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "https://github.com/tombell/test-status";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/test-status");
      });
      it("gets nwo of ssh repo ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "git@github.com:tombell/travis-ci-status.git";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/travis-ci-status");
      });
      return it("gets nwo of ssh repo not ending in .git", function() {
        var nwo;
        spyOn(atom.project, "getRepositories").andReturn([
          {
            getConfigValue: function(name) {
              return "git@github.com:tombell/test-status";
            }
          }
        ]);
        nwo = TravisCiStatus.getNameWithOwner();
        return expect(nwo).toEqual("tombell/test-status");
      });
    });
  });

}).call(this);
