(function() {
  var exitIfError, fs, getAttributes, getTags, path, request;

  path = require('path');

  fs = require('fs');

  request = require('request');

  exitIfError = function(error) {
    if (error != null) {
      console.error(error.message);
      return process.exit(1);
    }
  };

  getTags = function(callback) {
    var requestOptions;
    requestOptions = {
      url: 'https://raw.githubusercontent.com/adobe/brackets/master/src/extensions/default/HTMLCodeHints/HtmlTags.json',
      json: true
    };
    return request(requestOptions, function(error, response, tags) {
      var options, tag, _ref;
      if (error != null) {
        return callback(error);
      }
      if (response.statusCode !== 200) {
        return callback(new Error("Request for HtmlTags.json failed: " + response.statusCode));
      }
      for (tag in tags) {
        options = tags[tag];
        if (((_ref = options.attributes) != null ? _ref.length : void 0) === 0) {
          delete options.attributes;
        }
      }
      return callback(null, tags);
    });
  };

  getAttributes = function(callback) {
    var requestOptions;
    requestOptions = {
      url: 'https://raw.githubusercontent.com/adobe/brackets/master/src/extensions/default/HTMLCodeHints/HtmlAttributes.json',
      json: true
    };
    return request(requestOptions, function(error, response, attributes) {
      var attribute, options, _ref;
      if (error != null) {
        return callback(error);
      }
      if (response.statusCode !== 200) {
        return callback(new Error("Request for HtmlAttributes.json failed: " + response.statusCode));
      }
      for (attribute in attributes) {
        options = attributes[attribute];
        if (attribute.indexOf('/') !== -1) {
          delete attributes[attribute];
        }
        if (((_ref = options.attribOption) != null ? _ref.length : void 0) === 0) {
          delete options.attribOption;
        }
      }
      return callback(null, attributes);
    });
  };

  getTags(function(error, tags) {
    exitIfError(error);
    return getAttributes(function(error, attributes) {
      var completions;
      exitIfError(error);
      completions = {
        tags: tags,
        attributes: attributes
      };
      return fs.writeFileSync(path.join(__dirname, 'completions.json'), "" + (JSON.stringify(completions, null, 0)) + "\n");
    });
  });

}).call(this);
