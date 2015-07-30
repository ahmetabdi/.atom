/** @preserve
*  Copyright (c) 2014, Facebook, Inc.
*  All rights reserved.
*
*  This source code is licensed under the BSD-style license found in the
*  LICENSE file in the root directory of this source tree. An additional grant
*  of patent rights can be found in the PATENTS file in the same directory.
*
*/
'use strict';

/**
* This is a very simple HTML to JSX converter. It turns out that browsers
* have good HTML parsers (who would have thought?) so we utilise this by
* inserting the HTML into a temporary DOM node, and then do a breadth-first
* traversal of the resulting DOM tree.
*/

// https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType
var NODE_TYPE = {
  ELEMENT: 1,
  TEXT: 3,
  COMMENT: 8
};

var ATTRIBUTE_MAPPING = {
  'for': 'htmlFor',
  'class': 'className'
};

var ELEMENT_ATTRIBUTE_MAPPING = {
  'input': {
    'checked': 'defaultChecked',
    'value': 'defaultValue'
  }
};

/**
* Repeats a string a certain number of times.
* Also: the future is bright and consists of native string repetition:
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat
*
* @param {string} string  String to repeat
* @param {number} times   Number of times to repeat string. Integer.
* @see http://jsperf.com/string-repeater/2
*/
function repeatString(string, times) {
  if (times === 1) {
    return string;
  }
  if (times < 0) {
    throw new Error();
  }
  var repeated = '';
  while (times) {
    if (times & 1) {
      repeated += string;
    }
    if (times >>= 1) {
      string += string;
    }
  }
  return repeated;
}

/**
* Determine if the string ends with the specified substring.
*
* @param {string} haystack String to search in
* @param {string} needle   String to search for
* @return {boolean}
*/
function endsWith(haystack, needle) {
  return haystack.slice(-needle.length) === needle;
}

/**
* Trim the specified substring off the string. If the string does not end
* with the specified substring, this is a no-op.
*
* @param {string} haystack String to search in
* @param {string} needle   String to search for
* @return {string}
*/
function trimEnd(haystack, needle) {
  return endsWith(haystack, needle) ? haystack.slice(0, -needle.length) : haystack;
}

/**
* Convert a hyphenated string to camelCase.
*/
function hyphenToCamelCase(string) {
  return string.replace(/-(.)/g, function (match, chr) {
    return chr.toUpperCase();
  });
}

/**
* Determines if the specified string consists entirely of whitespace.
*/
function isEmpty(string) {
  return !/[^\s]/.test(string);
}

/**
* Determines if the CSS value can be converted from a
* 'px' suffixed string to a numeric value
*
* @param {string} value CSS property value
* @return {boolean}
*/
function isConvertiblePixelValue(value) {
  return /^\d+px$/.test(value);
}

/**
* Determines if the specified string consists entirely of numeric characters.
*/
function isNumeric(input) {
  return input !== undefined && input !== null && (typeof input === 'number' || parseInt(input, 10) == input);
}

var createElement = function createElement(tag) {
  return document.createElement(tag);
};

var tempEl = createElement('div');
/**
* Escapes special characters by converting them to their escaped equivalent
* (eg. "<" to "&lt;"). Only escapes characters that absolutely must be escaped.
*
* @param {string} value
* @return {string}
*/
function escapeSpecialChars(value) {
  // Uses this One Weird Trick to escape text - Raw text inserted as textContent
  // will have its escaped version in innerHTML.
  tempEl.textContent = value;
  return tempEl.innerHTML;
}

var HTMLtoJSX = function HTMLtoJSX(config) {
  this.config = config || {};

  if (this.config.createClass === undefined) {
    this.config.createClass = true;
  }
  if (!this.config.indent) {
    this.config.indent = '  ';
  }
  if (!this.config.outputClassName) {
    this.config.outputClassName = 'NewComponent';
  }
};

HTMLtoJSX.prototype = {
  /**
  * Reset the internal state of the converter
  */
  reset: function reset() {
    this.output = '';
    this.level = 0;
  },
  /**
  * Main entry point to the converter. Given the specified HTML, returns a
  * JSX object representing it.
  * @param {string} html HTML to convert
  * @return {string} JSX
  */
  convert: function convert(html) {
    this.reset();

    var containerEl = createElement('div');
    containerEl.innerHTML = '\n' + this._cleanInput(html) + '\n';

    if (this.config.createClass) {
      if (this.config.outputClassName) {
        this.output = 'var ' + this.config.outputClassName + ' = React.createClass({\n';
      } else {
        this.output = 'React.createClass({\n';
      }
      this.output += this.config.indent + 'render: function() {' + '\n';
      this.output += this.config.indent + this.config.indent + 'return (\n';
    }

    if (this._onlyOneTopLevel(containerEl)) {
      // Only one top-level element, the component can return it directly
      // No need to actually visit the container element
      this._traverse(containerEl);
    } else {
      // More than one top-level element, need to wrap the whole thing in a
      // container.
      this.output += this.config.indent + this.config.indent + this.config.indent;
      this.level++;
      this._visit(containerEl);
    }
    this.output = this.output.trim() + '\n';
    if (this.config.createClass) {
      this.output += this.config.indent + this.config.indent + ');\n';
      this.output += this.config.indent + '}\n';
      this.output += '});';
    }
    return this.output;
  },

  /**
  * Cleans up the specified HTML so it's in a format acceptable for
  * converting.
  *
  * @param {string} html HTML to clean
  * @return {string} Cleaned HTML
  */
  _cleanInput: function _cleanInput(html) {
    // Remove unnecessary whitespace
    html = html.trim();
    // Ugly method to strip script tags. They can wreak havoc on the DOM nodes
    // so let's not even put them in the DOM.
    html = html.replace(/<script([\s\S]*?)<\/script>/g, '');
    return html;
  },

  /**
  * Determines if there's only one top-level node in the DOM tree. That is,
  * all the HTML is wrapped by a single HTML tag.
  *
  * @param {DOMElement} containerEl Container element
  * @return {boolean}
  */
  _onlyOneTopLevel: function _onlyOneTopLevel(containerEl) {
    // Only a single child element
    if (containerEl.childNodes.length === 1 && containerEl.childNodes[0].nodeType === NODE_TYPE.ELEMENT) {
      return true;
    }
    // Only one element, and all other children are whitespace
    var foundElement = false;
    for (var i = 0, count = containerEl.childNodes.length; i < count; i++) {
      var child = containerEl.childNodes[i];
      if (child.nodeType === NODE_TYPE.ELEMENT) {
        if (foundElement) {
          // Encountered an element after already encountering another one
          // Therefore, more than one element at root level
          return false;
        } else {
          foundElement = true;
        }
      } else if (child.nodeType === NODE_TYPE.TEXT && !isEmpty(child.textContent)) {
        // Contains text content
        return false;
      }
    }
    return true;
  },

  /**
  * Gets a newline followed by the correct indentation for the current
  * nesting level
  *
  * @return {string}
  */
  _getIndentedNewline: function _getIndentedNewline() {
    return '\n' + repeatString(this.config.indent, this.level + 2);
  },

  /**
  * Handles processing the specified node
  *
  * @param {Node} node
  */
  _visit: function _visit(node) {
    this._beginVisit(node);
    this._traverse(node);
    this._endVisit(node);
  },

  /**
  * Traverses all the children of the specified node
  *
  * @param {Node} node
  */
  _traverse: function _traverse(node) {
    this.level++;
    for (var i = 0, count = node.childNodes.length; i < count; i++) {
      this._visit(node.childNodes[i]);
    }
    this.level--;
  },

  /**
  * Handle pre-visit behaviour for the specified node.
  *
  * @param {Node} node
  */
  _beginVisit: function _beginVisit(node) {
    switch (node.nodeType) {
      case NODE_TYPE.ELEMENT:
        this._beginVisitElement(node);
        break;

      case NODE_TYPE.TEXT:
        this._visitText(node);
        break;

      case NODE_TYPE.COMMENT:
        this._visitComment(node);
        break;

      default:
        console.warn('Unrecognised node type: ' + node.nodeType);
    }
  },

  /**
  * Handles post-visit behaviour for the specified node.
  *
  * @param {Node} node
  */
  _endVisit: function _endVisit(node) {
    switch (node.nodeType) {
      case NODE_TYPE.ELEMENT:
        this._endVisitElement(node);
        break;
      // No ending tags required for these types
      case NODE_TYPE.TEXT:
      case NODE_TYPE.COMMENT:
        break;
    }
  },

  /**
  * Handles pre-visit behaviour for the specified element node
  *
  * @param {DOMElement} node
  */
  _beginVisitElement: function _beginVisitElement(node) {
    var tagName = node.tagName.toLowerCase();
    var attributes = [];
    for (var i = 0, count = node.attributes.length; i < count; i++) {
      attributes.push(this._getElementAttribute(node, node.attributes[i]));
    }

    this.output += '<' + tagName;
    if (attributes.length > 0) {
      this.output += ' ' + attributes.join(' ');
    }
    if (node.firstChild) {
      this.output += '>';
    }
  },

  /**
  * Handles post-visit behaviour for the specified element node
  *
  * @param {Node} node
  */
  _endVisitElement: function _endVisitElement(node) {
    // De-indent a bit
    // TODO: It's inefficient to do it this way :/
    this.output = trimEnd(this.output, this.config.indent);
    if (node.firstChild) {
      this.output += '</' + node.tagName.toLowerCase() + '>';
    } else {
      this.output += ' />';
    }
  },

  /**
  * Handles processing of the specified text node
  *
  * @param {TextNode} node
  */
  _visitText: function _visitText(node) {
    var text = node.textContent;
    // If there's a newline in the text, adjust the indent level
    if (text.indexOf('\n') > -1) {
      text = node.textContent.replace(/\n\s*/g, this._getIndentedNewline());
    }
    this.output += escapeSpecialChars(text);
  },

  /**
  * Handles processing of the specified text node
  *
  * @param {Text} node
  */
  _visitComment: function _visitComment(node) {
    // Do not render the comment
    // Since we remove comments, we also need to remove the next line break so we
    // don't end up with extra whitespace after every comment
    //if (node.nextSibling && node.nextSibling.nodeType === NODE_TYPE.TEXT) {
    //  node.nextSibling.textContent = node.nextSibling.textContent.replace(/\n\s*/, '');
    //}
    this.output += '{/*' + node.textContent.replace('*/', '* /') + '*/}';
  },

  /**
  * Gets a JSX formatted version of the specified attribute from the node
  *
  * @param {DOMElement} node
  * @param {object}     attribute
  * @return {string}
  */
  _getElementAttribute: function _getElementAttribute(node, attribute) {
    switch (attribute.name) {
      case 'style':
        return this._getStyleAttribute(attribute.value);
      default:
        var tagName = node.tagName.toLowerCase();
        var name = ELEMENT_ATTRIBUTE_MAPPING[tagName] && ELEMENT_ATTRIBUTE_MAPPING[tagName][attribute.name] || ATTRIBUTE_MAPPING[attribute.name] || attribute.name;
        var result = name;

        // Numeric values should be output as {123} not "123"
        if (isNumeric(attribute.value)) {
          result += '={' + attribute.value + '}';
        } else if (attribute.value.length > 0) {
          result += '="' + attribute.value.replace('"', '&quot;') + '"';
        }
        return result;
    }
  },

  /**
  * Gets a JSX formatted version of the specified element styles
  *
  * @param {string} styles
  * @return {string}
  */
  _getStyleAttribute: function _getStyleAttribute(styles) {
    var jsxStyles = new StyleParser(styles).toJSXString();
    return 'style={{' + jsxStyles + '}}';
  }
};

/**
* Handles parsing of inline styles
*
* @param {string} rawStyle Raw style attribute
* @constructor
*/
var StyleParser = function StyleParser(rawStyle) {
  this.parse(rawStyle);
};
StyleParser.prototype = {
  /**
  * Parse the specified inline style attribute value
  * @param {string} rawStyle Raw style attribute
  */
  parse: function parse(rawStyle) {
    this.styles = {};
    rawStyle.split(';').forEach(function (style) {
      style = style.trim();
      var firstColon = style.indexOf(':');
      var key = style.substr(0, firstColon);
      var value = style.substr(firstColon + 1).trim();
      if (key !== '') {
        this.styles[key] = value;
      }
    }, this);
  },

  /**
  * Convert the style information represented by this parser into a JSX
  * string
  *
  * @return {string}
  */
  toJSXString: function toJSXString() {
    var output = [];
    for (var key in this.styles) {
      if (!this.styles.hasOwnProperty(key)) {
        continue;
      }
      output.push(this.toJSXKey(key) + ': ' + this.toJSXValue(this.styles[key]));
    }
    return output.join(', ');
  },

  /**
  * Convert the CSS style key to a JSX style key
  *
  * @param {string} key CSS style key
  * @return {string} JSX style key
  */
  toJSXKey: function toJSXKey(key) {
    return hyphenToCamelCase(key);
  },

  /**
  * Convert the CSS style value to a JSX style value
  *
  * @param {string} value CSS style value
  * @return {string} JSX style value
  */
  toJSXValue: function toJSXValue(value) {
    if (isNumeric(value)) {
      // If numeric, no quotes
      return value;
    } else if (isConvertiblePixelValue(value)) {
      // "500px" -> 500
      return trimEnd(value, 'px');
    } else {
      // Probably a string, wrap it in quotes
      return '\'' + value.replace(/'/g, '"') + '\'';
    }
  }
};

module.exports = HTMLtoJSX;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9yZWFjdC9saWIvaHRtbHRvanN4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQVNBLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQVViLElBQUksU0FBUyxHQUFHO0FBQ2QsU0FBTyxFQUFFLENBQUM7QUFDVixNQUFJLEVBQUUsQ0FBQztBQUNQLFNBQU8sRUFBRSxDQUFDO0NBQ1gsQ0FBQzs7QUFFRixJQUFJLGlCQUFpQixHQUFHO0FBQ3RCLE9BQUssRUFBRSxTQUFTO0FBQ2hCLFNBQU8sRUFBRSxXQUFXO0NBQ3JCLENBQUM7O0FBRUYsSUFBSSx5QkFBeUIsR0FBRztBQUM5QixTQUFPLEVBQUU7QUFDUCxhQUFTLEVBQUUsZ0JBQWdCO0FBQzNCLFdBQU8sRUFBRSxjQUFjO0dBQ3hCO0NBQ0YsQ0FBQzs7Ozs7Ozs7Ozs7QUFXRixTQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQ25DLE1BQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNmLFdBQU8sTUFBTSxDQUFDO0dBQ2Y7QUFDRCxNQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFBRSxVQUFNLElBQUksS0FBSyxFQUFFLENBQUM7R0FBRTtBQUNyQyxNQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDbEIsU0FBTyxLQUFLLEVBQUU7QUFDWixRQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDYixjQUFRLElBQUksTUFBTSxDQUFDO0tBQ3BCO0FBQ0QsUUFBSSxLQUFLLEtBQUssQ0FBQyxFQUFFO0FBQ2YsWUFBTSxJQUFJLE1BQU0sQ0FBQztLQUNsQjtHQUNGO0FBQ0QsU0FBTyxRQUFRLENBQUM7Q0FDakI7Ozs7Ozs7OztBQVNELFNBQVMsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUU7QUFDbEMsU0FBTyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sQ0FBQztDQUNsRDs7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QUVwQixhQUFPLEtBQUssQ0FBQztLQUNkLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQyxLQUFLLENBQUMsRUFBRTs7QUFFekMsYUFBTyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzdCLE1BQU07O0FBRUwsYUFBTyxJQUFJLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO0tBQy9DO0dBQ0Y7Q0FDRixDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6Ii9Vc2Vycy9haG1ldC8uYXRvbS9wYWNrYWdlcy9yZWFjdC9saWIvaHRtbHRvanN4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqIEBwcmVzZXJ2ZVxuKiAgQ29weXJpZ2h0IChjKSAyMDE0LCBGYWNlYm9vaywgSW5jLlxuKiAgQWxsIHJpZ2h0cyByZXNlcnZlZC5cbipcbiogIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuKiAgTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4qICBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbipcbiovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuKiBUaGlzIGlzIGEgdmVyeSBzaW1wbGUgSFRNTCB0byBKU1ggY29udmVydGVyLiBJdCB0dXJucyBvdXQgdGhhdCBicm93c2Vyc1xuKiBoYXZlIGdvb2QgSFRNTCBwYXJzZXJzICh3aG8gd291bGQgaGF2ZSB0aG91Z2h0Pykgc28gd2UgdXRpbGlzZSB0aGlzIGJ5XG4qIGluc2VydGluZyB0aGUgSFRNTCBpbnRvIGEgdGVtcG9yYXJ5IERPTSBub2RlLCBhbmQgdGhlbiBkbyBhIGJyZWFkdGgtZmlyc3RcbiogdHJhdmVyc2FsIG9mIHRoZSByZXN1bHRpbmcgRE9NIHRyZWUuXG4qL1xuXG4vLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvTm9kZS5ub2RlVHlwZVxudmFyIE5PREVfVFlQRSA9IHtcbiAgRUxFTUVOVDogMSxcbiAgVEVYVDogMyxcbiAgQ09NTUVOVDogOFxufTtcblxudmFyIEFUVFJJQlVURV9NQVBQSU5HID0ge1xuICAnZm9yJzogJ2h0bWxGb3InLFxuICAnY2xhc3MnOiAnY2xhc3NOYW1lJ1xufTtcblxudmFyIEVMRU1FTlRfQVRUUklCVVRFX01BUFBJTkcgPSB7XG4gICdpbnB1dCc6IHtcbiAgICAnY2hlY2tlZCc6ICdkZWZhdWx0Q2hlY2tlZCcsXG4gICAgJ3ZhbHVlJzogJ2RlZmF1bHRWYWx1ZSdcbiAgfVxufTtcblxuLyoqXG4qIFJlcGVhdHMgYSBzdHJpbmcgYSBjZXJ0YWluIG51bWJlciBvZiB0aW1lcy5cbiogQWxzbzogdGhlIGZ1dHVyZSBpcyBicmlnaHQgYW5kIGNvbnNpc3RzIG9mIG5hdGl2ZSBzdHJpbmcgcmVwZXRpdGlvbjpcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvU3RyaW5nL3JlcGVhdFxuKlxuKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nICBTdHJpbmcgdG8gcmVwZWF0XG4qIEBwYXJhbSB7bnVtYmVyfSB0aW1lcyAgIE51bWJlciBvZiB0aW1lcyB0byByZXBlYXQgc3RyaW5nLiBJbnRlZ2VyLlxuKiBAc2VlIGh0dHA6Ly9qc3BlcmYuY29tL3N0cmluZy1yZXBlYXRlci8yXG4qL1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nKHN0cmluZywgdGltZXMpIHtcbiAgaWYgKHRpbWVzID09PSAxKSB7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfVxuICBpZiAodGltZXMgPCAwKSB7IHRocm93IG5ldyBFcnJvcigpOyB9XG4gIHZhciByZXBlYXRlZCA9ICcnO1xuICB3aGlsZSAodGltZXMpIHtcbiAgICBpZiAodGltZXMgJiAxKSB7XG4gICAgICByZXBlYXRlZCArPSBzdHJpbmc7XG4gICAgfVxuICAgIGlmICh0aW1lcyA+Pj0gMSkge1xuICAgICAgc3RyaW5nICs9IHN0cmluZztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlcGVhdGVkO1xufVxuXG4vKipcbiogRGV0ZXJtaW5lIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIHRoZSBzcGVjaWZpZWQgc3Vic3RyaW5nLlxuKlxuKiBAcGFyYW0ge3N0cmluZ30gaGF5c3RhY2sgU3RyaW5nIHRvIHNlYXJjaCBpblxuKiBAcGFyYW0ge3N0cmluZ30gbmVlZGxlICAgU3RyaW5nIHRvIHNlYXJjaCBmb3JcbiogQHJldHVybiB7Ym9vbGVhbn1cbiovXG5mdW5jdGlvbiBlbmRzV2l0aChoYXlzdGFjaywgbmVlZGxlKSB7XG4gIHJldHVybiBoYXlzdGFjay5zbGljZSgtbmVlZGxlLmxlbmd0aCkgPT09IG5lZWRsZTtcbn1cblxuLyoqXG4qIFRyaW0gdGhlIHNwZWNpZmllZCBzdWJzdHJpbmcgb2ZmIHRoZSBzdHJpbmcuIElmIHRoZSBzdHJpbmcgZG9lcyBub3QgZW5kXG4qIHdpdGggdGhlIHNwZWNpZmllZCBzdWJzdHJpbmcsIHRoaXMgaXMgYSBuby1vcC5cbipcbiogQHBhcmFtIHtzdHJpbmd9IGhheXN0YWNrIFN0cmluZyB0byBzZWFyY2ggaW5cbiogQHBhcmFtIHtzdHJpbmd9IG5lZWRsZSAgIFN0cmluZyB0byBzZWFyY2ggZm9yXG4qIEByZXR1cm4ge3N0cmluZ31cbiovXG5mdW5jdGlvbiB0cmltRW5kKGhheXN0YWNrLCBuZWVkbGUpIHtcbiAgcmV0dXJuIGVuZHNXaXRoKGhheXN0YWNrLCBuZWVkbGUpXG4gID8gaGF5c3RhY2suc2xpY2UoMCwgLW5lZWRsZS5sZW5ndGgpXG4gIDogaGF5c3RhY2s7XG59XG5cbi8qKlxuKiBDb252ZXJ0IGEgaHlwaGVuYXRlZCBzdHJpbmcgdG8gY2FtZWxDYXNlLlxuKi9cbmZ1bmN0aW9uIGh5cGhlblRvQ2FtZWxDYXNlKHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoLy0oLikvZywgZnVuY3Rpb24obWF0Y2gsIGNocikge1xuICAgIHJldHVybiBjaHIudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59XG5cbi8qKlxuKiBEZXRlcm1pbmVzIGlmIHRoZSBzcGVjaWZpZWQgc3RyaW5nIGNvbnNpc3RzIGVudGlyZWx5IG9mIHdoaXRlc3BhY2UuXG4qL1xuZnVuY3Rpb24gaXNFbXB0eShzdHJpbmcpIHtcbiAgcmV0dXJuICEvW15cXHNdLy50ZXN0KHN0cmluZyk7XG59XG5cbi8qKlxuKiBEZXRlcm1pbmVzIGlmIHRoZSBDU1MgdmFsdWUgY2FuIGJlIGNvbnZlcnRlZCBmcm9tIGFcbiogJ3B4JyBzdWZmaXhlZCBzdHJpbmcgdG8gYSBudW1lcmljIHZhbHVlXG4qXG4qIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBDU1MgcHJvcGVydHkgdmFsdWVcbiogQHJldHVybiB7Ym9vbGVhbn1cbiovXG5mdW5jdGlvbiBpc0NvbnZlcnRpYmxlUGl4ZWxWYWx1ZSh2YWx1ZSkge1xuICByZXR1cm4gL15cXGQrcHgkLy50ZXN0KHZhbHVlKTtcbn1cblxuLyoqXG4qIERldGVybWluZXMgaWYgdGhlIHNwZWNpZmllZCBzdHJpbmcgY29uc2lzdHMgZW50aXJlbHkgb2YgbnVtZXJpYyBjaGFyYWN0ZXJzLlxuKi9cbmZ1bmN0aW9uIGlzTnVtZXJpYyhpbnB1dCkge1xuICByZXR1cm4gaW5wdXQgIT09IHVuZGVmaW5lZFxuICAmJiBpbnB1dCAhPT0gbnVsbFxuICAmJiAodHlwZW9mIGlucHV0ID09PSAnbnVtYmVyJyB8fCBwYXJzZUludChpbnB1dCwgMTApID09IGlucHV0KTtcbn1cblxudmFyIGNyZWF0ZUVsZW1lbnQgPSBmdW5jdGlvbiBjcmVhdGVFbGVtZW50KHRhZykge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZyk7XG59O1xuXG52YXIgdGVtcEVsID0gY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4vKipcbiogRXNjYXBlcyBzcGVjaWFsIGNoYXJhY3RlcnMgYnkgY29udmVydGluZyB0aGVtIHRvIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudFxuKiAoZWcuIFwiPFwiIHRvIFwiJmx0O1wiKS4gT25seSBlc2NhcGVzIGNoYXJhY3RlcnMgdGhhdCBhYnNvbHV0ZWx5IG11c3QgYmUgZXNjYXBlZC5cbipcbiogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4qIEByZXR1cm4ge3N0cmluZ31cbiovXG5mdW5jdGlvbiBlc2NhcGVTcGVjaWFsQ2hhcnModmFsdWUpIHtcbiAgLy8gVXNlcyB0aGlzIE9uZSBXZWlyZCBUcmljayB0byBlc2NhcGUgdGV4dCAtIFJhdyB0ZXh0IGluc2VydGVkIGFzIHRleHRDb250ZW50XG4gIC8vIHdpbGwgaGF2ZSBpdHMgZXNjYXBlZCB2ZXJzaW9uIGluIGlubmVySFRNTC5cbiAgdGVtcEVsLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIHJldHVybiB0ZW1wRWwuaW5uZXJIVE1MO1xufVxuXG52YXIgSFRNTHRvSlNYID0gZnVuY3Rpb24oY29uZmlnKSB7XG4gIHRoaXMuY29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG4gIGlmICh0aGlzLmNvbmZpZy5jcmVhdGVDbGFzcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpcy5jb25maWcuY3JlYXRlQ2xhc3MgPSB0cnVlO1xuICB9XG4gIGlmICghdGhpcy5jb25maWcuaW5kZW50KSB7XG4gICAgdGhpcy5jb25maWcuaW5kZW50ID0gJyAgJztcbiAgfVxuICBpZiAoIXRoaXMuY29uZmlnLm91dHB1dENsYXNzTmFtZSkge1xuICAgIHRoaXMuY29uZmlnLm91dHB1dENsYXNzTmFtZSA9ICdOZXdDb21wb25lbnQnO1xuICB9XG59O1xuXG5IVE1MdG9KU1gucHJvdG90eXBlID0ge1xuICAvKipcbiAgKiBSZXNldCB0aGUgaW50ZXJuYWwgc3RhdGUgb2YgdGhlIGNvbnZlcnRlclxuICAqL1xuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vdXRwdXQgPSAnJztcbiAgICB0aGlzLmxldmVsID0gMDtcbiAgfSxcbiAgLyoqXG4gICogTWFpbiBlbnRyeSBwb2ludCB0byB0aGUgY29udmVydGVyLiBHaXZlbiB0aGUgc3BlY2lmaWVkIEhUTUwsIHJldHVybnMgYVxuICAqIEpTWCBvYmplY3QgcmVwcmVzZW50aW5nIGl0LlxuICAqIEBwYXJhbSB7c3RyaW5nfSBodG1sIEhUTUwgdG8gY29udmVydFxuICAqIEByZXR1cm4ge3N0cmluZ30gSlNYXG4gICovXG4gIGNvbnZlcnQ6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICB2YXIgY29udGFpbmVyRWwgPSBjcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjb250YWluZXJFbC5pbm5lckhUTUwgPSAnXFxuJyArIHRoaXMuX2NsZWFuSW5wdXQoaHRtbCkgKyAnXFxuJztcblxuICAgIGlmICh0aGlzLmNvbmZpZy5jcmVhdGVDbGFzcykge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLm91dHB1dENsYXNzTmFtZSkge1xuICAgICAgICB0aGlzLm91dHB1dCA9ICd2YXIgJyArIHRoaXMuY29uZmlnLm91dHB1dENsYXNzTmFtZSArICcgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XFxuJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3V0cHV0ID0gJ1JlYWN0LmNyZWF0ZUNsYXNzKHtcXG4nO1xuICAgICAgfVxuICAgICAgdGhpcy5vdXRwdXQgKz0gdGhpcy5jb25maWcuaW5kZW50ICsgJ3JlbmRlcjogZnVuY3Rpb24oKSB7JyArIFwiXFxuXCI7XG4gICAgICB0aGlzLm91dHB1dCArPSB0aGlzLmNvbmZpZy5pbmRlbnQgKyB0aGlzLmNvbmZpZy5pbmRlbnQgKyAncmV0dXJuIChcXG4nO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9vbmx5T25lVG9wTGV2ZWwoY29udGFpbmVyRWwpKSB7XG4gICAgICAvLyBPbmx5IG9uZSB0b3AtbGV2ZWwgZWxlbWVudCwgdGhlIGNvbXBvbmVudCBjYW4gcmV0dXJuIGl0IGRpcmVjdGx5XG4gICAgICAvLyBObyBuZWVkIHRvIGFjdHVhbGx5IHZpc2l0IHRoZSBjb250YWluZXIgZWxlbWVudFxuICAgICAgdGhpcy5fdHJhdmVyc2UoY29udGFpbmVyRWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBNb3JlIHRoYW4gb25lIHRvcC1sZXZlbCBlbGVtZW50LCBuZWVkIHRvIHdyYXAgdGhlIHdob2xlIHRoaW5nIGluIGFcbiAgICAgIC8vIGNvbnRhaW5lci5cbiAgICAgIHRoaXMub3V0cHV0ICs9IHRoaXMuY29uZmlnLmluZGVudCArIHRoaXMuY29uZmlnLmluZGVudCArIHRoaXMuY29uZmlnLmluZGVudDtcbiAgICAgIHRoaXMubGV2ZWwrKztcbiAgICAgIHRoaXMuX3Zpc2l0KGNvbnRhaW5lckVsKTtcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSB0aGlzLm91dHB1dC50cmltKCkgKyAnXFxuJztcbiAgICBpZiAodGhpcy5jb25maWcuY3JlYXRlQ2xhc3MpIHtcbiAgICAgIHRoaXMub3V0cHV0ICs9IHRoaXMuY29uZmlnLmluZGVudCArIHRoaXMuY29uZmlnLmluZGVudCArICcpO1xcbic7XG4gICAgICB0aGlzLm91dHB1dCArPSB0aGlzLmNvbmZpZy5pbmRlbnQgKyAnfVxcbic7XG4gICAgICB0aGlzLm91dHB1dCArPSAnfSk7JztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0O1xuICB9LFxuXG4gIC8qKlxuICAqIENsZWFucyB1cCB0aGUgc3BlY2lmaWVkIEhUTUwgc28gaXQncyBpbiBhIGZvcm1hdCBhY2NlcHRhYmxlIGZvclxuICAqIGNvbnZlcnRpbmcuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbCBIVE1MIHRvIGNsZWFuXG4gICogQHJldHVybiB7c3RyaW5nfSBDbGVhbmVkIEhUTUxcbiAgKi9cbiAgX2NsZWFuSW5wdXQ6IGZ1bmN0aW9uKGh0bWwpIHtcbiAgICAvLyBSZW1vdmUgdW5uZWNlc3Nhcnkgd2hpdGVzcGFjZVxuICAgIGh0bWwgPSBodG1sLnRyaW0oKTtcbiAgICAvLyBVZ2x5IG1ldGhvZCB0byBzdHJpcCBzY3JpcHQgdGFncy4gVGhleSBjYW4gd3JlYWsgaGF2b2Mgb24gdGhlIERPTSBub2Rlc1xuICAgIC8vIHNvIGxldCdzIG5vdCBldmVuIHB1dCB0aGVtIGluIHRoZSBET00uXG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvPHNjcmlwdChbXFxzXFxTXSo/KTxcXC9zY3JpcHQ+L2csICcnKTtcbiAgICByZXR1cm4gaHRtbDtcbiAgfSxcblxuICAvKipcbiAgKiBEZXRlcm1pbmVzIGlmIHRoZXJlJ3Mgb25seSBvbmUgdG9wLWxldmVsIG5vZGUgaW4gdGhlIERPTSB0cmVlLiBUaGF0IGlzLFxuICAqIGFsbCB0aGUgSFRNTCBpcyB3cmFwcGVkIGJ5IGEgc2luZ2xlIEhUTUwgdGFnLlxuICAqXG4gICogQHBhcmFtIHtET01FbGVtZW50fSBjb250YWluZXJFbCBDb250YWluZXIgZWxlbWVudFxuICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICovXG4gIF9vbmx5T25lVG9wTGV2ZWw6IGZ1bmN0aW9uKGNvbnRhaW5lckVsKSB7XG4gICAgLy8gT25seSBhIHNpbmdsZSBjaGlsZCBlbGVtZW50XG4gICAgaWYgKFxuICAgICAgY29udGFpbmVyRWwuY2hpbGROb2Rlcy5sZW5ndGggPT09IDFcbiAgICAgICYmIGNvbnRhaW5lckVsLmNoaWxkTm9kZXNbMF0ubm9kZVR5cGUgPT09IE5PREVfVFlQRS5FTEVNRU5UXG4gICAgKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gT25seSBvbmUgZWxlbWVudCwgYW5kIGFsbCBvdGhlciBjaGlsZHJlbiBhcmUgd2hpdGVzcGFjZVxuICAgIHZhciBmb3VuZEVsZW1lbnQgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMCwgY291bnQgPSBjb250YWluZXJFbC5jaGlsZE5vZGVzLmxlbmd0aDsgaSA8IGNvdW50OyBpKyspIHtcbiAgICAgIHZhciBjaGlsZCA9IGNvbnRhaW5lckVsLmNoaWxkTm9kZXNbaV07XG4gICAgICBpZiAoY2hpbGQubm9kZVR5cGUgPT09IE5PREVfVFlQRS5FTEVNRU5UKSB7XG4gICAgICAgIGlmIChmb3VuZEVsZW1lbnQpIHtcbiAgICAgICAgICAvLyBFbmNvdW50ZXJlZCBhbiBlbGVtZW50IGFmdGVyIGFscmVhZHkgZW5jb3VudGVyaW5nIGFub3RoZXIgb25lXG4gICAgICAgICAgLy8gVGhlcmVmb3JlLCBtb3JlIHRoYW4gb25lIGVsZW1lbnQgYXQgcm9vdCBsZXZlbFxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3VuZEVsZW1lbnQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNoaWxkLm5vZGVUeXBlID09PSBOT0RFX1RZUEUuVEVYVCAmJiAhaXNFbXB0eShjaGlsZC50ZXh0Q29udGVudCkpIHtcbiAgICAgICAgLy8gQ29udGFpbnMgdGV4dCBjb250ZW50XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG5cbiAgLyoqXG4gICogR2V0cyBhIG5ld2xpbmUgZm9sbG93ZWQgYnkgdGhlIGNvcnJlY3QgaW5kZW50YXRpb24gZm9yIHRoZSBjdXJyZW50XG4gICogbmVzdGluZyBsZXZlbFxuICAqXG4gICogQHJldHVybiB7c3RyaW5nfVxuICAqL1xuICBfZ2V0SW5kZW50ZWROZXdsaW5lOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJ1xcbicgKyByZXBlYXRTdHJpbmcodGhpcy5jb25maWcuaW5kZW50LCB0aGlzLmxldmVsICsgMik7XG4gIH0sXG5cbiAgLyoqXG4gICogSGFuZGxlcyBwcm9jZXNzaW5nIHRoZSBzcGVjaWZpZWQgbm9kZVxuICAqXG4gICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICovXG4gIF92aXNpdDogZnVuY3Rpb24obm9kZSkge1xuICAgIHRoaXMuX2JlZ2luVmlzaXQobm9kZSk7XG4gICAgdGhpcy5fdHJhdmVyc2Uobm9kZSk7XG4gICAgdGhpcy5fZW5kVmlzaXQobm9kZSk7XG4gIH0sXG5cbiAgLyoqXG4gICogVHJhdmVyc2VzIGFsbCB0aGUgY2hpbGRyZW4gb2YgdGhlIHNwZWNpZmllZCBub2RlXG4gICpcbiAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgKi9cbiAgX3RyYXZlcnNlOiBmdW5jdGlvbihub2RlKSB7XG4gICAgdGhpcy5sZXZlbCsrO1xuICAgIGZvciAodmFyIGkgPSAwLCBjb3VudCA9IG5vZGUuY2hpbGROb2Rlcy5sZW5ndGg7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgICB0aGlzLl92aXNpdChub2RlLmNoaWxkTm9kZXNbaV0pO1xuICAgIH1cbiAgICB0aGlzLmxldmVsLS07XG4gIH0sXG5cbiAgLyoqXG4gICogSGFuZGxlIHByZS12aXNpdCBiZWhhdmlvdXIgZm9yIHRoZSBzcGVjaWZpZWQgbm9kZS5cbiAgKlxuICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAqL1xuICBfYmVnaW5WaXNpdDogZnVuY3Rpb24obm9kZSkge1xuICAgIHN3aXRjaCAobm9kZS5ub2RlVHlwZSkge1xuICAgICAgY2FzZSBOT0RFX1RZUEUuRUxFTUVOVDpcbiAgICAgICAgdGhpcy5fYmVnaW5WaXNpdEVsZW1lbnQobm9kZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIE5PREVfVFlQRS5URVhUOlxuICAgICAgICB0aGlzLl92aXNpdFRleHQobm9kZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIE5PREVfVFlQRS5DT01NRU5UOlxuICAgICAgICB0aGlzLl92aXNpdENvbW1lbnQobm9kZSk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbm9kZSB0eXBlOiAnICsgbm9kZS5ub2RlVHlwZSk7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAqIEhhbmRsZXMgcG9zdC12aXNpdCBiZWhhdmlvdXIgZm9yIHRoZSBzcGVjaWZpZWQgbm9kZS5cbiAgKlxuICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAqL1xuICBfZW5kVmlzaXQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBzd2l0Y2ggKG5vZGUubm9kZVR5cGUpIHtcbiAgICAgIGNhc2UgTk9ERV9UWVBFLkVMRU1FTlQ6XG4gICAgICAgIHRoaXMuX2VuZFZpc2l0RWxlbWVudChub2RlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAgIC8vIE5vIGVuZGluZyB0YWdzIHJlcXVpcmVkIGZvciB0aGVzZSB0eXBlc1xuICAgICAgICBjYXNlIE5PREVfVFlQRS5URVhUOlxuICAgICAgICBjYXNlIE5PREVfVFlQRS5DT01NRU5UOlxuICAgICAgICBicmVhaztcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICogSGFuZGxlcyBwcmUtdmlzaXQgYmVoYXZpb3VyIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgbm9kZVxuICAqXG4gICogQHBhcmFtIHtET01FbGVtZW50fSBub2RlXG4gICovXG4gIF9iZWdpblZpc2l0RWxlbWVudDogZnVuY3Rpb24obm9kZSkge1xuICAgIHZhciB0YWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgY291bnQgPSBub2RlLmF0dHJpYnV0ZXMubGVuZ3RoOyBpIDwgY291bnQ7IGkrKykge1xuICAgICAgYXR0cmlidXRlcy5wdXNoKHRoaXMuX2dldEVsZW1lbnRBdHRyaWJ1dGUobm9kZSwgbm9kZS5hdHRyaWJ1dGVzW2ldKSk7XG4gICAgfVxuXG4gICAgdGhpcy5vdXRwdXQgKz0gJzwnICsgdGFnTmFtZTtcbiAgICBpZiAoYXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLm91dHB1dCArPSAnICcgKyBhdHRyaWJ1dGVzLmpvaW4oJyAnKTtcbiAgICB9XG4gICAgaWYgKG5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgdGhpcy5vdXRwdXQgKz0gJz4nO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgKiBIYW5kbGVzIHBvc3QtdmlzaXQgYmVoYXZpb3VyIGZvciB0aGUgc3BlY2lmaWVkIGVsZW1lbnQgbm9kZVxuICAqXG4gICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICovXG4gIF9lbmRWaXNpdEVsZW1lbnQ6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAvLyBEZS1pbmRlbnQgYSBiaXRcbiAgICAvLyBUT0RPOiBJdCdzIGluZWZmaWNpZW50IHRvIGRvIGl0IHRoaXMgd2F5IDovXG4gICAgdGhpcy5vdXRwdXQgPSB0cmltRW5kKHRoaXMub3V0cHV0LCB0aGlzLmNvbmZpZy5pbmRlbnQpO1xuICAgIGlmIChub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIHRoaXMub3V0cHV0ICs9ICc8LycgKyBub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSArICc+JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vdXRwdXQgKz0gJyAvPic7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAqIEhhbmRsZXMgcHJvY2Vzc2luZyBvZiB0aGUgc3BlY2lmaWVkIHRleHQgbm9kZVxuICAqXG4gICogQHBhcmFtIHtUZXh0Tm9kZX0gbm9kZVxuICAqL1xuICBfdmlzaXRUZXh0OiBmdW5jdGlvbihub2RlKSB7XG4gICAgdmFyIHRleHQgPSBub2RlLnRleHRDb250ZW50O1xuICAgIC8vIElmIHRoZXJlJ3MgYSBuZXdsaW5lIGluIHRoZSB0ZXh0LCBhZGp1c3QgdGhlIGluZGVudCBsZXZlbFxuICAgIGlmICh0ZXh0LmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgIHRleHQgPSBub2RlLnRleHRDb250ZW50LnJlcGxhY2UoL1xcblxccyovZywgdGhpcy5fZ2V0SW5kZW50ZWROZXdsaW5lKCkpO1xuICAgIH1cbiAgICB0aGlzLm91dHB1dCArPSBlc2NhcGVTcGVjaWFsQ2hhcnModGV4dCk7XG4gIH0sXG5cbiAgLyoqXG4gICogSGFuZGxlcyBwcm9jZXNzaW5nIG9mIHRoZSBzcGVjaWZpZWQgdGV4dCBub2RlXG4gICpcbiAgKiBAcGFyYW0ge1RleHR9IG5vZGVcbiAgKi9cbiAgX3Zpc2l0Q29tbWVudDogZnVuY3Rpb24obm9kZSkge1xuICAgIC8vIERvIG5vdCByZW5kZXIgdGhlIGNvbW1lbnRcbiAgICAvLyBTaW5jZSB3ZSByZW1vdmUgY29tbWVudHMsIHdlIGFsc28gbmVlZCB0byByZW1vdmUgdGhlIG5leHQgbGluZSBicmVhayBzbyB3ZVxuICAgIC8vIGRvbid0IGVuZCB1cCB3aXRoIGV4dHJhIHdoaXRlc3BhY2UgYWZ0ZXIgZXZlcnkgY29tbWVudFxuICAgIC8vaWYgKG5vZGUubmV4dFNpYmxpbmcgJiYgbm9kZS5uZXh0U2libGluZy5ub2RlVHlwZSA9PT0gTk9ERV9UWVBFLlRFWFQpIHtcbiAgICAvLyAgbm9kZS5uZXh0U2libGluZy50ZXh0Q29udGVudCA9IG5vZGUubmV4dFNpYmxpbmcudGV4dENvbnRlbnQucmVwbGFjZSgvXFxuXFxzKi8sICcnKTtcbiAgICAvL31cbiAgICB0aGlzLm91dHB1dCArPSAney8qJyArIG5vZGUudGV4dENvbnRlbnQucmVwbGFjZSgnKi8nLCAnKiAvJykgKyAnKi99JztcbiAgfSxcblxuICAvKipcbiAgKiBHZXRzIGEgSlNYIGZvcm1hdHRlZCB2ZXJzaW9uIG9mIHRoZSBzcGVjaWZpZWQgYXR0cmlidXRlIGZyb20gdGhlIG5vZGVcbiAgKlxuICAqIEBwYXJhbSB7RE9NRWxlbWVudH0gbm9kZVxuICAqIEBwYXJhbSB7b2JqZWN0fSAgICAgYXR0cmlidXRlXG4gICogQHJldHVybiB7c3RyaW5nfVxuICAqL1xuICBfZ2V0RWxlbWVudEF0dHJpYnV0ZTogZnVuY3Rpb24obm9kZSwgYXR0cmlidXRlKSB7XG4gICAgc3dpdGNoIChhdHRyaWJ1dGUubmFtZSkge1xuICAgICAgY2FzZSAnc3R5bGUnOlxuICAgICAgICByZXR1cm4gdGhpcy5fZ2V0U3R5bGVBdHRyaWJ1dGUoYXR0cmlidXRlLnZhbHVlKTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHZhciB0YWdOYW1lID0gbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciBuYW1lID1cbiAgICAgICAgKEVMRU1FTlRfQVRUUklCVVRFX01BUFBJTkdbdGFnTmFtZV0gJiZcbiAgICAgICAgICBFTEVNRU5UX0FUVFJJQlVURV9NQVBQSU5HW3RhZ05hbWVdW2F0dHJpYnV0ZS5uYW1lXSkgfHxcbiAgICAgICAgICBBVFRSSUJVVEVfTUFQUElOR1thdHRyaWJ1dGUubmFtZV0gfHxcbiAgICAgICAgYXR0cmlidXRlLm5hbWU7XG4gICAgICAgIHZhciByZXN1bHQgPSBuYW1lO1xuXG4gICAgICAgIC8vIE51bWVyaWMgdmFsdWVzIHNob3VsZCBiZSBvdXRwdXQgYXMgezEyM30gbm90IFwiMTIzXCJcbiAgICAgICAgaWYgKGlzTnVtZXJpYyhhdHRyaWJ1dGUudmFsdWUpKSB7XG4gICAgICAgICAgcmVzdWx0ICs9ICc9eycgKyBhdHRyaWJ1dGUudmFsdWUgKyAnfSc7XG4gICAgICAgIH0gZWxzZSBpZiAoYXR0cmlidXRlLnZhbHVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICByZXN1bHQgKz0gJz1cIicgKyBhdHRyaWJ1dGUudmFsdWUucmVwbGFjZSgnXCInLCAnJnF1b3Q7JykgKyAnXCInO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAqIEdldHMgYSBKU1ggZm9ybWF0dGVkIHZlcnNpb24gb2YgdGhlIHNwZWNpZmllZCBlbGVtZW50IHN0eWxlc1xuICAqXG4gICogQHBhcmFtIHtzdHJpbmd9IHN0eWxlc1xuICAqIEByZXR1cm4ge3N0cmluZ31cbiAgKi9cbiAgX2dldFN0eWxlQXR0cmlidXRlOiBmdW5jdGlvbihzdHlsZXMpIHtcbiAgICB2YXIganN4U3R5bGVzID0gbmV3IFN0eWxlUGFyc2VyKHN0eWxlcykudG9KU1hTdHJpbmcoKTtcbiAgICByZXR1cm4gJ3N0eWxlPXt7JyArIGpzeFN0eWxlcyArICd9fSc7XG4gIH1cbn07XG5cbi8qKlxuKiBIYW5kbGVzIHBhcnNpbmcgb2YgaW5saW5lIHN0eWxlc1xuKlxuKiBAcGFyYW0ge3N0cmluZ30gcmF3U3R5bGUgUmF3IHN0eWxlIGF0dHJpYnV0ZVxuKiBAY29uc3RydWN0b3JcbiovXG52YXIgU3R5bGVQYXJzZXIgPSBmdW5jdGlvbihyYXdTdHlsZSkge1xuICB0aGlzLnBhcnNlKHJhd1N0eWxlKTtcbn07XG5TdHlsZVBhcnNlci5wcm90b3R5cGUgPSB7XG4gIC8qKlxuICAqIFBhcnNlIHRoZSBzcGVjaWZpZWQgaW5saW5lIHN0eWxlIGF0dHJpYnV0ZSB2YWx1ZVxuICAqIEBwYXJhbSB7c3RyaW5nfSByYXdTdHlsZSBSYXcgc3R5bGUgYXR0cmlidXRlXG4gICovXG4gIHBhcnNlOiBmdW5jdGlvbihyYXdTdHlsZSkge1xuICAgIHRoaXMuc3R5bGVzID0ge307XG4gICAgcmF3U3R5bGUuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKHN0eWxlKSB7XG4gICAgICBzdHlsZSA9IHN0eWxlLnRyaW0oKTtcbiAgICAgIHZhciBmaXJzdENvbG9uID0gc3R5bGUuaW5kZXhPZignOicpO1xuICAgICAgdmFyIGtleSA9IHN0eWxlLnN1YnN0cigwLCBmaXJzdENvbG9uKTtcbiAgICAgIHZhciB2YWx1ZSA9IHN0eWxlLnN1YnN0cihmaXJzdENvbG9uICsgMSkudHJpbSgpO1xuICAgICAgaWYgKGtleSAhPT0gJycpIHtcbiAgICAgICAgdGhpcy5zdHlsZXNba2V5XSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9LFxuXG4gIC8qKlxuICAqIENvbnZlcnQgdGhlIHN0eWxlIGluZm9ybWF0aW9uIHJlcHJlc2VudGVkIGJ5IHRoaXMgcGFyc2VyIGludG8gYSBKU1hcbiAgKiBzdHJpbmdcbiAgKlxuICAqIEByZXR1cm4ge3N0cmluZ31cbiAgKi9cbiAgdG9KU1hTdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5zdHlsZXMpIHtcbiAgICAgIGlmICghdGhpcy5zdHlsZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIG91dHB1dC5wdXNoKHRoaXMudG9KU1hLZXkoa2V5KSArICc6ICcgKyB0aGlzLnRvSlNYVmFsdWUodGhpcy5zdHlsZXNba2V5XSkpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0LmpvaW4oJywgJyk7XG4gIH0sXG5cbiAgLyoqXG4gICogQ29udmVydCB0aGUgQ1NTIHN0eWxlIGtleSB0byBhIEpTWCBzdHlsZSBrZXlcbiAgKlxuICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgQ1NTIHN0eWxlIGtleVxuICAqIEByZXR1cm4ge3N0cmluZ30gSlNYIHN0eWxlIGtleVxuICAqL1xuICB0b0pTWEtleTogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGh5cGhlblRvQ2FtZWxDYXNlKGtleSk7XG4gIH0sXG5cbiAgLyoqXG4gICogQ29udmVydCB0aGUgQ1NTIHN0eWxlIHZhbHVlIHRvIGEgSlNYIHN0eWxlIHZhbHVlXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgQ1NTIHN0eWxlIHZhbHVlXG4gICogQHJldHVybiB7c3RyaW5nfSBKU1ggc3R5bGUgdmFsdWVcbiAgKi9cbiAgdG9KU1hWYWx1ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoaXNOdW1lcmljKHZhbHVlKSkge1xuICAgICAgLy8gSWYgbnVtZXJpYywgbm8gcXVvdGVzXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSBlbHNlIGlmIChpc0NvbnZlcnRpYmxlUGl4ZWxWYWx1ZSh2YWx1ZSkpIHtcbiAgICAgIC8vIFwiNTAwcHhcIiAtPiA1MDBcbiAgICAgIHJldHVybiB0cmltRW5kKHZhbHVlLCAncHgnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gUHJvYmFibHkgYSBzdHJpbmcsIHdyYXAgaXQgaW4gcXVvdGVzXG4gICAgICByZXR1cm4gJ1xcJycgKyB2YWx1ZS5yZXBsYWNlKC8nL2csICdcIicpICsgJ1xcJyc7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhUTUx0b0pTWDtcbiJdfQ==