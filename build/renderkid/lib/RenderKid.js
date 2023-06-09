"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Generated by CoffeeScript 2.5.1
var AnsiPainter, Layout, RenderKid, Styles, blockStyleApplier, cloneAndMergeDeep, inlineStyleApplier, isPlainObject, stripAnsi, terminalWidth, tools;
inlineStyleApplier = require('./renderKid/styleApplier/inline');
blockStyleApplier = require('./renderKid/styleApplier/block');
isPlainObject = require('lodash/isPlainObject');

var _require = require('./tools');

cloneAndMergeDeep = _require.cloneAndMergeDeep;
AnsiPainter = require('./AnsiPainter');
Styles = require('./renderKid/Styles');
Layout = require('./Layout');
tools = require('./tools');
stripAnsi = require('strip-ansi');
terminalWidth = require('./tools').getCols();

module.exports = RenderKid = function () {
  var self;

  var RenderKid = /*#__PURE__*/function () {
    function RenderKid() {
      var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, RenderKid);

      this.tools = self.tools;
      this._config = cloneAndMergeDeep(self._defaultConfig, config);

      this._initStyles();
    }

    _createClass(RenderKid, [{
      key: "_initStyles",
      value: function _initStyles() {
        return this._styles = new Styles();
      }
    }, {
      key: "style",
      value: function style() {
        return this._styles.setRule.apply(this._styles, arguments);
      }
    }, {
      key: "_getStyleFor",
      value: function _getStyleFor(el) {
        return this._styles.getStyleFor(el);
      }
    }, {
      key: "render",
      value: function render(input) {
        var withColors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        return this._paint(this._renderDom(this._toDom(input)), withColors);
      }
    }, {
      key: "_toDom",
      value: function _toDom(input) {
        if (typeof input === 'string') {
          return this._parse(input);
        } else if (isPlainObject(input) || Array.isArray(input)) {
          return this._objToDom(input);
        } else {
          throw Error("Invalid input type. Only strings, arrays and objects are accepted");
        }
      }
    }, {
      key: "_objToDom",
      value: function _objToDom(o) {
        var injectFakeRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (injectFakeRoot) {
          o = {
            body: o
          };
        }

        return tools.objectToDom(o);
      }
    }, {
      key: "_paint",
      value: function _paint(text, withColors) {
        var painted;
        painted = AnsiPainter.paint(text);

        if (withColors) {
          return painted;
        } else {
          return stripAnsi(painted);
        }
      }
    }, {
      key: "_parse",
      value: function _parse(string) {
        var injectFakeRoot = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

        if (injectFakeRoot) {
          string = '<body>' + string + '</body>';
        }

        return tools.stringToDom(string);
      }
    }, {
      key: "_renderDom",
      value: function _renderDom(dom) {
        var bodyTag, layout, rootBlock;
        bodyTag = dom[0];
        layout = new Layout(this._config.layout);
        rootBlock = layout.getRootBlock();

        this._renderBlockNode(bodyTag, null, rootBlock);

        return layout.get();
      }
    }, {
      key: "_renderChildrenOf",
      value: function _renderChildrenOf(parentNode, parentBlock) {
        var i, len, node, nodes;
        nodes = parentNode.children;

        for (i = 0, len = nodes.length; i < len; i++) {
          node = nodes[i];

          this._renderNode(node, parentNode, parentBlock);
        }
      }
    }, {
      key: "_renderNode",
      value: function _renderNode(node, parentNode, parentBlock) {
        if (node.type === 'text') {
          this._renderText(node, parentNode, parentBlock);
        } else if (node.name === 'br') {
          this._renderBr(node, parentNode, parentBlock);
        } else if (this._isBlock(node)) {
          this._renderBlockNode(node, parentNode, parentBlock);
        } else if (this._isNone(node)) {
          return;
        } else {
          this._renderInlineNode(node, parentNode, parentBlock);
        }
      }
    }, {
      key: "_renderText",
      value: function _renderText(node, parentNode, parentBlock) {
        var ref, text;
        text = node.data;
        text = text.replace(/\s+/g, ' '); // let's only trim if the parent is an inline element

        if ((parentNode != null ? (ref = parentNode.styles) != null ? ref.display : void 0 : void 0) !== 'inline') {
          text = text.trim();
        }

        if (text.length === 0) {
          return;
        }

        text = text.replace(/&nl;/g, "\n");
        return parentBlock.write(text);
      }
    }, {
      key: "_renderBlockNode",
      value: function _renderBlockNode(node, parentNode, parentBlock) {
        var after, before, block, blockConfig;

        var _blockStyleApplier$ap = blockStyleApplier.applyTo(node, this._getStyleFor(node));

        before = _blockStyleApplier$ap.before;
        after = _blockStyleApplier$ap.after;
        blockConfig = _blockStyleApplier$ap.blockConfig;
        block = parentBlock.openBlock(blockConfig);

        if (before !== '') {
          block.write(before);
        }

        this._renderChildrenOf(node, block);

        if (after !== '') {
          block.write(after);
        }

        return block.close();
      }
    }, {
      key: "_renderInlineNode",
      value: function _renderInlineNode(node, parentNode, parentBlock) {
        var after, before;

        var _inlineStyleApplier$a = inlineStyleApplier.applyTo(node, this._getStyleFor(node));

        before = _inlineStyleApplier$a.before;
        after = _inlineStyleApplier$a.after;

        if (before !== '') {
          parentBlock.write(before);
        }

        this._renderChildrenOf(node, parentBlock);

        if (after !== '') {
          return parentBlock.write(after);
        }
      }
    }, {
      key: "_renderBr",
      value: function _renderBr(node, parentNode, parentBlock) {
        return parentBlock.write("\n");
      }
    }, {
      key: "_isBlock",
      value: function _isBlock(node) {
        return !(node.type === 'text' || node.name === 'br' || this._getStyleFor(node).display !== 'block');
      }
    }, {
      key: "_isNone",
      value: function _isNone(node) {
        return !(node.type === 'text' || node.name === 'br' || this._getStyleFor(node).display !== 'none');
      }
    }]);

    return RenderKid;
  }();

  ;
  self = RenderKid;
  RenderKid.AnsiPainter = AnsiPainter;
  RenderKid.Layout = Layout;
  RenderKid.quote = tools.quote;
  RenderKid.tools = tools;
  RenderKid._defaultConfig = {
    layout: {
      terminalWidth: terminalWidth
    }
  };
  return RenderKid;
}.call(void 0);