Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _mobx = require("mobx");

var _display = require("./display");

var _display2 = _interopRequireDefault(_display);

var _status = require("./status");

var _status2 = _interopRequireDefault(_status);

var SCROLL_HEIGHT = 600;

var ResultViewComponent = (function (_React$Component) {
  var _instanceInitializers = {};

  _inherits(ResultViewComponent, _React$Component);

  function ResultViewComponent() {
    var _this = this;

    _classCallCheck(this, _ResultViewComponent);

    _get(Object.getPrototypeOf(_ResultViewComponent.prototype), "constructor", this).apply(this, arguments);

    this.containerTooltip = new _atom.CompositeDisposable();
    this.buttonTooltip = new _atom.CompositeDisposable();
    this.closeTooltip = new _atom.CompositeDisposable();

    _defineDecoratedPropertyDescriptor(this, "expanded", _instanceInitializers);

    this.getAllText = function () {
      if (!_this.el) return "";
      return _this.el.innerText ? _this.el.innerText : "";
    };

    this.handleClick = function (event) {
      if (event.ctrlKey || event.metaKey) {
        _this.openInEditor();
      } else {
        _this.copyToClipboard();
      }
    };

    this.checkForSelection = function (event) {
      var selection = document.getSelection();
      if (selection && selection.toString()) {
        return;
      } else {
        _this.handleClick(event);
      }
    };

    this.copyToClipboard = function () {
      atom.clipboard.write(_this.getAllText());
      atom.notifications.addSuccess("Copied to clipboard");
    };

    this.openInEditor = function () {
      atom.workspace.open().then(function (editor) {
        return editor.insertText(_this.getAllText());
      });
    };

    this.addCopyTooltip = function (element, comp) {
      if (!element || !comp.disposables || comp.disposables.size > 0) return;
      comp.add(atom.tooltips.add(element, {
        title: "Click to copy,\n          " + (process.platform === "darwin" ? "Cmd" : "Ctrl") + "+Click to open in editor"
      }));
    };

    this.addCloseButtonTooltip = function (element, comp) {
      if (!element || !comp.disposables || comp.disposables.size > 0) return;
      comp.add(atom.tooltips.add(element, {
        title: _this.props.store.executionCount ? "Close (Out[" + _this.props.store.executionCount + "])" : "Close result"
      }));
    };

    this.addCopyButtonTooltip = function (element) {
      _this.addCopyTooltip(element, _this.buttonTooltip);
    };

    this.onWheel = function (element) {
      return function (event) {
        var clientHeight = element.clientHeight;
        var scrollHeight = element.scrollHeight;
        var clientWidth = element.clientWidth;
        var scrollWidth = element.scrollWidth;
        var scrollTop = element.scrollTop;
        var scrollLeft = element.scrollLeft;
        var atTop = scrollTop !== 0 && event.deltaY < 0;
        var atLeft = scrollLeft !== 0 && event.deltaX < 0;
        var atBottom = scrollTop !== scrollHeight - clientHeight && event.deltaY > 0;
        var atRight = scrollLeft !== scrollWidth - clientWidth && event.deltaX > 0;

        if (clientHeight < scrollHeight && (atTop || atBottom)) {
          event.stopPropagation();
        } else if (clientWidth < scrollWidth && (atLeft || atRight)) {
          event.stopPropagation();
        }
      };
    };

    _defineDecoratedPropertyDescriptor(this, "toggleExpand", _instanceInitializers);
  }

  _createDecoratedClass(ResultViewComponent, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      var _props$store = this.props.store;
      var outputs = _props$store.outputs;
      var status = _props$store.status;
      var isPlain = _props$store.isPlain;
      var position = _props$store.position;

      var inlineStyle = {
        marginLeft: position.lineLength + position.charWidth + "px",
        marginTop: "-" + position.lineHeight + "px",
        userSelect: "text"
      };

      if (outputs.length === 0 || this.props.showResult === false) {
        var _kernel = this.props.kernel;
        return _react2["default"].createElement(_status2["default"], {
          status: _kernel && _kernel.executionState !== "busy" && status === "running" ? "error" : status,
          style: inlineStyle
        });
      }

      return _react2["default"].createElement(
        "div",
        {
          className: (isPlain ? "inline-container" : "multiline-container") + " native-key-bindings",
          tabIndex: "-1",
          onClick: isPlain ? this.checkForSelection : undefined,
          style: isPlain ? inlineStyle : {
            maxWidth: position.editorWidth - 2 * position.charWidth + "px",
            margin: "0px",
            userSelect: "text"
          },
          "hydrogen-wrapoutput": atom.config.get("Hydrogen.wrapOutput").toString()
        },
        _react2["default"].createElement(
          "div",
          {
            className: "hydrogen_cell_display",
            ref: function (ref) {
              if (!ref) return;
              _this2.el = ref;

              isPlain ? _this2.addCopyTooltip(ref, _this2.containerTooltip) : _this2.containerTooltip.dispose();

              // As of this writing React's event handler doesn't properly handle
              // event.stopPropagation() for events outside the React context.
              if (!_this2.expanded && !isPlain && ref) {
                ref.addEventListener("wheel", _this2.onWheel(ref), {
                  passive: true
                });
              }
            },
            style: {
              maxHeight: this.expanded ? "100%" : SCROLL_HEIGHT + "px",
              overflowY: "auto"
            }
          },
          outputs.map(function (output, index) {
            return _react2["default"].createElement(_display2["default"], { output: output, key: index });
          })
        ),
        isPlain ? null : _react2["default"].createElement(
          "div",
          { className: "toolbar" },
          _react2["default"].createElement("div", {
            className: "icon icon-x",
            onClick: this.props.destroy,
            ref: function (ref) {
              return _this2.addCloseButtonTooltip(ref, _this2.closeTooltip);
            }
          }),
          _react2["default"].createElement("div", { style: { flex: 1, minHeight: "0.25em" } }),
          this.getAllText().length > 0 ? _react2["default"].createElement("div", {
            className: "icon icon-clippy",
            onClick: this.handleClick,
            ref: this.addCopyButtonTooltip
          }) : null,
          this.el && this.el.scrollHeight > SCROLL_HEIGHT ? _react2["default"].createElement("div", {
            className: "icon icon-" + (this.expanded ? "fold" : "unfold"),
            onClick: this.toggleExpand
          }) : null
        )
      );
    }
  }, {
    key: "scrollToBottom",
    value: function scrollToBottom() {
      if (!this.el || this.expanded === true || this.props.store.isPlain === true || atom.config.get("Hydrogen.autoScroll") === false) return;
      var scrollHeight = this.el.scrollHeight;
      var height = this.el.clientHeight;
      var maxScrollTop = scrollHeight - height;
      this.el.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.scrollToBottom();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.scrollToBottom();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.containerTooltip.dispose();
      this.buttonTooltip.dispose();
      this.closeTooltip.dispose();
    }
  }, {
    key: "expanded",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return false;
    },
    enumerable: true
  }, {
    key: "toggleExpand",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.expanded = !_this3.expanded;
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  var _ResultViewComponent = ResultViewComponent;
  ResultViewComponent = (0, _mobxReact.observer)(ResultViewComponent) || ResultViewComponent;
  return ResultViewComponent;
})(_react2["default"].Component);

exports["default"] = ResultViewComponent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3Jlc3VsdC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBRW9DLE1BQU07O3FCQUN4QixPQUFPOzs7O3lCQUNBLFlBQVk7O29CQUNGLE1BQU07O3VCQUNyQixXQUFXOzs7O3NCQUNaLFVBQVU7Ozs7QUFLN0IsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDOztJQVVwQixtQkFBbUI7OztZQUFuQixtQkFBbUI7O1dBQW5CLG1CQUFtQjs7Ozs7OztTQUV2QixnQkFBZ0IsR0FBRywrQkFBeUI7U0FDNUMsYUFBYSxHQUFHLCtCQUF5QjtTQUN6QyxZQUFZLEdBQUcsK0JBQXlCOzs7O1NBSXhDLFVBQVUsR0FBRyxZQUFNO0FBQ2pCLFVBQUksQ0FBQyxNQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQztBQUN4QixhQUFPLE1BQUssRUFBRSxDQUFDLFNBQVMsR0FBRyxNQUFLLEVBQUUsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0tBQ25EOztTQUVELFdBQVcsR0FBRyxVQUFDLEtBQUssRUFBaUI7QUFDbkMsVUFBSSxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLEVBQUU7QUFDbEMsY0FBSyxZQUFZLEVBQUUsQ0FBQztPQUNyQixNQUFNO0FBQ0wsY0FBSyxlQUFlLEVBQUUsQ0FBQztPQUN4QjtLQUNGOztTQUVELGlCQUFpQixHQUFHLFVBQUMsS0FBSyxFQUFpQjtBQUN6QyxVQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDMUMsVUFBSSxTQUFTLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFFO0FBQ3JDLGVBQU87T0FDUixNQUFNO0FBQ0wsY0FBSyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDekI7S0FDRjs7U0FFRCxlQUFlLEdBQUcsWUFBTTtBQUN0QixVQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFLLFVBQVUsRUFBRSxDQUFDLENBQUM7QUFDeEMsVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztLQUN0RDs7U0FFRCxZQUFZLEdBQUcsWUFBTTtBQUNuQixVQUFJLENBQUMsU0FBUyxDQUNYLElBQUksRUFBRSxDQUNOLElBQUksQ0FBQyxVQUFDLE1BQU07ZUFBSyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQUssVUFBVSxFQUFFLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDM0Q7O1NBRUQsY0FBYyxHQUFHLFVBQUMsT0FBTyxFQUFnQixJQUFJLEVBQStCO0FBQzFFLFVBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxPQUFPO0FBQ3ZFLFVBQUksQ0FBQyxHQUFHLENBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFO0FBQ3pCLGFBQUssa0NBRUQsT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEdBQUcsS0FBSyxHQUFHLE1BQU0sQ0FBQSw2QkFDdEI7T0FDN0IsQ0FBQyxDQUNILENBQUM7S0FDSDs7U0FFRCxxQkFBcUIsR0FBRyxVQUN0QixPQUFPLEVBQ1AsSUFBSSxFQUNEO0FBQ0gsVUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLE9BQU87QUFDdkUsVUFBSSxDQUFDLEdBQUcsQ0FDTixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUU7QUFDekIsYUFBSyxFQUFFLE1BQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxjQUFjLG1CQUNwQixNQUFLLEtBQUssQ0FBQyxLQUFLLENBQUMsY0FBYyxVQUM3QyxjQUFjO09BQ25CLENBQUMsQ0FDSCxDQUFDO0tBQ0g7O1NBRUQsb0JBQW9CLEdBQUcsVUFBQyxPQUFPLEVBQW1CO0FBQ2hELFlBQUssY0FBYyxDQUFDLE9BQU8sRUFBRSxNQUFLLGFBQWEsQ0FBQyxDQUFDO0tBQ2xEOztTQUVELE9BQU8sR0FBRyxVQUFDLE9BQU8sRUFBa0I7QUFDbEMsYUFBTyxVQUFDLEtBQUssRUFBaUI7QUFDNUIsWUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztBQUMxQyxZQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO0FBQzFDLFlBQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7QUFDeEMsWUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQztBQUN4QyxZQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO0FBQ3BDLFlBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7QUFDdEMsWUFBTSxLQUFLLEdBQUcsU0FBUyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNsRCxZQUFNLE1BQU0sR0FBRyxVQUFVLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ3BELFlBQU0sUUFBUSxHQUNaLFNBQVMsS0FBSyxZQUFZLEdBQUcsWUFBWSxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hFLFlBQU0sT0FBTyxHQUNYLFVBQVUsS0FBSyxXQUFXLEdBQUcsV0FBVyxJQUFJLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDOztBQUUvRCxZQUFJLFlBQVksR0FBRyxZQUFZLEtBQUssS0FBSyxJQUFJLFFBQVEsQ0FBQSxBQUFDLEVBQUU7QUFDdEQsZUFBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQ3pCLE1BQU0sSUFBSSxXQUFXLEdBQUcsV0FBVyxLQUFLLE1BQU0sSUFBSSxPQUFPLENBQUEsQUFBQyxFQUFFO0FBQzNELGVBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztTQUN6QjtPQUNGLENBQUM7S0FDSDs7Ozs7d0JBNUZHLG1CQUFtQjs7V0FtR2pCLGtCQUFHOzs7eUJBQ3dDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztVQUF2RCxPQUFPLGdCQUFQLE9BQU87VUFBRSxNQUFNLGdCQUFOLE1BQU07VUFBRSxPQUFPLGdCQUFQLE9BQU87VUFBRSxRQUFRLGdCQUFSLFFBQVE7O0FBRTFDLFVBQU0sV0FBVyxHQUFHO0FBQ2xCLGtCQUFVLEVBQUssUUFBUSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsU0FBUyxPQUFJO0FBQzNELGlCQUFTLFFBQU0sUUFBUSxDQUFDLFVBQVUsT0FBSTtBQUN0QyxrQkFBVSxFQUFFLE1BQU07T0FDbkIsQ0FBQzs7QUFFRixVQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtBQUMzRCxZQUFNLE9BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNqQyxlQUNFO0FBQ0UsZ0JBQU0sRUFDSixPQUFNLElBQUksT0FBTSxDQUFDLGNBQWMsS0FBSyxNQUFNLElBQUksTUFBTSxLQUFLLFNBQVMsR0FDOUQsT0FBTyxHQUNQLE1BQU0sQUFDWDtBQUNELGVBQUssRUFBRSxXQUFXLEFBQUM7VUFDbkIsQ0FDRjtPQUNIOztBQUVELGFBQ0U7OztBQUNFLG1CQUFTLEVBQ1AsQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLEdBQUcscUJBQXFCLENBQUEsR0FDckQsc0JBQXNCLEFBQ3ZCO0FBQ0Qsa0JBQVEsRUFBRSxJQUFJLEFBQUM7QUFDZixpQkFBTyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsU0FBUyxBQUFDO0FBQ3RELGVBQUssRUFDSCxPQUFPLEdBQ0gsV0FBVyxHQUNYO0FBQ0Usb0JBQVEsRUFBSyxRQUFRLENBQUMsV0FBVyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsU0FBUyxPQUFJO0FBQzlELGtCQUFNLEVBQUUsS0FBSztBQUNiLHNCQUFVLEVBQUUsTUFBTTtXQUNuQixBQUNOO0FBQ0QsaUNBQXFCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsQUFBQzs7UUFFdkU7OztBQUNFLHFCQUFTLEVBQUMsdUJBQXVCO0FBQ2pDLGVBQUcsRUFBRSxVQUFDLEdBQUcsRUFBSztBQUNaLGtCQUFJLENBQUMsR0FBRyxFQUFFLE9BQU87QUFDakIscUJBQUssRUFBRSxHQUFHLEdBQUcsQ0FBQzs7QUFFZCxxQkFBTyxHQUNILE9BQUssY0FBYyxDQUFDLEdBQUcsRUFBRSxPQUFLLGdCQUFnQixDQUFDLEdBQy9DLE9BQUssZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7Ozs7QUFJcEMsa0JBQUksQ0FBQyxPQUFLLFFBQVEsSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLEVBQUU7QUFDckMsbUJBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBSyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDL0MseUJBQU8sRUFBRSxJQUFJO2lCQUNkLENBQUMsQ0FBQztlQUNKO2FBQ0YsQUFBQztBQUNGLGlCQUFLLEVBQUU7QUFDTCx1QkFBUyxFQUFFLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxHQUFNLGFBQWEsT0FBSTtBQUN4RCx1QkFBUyxFQUFFLE1BQU07YUFDbEIsQUFBQzs7VUFFRCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQUMsTUFBTSxFQUFFLEtBQUs7bUJBQ3pCLHlEQUFTLE1BQU0sRUFBRSxNQUFNLEFBQUMsRUFBQyxHQUFHLEVBQUUsS0FBSyxBQUFDLEdBQUc7V0FDeEMsQ0FBQztTQUNFO1FBQ0wsT0FBTyxHQUFHLElBQUksR0FDYjs7WUFBSyxTQUFTLEVBQUMsU0FBUztVQUN0QjtBQUNFLHFCQUFTLEVBQUMsYUFBYTtBQUN2QixtQkFBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxBQUFDO0FBQzVCLGVBQUcsRUFBRSxVQUFDLEdBQUc7cUJBQUssT0FBSyxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsT0FBSyxZQUFZLENBQUM7YUFBQSxBQUFDO1lBQ2pFO1VBRUYsMENBQUssS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEFBQUMsR0FBRztVQUUvQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsR0FDM0I7QUFDRSxxQkFBUyxFQUFDLGtCQUFrQjtBQUM1QixtQkFBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEFBQUM7QUFDMUIsZUFBRyxFQUFFLElBQUksQ0FBQyxvQkFBb0IsQUFBQztZQUMvQixHQUNBLElBQUk7VUFFUCxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxHQUFHLGFBQWEsR0FDOUM7QUFDRSxxQkFBUyxrQkFBZSxJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUEsQUFBRztBQUM1RCxtQkFBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEFBQUM7WUFDM0IsR0FDQSxJQUFJO1NBQ0osQUFDUDtPQUNHLENBQ047S0FDSDs7O1dBRWEsMEJBQUc7QUFDZixVQUNFLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFDUixJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLElBQUksSUFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLHVCQUF1QixLQUFLLEtBQUssRUFFaEQsT0FBTztBQUNULFVBQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDO0FBQzFDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDO0FBQ3BDLFVBQU0sWUFBWSxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUM7QUFDM0MsVUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEdBQUcsWUFBWSxHQUFHLENBQUMsR0FBRyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0tBQ3pEOzs7V0FFaUIsOEJBQUc7QUFDbkIsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3ZCOzs7V0FFZ0IsNkJBQUc7QUFDbEIsVUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0tBQ3ZCOzs7V0FFbUIsZ0NBQUc7QUFDckIsVUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDN0IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7Ozs7YUExTm1CLEtBQUs7Ozs7Ozs7OzthQXlGVixZQUFNO0FBQ25CLGVBQUssUUFBUSxHQUFHLENBQUMsT0FBSyxRQUFRLENBQUM7T0FDaEM7Ozs7OzZCQWpHRyxtQkFBbUI7QUFBbkIscUJBQW1CLDRCQUFuQixtQkFBbUIsS0FBbkIsbUJBQW1CO1NBQW5CLG1CQUFtQjtHQUFTLG1CQUFNLFNBQVM7O3FCQW1PbEMsbUJBQW1CIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3Jlc3VsdC12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5pbXBvcnQgeyBhY3Rpb24sIG9ic2VydmFibGUgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IERpc3BsYXkgZnJvbSBcIi4vZGlzcGxheVwiO1xuaW1wb3J0IFN0YXR1cyBmcm9tIFwiLi9zdGF0dXNcIjtcblxuaW1wb3J0IHR5cGUgT3V0cHV0U3RvcmUgZnJvbSBcIi4vLi4vLi4vc3RvcmUvb3V0cHV0XCI7XG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4vLi4vLi4va2VybmVsXCI7XG5cbmNvbnN0IFNDUk9MTF9IRUlHSFQgPSA2MDA7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHN0b3JlOiBPdXRwdXRTdG9yZSxcbiAga2VybmVsOiA/S2VybmVsLFxuICBkZXN0cm95OiBGdW5jdGlvbixcbiAgc2hvd1Jlc3VsdDogYm9vbGVhbixcbn07XG5cbkBvYnNlcnZlclxuY2xhc3MgUmVzdWx0Vmlld0NvbXBvbmVudCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcz4ge1xuICBlbDogP0hUTUxFbGVtZW50O1xuICBjb250YWluZXJUb29sdGlwID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgYnV0dG9uVG9vbHRpcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIGNsb3NlVG9vbHRpcCA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gIEBvYnNlcnZhYmxlXG4gIGV4cGFuZGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZ2V0QWxsVGV4dCA9ICgpID0+IHtcbiAgICBpZiAoIXRoaXMuZWwpIHJldHVybiBcIlwiO1xuICAgIHJldHVybiB0aGlzLmVsLmlubmVyVGV4dCA/IHRoaXMuZWwuaW5uZXJUZXh0IDogXCJcIjtcbiAgfTtcblxuICBoYW5kbGVDbGljayA9IChldmVudDogTW91c2VFdmVudCkgPT4ge1xuICAgIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkpIHtcbiAgICAgIHRoaXMub3BlbkluRWRpdG9yKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY29weVRvQ2xpcGJvYXJkKCk7XG4gICAgfVxuICB9O1xuXG4gIGNoZWNrRm9yU2VsZWN0aW9uID0gKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgY29uc3Qgc2VsZWN0aW9uID0gZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgaWYgKHNlbGVjdGlvbiAmJiBzZWxlY3Rpb24udG9TdHJpbmcoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhhbmRsZUNsaWNrKGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgY29weVRvQ2xpcGJvYXJkID0gKCkgPT4ge1xuICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHRoaXMuZ2V0QWxsVGV4dCgpKTtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkU3VjY2VzcyhcIkNvcGllZCB0byBjbGlwYm9hcmRcIik7XG4gIH07XG5cbiAgb3BlbkluRWRpdG9yID0gKCkgPT4ge1xuICAgIGF0b20ud29ya3NwYWNlXG4gICAgICAub3BlbigpXG4gICAgICAudGhlbigoZWRpdG9yKSA9PiBlZGl0b3IuaW5zZXJ0VGV4dCh0aGlzLmdldEFsbFRleHQoKSkpO1xuICB9O1xuXG4gIGFkZENvcHlUb29sdGlwID0gKGVsZW1lbnQ6ID9IVE1MRWxlbWVudCwgY29tcDogYXRvbSRDb21wb3NpdGVEaXNwb3NhYmxlKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50IHx8ICFjb21wLmRpc3Bvc2FibGVzIHx8IGNvbXAuZGlzcG9zYWJsZXMuc2l6ZSA+IDApIHJldHVybjtcbiAgICBjb21wLmFkZChcbiAgICAgIGF0b20udG9vbHRpcHMuYWRkKGVsZW1lbnQsIHtcbiAgICAgICAgdGl0bGU6IGBDbGljayB0byBjb3B5LFxuICAgICAgICAgICR7XG4gICAgICAgICAgICBwcm9jZXNzLnBsYXRmb3JtID09PSBcImRhcndpblwiID8gXCJDbWRcIiA6IFwiQ3RybFwiXG4gICAgICAgICAgfStDbGljayB0byBvcGVuIGluIGVkaXRvcmAsXG4gICAgICB9KVxuICAgICk7XG4gIH07XG5cbiAgYWRkQ2xvc2VCdXR0b25Ub29sdGlwID0gKFxuICAgIGVsZW1lbnQ6ID9IVE1MRWxlbWVudCxcbiAgICBjb21wOiBhdG9tJENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgKSA9PiB7XG4gICAgaWYgKCFlbGVtZW50IHx8ICFjb21wLmRpc3Bvc2FibGVzIHx8IGNvbXAuZGlzcG9zYWJsZXMuc2l6ZSA+IDApIHJldHVybjtcbiAgICBjb21wLmFkZChcbiAgICAgIGF0b20udG9vbHRpcHMuYWRkKGVsZW1lbnQsIHtcbiAgICAgICAgdGl0bGU6IHRoaXMucHJvcHMuc3RvcmUuZXhlY3V0aW9uQ291bnRcbiAgICAgICAgICA/IGBDbG9zZSAoT3V0WyR7dGhpcy5wcm9wcy5zdG9yZS5leGVjdXRpb25Db3VudH1dKWBcbiAgICAgICAgICA6IFwiQ2xvc2UgcmVzdWx0XCIsXG4gICAgICB9KVxuICAgICk7XG4gIH07XG5cbiAgYWRkQ29weUJ1dHRvblRvb2x0aXAgPSAoZWxlbWVudDogP0hUTUxFbGVtZW50KSA9PiB7XG4gICAgdGhpcy5hZGRDb3B5VG9vbHRpcChlbGVtZW50LCB0aGlzLmJ1dHRvblRvb2x0aXApO1xuICB9O1xuXG4gIG9uV2hlZWwgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICByZXR1cm4gKGV2ZW50OiBXaGVlbEV2ZW50KSA9PiB7XG4gICAgICBjb25zdCBjbGllbnRIZWlnaHQgPSBlbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIGNvbnN0IHNjcm9sbEhlaWdodCA9IGVsZW1lbnQuc2Nyb2xsSGVpZ2h0O1xuICAgICAgY29uc3QgY2xpZW50V2lkdGggPSBlbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgY29uc3Qgc2Nyb2xsV2lkdGggPSBlbGVtZW50LnNjcm9sbFdpZHRoO1xuICAgICAgY29uc3Qgc2Nyb2xsVG9wID0gZWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICBjb25zdCBzY3JvbGxMZWZ0ID0gZWxlbWVudC5zY3JvbGxMZWZ0O1xuICAgICAgY29uc3QgYXRUb3AgPSBzY3JvbGxUb3AgIT09IDAgJiYgZXZlbnQuZGVsdGFZIDwgMDtcbiAgICAgIGNvbnN0IGF0TGVmdCA9IHNjcm9sbExlZnQgIT09IDAgJiYgZXZlbnQuZGVsdGFYIDwgMDtcbiAgICAgIGNvbnN0IGF0Qm90dG9tID1cbiAgICAgICAgc2Nyb2xsVG9wICE9PSBzY3JvbGxIZWlnaHQgLSBjbGllbnRIZWlnaHQgJiYgZXZlbnQuZGVsdGFZID4gMDtcbiAgICAgIGNvbnN0IGF0UmlnaHQgPVxuICAgICAgICBzY3JvbGxMZWZ0ICE9PSBzY3JvbGxXaWR0aCAtIGNsaWVudFdpZHRoICYmIGV2ZW50LmRlbHRhWCA+IDA7XG5cbiAgICAgIGlmIChjbGllbnRIZWlnaHQgPCBzY3JvbGxIZWlnaHQgJiYgKGF0VG9wIHx8IGF0Qm90dG9tKSkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgIH0gZWxzZSBpZiAoY2xpZW50V2lkdGggPCBzY3JvbGxXaWR0aCAmJiAoYXRMZWZ0IHx8IGF0UmlnaHQpKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgQGFjdGlvblxuICB0b2dnbGVFeHBhbmQgPSAoKSA9PiB7XG4gICAgdGhpcy5leHBhbmRlZCA9ICF0aGlzLmV4cGFuZGVkO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IG91dHB1dHMsIHN0YXR1cywgaXNQbGFpbiwgcG9zaXRpb24gfSA9IHRoaXMucHJvcHMuc3RvcmU7XG5cbiAgICBjb25zdCBpbmxpbmVTdHlsZSA9IHtcbiAgICAgIG1hcmdpbkxlZnQ6IGAke3Bvc2l0aW9uLmxpbmVMZW5ndGggKyBwb3NpdGlvbi5jaGFyV2lkdGh9cHhgLFxuICAgICAgbWFyZ2luVG9wOiBgLSR7cG9zaXRpb24ubGluZUhlaWdodH1weGAsXG4gICAgICB1c2VyU2VsZWN0OiBcInRleHRcIixcbiAgICB9O1xuXG4gICAgaWYgKG91dHB1dHMubGVuZ3RoID09PSAwIHx8IHRoaXMucHJvcHMuc2hvd1Jlc3VsdCA9PT0gZmFsc2UpIHtcbiAgICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMucHJvcHMua2VybmVsO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFN0YXR1c1xuICAgICAgICAgIHN0YXR1cz17XG4gICAgICAgICAgICBrZXJuZWwgJiYga2VybmVsLmV4ZWN1dGlvblN0YXRlICE9PSBcImJ1c3lcIiAmJiBzdGF0dXMgPT09IFwicnVubmluZ1wiXG4gICAgICAgICAgICAgID8gXCJlcnJvclwiXG4gICAgICAgICAgICAgIDogc3RhdHVzXG4gICAgICAgICAgfVxuICAgICAgICAgIHN0eWxlPXtpbmxpbmVTdHlsZX1cbiAgICAgICAgLz5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtcbiAgICAgICAgICAoaXNQbGFpbiA/IFwiaW5saW5lLWNvbnRhaW5lclwiIDogXCJtdWx0aWxpbmUtY29udGFpbmVyXCIpICtcbiAgICAgICAgICBcIiBuYXRpdmUta2V5LWJpbmRpbmdzXCJcbiAgICAgICAgfVxuICAgICAgICB0YWJJbmRleD17XCItMVwifVxuICAgICAgICBvbkNsaWNrPXtpc1BsYWluID8gdGhpcy5jaGVja0ZvclNlbGVjdGlvbiA6IHVuZGVmaW5lZH1cbiAgICAgICAgc3R5bGU9e1xuICAgICAgICAgIGlzUGxhaW5cbiAgICAgICAgICAgID8gaW5saW5lU3R5bGVcbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIG1heFdpZHRoOiBgJHtwb3NpdGlvbi5lZGl0b3JXaWR0aCAtIDIgKiBwb3NpdGlvbi5jaGFyV2lkdGh9cHhgLFxuICAgICAgICAgICAgICAgIG1hcmdpbjogXCIwcHhcIixcbiAgICAgICAgICAgICAgICB1c2VyU2VsZWN0OiBcInRleHRcIixcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGh5ZHJvZ2VuLXdyYXBvdXRwdXQ9e2F0b20uY29uZmlnLmdldChgSHlkcm9nZW4ud3JhcE91dHB1dGApLnRvU3RyaW5nKCl9XG4gICAgICA+XG4gICAgICAgIDxkaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJoeWRyb2dlbl9jZWxsX2Rpc3BsYXlcIlxuICAgICAgICAgIHJlZj17KHJlZikgPT4ge1xuICAgICAgICAgICAgaWYgKCFyZWYpIHJldHVybjtcbiAgICAgICAgICAgIHRoaXMuZWwgPSByZWY7XG5cbiAgICAgICAgICAgIGlzUGxhaW5cbiAgICAgICAgICAgICAgPyB0aGlzLmFkZENvcHlUb29sdGlwKHJlZiwgdGhpcy5jb250YWluZXJUb29sdGlwKVxuICAgICAgICAgICAgICA6IHRoaXMuY29udGFpbmVyVG9vbHRpcC5kaXNwb3NlKCk7XG5cbiAgICAgICAgICAgIC8vIEFzIG9mIHRoaXMgd3JpdGluZyBSZWFjdCdzIGV2ZW50IGhhbmRsZXIgZG9lc24ndCBwcm9wZXJseSBoYW5kbGVcbiAgICAgICAgICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpIGZvciBldmVudHMgb3V0c2lkZSB0aGUgUmVhY3QgY29udGV4dC5cbiAgICAgICAgICAgIGlmICghdGhpcy5leHBhbmRlZCAmJiAhaXNQbGFpbiAmJiByZWYpIHtcbiAgICAgICAgICAgICAgcmVmLmFkZEV2ZW50TGlzdGVuZXIoXCJ3aGVlbFwiLCB0aGlzLm9uV2hlZWwocmVmKSwge1xuICAgICAgICAgICAgICAgIHBhc3NpdmU6IHRydWUsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH19XG4gICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgIG1heEhlaWdodDogdGhpcy5leHBhbmRlZCA/IFwiMTAwJVwiIDogYCR7U0NST0xMX0hFSUdIVH1weGAsXG4gICAgICAgICAgICBvdmVyZmxvd1k6IFwiYXV0b1wiLFxuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICB7b3V0cHV0cy5tYXAoKG91dHB1dCwgaW5kZXgpID0+IChcbiAgICAgICAgICAgIDxEaXNwbGF5IG91dHB1dD17b3V0cHV0fSBrZXk9e2luZGV4fSAvPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2lzUGxhaW4gPyBudWxsIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidG9vbGJhclwiPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpY29uIGljb24teFwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMuZGVzdHJveX1cbiAgICAgICAgICAgICAgcmVmPXsocmVmKSA9PiB0aGlzLmFkZENsb3NlQnV0dG9uVG9vbHRpcChyZWYsIHRoaXMuY2xvc2VUb29sdGlwKX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleDogMSwgbWluSGVpZ2h0OiBcIjAuMjVlbVwiIH19IC8+XG5cbiAgICAgICAgICAgIHt0aGlzLmdldEFsbFRleHQoKS5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbiBpY29uLWNsaXBweVwiXG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVDbGlja31cbiAgICAgICAgICAgICAgICByZWY9e3RoaXMuYWRkQ29weUJ1dHRvblRvb2x0aXB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApIDogbnVsbH1cblxuICAgICAgICAgICAge3RoaXMuZWwgJiYgdGhpcy5lbC5zY3JvbGxIZWlnaHQgPiBTQ1JPTExfSEVJR0hUID8gKFxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgaWNvbiBpY29uLSR7dGhpcy5leHBhbmRlZCA/IFwiZm9sZFwiIDogXCJ1bmZvbGRcIn1gfVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMudG9nZ2xlRXhwYW5kfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgc2Nyb2xsVG9Cb3R0b20oKSB7XG4gICAgaWYgKFxuICAgICAgIXRoaXMuZWwgfHxcbiAgICAgIHRoaXMuZXhwYW5kZWQgPT09IHRydWUgfHxcbiAgICAgIHRoaXMucHJvcHMuc3RvcmUuaXNQbGFpbiA9PT0gdHJ1ZSB8fFxuICAgICAgYXRvbS5jb25maWcuZ2V0KGBIeWRyb2dlbi5hdXRvU2Nyb2xsYCkgPT09IGZhbHNlXG4gICAgKVxuICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IHNjcm9sbEhlaWdodCA9IHRoaXMuZWwuc2Nyb2xsSGVpZ2h0O1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZWwuY2xpZW50SGVpZ2h0O1xuICAgIGNvbnN0IG1heFNjcm9sbFRvcCA9IHNjcm9sbEhlaWdodCAtIGhlaWdodDtcbiAgICB0aGlzLmVsLnNjcm9sbFRvcCA9IG1heFNjcm9sbFRvcCA+IDAgPyBtYXhTY3JvbGxUb3AgOiAwO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIHRoaXMuc2Nyb2xsVG9Cb3R0b20oKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuY29udGFpbmVyVG9vbHRpcC5kaXNwb3NlKCk7XG4gICAgdGhpcy5idXR0b25Ub29sdGlwLmRpc3Bvc2UoKTtcbiAgICB0aGlzLmNsb3NlVG9vbHRpcC5kaXNwb3NlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmVzdWx0Vmlld0NvbXBvbmVudDtcbiJdfQ==