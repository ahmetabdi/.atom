(function() {
  var CtagsProvider;

  module.exports = CtagsProvider = (function() {
    var tag_options;

    function CtagsProvider() {}

    CtagsProvider.prototype.id = 'autocomplete-ctags-ctagssprovider';

    CtagsProvider.prototype.selector = '*';

    tag_options = {
      partialMatch: true,
      maxItems: 10
    };

    CtagsProvider.prototype.requestHandler = function(options) {
      var i, k, matches, output, prefix, suggestions, v, _i, _len;
      prefix = options.prefix;
      if (!prefix.length) {
        return;
      }
      matches = this.ctagsCache.findTags(prefix, tag_options);
      suggestions = [];
      if (tag_options.partialMatch) {
        output = {};
        k = 0;
        while (k < matches.length) {
          v = matches[k++];
          if (output[v.name]) {
            continue;
          }
          output[v.name] = v;
          suggestions.push({
            word: v.name,
            prefix: prefix,
            label: v.pattern
          });
        }
        if (suggestions.length === 1 && suggestions[0].word === prefix) {
          return [];
        }
      } else {
        for (_i = 0, _len = matches.length; _i < _len; _i++) {
          i = matches[_i];
          suggestions.push({
            word: i.name,
            prefix: prefix,
            label: i.pattern
          });
        }
      }
      if (!suggestions.length) {
        return;
      }
      return suggestions;
    };

    return CtagsProvider;

  })();

}).call(this);
