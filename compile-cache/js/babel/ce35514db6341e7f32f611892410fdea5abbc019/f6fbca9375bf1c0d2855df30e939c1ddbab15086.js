Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _display = require("./display");

var _display2 = _interopRequireDefault(_display);

function RangeSlider(_ref) {
  var outputStore = _ref.outputStore;
  var storeIndex = outputStore.index;
  var setStoreIndex = outputStore.setIndex;
  var incrementIndex = outputStore.incrementIndex;
  var decrementIndex = outputStore.decrementIndex;
  var outputs = outputStore.outputs;

  var sliderRef = (0, _react.useRef)();

  (0, _react.useEffect)(function () {
    var disposer = new _atom.CompositeDisposable();

    disposer.add(
    // $FlowFixMe
    atom.commands.add(sliderRef.current, "core:move-left", function () {
      return decrementIndex();
    }),
    // $FlowFixMe
    atom.commands.add(sliderRef.current, "core:move-right", function () {
      return incrementIndex();
    }));

    return function () {
      return disposer.dispose();
    };
  }, []);

  function onIndexChange(e) {
    var newIndex = Number(e.target.value);
    setStoreIndex(newIndex);
  }

  return _react2["default"].createElement(
    "div",
    { className: "slider", ref: sliderRef },
    _react2["default"].createElement(
      "div",
      { className: "current-output" },
      _react2["default"].createElement("span", {
        className: "btn btn-xs icon icon-chevron-left",
        onClick: function (e) {
          return decrementIndex();
        }
      }),
      _react2["default"].createElement(
        "span",
        null,
        storeIndex + 1,
        "/",
        outputs.length
      ),
      _react2["default"].createElement("span", {
        className: "btn btn-xs icon icon-chevron-right",
        onClick: function (e) {
          return incrementIndex();
        }
      })
    ),
    _react2["default"].createElement("input", {
      className: "input-range",
      max: outputs.length - 1,
      min: "0",
      id: "range-input",
      onChange: onIndexChange,
      type: "range",
      value: storeIndex
    })
  );
}

var History = (0, _mobxReact.observer)(function (_ref2) {
  var store = _ref2.store;
  return (function () {
    var output = store.outputs[store.index];
    return output ? _react2["default"].createElement(
      "div",
      { className: "history" },
      _react2["default"].createElement(RangeSlider, { outputStore: store }),
      _react2["default"].createElement(
        "div",
        {
          className: "multiline-container native-key-bindings",
          tabIndex: "-1",
          style: {
            fontSize: atom.config.get("Hydrogen.outputAreaFontSize") || "inherit"
          },
          "hydrogen-wrapoutput": atom.config.get("Hydrogen.wrapOutput").toString()
        },
        _react2["default"].createElement(_display2["default"], { output: output })
      )
    ) : null;
  })();
});

exports["default"] = History;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L2hpc3RvcnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVvQyxNQUFNOztxQkFDRCxPQUFPOzs7O3lCQUN2QixZQUFZOzt1QkFDakIsV0FBVzs7OztBQUkvQixTQUFTLFdBQVcsQ0FBQyxJQUFlLEVBQUU7TUFBZixXQUFXLEdBQWIsSUFBZSxDQUFiLFdBQVc7TUFFdkIsVUFBVSxHQUtmLFdBQVcsQ0FMYixLQUFLO01BQ0ssYUFBYSxHQUlyQixXQUFXLENBSmIsUUFBUTtNQUNSLGNBQWMsR0FHWixXQUFXLENBSGIsY0FBYztNQUNkLGNBQWMsR0FFWixXQUFXLENBRmIsY0FBYztNQUNkLE9BQU8sR0FDTCxXQUFXLENBRGIsT0FBTzs7QUFHVCxNQUFNLFNBQW9DLEdBQUcsb0JBQVEsQ0FBQzs7QUFFdEQsd0JBQVUsWUFBTTtBQUNkLFFBQU0sUUFBUSxHQUFHLCtCQUF5QixDQUFDOztBQUUzQyxZQUFRLENBQUMsR0FBRzs7QUFFVixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLGdCQUFnQixFQUFFO2FBQ3JELGNBQWMsRUFBRTtLQUFBLENBQ2pCOztBQUVELFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUU7YUFDdEQsY0FBYyxFQUFFO0tBQUEsQ0FDakIsQ0FDRixDQUFDOztBQUVGLFdBQU87YUFBTSxRQUFRLENBQUMsT0FBTyxFQUFFO0tBQUEsQ0FBQztHQUNqQyxFQUFFLEVBQUUsQ0FBQyxDQUFDOztBQUVQLFdBQVMsYUFBYSxDQUFDLENBQUMsRUFBRTtBQUN4QixRQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN4QyxpQkFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQ3pCOztBQUVELFNBQ0U7O01BQUssU0FBUyxFQUFDLFFBQVEsRUFBQyxHQUFHLEVBQUUsU0FBUyxBQUFDO0lBQ3JDOztRQUFLLFNBQVMsRUFBQyxnQkFBZ0I7TUFDN0I7QUFDRSxpQkFBUyxFQUFDLG1DQUFtQztBQUM3QyxlQUFPLEVBQUUsVUFBQyxDQUFDO2lCQUFLLGNBQWMsRUFBRTtTQUFBLEFBQUM7UUFDakM7TUFDRjs7O1FBQ0csVUFBVSxHQUFHLENBQUM7O1FBQUcsT0FBTyxDQUFDLE1BQU07T0FDM0I7TUFDUDtBQUNFLGlCQUFTLEVBQUMsb0NBQW9DO0FBQzlDLGVBQU8sRUFBRSxVQUFDLENBQUM7aUJBQUssY0FBYyxFQUFFO1NBQUEsQUFBQztRQUNqQztLQUNFO0lBQ047QUFDRSxlQUFTLEVBQUMsYUFBYTtBQUN2QixTQUFHLEVBQUUsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUM7QUFDeEIsU0FBRyxFQUFDLEdBQUc7QUFDUCxRQUFFLEVBQUMsYUFBYTtBQUNoQixjQUFRLEVBQUUsYUFBYSxBQUFDO0FBQ3hCLFVBQUksRUFBQyxPQUFPO0FBQ1osV0FBSyxFQUFFLFVBQVUsQUFBQztNQUNsQjtHQUNFLENBQ047Q0FDSDs7QUFFRCxJQUFNLE9BQU8sR0FBRyx5QkFBUyxVQUFDLEtBQVM7TUFBUCxLQUFLLEdBQVAsS0FBUyxDQUFQLEtBQUs7c0JBQStCO0FBQzlELFFBQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzFDLFdBQU8sTUFBTSxHQUNYOztRQUFLLFNBQVMsRUFBQyxTQUFTO01BQ3RCLGlDQUFDLFdBQVcsSUFBQyxXQUFXLEVBQUUsS0FBSyxBQUFDLEdBQUc7TUFDbkM7OztBQUNFLG1CQUFTLEVBQUMseUNBQXlDO0FBQ25ELGtCQUFRLEVBQUMsSUFBSTtBQUNiLGVBQUssRUFBRTtBQUNMLG9CQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLCtCQUErQixJQUFJLFNBQVM7V0FDdEUsQUFBQztBQUNGLGlDQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsdUJBQXVCLENBQUMsUUFBUSxFQUFFLEFBQUM7O1FBRXZFLHlEQUFTLE1BQU0sRUFBRSxNQUFNLEFBQUMsR0FBRztPQUN2QjtLQUNGLEdBQ0osSUFBSSxDQUFDO0dBQ1Y7Q0FBQSxDQUFDLENBQUM7O3FCQUVZLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvcmVzdWx0LXZpZXcvaGlzdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xuaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBvYnNlcnZlciB9IGZyb20gXCJtb2J4LXJlYWN0XCI7XG5pbXBvcnQgRGlzcGxheSBmcm9tIFwiLi9kaXNwbGF5XCI7XG5cbmltcG9ydCB0eXBlIE91dHB1dFN0b3JlIGZyb20gXCIuLi8uLi9zdG9yZS9vdXRwdXRcIjtcblxuZnVuY3Rpb24gUmFuZ2VTbGlkZXIoeyBvdXRwdXRTdG9yZSB9KSB7XG4gIGNvbnN0IHtcbiAgICBpbmRleDogc3RvcmVJbmRleCxcbiAgICBzZXRJbmRleDogc2V0U3RvcmVJbmRleCxcbiAgICBpbmNyZW1lbnRJbmRleCxcbiAgICBkZWNyZW1lbnRJbmRleCxcbiAgICBvdXRwdXRzLFxuICB9ID0gb3V0cHV0U3RvcmU7XG5cbiAgY29uc3Qgc2xpZGVyUmVmOiB7IGN1cnJlbnQ6ID9IVE1MRWxlbWVudCB9ID0gdXNlUmVmKCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBkaXNwb3NlciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICBkaXNwb3Nlci5hZGQoXG4gICAgICAvLyAkRmxvd0ZpeE1lXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChzbGlkZXJSZWYuY3VycmVudCwgXCJjb3JlOm1vdmUtbGVmdFwiLCAoKSA9PlxuICAgICAgICBkZWNyZW1lbnRJbmRleCgpXG4gICAgICApLFxuICAgICAgLy8gJEZsb3dGaXhNZVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoc2xpZGVyUmVmLmN1cnJlbnQsIFwiY29yZTptb3ZlLXJpZ2h0XCIsICgpID0+XG4gICAgICAgIGluY3JlbWVudEluZGV4KClcbiAgICAgIClcbiAgICApO1xuXG4gICAgcmV0dXJuICgpID0+IGRpc3Bvc2VyLmRpc3Bvc2UoKTtcbiAgfSwgW10pO1xuXG4gIGZ1bmN0aW9uIG9uSW5kZXhDaGFuZ2UoZSkge1xuICAgIGNvbnN0IG5ld0luZGV4ID0gTnVtYmVyKGUudGFyZ2V0LnZhbHVlKTtcbiAgICBzZXRTdG9yZUluZGV4KG5ld0luZGV4KTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJzbGlkZXJcIiByZWY9e3NsaWRlclJlZn0+XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImN1cnJlbnQtb3V0cHV0XCI+XG4gICAgICAgIDxzcGFuXG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi14cyBpY29uIGljb24tY2hldnJvbi1sZWZ0XCJcbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gZGVjcmVtZW50SW5kZXgoKX1cbiAgICAgICAgLz5cbiAgICAgICAgPHNwYW4+XG4gICAgICAgICAge3N0b3JlSW5kZXggKyAxfS97b3V0cHV0cy5sZW5ndGh9XG4gICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPHNwYW5cbiAgICAgICAgICBjbGFzc05hbWU9XCJidG4gYnRuLXhzIGljb24gaWNvbi1jaGV2cm9uLXJpZ2h0XCJcbiAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gaW5jcmVtZW50SW5kZXgoKX1cbiAgICAgICAgLz5cbiAgICAgIDwvZGl2PlxuICAgICAgPGlucHV0XG4gICAgICAgIGNsYXNzTmFtZT1cImlucHV0LXJhbmdlXCJcbiAgICAgICAgbWF4PXtvdXRwdXRzLmxlbmd0aCAtIDF9XG4gICAgICAgIG1pbj1cIjBcIlxuICAgICAgICBpZD1cInJhbmdlLWlucHV0XCJcbiAgICAgICAgb25DaGFuZ2U9e29uSW5kZXhDaGFuZ2V9XG4gICAgICAgIHR5cGU9XCJyYW5nZVwiXG4gICAgICAgIHZhbHVlPXtzdG9yZUluZGV4fVxuICAgICAgLz5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuY29uc3QgSGlzdG9yeSA9IG9ic2VydmVyKCh7IHN0b3JlIH06IHsgc3RvcmU6IE91dHB1dFN0b3JlIH0pID0+IHtcbiAgY29uc3Qgb3V0cHV0ID0gc3RvcmUub3V0cHV0c1tzdG9yZS5pbmRleF07XG4gIHJldHVybiBvdXRwdXQgPyAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJoaXN0b3J5XCI+XG4gICAgICA8UmFuZ2VTbGlkZXIgb3V0cHV0U3RvcmU9e3N0b3JlfSAvPlxuICAgICAgPGRpdlxuICAgICAgICBjbGFzc05hbWU9XCJtdWx0aWxpbmUtY29udGFpbmVyIG5hdGl2ZS1rZXktYmluZGluZ3NcIlxuICAgICAgICB0YWJJbmRleD1cIi0xXCJcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBmb250U2l6ZTogYXRvbS5jb25maWcuZ2V0KGBIeWRyb2dlbi5vdXRwdXRBcmVhRm9udFNpemVgKSB8fCBcImluaGVyaXRcIixcbiAgICAgICAgfX1cbiAgICAgICAgaHlkcm9nZW4td3JhcG91dHB1dD17YXRvbS5jb25maWcuZ2V0KGBIeWRyb2dlbi53cmFwT3V0cHV0YCkudG9TdHJpbmcoKX1cbiAgICAgID5cbiAgICAgICAgPERpc3BsYXkgb3V0cHV0PXtvdXRwdXR9IC8+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKSA6IG51bGw7XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgSGlzdG9yeTtcbiJdfQ==