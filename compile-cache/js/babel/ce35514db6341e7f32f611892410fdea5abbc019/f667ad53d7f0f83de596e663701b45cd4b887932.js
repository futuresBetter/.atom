Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _nteractMathjax = require("@nteract/mathjax");

var _mathjaxElectron = require("mathjax-electron");

var _mobx = require("mobx");

var _mobxReact = require("mobx-react");

var _anser = require("anser");

var _anser2 = _interopRequireDefault(_anser);

var _resultViewHistory = require("./result-view/history");

var _resultViewHistory2 = _interopRequireDefault(_resultViewHistory);

var _resultViewList = require("./result-view/list");

var _resultViewList2 = _interopRequireDefault(_resultViewList);

var _utils = require("./../utils");

var OutputArea = (function (_React$Component) {
  var _instanceInitializers = {};

  _inherits(OutputArea, _React$Component);

  function OutputArea() {
    var _this = this;

    _classCallCheck(this, _OutputArea);

    _get(Object.getPrototypeOf(_OutputArea.prototype), "constructor", this).apply(this, arguments);

    _defineDecoratedPropertyDescriptor(this, "showHistory", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setHistory", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setScrollList", _instanceInitializers);

    this.handleClick = function () {
      var kernel = _this.props.store.kernel;
      if (!kernel || !kernel.outputStore) return;
      var output = kernel.outputStore.outputs[kernel.outputStore.index];
      var copyOutput = _this.getOutputText(output);

      if (copyOutput) {
        atom.clipboard.write(_anser2["default"].ansiToText(copyOutput));
        atom.notifications.addSuccess("Copied to clipboard");
      } else {
        atom.notifications.addWarning("Nothing to copy");
      }
    };
  }

  _createDecoratedClass(OutputArea, [{
    key: "getOutputText",
    value: function getOutputText(output) {
      switch (output.output_type) {
        case "stream":
          return output.text;
        case "execute_result":
          return output.data["text/plain"];
        case "error":
          return output.traceback.toJS().join("\n");
      }
    }
  }, {
    key: "render",
    value: function render() {
      var kernel = this.props.store.kernel;

      if (!kernel) {
        if (atom.config.get("Hydrogen.outputAreaDock")) {
          return _react2["default"].createElement(_utils.EmptyMessage, null);
        }

        atom.workspace.hide(_utils.OUTPUT_AREA_URI);
        return null;
      }
      return _react2["default"].createElement(
        _nteractMathjax.Provider,
        { src: _mathjaxElectron.mathJaxPath },
        _react2["default"].createElement(
          "div",
          { className: "sidebar output-area" },
          kernel.outputStore.outputs.length > 0 ? _react2["default"].createElement(
            "div",
            { className: "block" },
            _react2["default"].createElement(
              "div",
              { className: "btn-group" },
              _react2["default"].createElement("button", {
                className: "btn icon icon-clock" + (this.showHistory ? " selected" : ""),
                onClick: this.setHistory
              }),
              _react2["default"].createElement("button", {
                className: "btn icon icon-three-bars" + (!this.showHistory ? " selected" : ""),
                onClick: this.setScrollList
              })
            ),
            _react2["default"].createElement(
              "div",
              { style: { float: "right" } },
              this.showHistory ? _react2["default"].createElement(
                "button",
                {
                  className: "btn icon icon-clippy",
                  onClick: this.handleClick
                },
                "Copy"
              ) : null,
              _react2["default"].createElement(
                "button",
                {
                  className: "btn icon icon-trashcan",
                  onClick: kernel.outputStore.clear
                },
                "Clear"
              )
            )
          ) : _react2["default"].createElement(_utils.EmptyMessage, null),
          this.showHistory ? _react2["default"].createElement(_resultViewHistory2["default"], { store: kernel.outputStore }) : _react2["default"].createElement(_resultViewList2["default"], { outputs: kernel.outputStore.outputs })
        )
      );
    }
  }, {
    key: "showHistory",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return true;
    },
    enumerable: true
  }, {
    key: "setHistory",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        _this2.showHistory = true;
      };
    },
    enumerable: true
  }, {
    key: "setScrollList",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.showHistory = false;
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  var _OutputArea = OutputArea;
  OutputArea = (0, _mobxReact.observer)(OutputArea) || OutputArea;
  return OutputArea;
})(_react2["default"].Component);

exports["default"] = OutputArea;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL291dHB1dC1hcmVhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7cUJBRWtCLE9BQU87Ozs7OEJBQ0Esa0JBQWtCOzsrQkFDZixrQkFBa0I7O29CQUNYLE1BQU07O3lCQUNoQixZQUFZOztxQkFDbkIsT0FBTzs7OztpQ0FFTCx1QkFBdUI7Ozs7OEJBQ3BCLG9CQUFvQjs7OztxQkFDRyxZQUFZOztJQUtwRCxVQUFVOzs7WUFBVixVQUFVOztXQUFWLFVBQVU7Ozs7Ozs7Ozs7Ozs7U0F3QmQsV0FBVyxHQUFHLFlBQU07QUFDbEIsVUFBTSxNQUFNLEdBQUcsTUFBSyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUN2QyxVQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPO0FBQzNDLFVBQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDcEUsVUFBTSxVQUFVLEdBQUcsTUFBSyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTlDLFVBQUksVUFBVSxFQUFFO0FBQ2QsWUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsbUJBQU0sVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7QUFDbkQsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztPQUN0RCxNQUFNO0FBQ0wsWUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsQ0FBQztPQUNsRDtLQUNGOzs7d0JBcENHLFVBQVU7O1dBYUQsdUJBQUMsTUFBYyxFQUFXO0FBQ3JDLGNBQVEsTUFBTSxDQUFDLFdBQVc7QUFDeEIsYUFBSyxRQUFRO0FBQ1gsaUJBQU8sTUFBTSxDQUFDLElBQUksQ0FBQztBQUFBLEFBQ3JCLGFBQUssZ0JBQWdCO0FBQ25CLGlCQUFPLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7QUFBQSxBQUNuQyxhQUFLLE9BQU87QUFDVixpQkFBTyxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUFBLE9BQzdDO0tBQ0Y7OztXQWdCSyxrQkFBRztBQUNQLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFdkMsVUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNYLFlBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsRUFBRTtBQUM5QyxpQkFBTywyREFBZ0IsQ0FBQztTQUN6Qjs7QUFFRCxZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksd0JBQWlCLENBQUM7QUFDckMsZUFBTyxJQUFJLENBQUM7T0FDYjtBQUNELGFBQ0U7O1VBQVUsR0FBRyw4QkFBYztRQUN6Qjs7WUFBSyxTQUFTLEVBQUMscUJBQXFCO1VBQ2pDLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQ3BDOztjQUFLLFNBQVMsRUFBQyxPQUFPO1lBQ3BCOztnQkFBSyxTQUFTLEVBQUMsV0FBVztjQUN4QjtBQUNFLHlCQUFTLDJCQUNQLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxHQUFHLEVBQUUsQ0FBQSxBQUNsQztBQUNILHVCQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVUsQUFBQztnQkFDekI7Y0FDRjtBQUNFLHlCQUFTLGdDQUNQLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLEdBQUcsRUFBRSxDQUFBLEFBQ25DO0FBQ0gsdUJBQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxBQUFDO2dCQUM1QjthQUNFO1lBQ047O2dCQUFLLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQUFBQztjQUM1QixJQUFJLENBQUMsV0FBVyxHQUNmOzs7QUFDRSwyQkFBUyxFQUFDLHNCQUFzQjtBQUNoQyx5QkFBTyxFQUFFLElBQUksQ0FBQyxXQUFXLEFBQUM7OztlQUduQixHQUNQLElBQUk7Y0FDUjs7O0FBQ0UsMkJBQVMsRUFBQyx3QkFBd0I7QUFDbEMseUJBQU8sRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQUFBQzs7O2VBRzNCO2FBQ0w7V0FDRixHQUVOLDJEQUFnQixBQUNqQjtVQUNBLElBQUksQ0FBQyxXQUFXLEdBQ2YsbUVBQVMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxXQUFXLEFBQUMsR0FBRyxHQUV0QyxnRUFBWSxPQUFPLEVBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEFBQUMsR0FBRyxBQUNwRDtTQUNHO09BQ0csQ0FDWDtLQUNIOzs7OzthQTlGc0IsSUFBSTs7Ozs7Ozs7O2FBRWQsWUFBTTtBQUNqQixlQUFLLFdBQVcsR0FBRyxJQUFJLENBQUM7T0FDekI7Ozs7Ozs7OzthQUdlLFlBQU07QUFDcEIsZUFBSyxXQUFXLEdBQUcsS0FBSyxDQUFDO09BQzFCOzs7OztvQkFYRyxVQUFVO0FBQVYsWUFBVSw0QkFBVixVQUFVLEtBQVYsVUFBVTtTQUFWLFVBQVU7R0FBUyxtQkFBTSxTQUFTOztxQkFtR3pCLFVBQVUiLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvb3V0cHV0LWFyZWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBQcm92aWRlciB9IGZyb20gXCJAbnRlcmFjdC9tYXRoamF4XCI7XG5pbXBvcnQgeyBtYXRoSmF4UGF0aCB9IGZyb20gXCJtYXRoamF4LWVsZWN0cm9uXCI7XG5pbXBvcnQgeyBhY3Rpb24sIG9ic2VydmFibGUgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IEFuc2VyIGZyb20gXCJhbnNlclwiO1xuXG5pbXBvcnQgSGlzdG9yeSBmcm9tIFwiLi9yZXN1bHQtdmlldy9oaXN0b3J5XCI7XG5pbXBvcnQgU2Nyb2xsTGlzdCBmcm9tIFwiLi9yZXN1bHQtdmlldy9saXN0XCI7XG5pbXBvcnQgeyBPVVRQVVRfQVJFQV9VUkksIEVtcHR5TWVzc2FnZSB9IGZyb20gXCIuLy4uL3V0aWxzXCI7XG5cbmltcG9ydCB0eXBlb2Ygc3RvcmUgZnJvbSBcIi4uL3N0b3JlXCI7XG5cbkBvYnNlcnZlclxuY2xhc3MgT3V0cHV0QXJlYSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudDx7IHN0b3JlOiBzdG9yZSB9PiB7XG4gIEBvYnNlcnZhYmxlXG4gIHNob3dIaXN0b3J5OiBib29sZWFuID0gdHJ1ZTtcbiAgQGFjdGlvblxuICBzZXRIaXN0b3J5ID0gKCkgPT4ge1xuICAgIHRoaXMuc2hvd0hpc3RvcnkgPSB0cnVlO1xuICB9O1xuXG4gIEBhY3Rpb25cbiAgc2V0U2Nyb2xsTGlzdCA9ICgpID0+IHtcbiAgICB0aGlzLnNob3dIaXN0b3J5ID0gZmFsc2U7XG4gIH07XG5cbiAgZ2V0T3V0cHV0VGV4dChvdXRwdXQ6IE9iamVjdCk6ID9zdHJpbmcge1xuICAgIHN3aXRjaCAob3V0cHV0Lm91dHB1dF90eXBlKSB7XG4gICAgICBjYXNlIFwic3RyZWFtXCI6XG4gICAgICAgIHJldHVybiBvdXRwdXQudGV4dDtcbiAgICAgIGNhc2UgXCJleGVjdXRlX3Jlc3VsdFwiOlxuICAgICAgICByZXR1cm4gb3V0cHV0LmRhdGFbXCJ0ZXh0L3BsYWluXCJdO1xuICAgICAgY2FzZSBcImVycm9yXCI6XG4gICAgICAgIHJldHVybiBvdXRwdXQudHJhY2ViYWNrLnRvSlMoKS5qb2luKFwiXFxuXCIpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUNsaWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IGtlcm5lbCA9IHRoaXMucHJvcHMuc3RvcmUua2VybmVsO1xuICAgIGlmICgha2VybmVsIHx8ICFrZXJuZWwub3V0cHV0U3RvcmUpIHJldHVybjtcbiAgICBjb25zdCBvdXRwdXQgPSBrZXJuZWwub3V0cHV0U3RvcmUub3V0cHV0c1trZXJuZWwub3V0cHV0U3RvcmUuaW5kZXhdO1xuICAgIGNvbnN0IGNvcHlPdXRwdXQgPSB0aGlzLmdldE91dHB1dFRleHQob3V0cHV0KTtcblxuICAgIGlmIChjb3B5T3V0cHV0KSB7XG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShBbnNlci5hbnNpVG9UZXh0KGNvcHlPdXRwdXQpKTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzKFwiQ29waWVkIHRvIGNsaXBib2FyZFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoXCJOb3RoaW5nIHRvIGNvcHlcIik7XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCBrZXJuZWwgPSB0aGlzLnByb3BzLnN0b3JlLmtlcm5lbDtcblxuICAgIGlmICgha2VybmVsKSB7XG4gICAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4ub3V0cHV0QXJlYURvY2tcIikpIHtcbiAgICAgICAgcmV0dXJuIDxFbXB0eU1lc3NhZ2UgLz47XG4gICAgICB9XG5cbiAgICAgIGF0b20ud29ya3NwYWNlLmhpZGUoT1VUUFVUX0FSRUFfVVJJKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPFByb3ZpZGVyIHNyYz17bWF0aEpheFBhdGh9PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNpZGViYXIgb3V0cHV0LWFyZWFcIj5cbiAgICAgICAgICB7a2VybmVsLm91dHB1dFN0b3JlLm91dHB1dHMubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmxvY2tcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJidG4tZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BidG4gaWNvbiBpY29uLWNsb2NrJHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93SGlzdG9yeSA/IFwiIHNlbGVjdGVkXCIgOiBcIlwiXG4gICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuc2V0SGlzdG9yeX1cbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGJ0biBpY29uIGljb24tdGhyZWUtYmFycyR7XG4gICAgICAgICAgICAgICAgICAgICF0aGlzLnNob3dIaXN0b3J5ID8gXCIgc2VsZWN0ZWRcIiA6IFwiXCJcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5zZXRTY3JvbGxMaXN0fVxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZsb2F0OiBcInJpZ2h0XCIgfX0+XG4gICAgICAgICAgICAgICAge3RoaXMuc2hvd0hpc3RvcnkgPyAoXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJ0biBpY29uIGljb24tY2xpcHB5XCJcbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5oYW5kbGVDbGlja31cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgQ29weVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGljb24gaWNvbi10cmFzaGNhblwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXtrZXJuZWwub3V0cHV0U3RvcmUuY2xlYXJ9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgQ2xlYXJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPEVtcHR5TWVzc2FnZSAvPlxuICAgICAgICAgICl9XG4gICAgICAgICAge3RoaXMuc2hvd0hpc3RvcnkgPyAoXG4gICAgICAgICAgICA8SGlzdG9yeSBzdG9yZT17a2VybmVsLm91dHB1dFN0b3JlfSAvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8U2Nyb2xsTGlzdCBvdXRwdXRzPXtrZXJuZWwub3V0cHV0U3RvcmUub3V0cHV0c30gLz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvUHJvdmlkZXI+XG4gICAgKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPdXRwdXRBcmVhO1xuIl19