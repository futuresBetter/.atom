Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _utils = require("../../../utils");

var StatusBar = (function (_React$Component) {
  _inherits(StatusBar, _React$Component);

  function StatusBar() {
    _classCallCheck(this, _StatusBar);

    _get(Object.getPrototypeOf(_StatusBar.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(StatusBar, [{
    key: "render",
    value: function render() {
      var _this = this;

      var _props$store = this.props.store;
      var kernel = _props$store.kernel;
      var markers = _props$store.markers;
      var configMapping = _props$store.configMapping;

      if (!kernel || configMapping.get("Hydrogen.statusBarDisable")) return null;
      var view = configMapping.get("Hydrogen.statusBarKernelInfo") ?
      // branch on if exec time is not available or no execution has happened
      kernel.executionCount === 0 || kernel.lastExecutionTime === _utils.NO_EXECTIME_STRING ? _react2["default"].createElement(
        "a",
        { onClick: function () {
            return _this.props.onClick({ kernel: kernel, markers: markers });
          } },
        kernel.displayName,
        " | ",
        kernel.executionState,
        " |",
        " ",
        kernel.executionCount
      ) : _react2["default"].createElement(
        "a",
        { onClick: function () {
            return _this.props.onClick({ kernel: kernel, markers: markers });
          } },
        kernel.displayName,
        " | ",
        kernel.executionState,
        " |",
        " ",
        kernel.executionCount,
        " | ",
        kernel.lastExecutionTime
      ) : _react2["default"].createElement(
        "a",
        { onClick: function () {
            return _this.props.onClick({ kernel: kernel, markers: markers });
          } },
        kernel.displayName,
        " | ",
        kernel.executionState
      );
      return view;
    }
  }]);

  var _StatusBar = StatusBar;
  StatusBar = (0, _mobxReact.observer)(StatusBar) || StatusBar;
  return StatusBar;
})(_react2["default"].Component);

exports["default"] = StatusBar;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zZXJ2aWNlcy9jb25zdW1lZC9zdGF0dXMtYmFyL3N0YXR1cy1iYXItY29tcG9uZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7O3lCQUNBLFlBQVk7O3FCQUlGLGdCQUFnQjs7SUFROUIsU0FBUztZQUFULFNBQVM7O1dBQVQsU0FBUzs7Ozs7O2VBQVQsU0FBUzs7V0FDdEIsa0JBQUc7Ozt5QkFDb0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO1VBQW5ELE1BQU0sZ0JBQU4sTUFBTTtVQUFFLE9BQU8sZ0JBQVAsT0FBTztVQUFFLGFBQWEsZ0JBQWIsYUFBYTs7QUFDdEMsVUFBSSxDQUFDLE1BQU0sSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUM7QUFDM0UsVUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQzs7QUFFNUQsWUFBTSxDQUFDLGNBQWMsS0FBSyxDQUFDLElBQzNCLE1BQU0sQ0FBQyxpQkFBaUIsOEJBQXVCLEdBQzdDOztVQUFHLE9BQU8sRUFBRTttQkFBTSxNQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsQ0FBQztXQUFBLEFBQUM7UUFDdkQsTUFBTSxDQUFDLFdBQVc7O1FBQUssTUFBTSxDQUFDLGNBQWM7O1FBQUksR0FBRztRQUNuRCxNQUFNLENBQUMsY0FBYztPQUNwQixHQUVKOztVQUFHLE9BQU8sRUFBRTttQkFBTSxNQUFLLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUUsQ0FBQztXQUFBLEFBQUM7UUFDdkQsTUFBTSxDQUFDLFdBQVc7O1FBQUssTUFBTSxDQUFDLGNBQWM7O1FBQUksR0FBRztRQUNuRCxNQUFNLENBQUMsY0FBYzs7UUFBSyxNQUFNLENBQUMsaUJBQWlCO09BQ2pELEFBQ0wsR0FFRDs7VUFBRyxPQUFPLEVBQUU7bUJBQU0sTUFBSyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxPQUFPLEVBQVAsT0FBTyxFQUFFLENBQUM7V0FBQSxBQUFDO1FBQ3ZELE1BQU0sQ0FBQyxXQUFXOztRQUFLLE1BQU0sQ0FBQyxjQUFjO09BQzNDLEFBQ0wsQ0FBQztBQUNGLGFBQU8sSUFBSSxDQUFDO0tBQ2I7OzttQkF4QmtCLFNBQVM7QUFBVCxXQUFTLDRCQUFULFNBQVMsS0FBVCxTQUFTO1NBQVQsU0FBUztHQUFTLG1CQUFNLFNBQVM7O3FCQUFqQyxTQUFTIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zZXJ2aWNlcy9jb25zdW1lZC9zdGF0dXMtYmFyL3N0YXR1cy1iYXItY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuXG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4uLy4uLy4uL2tlcm5lbFwiO1xuaW1wb3J0IHR5cGUgeyBTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHsgTk9fRVhFQ1RJTUVfU1RSSU5HIH0gZnJvbSBcIi4uLy4uLy4uL3V0aWxzXCI7XG5cbnR5cGUgUHJvcHMgPSB7XG4gIHN0b3JlOiBTdG9yZSxcbiAgb25DbGljazogRnVuY3Rpb24sXG59O1xuXG5Ab2JzZXJ2ZXJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXR1c0JhciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDxQcm9wcz4ge1xuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBrZXJuZWwsIG1hcmtlcnMsIGNvbmZpZ01hcHBpbmcgfSA9IHRoaXMucHJvcHMuc3RvcmU7XG4gICAgaWYgKCFrZXJuZWwgfHwgY29uZmlnTWFwcGluZy5nZXQoXCJIeWRyb2dlbi5zdGF0dXNCYXJEaXNhYmxlXCIpKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB2aWV3ID0gY29uZmlnTWFwcGluZy5nZXQoXCJIeWRyb2dlbi5zdGF0dXNCYXJLZXJuZWxJbmZvXCIpID8gKFxuICAgICAgLy8gYnJhbmNoIG9uIGlmIGV4ZWMgdGltZSBpcyBub3QgYXZhaWxhYmxlIG9yIG5vIGV4ZWN1dGlvbiBoYXMgaGFwcGVuZWRcbiAgICAgIGtlcm5lbC5leGVjdXRpb25Db3VudCA9PT0gMCB8fFxuICAgICAga2VybmVsLmxhc3RFeGVjdXRpb25UaW1lID09PSBOT19FWEVDVElNRV9TVFJJTkcgPyAoXG4gICAgICAgIDxhIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25DbGljayh7IGtlcm5lbCwgbWFya2VycyB9KX0+XG4gICAgICAgICAge2tlcm5lbC5kaXNwbGF5TmFtZX0gfCB7a2VybmVsLmV4ZWN1dGlvblN0YXRlfSB8e1wiIFwifVxuICAgICAgICAgIHtrZXJuZWwuZXhlY3V0aW9uQ291bnR9XG4gICAgICAgIDwvYT5cbiAgICAgICkgOiAoXG4gICAgICAgIDxhIG9uQ2xpY2s9eygpID0+IHRoaXMucHJvcHMub25DbGljayh7IGtlcm5lbCwgbWFya2VycyB9KX0+XG4gICAgICAgICAge2tlcm5lbC5kaXNwbGF5TmFtZX0gfCB7a2VybmVsLmV4ZWN1dGlvblN0YXRlfSB8e1wiIFwifVxuICAgICAgICAgIHtrZXJuZWwuZXhlY3V0aW9uQ291bnR9IHwge2tlcm5lbC5sYXN0RXhlY3V0aW9uVGltZX1cbiAgICAgICAgPC9hPlxuICAgICAgKVxuICAgICkgOiAoXG4gICAgICA8YSBvbkNsaWNrPXsoKSA9PiB0aGlzLnByb3BzLm9uQ2xpY2soeyBrZXJuZWwsIG1hcmtlcnMgfSl9PlxuICAgICAgICB7a2VybmVsLmRpc3BsYXlOYW1lfSB8IHtrZXJuZWwuZXhlY3V0aW9uU3RhdGV9XG4gICAgICA8L2E+XG4gICAgKTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxufVxuIl19