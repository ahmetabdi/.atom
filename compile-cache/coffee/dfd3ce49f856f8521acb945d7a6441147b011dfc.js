(function() {
  var CompositeDisposable, Disposable, FuzzyProvider, ProviderManager, ProviderMetadata, Selector, SymbolProvider, grim, selectorsMatchScopeChain, semver, stableSort, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), CompositeDisposable = _ref.CompositeDisposable, Disposable = _ref.Disposable;

  _ = require('underscore-plus');

  semver = require('semver');

  Selector = require('selector-kit').Selector;

  stableSort = require('stable');

  selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;

  SymbolProvider = null;

  FuzzyProvider = null;

  grim = null;

  ProviderMetadata = null;

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
      this.metadataForProvider = __bind(this.metadataForProvider, this);
      this.setGlobalBlacklist = __bind(this.setGlobalBlacklist, this);
      this.toggleFuzzyProvider = __bind(this.toggleFuzzyProvider, this);
      this.providersForScopeDescriptor = __bind(this.providersForScopeDescriptor, this);
      this.subscriptions = new CompositeDisposable;
      this.globalBlacklist = new CompositeDisposable;
      this.providers = [];
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
      var _ref1;
      this.toggleFuzzyProvider(false);
      if ((_ref1 = this.subscriptions) != null) {
        _ref1.dispose();
      }
      this.subscriptions = null;
      return this.providers = null;
    };

    ProviderManager.prototype.providersForScopeDescriptor = function(scopeDescriptor) {
      var disableDefaultProvider, lowestIncludedPriority, matchingProviders, provider, providerMetadata, scopeChain, _i, _len, _ref1, _ref2;
      scopeChain = (scopeDescriptor != null ? typeof scopeDescriptor.getScopeChain === "function" ? scopeDescriptor.getScopeChain() : void 0 : void 0) || scopeDescriptor;
      if (!scopeChain) {
        return [];
      }
      if ((this.globalBlacklistSelectors != null) && selectorsMatchScopeChain(this.globalBlacklistSelectors, scopeChain)) {
        return [];
      }
      matchingProviders = [];
      disableDefaultProvider = false;
      lowestIncludedPriority = 0;
      _ref1 = this.providers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        providerMetadata = _ref1[_i];
        provider = providerMetadata.provider;
        if (providerMetadata.matchesScopeChain(scopeChain)) {
          matchingProviders.push(provider);
          if (provider.excludeLowerPriority != null) {
            lowestIncludedPriority = Math.max(lowestIncludedPriority, (_ref2 = provider.inclusionPriority) != null ? _ref2 : 0);
          }
          if (providerMetadata.shouldDisableDefaultProvider(scopeChain)) {
            disableDefaultProvider = true;
          }
        }
      }
      if (disableDefaultProvider) {
        matchingProviders = _.without(matchingProviders, this.fuzzyProvider);
      }
      matchingProviders = (function() {
        var _j, _len1, _ref3, _results;
        _results = [];
        for (_j = 0, _len1 = matchingProviders.length; _j < _len1; _j++) {
          provider = matchingProviders[_j];
          if (((_ref3 = provider.inclusionPriority) != null ? _ref3 : 0) >= lowestIncludedPriority) {
            _results.push(provider);
          }
        }
        return _results;
      })();
      return stableSort(matchingProviders, (function(_this) {
        return function(providerA, providerB) {
          var difference, specificityA, specificityB, _ref3, _ref4;
          specificityA = _this.metadataForProvider(providerA).getSpecificity(scopeChain);
          specificityB = _this.metadataForProvider(providerB).getSpecificity(scopeChain);
          difference = specificityB - specificityA;
          if (difference === 0) {
            difference = ((_ref3 = providerB.suggestionPriority) != null ? _ref3 : 1) - ((_ref4 = providerA.suggestionPriority) != null ? _ref4 : 1);
          }
          return difference;
        };
      })(this));
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

    ProviderManager.prototype.setGlobalBlacklist = function(globalBlacklist) {
      this.globalBlacklistSelectors = null;
      if (globalBlacklist != null ? globalBlacklist.length : void 0) {
        return this.globalBlacklistSelectors = Selector.create(globalBlacklist);
      }
    };

    ProviderManager.prototype.isValidProvider = function(provider, apiVersion) {
      if (semver.satisfies(apiVersion, '>=2.0.0')) {
        return (provider != null) && _.isFunction(provider.getSuggestions) && _.isString(provider.selector) && !!provider.selector.length;
      } else {
        return (provider != null) && _.isFunction(provider.requestHandler) && _.isString(provider.selector) && !!provider.selector.length;
      }
    };

    ProviderManager.prototype.metadataForProvider = function(provider) {
      var providerMetadata, _i, _len, _ref1;
      _ref1 = this.providers;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        providerMetadata = _ref1[_i];
        if (providerMetadata.provider === provider) {
          return providerMetadata;
        }
      }
      return null;
    };

    ProviderManager.prototype.apiVersionForProvider = function(provider) {
      var _ref1;
      return (_ref1 = this.metadataForProvider(provider)) != null ? _ref1.apiVersion : void 0;
    };

    ProviderManager.prototype.isProviderRegistered = function(provider) {
      return this.metadataForProvider(provider) != null;
    };

    ProviderManager.prototype.addProvider = function(provider, apiVersion) {
      if (apiVersion == null) {
        apiVersion = '2.0.0';
      }
      if (this.isProviderRegistered(provider)) {
        return;
      }
      if (ProviderMetadata == null) {
        ProviderMetadata = require('./provider-metadata');
      }
      this.providers.push(new ProviderMetadata(provider, apiVersion));
      if (provider.dispose != null) {
        return this.subscriptions.add(provider);
      }
    };

    ProviderManager.prototype.removeProvider = function(provider) {
      var i, providerMetadata, _i, _len, _ref1, _ref2;
      if (!this.providers) {
        return;
      }
      _ref1 = this.providers;
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        providerMetadata = _ref1[i];
        if (providerMetadata.provider === provider) {
          this.providers.splice(i, 1);
          break;
        }
      }
      if (provider.dispose != null) {
        return (_ref2 = this.subscriptions) != null ? _ref2.remove(provider) : void 0;
      }
    };

    ProviderManager.prototype.registerProvider = function(provider, apiVersion) {
      var apiIs20, disabledSelector, disposable, originalDispose, selector;
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
      disposable = new Disposable((function(_this) {
        return function() {
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
