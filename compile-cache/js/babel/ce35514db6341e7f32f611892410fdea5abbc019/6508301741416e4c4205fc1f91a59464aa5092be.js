Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.isTextOutputOnly = isTextOutputOnly;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobx = require("mobx");

var _mobxReact = require("mobx-react");

var _nteractOutputs = require("@nteract/outputs");

var _plotly = require("./plotly");

var _plotly2 = _interopRequireDefault(_plotly);

var _nteractTransformVega = require("@nteract/transform-vega");

var _markdown = require("./markdown");

var _markdown2 = _interopRequireDefault(_markdown);

// All supported media types for output go here
var supportedMediaTypes = _react2["default"].createElement(
  _nteractOutputs.RichMedia,
  null,
  _react2["default"].createElement(_nteractTransformVega.Vega5, null),
  _react2["default"].createElement(_nteractTransformVega.Vega4, null),
  _react2["default"].createElement(_nteractTransformVega.Vega3, null),
  _react2["default"].createElement(_nteractTransformVega.Vega2, null),
  _react2["default"].createElement(_plotly2["default"], null),
  _react2["default"].createElement(_nteractTransformVega.VegaLite4, null),
  _react2["default"].createElement(_nteractTransformVega.VegaLite3, null),
  _react2["default"].createElement(_nteractTransformVega.VegaLite2, null),
  _react2["default"].createElement(_nteractTransformVega.VegaLite1, null),
  _react2["default"].createElement(_nteractOutputs.Media.Json, null),
  _react2["default"].createElement(_nteractOutputs.Media.JavaScript, null),
  _react2["default"].createElement(_nteractOutputs.Media.HTML, null),
  _react2["default"].createElement(_markdown2["default"], null),
  _react2["default"].createElement(_nteractOutputs.Media.LaTeX, null),
  _react2["default"].createElement(_nteractOutputs.Media.SVG, null),
  _react2["default"].createElement(_nteractOutputs.Media.Image, { mediaType: "image/gif" }),
  _react2["default"].createElement(_nteractOutputs.Media.Image, { mediaType: "image/jpeg" }),
  _react2["default"].createElement(_nteractOutputs.Media.Image, { mediaType: "image/png" }),
  _react2["default"].createElement(_nteractOutputs.Media.Plain, null)
);

exports.supportedMediaTypes = supportedMediaTypes;

function isTextOutputOnly(data) {
  var supported = _react2["default"].Children.map(supportedMediaTypes.props.children, function (mediaComponent) {
    return mediaComponent.props.mediaType;
  });
  var bundleMediaTypes = [].concat(_toConsumableArray(Object.keys(data))).filter(function (mediaType) {
    return supported.includes(mediaType);
  });

  return bundleMediaTypes.length === 1 && bundleMediaTypes[0] === "text/plain" ? true : false;
}

var Display = (function (_React$Component) {
  _inherits(Display, _React$Component);

  function Display() {
    _classCallCheck(this, _Display);

    _get(Object.getPrototypeOf(_Display.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Display, [{
    key: "render",
    value: function render() {
      return _react2["default"].createElement(
        _nteractOutputs.Output,
        { output: (0, _mobx.toJS)(this.props.output) },
        _react2["default"].createElement(
          _nteractOutputs.ExecuteResult,
          { expanded: true },
          supportedMediaTypes
        ),
        _react2["default"].createElement(
          _nteractOutputs.DisplayData,
          { expanded: true },
          supportedMediaTypes
        ),
        _react2["default"].createElement(_nteractOutputs.StreamText, { expanded: true }),
        _react2["default"].createElement(_nteractOutputs.KernelOutputError, { expanded: true })
      );
    }
  }]);

  var _Display = Display;
  Display = (0, _mobxReact.observer)(Display) || Display;
  return Display;
})(_react2["default"].Component);

exports["default"] = Display;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L2Rpc3BsYXkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7O29CQUNKLE1BQU07O3lCQUNGLFlBQVk7OzhCQVM5QixrQkFBa0I7O3NCQUNOLFVBQVU7Ozs7b0NBVXRCLHlCQUF5Qjs7d0JBRVgsWUFBWTs7Ozs7QUFHMUIsSUFBTSxtQkFBbUIsR0FDOUI7OztFQUNFLG1FQUFTO0VBQ1QsbUVBQVM7RUFDVCxtRUFBUztFQUNULG1FQUFTO0VBQ1QsMkRBQVU7RUFDVix1RUFBYTtFQUNiLHVFQUFhO0VBQ2IsdUVBQWE7RUFDYix1RUFBYTtFQUNiLGlDQUFDLHNCQUFNLElBQUksT0FBRztFQUNkLGlDQUFDLHNCQUFNLFVBQVUsT0FBRztFQUNwQixpQ0FBQyxzQkFBTSxJQUFJLE9BQUc7RUFDZCw2REFBWTtFQUNaLGlDQUFDLHNCQUFNLEtBQUssT0FBRztFQUNmLGlDQUFDLHNCQUFNLEdBQUcsT0FBRztFQUNiLGlDQUFDLHNCQUFNLEtBQUssSUFBQyxTQUFTLEVBQUMsV0FBVyxHQUFHO0VBQ3JDLGlDQUFDLHNCQUFNLEtBQUssSUFBQyxTQUFTLEVBQUMsWUFBWSxHQUFHO0VBQ3RDLGlDQUFDLHNCQUFNLEtBQUssSUFBQyxTQUFTLEVBQUMsV0FBVyxHQUFHO0VBQ3JDLGlDQUFDLHNCQUFNLEtBQUssT0FBRztDQUNMLEFBQ2IsQ0FBQzs7OztBQUVLLFNBQVMsZ0JBQWdCLENBQUMsSUFBWSxFQUFFO0FBQzdDLE1BQU0sU0FBUyxHQUFHLG1CQUFNLFFBQVEsQ0FBQyxHQUFHLENBQ2xDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQ2xDLFVBQUMsY0FBYztXQUFLLGNBQWMsQ0FBQyxLQUFLLENBQUMsU0FBUztHQUFBLENBQ25ELENBQUM7QUFDRixNQUFNLGdCQUFnQixHQUFHLDZCQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUUsTUFBTSxDQUFDLFVBQUMsU0FBUztXQUMvRCxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztHQUFBLENBQzlCLENBQUM7O0FBRUYsU0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxLQUFLLFlBQVksR0FDeEUsSUFBSSxHQUNKLEtBQUssQ0FBQztDQUNYOztJQUdLLE9BQU87WUFBUCxPQUFPOztXQUFQLE9BQU87Ozs7OztlQUFQLE9BQU87O1dBQ0wsa0JBQUc7QUFDUCxhQUNFOztVQUFRLE1BQU0sRUFBRSxnQkFBSyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxBQUFDO1FBQ3RDOztZQUFlLFFBQVEsTUFBQTtVQUFFLG1CQUFtQjtTQUFpQjtRQUM3RDs7WUFBYSxRQUFRLE1BQUE7VUFBRSxtQkFBbUI7U0FBZTtRQUN6RCwrREFBWSxRQUFRLE1BQUEsR0FBRztRQUN2QixzRUFBbUIsUUFBUSxNQUFBLEdBQUc7T0FDdkIsQ0FDVDtLQUNIOzs7aUJBVkcsT0FBTztBQUFQLFNBQU8sNEJBQVAsT0FBTyxLQUFQLE9BQU87U0FBUCxPQUFPO0dBQVMsbUJBQU0sU0FBUzs7cUJBYXRCLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvcmVzdWx0LXZpZXcvZGlzcGxheS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHRvSlMgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IHtcbiAgRGlzcGxheURhdGEsXG4gIEV4ZWN1dGVSZXN1bHQsXG4gIFN0cmVhbVRleHQsXG4gIEtlcm5lbE91dHB1dEVycm9yLFxuICBPdXRwdXQsXG4gIE1lZGlhLFxuICBSaWNoTWVkaWEsXG59IGZyb20gXCJAbnRlcmFjdC9vdXRwdXRzXCI7XG5pbXBvcnQgUGxvdGx5IGZyb20gXCIuL3Bsb3RseVwiO1xuaW1wb3J0IHtcbiAgVmVnYUxpdGUxLFxuICBWZWdhTGl0ZTIsXG4gIFZlZ2FMaXRlMyxcbiAgVmVnYUxpdGU0LFxuICBWZWdhMixcbiAgVmVnYTMsXG4gIFZlZ2E0LFxuICBWZWdhNSxcbn0gZnJvbSBcIkBudGVyYWN0L3RyYW5zZm9ybS12ZWdhXCI7XG5cbmltcG9ydCBNYXJrZG93biBmcm9tIFwiLi9tYXJrZG93blwiO1xuXG4vLyBBbGwgc3VwcG9ydGVkIG1lZGlhIHR5cGVzIGZvciBvdXRwdXQgZ28gaGVyZVxuZXhwb3J0IGNvbnN0IHN1cHBvcnRlZE1lZGlhVHlwZXMgPSAoXG4gIDxSaWNoTWVkaWE+XG4gICAgPFZlZ2E1IC8+XG4gICAgPFZlZ2E0IC8+XG4gICAgPFZlZ2EzIC8+XG4gICAgPFZlZ2EyIC8+XG4gICAgPFBsb3RseSAvPlxuICAgIDxWZWdhTGl0ZTQgLz5cbiAgICA8VmVnYUxpdGUzIC8+XG4gICAgPFZlZ2FMaXRlMiAvPlxuICAgIDxWZWdhTGl0ZTEgLz5cbiAgICA8TWVkaWEuSnNvbiAvPlxuICAgIDxNZWRpYS5KYXZhU2NyaXB0IC8+XG4gICAgPE1lZGlhLkhUTUwgLz5cbiAgICA8TWFya2Rvd24gLz5cbiAgICA8TWVkaWEuTGFUZVggLz5cbiAgICA8TWVkaWEuU1ZHIC8+XG4gICAgPE1lZGlhLkltYWdlIG1lZGlhVHlwZT1cImltYWdlL2dpZlwiIC8+XG4gICAgPE1lZGlhLkltYWdlIG1lZGlhVHlwZT1cImltYWdlL2pwZWdcIiAvPlxuICAgIDxNZWRpYS5JbWFnZSBtZWRpYVR5cGU9XCJpbWFnZS9wbmdcIiAvPlxuICAgIDxNZWRpYS5QbGFpbiAvPlxuICA8L1JpY2hNZWRpYT5cbik7XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1RleHRPdXRwdXRPbmx5KGRhdGE6IE9iamVjdCkge1xuICBjb25zdCBzdXBwb3J0ZWQgPSBSZWFjdC5DaGlsZHJlbi5tYXAoXG4gICAgc3VwcG9ydGVkTWVkaWFUeXBlcy5wcm9wcy5jaGlsZHJlbixcbiAgICAobWVkaWFDb21wb25lbnQpID0+IG1lZGlhQ29tcG9uZW50LnByb3BzLm1lZGlhVHlwZVxuICApO1xuICBjb25zdCBidW5kbGVNZWRpYVR5cGVzID0gWy4uLk9iamVjdC5rZXlzKGRhdGEpXS5maWx0ZXIoKG1lZGlhVHlwZSkgPT5cbiAgICBzdXBwb3J0ZWQuaW5jbHVkZXMobWVkaWFUeXBlKVxuICApO1xuXG4gIHJldHVybiBidW5kbGVNZWRpYVR5cGVzLmxlbmd0aCA9PT0gMSAmJiBidW5kbGVNZWRpYVR5cGVzWzBdID09PSBcInRleHQvcGxhaW5cIlxuICAgID8gdHJ1ZVxuICAgIDogZmFsc2U7XG59XG5cbkBvYnNlcnZlclxuY2xhc3MgRGlzcGxheSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7IG91dHB1dDogYW55IH0+IHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8T3V0cHV0IG91dHB1dD17dG9KUyh0aGlzLnByb3BzLm91dHB1dCl9PlxuICAgICAgICA8RXhlY3V0ZVJlc3VsdCBleHBhbmRlZD57c3VwcG9ydGVkTWVkaWFUeXBlc308L0V4ZWN1dGVSZXN1bHQ+XG4gICAgICAgIDxEaXNwbGF5RGF0YSBleHBhbmRlZD57c3VwcG9ydGVkTWVkaWFUeXBlc308L0Rpc3BsYXlEYXRhPlxuICAgICAgICA8U3RyZWFtVGV4dCBleHBhbmRlZCAvPlxuICAgICAgICA8S2VybmVsT3V0cHV0RXJyb3IgZXhwYW5kZWQgLz5cbiAgICAgIDwvT3V0cHV0PlxuICAgICk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGlzcGxheTtcbiJdfQ==