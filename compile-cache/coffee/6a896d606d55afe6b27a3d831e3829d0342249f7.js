(function() {
  var $, EnvStore;

  EnvStore = require('../lib/env-store');

  $ = require('atom').$;

  require('./spec-helper');

  describe('EnvStore', function() {
    var originalEnv;
    originalEnv = null;
    beforeEach(function() {
      originalEnv = $.extend(true, {}, process.env);
      return EnvStore.clear();
    });
    afterEach(function() {
      return process.env = originalEnv;
    });
    return describe('.get', function() {
      describe('when no env is cached on disk', function() {
        it('always returns the current env', function() {
          expect(EnvStore.get().PATH).toBe(process.env.PATH);
          return expect(EnvStore.get().PATH).toBe(process.env.PATH);
        });
        return describe('and the current env is empty', function() {
          beforeEach(function() {
            return process.env = {};
          });
          return it('does not raise error', function() {
            return expect(function() {
              return EnvStore.get();
            }).not.toThrow();
          });
        });
      });
      return describe('when an env is cached on disk and new Atom instance is launched', function() {
        var cache;
        cache = function() {
          EnvStore.get();
          return EnvStore.clearEphemeralCache();
        };
        describe('and the current env has SHLVL', function() {
          describe('and the cached env also has SHLVL', function() {
            beforeEach(function() {
              process.env.SHLVL = '2';
              process.env.THIS_IS_CACHED = 'true';
              cache();
              return process.env.SHLVL = '2';
            });
            return describe('and even the cached env has more keys than the current one', function() {
              beforeEach(function() {
                return delete process.env.THIS_IS_CACHED;
              });
              return it('always returns the current env', function() {
                return expect(EnvStore.get().THIS_IS_CACHED).toBeUndefined();
              });
            });
          });
          return describe('and the cached env does not have SHLVL', function() {
            beforeEach(function() {
              delete process.env.SHLVL;
              process.env.THIS_IS_CACHED = 'true';
              cache();
              process.env.SHLVL = '2';
              return delete process.env.THIS_IS_CACHED;
            });
            return it('returns the current env', function() {
              return expect(EnvStore.get().THIS_IS_CACHED).toBeUndefined();
            });
          });
        });
        return describe('and the current env does not have SHLVL', function() {
          describe('and the cached env has SHLVL', function() {
            beforeEach(function() {
              process.env.SHLVL = '2';
              cache();
              delete process.env.SHLVL;
              return process.env.THIS_IS_CURRENT = 'true';
            });
            return it('returns the cached env', function() {
              return expect(EnvStore.get().THIS_IS_CURRENT).toBeUndefined();
            });
          });
          return describe('and the cached env also does not have SHLVL', function() {
            beforeEach(function() {
              delete process.env.SHLVL;
              process.env.FOO = 'foo';
              process.env.PATH += ':/foo/bar';
              return cache();
            });
            describe('and the current env has more keys than the cached one', function() {
              beforeEach(function() {
                return process.env.BAR = 'bar';
              });
              return it('returns the current env', function() {
                var env;
                env = EnvStore.get();
                expect(env.FOO).toBe('foo');
                return expect(env.BAR).toBe('bar');
              });
            });
            describe('and the cached env has more keys than the current one', function() {
              beforeEach(function() {
                return delete process.env.FOO;
              });
              return it('returns the cached env', function() {
                var env;
                env = EnvStore.get();
                return expect(env.FOO).toBe('foo');
              });
            });
            return describe('and the current and the cached env have same numbers of keys', function() {
              describe('and the current one has longer PATH', function() {
                beforeEach(function() {
                  return process.env.PATH += ':/foo/bar/baz';
                });
                return it('returns the current one', function() {
                  return expect(EnvStore.get().PATH).toContain(':/foo/bar/baz');
                });
              });
              describe('and the cache one has longer PATH', function() {
                beforeEach(function() {
                  return process.env.PATH = process.env.PATH.slice(0, -4);
                });
                return it('returns the cached one', function() {
                  return expect(EnvStore.get().PATH).toContain(':/foo/bar');
                });
              });
              return describe('and the current and cached env have same length PATH', function() {
                beforeEach(function() {
                  return process.env.PATH = process.env.PATH.replace('/bar', '/baz');
                });
                return it('returns the current one', function() {
                  return expect(EnvStore.get().PATH).toContain(':/foo/baz');
                });
              });
            });
          });
        });
      });
    });
  });

}).call(this);
