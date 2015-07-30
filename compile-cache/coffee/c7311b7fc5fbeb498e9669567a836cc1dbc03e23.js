(function() {
  describe('Coffee-React grammar', function() {
    var grammar;
    grammar = null;
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('react');
      });
      return runs(function() {
        return grammar = atom.grammars.grammarForScopeName('source.coffee.jsx');
      });
    });
    it('parses the grammar', function() {
      expect(grammar).toBeTruthy();
      return expect(grammar.scopeName).toBe('source.coffee.jsx');
    });
    it('tokenizes CoffeeScript', function() {
      var tokens;
      tokens = grammar.tokenizeLine('foo = @bar').tokens;
      expect(tokens.length).toEqual(4);
      expect(tokens[0]).toEqual({
        value: 'foo ',
        scopes: ['source.coffee.jsx', 'variable.assignment.coffee', 'variable.assignment.coffee']
      });
      expect(tokens[1]).toEqual({
        value: '=',
        scopes: ['source.coffee.jsx', 'variable.assignment.coffee', 'variable.assignment.coffee', 'keyword.operator.coffee']
      });
      expect(tokens[2]).toEqual({
        value: ' ',
        scopes: ['source.coffee.jsx']
      });
      return expect(tokens[3]).toEqual({
        value: '@bar',
        scopes: ['source.coffee.jsx', 'variable.other.readwrite.instance.coffee']
      });
    });
    return describe('CJSX', function() {
      it('tokenizes CJSX', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div>hi</div>').tokens;
        expect(tokens.length).toEqual(7);
        expect(tokens[0]).toEqual({
          value: '<',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.begin.html']
        });
        expect(tokens[1]).toEqual({
          value: 'div',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.name.tag.other.html']
        });
        expect(tokens[2]).toEqual({
          value: '>',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.end.html']
        });
        expect(tokens[3]).toEqual({
          value: 'hi',
          scopes: ['source.coffee.jsx']
        });
        expect(tokens[4]).toEqual({
          value: '<',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.begin.html']
        });
        expect(tokens[5]).toEqual({
          value: '/div',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.name.tag.other.html']
        });
        return expect(tokens[6]).toEqual({
          value: '>',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'punctuation.definition.tag.end.html']
        });
      });
      it('tokenizes props', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div className="span6"></div>').tokens;
        expect(tokens.length).toEqual(12);
        expect(tokens[2]).toEqual({
          value: ' ',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html']
        });
        expect(tokens[3]).toEqual({
          value: 'className',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.other.attribute-name.html']
        });
        expect(tokens[4]).toEqual({
          value: '=',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html']
        });
        expect(tokens[5]).toEqual({
          value: '"',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'punctuation.definition.string.begin.html']
        });
        expect(tokens[6]).toEqual({
          value: 'span6',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html']
        });
        return expect(tokens[7]).toEqual({
          value: '"',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'punctuation.definition.string.end.html']
        });
      });
      it('tokenizes props with digits', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div thing1="hi"></div>').tokens;
        return expect(tokens[3]).toEqual({
          value: 'thing1',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'entity.other.attribute-name.html']
        });
      });
      it('tokenizes interpolated CoffeeScript strings', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div className="#{@var}"></div>').tokens;
        expect(tokens.length).toEqual(14);
        expect(tokens[6]).toEqual({
          value: '#{',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'source.coffee.embedded.source', 'punctuation.section.embedded.coffee']
        });
        expect(tokens[7]).toEqual({
          value: '@var',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'source.coffee.embedded.source', 'variable.other.readwrite.instance.coffee']
        });
        return expect(tokens[8]).toEqual({
          value: '}',
          scopes: ['source.coffee.jsx', 'meta.tag.other.html', 'string.quoted.double.html', 'source.coffee.embedded.source', 'punctuation.section.embedded.coffee']
        });
      });
      it('tokenizes embedded CoffeeScript', function() {
        var tokens;
        tokens = grammar.tokenizeLine('<div>{@var}</div>').tokens;
        expect(tokens.length).toEqual(9);
        expect(tokens[3]).toEqual({
          value: '{',
          scopes: ['source.coffee.jsx', 'meta.brace.curly.coffee']
        });
        expect(tokens[4]).toEqual({
          value: '@var',
          scopes: ['source.coffee.jsx', 'variable.other.readwrite.instance.coffee']
        });
        return expect(tokens[5]).toEqual({
          value: '}',
          scopes: ['source.coffee.jsx', 'meta.brace.curly.coffee']
        });
      });
      return it("doesn't tokenize inner CJSX as CoffeeScript", function() {
        var tokens;
        tokens = grammar.tokenizeLine("<div>it's and</div>").tokens;
        expect(tokens.length).toEqual(7);
        return expect(tokens[3]).toEqual({
          value: "it's and",
          scopes: ['source.coffee.jsx']
        });
      });
    });
  });

}).call(this);
