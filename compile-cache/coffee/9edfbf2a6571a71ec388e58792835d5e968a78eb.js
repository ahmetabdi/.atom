(function() {
  var Beautifiers, JsDiff, beautifier, fs, path;

  Beautifiers = require("../src/beautifiers");

  beautifier = new Beautifiers();

  fs = require("fs");

  path = require("path");

  JsDiff = require('diff');

  describe("BeautifyLanguages", function() {
    var allLanguages, config, configs, optionsDir, _i, _len, _results;
    optionsDir = path.resolve(__dirname, "../examples");
    allLanguages = ["c", "coffee-script", "css", "html", "java", "javascript", "json", "less", "mustache", "objective-c", "perl", "php", "python", "ruby", "sass", "sql", "typescript", "xml", "csharp", "gfm", "marko", "tss", "go"];
    beforeEach(function() {
      var lang, _fn, _i, _len;
      _fn = function(lang) {
        return waitsForPromise(function() {
          return atom.packages.activatePackage("language-" + lang);
        });
      };
      for (_i = 0, _len = allLanguages.length; _i < _len; _i++) {
        lang = allLanguages[_i];
        _fn(lang);
      }
      return waitsForPromise(function() {
        var activationPromise, pack;
        activationPromise = atom.packages.activatePackage('atom-beautify');
        pack = atom.packages.getLoadedPackage("atom-beautify");
        pack.activateNow();
        return activationPromise;
      });
    });

    /*
    Directory structure:
     - examples
       - config1
         - lang1
           - original
             - 1 - test.ext
           - expected
             - 1 - test.ext
         - lang2
       - config2
     */
    configs = fs.readdirSync(optionsDir);
    _results = [];
    for (_i = 0, _len = configs.length; _i < _len; _i++) {
      config = configs[_i];
      _results.push((function(config) {
        var langsDir, optionStats;
        langsDir = path.resolve(optionsDir, config);
        optionStats = fs.lstatSync(langsDir);
        if (optionStats.isDirectory()) {
          return describe("when using configuration '" + config + "'", function() {
            var lang, langNames, _j, _len1, _results1;
            langNames = fs.readdirSync(langsDir);
            _results1 = [];
            for (_j = 0, _len1 = langNames.length; _j < _len1; _j++) {
              lang = langNames[_j];
              _results1.push((function(lang) {
                var expectedDir, langStats, originalDir, testsDir;
                testsDir = path.resolve(langsDir, lang);
                langStats = fs.lstatSync(testsDir);
                if (langStats.isDirectory()) {
                  originalDir = path.resolve(testsDir, "original");
                  if (!fs.existsSync(originalDir)) {
                    console.warn("Directory for test originals/inputs not found." + (" Making it at " + originalDir + "."));
                    fs.mkdirSync(originalDir);
                  }
                  expectedDir = path.resolve(testsDir, "expected");
                  if (!fs.existsSync(expectedDir)) {
                    console.warn("Directory for test expected/results not found." + ("Making it at " + expectedDir + "."));
                    fs.mkdirSync(expectedDir);
                  }
                  return describe("when beautifying language '" + lang + "'", function() {
                    var testFileName, testNames, _k, _len2, _results2;
                    testNames = fs.readdirSync(originalDir);
                    _results2 = [];
                    for (_k = 0, _len2 = testNames.length; _k < _len2; _k++) {
                      testFileName = testNames[_k];
                      _results2.push((function(testFileName) {
                        var ext, testName;
                        ext = path.extname(testFileName);
                        testName = path.basename(testFileName, ext);
                        if (testFileName[0] === '_') {
                          return;
                        }
                        return it("" + testName + " " + testFileName, function() {
                          var allOptions, beautifyCompleted, completionFun, expectedContents, expectedTestPath, grammar, grammarName, originalContents, originalTestPath, _ref, _ref1;
                          originalTestPath = path.resolve(originalDir, testFileName);
                          expectedTestPath = path.resolve(expectedDir, testFileName);
                          originalContents = (_ref = fs.readFileSync(originalTestPath)) != null ? _ref.toString() : void 0;
                          if (!fs.existsSync(expectedTestPath)) {
                            throw new Error(("No matching expected test result found for '" + testName + "' ") + ("at '" + expectedTestPath + "'."));
                          }
                          expectedContents = (_ref1 = fs.readFileSync(expectedTestPath)) != null ? _ref1.toString() : void 0;
                          grammar = atom.grammars.selectGrammar(originalTestPath, originalContents);
                          grammarName = grammar.name;
                          allOptions = beautifier.getOptionsForPath(originalTestPath);
                          beautifyCompleted = false;
                          completionFun = function(text) {
                            var diff, fileName, newHeader, newStr, oldHeader, oldStr;
                            expect(text instanceof Error).not.toEqual(true, text);
                            expect(typeof text).toEqual("string");
                            if (text !== expectedContents) {
                              fileName = expectedTestPath;
                              oldStr = text;
                              newStr = expectedContents;
                              oldHeader = "beautified";
                              newHeader = "expected";
                              diff = JsDiff.createPatch(fileName, oldStr, newStr, oldHeader, newHeader);
                              expect(text).toEqual(expectedContents, "Beautifier output does not match expected output:\n" + diff);
                            }
                            return beautifyCompleted = true;
                          };
                          runs(function() {
                            var e;
                            try {
                              return beautifier.beautify(originalContents, allOptions, grammarName, testFileName).then(completionFun)["catch"](completionFun);
                            } catch (_error) {
                              e = _error;
                              return beautifyCompleted = e;
                            }
                          });
                          return waitsFor(function() {
                            if (beautifyCompleted instanceof Error) {
                              throw beautifyCompleted;
                            } else {
                              return beautifyCompleted;
                            }
                          }, "Waiting for beautification to complete", 5000);
                        });
                      })(testFileName));
                    }
                    return _results2;
                  });
                }
              })(lang));
            }
            return _results1;
          });
        }
      })(config));
    }
    return _results;
  });

}).call(this);
