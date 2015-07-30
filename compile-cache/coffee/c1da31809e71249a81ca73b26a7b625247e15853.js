(function() {
  var attributePattern, fs, path, tagPattern, trailingWhitespace;

  fs = require('fs');

  path = require('path');

  trailingWhitespace = /\s$/;

  attributePattern = /\s+([a-zA-Z][-a-zA-Z]*)\s*=\s*$/;

  tagPattern = /<([a-zA-Z][-a-zA-Z]*)(?:\s|$)/;

  module.exports = {
    selector: '.text.html',
    getSuggestions: function(request) {
      if (this.isAttributeValueStartWithNoPrefix(request)) {
        return this.getAllAttributeValueCompletions(request);
      } else if (this.isAttributeValueStartWithPrefix(request)) {
        return this.getAttributeValueCompletions(request);
      } else if (this.isAttributeStartWithNoPrefix(request)) {
        return this.getAllAttributeNameCompletions(request);
      } else if (this.isAttributeStartWithPrefix(request)) {
        return this.getAttributeNameCompletions(request);
      } else if (this.isTagStartWithNoPrefix(request)) {
        return this.getAllTagNameCompletions();
      } else if (this.isTagStartTagWithPrefix(request)) {
        return this.getTagNameCompletions(request);
      } else {
        return [];
      }
    },
    isTagStartWithNoPrefix: function(_arg) {
      var prefix, scopeDescriptor, scopes;
      prefix = _arg.prefix, scopeDescriptor = _arg.scopeDescriptor;
      scopes = scopeDescriptor.getScopesArray();
      return prefix === '<' && scopes.length === 1 && scopes[0] === 'text.html.basic';
    },
    isTagStartTagWithPrefix: function(_arg) {
      var prefix, scopeDescriptor;
      prefix = _arg.prefix, scopeDescriptor = _arg.scopeDescriptor;
      if (!prefix) {
        return false;
      }
      if (trailingWhitespace.test(prefix)) {
        return false;
      }
      return this.hasTagScope(scopeDescriptor.getScopesArray());
    },
    isAttributeStartWithNoPrefix: function(_arg) {
      var prefix, scopeDescriptor;
      prefix = _arg.prefix, scopeDescriptor = _arg.scopeDescriptor;
      if (!trailingWhitespace.test(prefix)) {
        return false;
      }
      return this.hasTagScope(scopeDescriptor.getScopesArray());
    },
    isAttributeStartWithPrefix: function(_arg) {
      var prefix, scopeDescriptor, scopes;
      prefix = _arg.prefix, scopeDescriptor = _arg.scopeDescriptor;
      if (!prefix) {
        return false;
      }
      if (trailingWhitespace.test(prefix)) {
        return false;
      }
      scopes = scopeDescriptor.getScopesArray();
      if (scopes.indexOf('entity.other.attribute-name.html') !== -1) {
        return true;
      }
      if (!this.hasTagScope(scopes)) {
        return false;
      }
      return scopes.indexOf('punctuation.definition.tag.html') !== -1 || scopes.indexOf('punctuation.definition.tag.end.html') !== -1;
    },
    isAttributeValueStartWithNoPrefix: function(_arg) {
      var lastPrefixCharacter, prefix, scopeDescriptor, scopes;
      scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      lastPrefixCharacter = prefix[prefix.length - 1];
      if (lastPrefixCharacter !== '"' && lastPrefixCharacter !== "'") {
        return false;
      }
      scopes = scopeDescriptor.getScopesArray();
      return this.hasStringScope(scopes) && this.hasTagScope(scopes);
    },
    isAttributeValueStartWithPrefix: function(_arg) {
      var lastPrefixCharacter, prefix, scopeDescriptor, scopes;
      scopeDescriptor = _arg.scopeDescriptor, prefix = _arg.prefix;
      lastPrefixCharacter = prefix[prefix.length - 1];
      if (lastPrefixCharacter === '"' || lastPrefixCharacter === "'") {
        return false;
      }
      scopes = scopeDescriptor.getScopesArray();
      return this.hasStringScope(scopes) && this.hasTagScope(scopes);
    },
    hasTagScope: function(scopes) {
      return scopes.indexOf('meta.tag.any.html') !== -1 || scopes.indexOf('meta.tag.other.html') !== -1 || scopes.indexOf('meta.tag.block.any.html') !== -1 || scopes.indexOf('meta.tag.inline.any.html') !== -1 || scopes.indexOf('meta.tag.structure.any.html') !== -1;
    },
    hasStringScope: function(scopes) {
      return scopes.indexOf('string.quoted.double.html') !== -1 || scopes.indexOf('string.quoted.single.html') !== -1;
    },
    getAllTagNameCompletions: function() {
      var attributes, completions, tag, _ref;
      completions = [];
      _ref = this.completions.tags;
      for (tag in _ref) {
        attributes = _ref[tag];
        completions.push({
          text: tag,
          replacementPrefix: ''
        });
      }
      return completions;
    },
    getTagNameCompletions: function(_arg) {
      var attributes, completions, lowerCasePrefix, prefix, tag, _ref;
      prefix = _arg.prefix;
      completions = [];
      lowerCasePrefix = prefix.toLowerCase();
      _ref = this.completions.tags;
      for (tag in _ref) {
        attributes = _ref[tag];
        if (tag.indexOf(lowerCasePrefix) === 0) {
          completions.push({
            text: tag,
            replacementPrefix: prefix
          });
        }
      }
      return completions;
    },
    getAllAttributeNameCompletions: function(_arg) {
      var attribute, bufferPosition, completions, editor, options, tagAttributes, _i, _len, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition;
      completions = [];
      _ref = this.completions.attributes;
      for (attribute in _ref) {
        options = _ref[attribute];
        if (options.global) {
          completions.push({
            text: attribute,
            replacementPrefix: ''
          });
        }
      }
      tagAttributes = this.getTagAttributes(editor, bufferPosition);
      for (_i = 0, _len = tagAttributes.length; _i < _len; _i++) {
        attribute = tagAttributes[_i];
        completions.push({
          text: attribute,
          replacementPrefix: ''
        });
      }
      return completions;
    },
    getAttributeNameCompletions: function(_arg) {
      var attribute, bufferPosition, completions, editor, lowerCasePrefix, options, prefix, tagAttributes, _i, _len, _ref;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, prefix = _arg.prefix;
      completions = [];
      lowerCasePrefix = prefix.toLowerCase();
      _ref = this.completions.attributes;
      for (attribute in _ref) {
        options = _ref[attribute];
        if (attribute.indexOf(lowerCasePrefix) === 0) {
          if (options.global) {
            completions.push({
              text: attribute,
              replacementPrefix: prefix
            });
          }
        }
      }
      tagAttributes = this.getTagAttributes(editor, bufferPosition);
      for (_i = 0, _len = tagAttributes.length; _i < _len; _i++) {
        attribute = tagAttributes[_i];
        if (attribute.indexOf(lowerCasePrefix) === 0) {
          completions.push({
            text: attribute,
            replacementPrefix: prefix
          });
        }
      }
      return completions;
    },
    getAllAttributeValueCompletions: function(_arg) {
      var bufferPosition, completions, editor, value, values, _i, _len;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition;
      completions = [];
      values = this.getAttributeValues(editor, bufferPosition);
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        completions.push({
          text: value,
          replacementPrefix: ''
        });
      }
      return completions;
    },
    getAttributeValueCompletions: function(_arg) {
      var bufferPosition, completions, editor, lowerCasePrefix, prefix, value, values, _i, _len;
      editor = _arg.editor, bufferPosition = _arg.bufferPosition, prefix = _arg.prefix;
      completions = [];
      values = this.getAttributeValues(editor, bufferPosition);
      lowerCasePrefix = prefix.toLowerCase();
      for (_i = 0, _len = values.length; _i < _len; _i++) {
        value = values[_i];
        if (value.indexOf(lowerCasePrefix) === 0) {
          completions.push({
            text: value,
            replacementPrefix: prefix
          });
        }
      }
      return completions;
    },
    loadCompletions: function() {
      this.completions = {};
      return fs.readFile(path.resolve(__dirname, '..', 'completions.json'), (function(_this) {
        return function(error, content) {
          if (error == null) {
            _this.completions = JSON.parse(content);
          }
        };
      })(this));
    },
    getPreviousTag: function(editor, bufferPosition) {
      var row, tag, _ref;
      row = bufferPosition.row;
      while (row >= 0) {
        tag = (_ref = tagPattern.exec(editor.lineTextForBufferRow(row))) != null ? _ref[1] : void 0;
        if (tag) {
          return tag;
        }
        row--;
      }
    },
    getPreviousAttribute: function(editor, bufferPosition) {
      var line, quoteIndex, _ref, _ref1;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]).trim();
      quoteIndex = line.length - 1;
      while (line[quoteIndex] && !((_ref = line[quoteIndex]) === '"' || _ref === "'")) {
        quoteIndex--;
      }
      line = line.substring(0, quoteIndex);
      return (_ref1 = attributePattern.exec(line)) != null ? _ref1[1] : void 0;
    },
    getAttributeValues: function(editor, bufferPosition) {
      var attribute, _ref;
      attribute = this.completions.attributes[this.getPreviousAttribute(editor, bufferPosition)];
      return (_ref = attribute != null ? attribute.attribOption : void 0) != null ? _ref : [];
    },
    getTagAttributes: function(editor, bufferPosition) {
      var tag, _ref, _ref1;
      tag = this.getPreviousTag(editor, bufferPosition);
      return (_ref = (_ref1 = this.completions.tags[tag]) != null ? _ref1.attributes : void 0) != null ? _ref : [];
    }
  };

}).call(this);
