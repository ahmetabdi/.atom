(function() {
  var CompositeDisposable, Disposable, FuzzyProvider, ProviderManager, ScopedPropertyStore, SymbolProvider, grim, semver, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  ScopedPropertyStore = require('scoped-property-store');

  _ = require('underscore-plus');

  semver = require('semver');

  SymbolProvider = null;

  FuzzyProvider = null;

  grim = null;

  module.exports = ProviderManager = (function() {
    ProviderManager.prototype.fuzzyProvider = null;

    ProviderManager.prototype.fuzzyRegistration = null;

    ProviderManager.prototype.store = null;

    ProviderManager.prototype.subscriptions = null;

    ProviderManager.prototype.globalBlacklist = null;

    function ProviderManager() {
      this.registerProvider = __bind(this.registerProvider, this);
      this.removeProvider = __bind(this.removeProvider, this);
      this.addProvider = __bind(this.addProvider, this);
      this.apiVersionForProvider = __bind(this.apiVersionForProvider, this);
      this.setGlobalBlacklist = __bind(this.setGlobalBlacklist, this);
      this.toggleFuzzyProvider = __bind(this.toggleFuzzyProvider, this);
      this.providersForScopeDescriptor = __bind(this.providersForScopeDescriptor, this);
      this.subscriptions = new CompositeDisposable;
      this.globalBlacklist = new CompositeDisposable;
      this.providers = new Map;
      this.store = new ScopedPropertyStore;
      this.subscriptions.add(atom.config.observe('autocomplete-plus.enableBuiltinProvider', (function(_this) {
        return function(value) {
          return _this.toggleFuzzyProvider(value);
        };
      })(this)));
      this.subscriptions.add(atom.config.observe('autocomplete-plus.scopeBlacklist', (function(_this) {
        return function(value) {
          return _this.setGlobalBlacklist(value);
        };
      })(this)));
    }

    ProviderManager.prototype.dispose = function() {
      var _ref1, _ref2, _ref3, _ref4, _ref5;
      this.toggleFuzzyProvider(false);
      if ((_ref1 = this.globalBlacklist) != null) {
        _ref1.dispose();
      }
      this.globalBlacklist = null;
      this.blacklist = null;
      if ((_ref2 = this.subscriptions) != null) {
        _ref2.dispose();
      }
      this.subscriptions = null;
      if ((_ref3 = this.store) != null) {
        _ref3.cache = {};
      }
      if ((_ref4 = this.store) != null) {
        _ref4.propertySets = [];
      }
      this.store = null;
      if ((_ref5 = this.providers) != null) {
        _ref5.clear();
      }
      return this.providers = null;
    };

    ProviderManager.prototype.providersForScopeDescriptor = function(scopeDescriptor) {
      var blacklist, blacklistedProviders, fuzzyProviderBlacklisted, lowestIncludedPriority, provider, providers, scopeChain, _i, _j, _len, _len1, _ref1, _ref2, _results;
      scopeChain = (scopeDescriptor != null ? typeof scopeDescriptor.getScopeChain === "function" ? scopeDescriptor.getScopeChain() : void 0 : void 0) || scopeDescriptor;
      if (!((scopeChain != null) && (this.store != null))) {
        return [];
      }
      if (_.contains(this.blacklist, scopeChain)) {
        return [];
      }
      providers = this.store.getAll(scopeChain);
      blacklist = _.chain(providers).map(function(p) {
        return p.value.globalBlacklist;
      }).filter(function(p) {
        return (p != null) && p === true;
      }).value();
      if ((blacklist != null) && blacklist.length) {
        return [];
      }
      blacklistedProviders = _.chain(providers).filter(function(p) {
        return (p.value.blacklisted != null) && p.value.blacklisted === true;
      }).map(function(p) {
        return p.value.provider;
      }).value();
      if (this.fuzzyProvider != null) {
        fuzzyProviderBlacklisted = _.chain(providers).filter(function(p) {
          return (p.value.providerblacklisted != null) && p.value.providerblacklisted === 'autocomplete-plus-fuzzyprovider';
        }).map(function(p) {
          return p.value.provider;
        }).value();
      }
      providers = _.chain(providers).sortBy(function(p) {
        return -p.scopeSelector.length;
      }).map(function(p) {
        return p.value.provider;
      }).uniq().difference(blacklistedProviders).value();
      if ((fuzzyProviderBlacklisted != null) && fuzzyProviderBlacklisted.length && (this.fuzzyProvider != null)) {
        providers = _.without(providers, this.fuzzyProvider);
      }
      lowestIncludedPriority = 0;
      for (_i = 0, _len = providers.length; _i < _len; _i++) {
        provider = providers[_i];
        if (provider.excludeLowerPriority != null) {
          lowestIncludedPriority = Math.max(lowestIncludedPriority, (_ref1 = provider.inclusionPriority) != null ? _ref1 : 0);
        }
      }
      _results = [];
      for (_j = 0, _len1 = providers.length; _j < _len1; _j++) {
        provider = providers[_j];
        if (((_ref2 = provider.inclusionPriority) != null ? _ref2 : 0) >= lowestIncludedPriority) {
          _results.push(provider);
        }
      }
      return _results;
    };

    ProviderManager.prototype.toggleFuzzyProvider = function(enabled) {
      if (enabled == null) {
        return;
      }
      if (enabled) {
        if ((this.fuzzyProvider != null) || (this.fuzzyRegistration != null)) {
          return;
        }
        if (atom.config.get('autocomplete-plus.defaultProvider') === 'Symbol') {
          if (SymbolProvider == null) {
            SymbolProvider = require('./symbol-provider');
          }
          this.fuzzyProvider = new SymbolProvider();
        } else {
          if (FuzzyProvider == null) {
            FuzzyProvider = require('./fuzzy-provider');
          }
          this.fuzzyProvider = new FuzzyProvider();
        }
        return this.fuzzyRegistration = this.registerProvider(this.fuzzyProvider);
      } else {
        if (this.fuzzyRegistration != null) {
          this.fuzzyRegistration.dispose();
        }
        if (this.fuzzyProvider != null) {
          this.fuzzyProvider.dispose();
        }
        this.fuzzyRegistration = null;
        return this.fuzzyProvider = null;
      }
    };

    ProviderManager.prototype.setGlobalBlacklist = function(blacklist) {
      var properties, registration;
      this.blacklist = blacklist;
      if (this.globalBlacklist != null) {
        this.globalBlacklist.dispose();
      }
      this.globalBlacklist = new CompositeDisposable;
      if (this.blacklist == null) {
        this.blacklist = [];
      }
      if (!this.blacklist.length) {
        return;
      }
      properties = {};
      properties[blacklist.join(',')] = {
        globalBlacklist: true
      };
      registration = this.store.addProperties('globalblacklist', properties);
      return this.globalBlacklist.add(registration);
    };

    ProviderManager.prototype.isValidProvider = function(provider, apiVersion) {
      if (semver.satisfies(apiVersion, '>=2.0.0')) {
        return (provider != null) && _.isFunction(provider.getSuggestions) && _.isString(provider.selector) && !!provider.selector.length;
      } else {
        return (provider != null) && _.isFunction(provider.requestHandler) && _.isString(provider.selector) && !!provider.selector.length;
      }
    };

    ProviderManager.prototype.apiVersionForProvider = function(provider) {
      return this.providers.get(provider);
    };

    ProviderManager.prototype.isProviderRegistered = function(provider) {
      return this.providers.has(provider);
    };

    ProviderManager.prototype.addProvider = function(provider, apiVersion) {
      if (apiVersion == null) {
        apiVersion = '2.0.0';
      }
      if (this.isProviderRegistered(provider)) {
        return;
      }
      this.providers.set(provider, apiVersion);
      if (provider.dispose != null) {
        return this.subscriptions.add(provider);
      }
    };

    ProviderManager.prototype.removeProvider = function(provider) {
      var _ref1, _ref2;
      if ((_ref1 = this.providers) != null) {
        _ref1["delete"](provider);
      }
      if (provider.dispose != null) {
        return (_ref2 = this.subscriptions) != null ? _ref2.remove(provider) : void 0;
      }
    };

    ProviderManager.prototype.registerProvider = function(provider, apiVersion) {
      var apiIs20, blacklistRegistration, blacklistproperties, disabledSelector, disposable, originalDispose, properties, providerblacklist, providerblacklistRegistration, providerblacklistproperties, registration, selector, _ref1, _ref2;
      if (apiVersion == null) {
        apiVersion = '2.0.0';
      }
      if (provider == null) {
        return;
      }
      apiIs20 = semver.satisfies(apiVersion, '>=2.0.0');
      if (apiIs20) {
        if ((provider.id != null) && provider !== this.fuzzyProvider) {
          if (grim == null) {
            grim = require('grim');
          }
          grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\ncontains an `id` property.\nAn `id` attribute on your provider is no longer necessary.\nSee https://github.com/atom-community/autocomplete-plus/wiki/Provider-API");
        }
        if (provider.requestHandler != null) {
          if (grim == null) {
            grim = require('grim');
          }
          grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\ncontains a `requestHandler` property.\n`requestHandler` has been renamed to `getSuggestions`.\nSee https://github.com/atom-community/autocomplete-plus/wiki/Provider-API");
        }
        if (provider.blacklist != null) {
          if (grim == null) {
            grim = require('grim');
          }
          grim.deprecate("Autocomplete provider '" + provider.constructor.name + "(" + provider.id + ")'\ncontains a `blacklist` property.\n`blacklist` has been renamed to `disableForSelector`.\nSee https://github.com/atom-community/autocomplete-plus/wiki/Provider-API");
        }
      }
      if (!this.isValidProvider(provider, apiVersion)) {
        return;
      }
      if (this.isProviderRegistered(provider)) {
        return;
      }
      selector = provider.selector;
      disabledSelector = provider.disableForSelector;
      if (!apiIs20) {
        disabledSelector = provider.blacklist;
      }
      this.addProvider(provider, apiVersion);
      properties = {};
      properties[selector] = {
        provider: provider
      };
      registration = this.store.addProperties(null, properties);
      blacklistRegistration = null;
      if (disabledSelector != null ? disabledSelector.length : void 0) {
        blacklistproperties = {};
        blacklistproperties[disabledSelector] = {
          provider: provider,
          blacklisted: true
        };
        blacklistRegistration = this.store.addProperties(null, blacklistproperties);
      }
      providerblacklistRegistration = null;
      if ((_ref1 = provider.providerblacklist) != null ? (_ref2 = _ref1['autocomplete-plus-fuzzyprovider']) != null ? _ref2.length : void 0 : void 0) {
        providerblacklist = provider.providerblacklist['autocomplete-plus-fuzzyprovider'];
        if (providerblacklist.length) {
          providerblacklistproperties = {};
          providerblacklistproperties[providerblacklist] = {
            provider: provider,
            providerblacklisted: 'autocomplete-plus-fuzzyprovider'
          };
          providerblacklistRegistration = this.store.addProperties(null, providerblacklistproperties);
        }
      }
      disposable = new Disposable((function(_this) {
        return function() {
          if (typeof providerblacklistRegistation !== "undefined" && providerblacklistRegistation !== null) {
            providerblacklistRegistation.dispose();
          }
          if (registration != null) {
            registration.dispose();
          }
          if (blacklistRegistration != null) {
            blacklistRegistration.dispose();
          }
          return _this.removeProvider(provider);
        };
      })(this));
      if (originalDispose = provider.dispose) {
        provider.dispose = function() {
          originalDispose.call(provider);
          return disposable.dispose();
        };
      }
      return disposable;
    };

    return ProviderManager;

  })();

}).call(this);
