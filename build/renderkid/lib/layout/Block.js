"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// Generated by CoffeeScript 2.5.1
var Block, SpecialString, cloneAndMergeDeep, terminalWidth;
SpecialString = require('./SpecialString');
terminalWidth = require('../tools').getCols();

var _require = require('../tools');

cloneAndMergeDeep = _require.cloneAndMergeDeep;

module.exports = Block = function () {
  var self;

  var Block = /*#__PURE__*/function () {
    function Block(_layout, _parent) {
      var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var _name = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

      _classCallCheck(this, Block);

      this._layout = _layout;
      this._parent = _parent;
      this._name = _name;
      this._config = cloneAndMergeDeep(self.defaultConfig, config);
      this._closed = false;
      this._wasOpenOnce = false;
      this._active = false;
      this._buffer = '';
      this._didSeparateBlock = false;
      this._linePrependor = new this._config.linePrependor.fn(this._config.linePrependor.options);
      this._lineAppendor = new this._config.lineAppendor.fn(this._config.lineAppendor.options);
      this._blockPrependor = new this._config.blockPrependor.fn(this._config.blockPrependor.options);
      this._blockAppendor = new this._config.blockAppendor.fn(this._config.blockAppendor.options);
    }

    _createClass(Block, [{
      key: "_activate",
      value: function _activate() {
        var deactivateParent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        if (this._active) {
          throw Error("This block is already active. This is probably a bug in RenderKid itself");
        }

        if (this._closed) {
          throw Error("This block is closed and cannot be activated. This is probably a bug in RenderKid itself");
        }

        this._active = true;
        this._layout._activeBlock = this;

        if (deactivateParent) {
          if (this._parent != null) {
            this._parent._deactivate(false);
          }
        }

        return this;
      }
    }, {
      key: "_deactivate",
      value: function _deactivate() {
        var activateParent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

        this._ensureActive();

        this._flushBuffer();

        if (activateParent) {
          if (this._parent != null) {
            this._parent._activate(false);
          }
        }

        this._active = false;
        return this;
      }
    }, {
      key: "_ensureActive",
      value: function _ensureActive() {
        if (!this._wasOpenOnce) {
          throw Error("This block has never been open before. This is probably a bug in RenderKid itself.");
        }

        if (!this._active) {
          throw Error("This block is not active. This is probably a bug in RenderKid itself.");
        }

        if (this._closed) {
          throw Error("This block is already closed. This is probably a bug in RenderKid itself.");
        }
      }
    }, {
      key: "_open",
      value: function _open() {
        if (this._wasOpenOnce) {
          throw Error("Block._open() has been called twice. This is probably a RenderKid bug.");
        }

        this._wasOpenOnce = true;

        if (this._parent != null) {
          this._parent.write(this._whatToPrependToBlock());
        }

        this._activate();

        return this;
      }
    }, {
      key: "close",
      value: function close() {
        this._deactivate();

        this._closed = true;

        if (this._parent != null) {
          this._parent.write(this._whatToAppendToBlock());
        }

        return this;
      }
    }, {
      key: "isOpen",
      value: function isOpen() {
        return this._wasOpenOnce && !this._closed;
      }
    }, {
      key: "write",
      value: function write(str) {
        this._ensureActive();

        if (str === '') {
          return;
        }

        str = String(str);
        this._buffer += str;
        return this;
      }
    }, {
      key: "openBlock",
      value: function openBlock(config, name) {
        var block;

        this._ensureActive();

        block = new Block(this._layout, this, config, name);

        block._open();

        return block;
      }
    }, {
      key: "_flushBuffer",
      value: function _flushBuffer() {
        var str;

        if (this._buffer === '') {
          return;
        }

        str = this._buffer;
        this._buffer = '';

        this._writeInline(str);
      }
    }, {
      key: "_toPrependToLine",
      value: function _toPrependToLine() {
        var fromParent;
        fromParent = '';

        if (this._parent != null) {
          fromParent = this._parent._toPrependToLine();
        }

        return this._linePrependor.render(fromParent);
      }
    }, {
      key: "_toAppendToLine",
      value: function _toAppendToLine() {
        var fromParent;
        fromParent = '';

        if (this._parent != null) {
          fromParent = this._parent._toAppendToLine();
        }

        return this._lineAppendor.render(fromParent);
      }
    }, {
      key: "_whatToPrependToBlock",
      value: function _whatToPrependToBlock() {
        return this._blockPrependor.render();
      }
    }, {
      key: "_whatToAppendToBlock",
      value: function _whatToAppendToBlock() {
        return this._blockAppendor.render();
      }
    }, {
      key: "_writeInline",
      value: function _writeInline(str) {
        var i, j, k, l, lineBreaksToAppend, m, ref, ref1, ref2, remaining; // special characters (such as <bg-white>) don't require
        // any wrapping...

        if (new SpecialString(str).isOnlySpecialChars()) {
          // ... and directly get appended to the layout.
          this._layout._append(str);

          return;
        } // we'll be removing from the original string till it's empty


        remaining = str; // we might need to add a few line breaks at the end of the text.

        lineBreaksToAppend = 0; // if text starts with line breaks...

        if (m = remaining.match(/^\n+/)) {
          // ... we want to write the exact same number of line breaks
          // to the layout.
          for (i = j = 1, ref = m[0].length; 1 <= ref ? j <= ref : j >= ref; i = 1 <= ref ? ++j : --j) {
            this._writeLine('');
          }

          remaining = remaining.substr(m[0].length, remaining.length);
        } // and if the text ends with line breaks...


        if (m = remaining.match(/\n+$/)) {
          // we want to write the exact same number of line breaks
          // to the end of the layout.
          lineBreaksToAppend = m[0].length;
          remaining = remaining.substr(0, remaining.length - m[0].length);
        } // now let's parse the body of the text:


        while (remaining.length > 0) {
          // anything other than a break line...
          if (m = remaining.match(/^[^\n]+/)) {
            // ... should be wrapped as a block of text.
            this._writeLine(m[0]);

            remaining = remaining.substr(m[0].length, remaining.length); // for any number of line breaks we find inside the text...
          } else if (m = remaining.match(/^\n+/)) {
            // ... we write one less break line to the layout.
            for (i = k = 1, ref1 = m[0].length; 1 <= ref1 ? k < ref1 : k > ref1; i = 1 <= ref1 ? ++k : --k) {
              this._writeLine('');
            }

            remaining = remaining.substr(m[0].length, remaining.length);
          }
        } // if we had line breaks to append to the layout...


        if (lineBreaksToAppend > 0) {
          // ... we append the exact same number of line breaks to the layout.
          for (i = l = 1, ref2 = lineBreaksToAppend; 1 <= ref2 ? l <= ref2 : l >= ref2; i = 1 <= ref2 ? ++l : --l) {
            this._writeLine('');
          }
        }
      } // wraps a line into multiple lines if necessary, adds horizontal margins,
      // etc, and appends it to the layout.

    }, {
      key: "_writeLine",
      value: function _writeLine(str) {
        var line, lineContent, lineContentLength, remaining, roomLeft, toAppend, toAppendLength, toPrepend, toPrependLength; // we'll be cutting from our string as we go

        remaining = new SpecialString(str);

        while (true) {
          // left margin...
          // this will continue until nothing is left of our block.
          toPrepend = this._toPrependToLine(); // ... and its length

          toPrependLength = new SpecialString(toPrepend).length; // right margin...

          toAppend = this._toAppendToLine(); // ... and its length

          toAppendLength = new SpecialString(toAppend).length; // how much room is left for content

          roomLeft = this._layout._config.terminalWidth - (toPrependLength + toAppendLength); // how much room each line of content will have

          lineContentLength = Math.min(this._config.width, roomLeft); // cut line content, only for the amount needed

          lineContent = remaining.cut(0, lineContentLength, true); // line will consist of both margins and the content

          line = toPrepend + lineContent.str + toAppend; // send it off to layout

          this._layout._appendLine(line);

          if (remaining.isEmpty()) {
            break;
          }
        }
      }
    }]);

    return Block;
  }();

  ;
  self = Block;
  Block.defaultConfig = {
    blockPrependor: {
      fn: require('./block/blockPrependor/Default'),
      options: {
        amount: 0
      }
    },
    blockAppendor: {
      fn: require('./block/blockAppendor/Default'),
      options: {
        amount: 0
      }
    },
    linePrependor: {
      fn: require('./block/linePrependor/Default'),
      options: {
        amount: 0
      }
    },
    lineAppendor: {
      fn: require('./block/lineAppendor/Default'),
      options: {
        amount: 0
      }
    },
    lineWrapper: {
      fn: require('./block/lineWrapper/Default'),
      options: {
        lineWidth: null
      }
    },
    width: terminalWidth,
    prefixRaw: '',
    suffixRaw: ''
  };
  return Block;
}.call(void 0);