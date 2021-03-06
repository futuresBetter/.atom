Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _mobxReact = require("mobx-react");

var _watch = require("./watch");

var _watch2 = _interopRequireDefault(_watch);

var _utils = require("../../utils");

var Watches = (0, _mobxReact.observer)(function (_ref) {
  var kernel = _ref.store.kernel;

  if (!kernel) {
    if (atom.config.get("Hydrogen.outputAreaDock")) {
      return _react2["default"].createElement(_utils.EmptyMessage, null);
    }

    atom.workspace.hide(_utils.WATCHES_URI);
    return null;
  }

  return _react2["default"].createElement(
    "div",
    { className: "sidebar watch-sidebar" },
    kernel.watchesStore.watches.map(function (watch) {
      return _react2["default"].createElement(_watch2["default"], { key: watch.editor.id, store: watch });
    }),
    _react2["default"].createElement(
      "div",
      { className: "btn-group" },
      _react2["default"].createElement(
        "button",
        {
          className: "btn btn-primary icon icon-plus",
          onClick: kernel.watchesStore.addWatch
        },
        "Add watch"
      ),
      _react2["default"].createElement(
        "button",
        {
          className: "btn btn-error icon icon-trashcan",
          onClick: kernel.watchesStore.removeWatch
        },
        "Remove watch"
      )
    )
  );
});

exports["default"] = Watches;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3dhdGNoLXNpZGViYXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O29CQUVvQyxNQUFNOztxQkFDeEIsT0FBTzs7Ozt5QkFDQSxZQUFZOztxQkFFbkIsU0FBUzs7OztxQkFDZSxhQUFhOztBQUt2RCxJQUFNLE9BQU8sR0FBRyx5QkFBUyxVQUFDLElBQXFCLEVBQXVCO01BQWpDLE1BQU0sR0FBakIsSUFBcUIsQ0FBbkIsS0FBSyxDQUFJLE1BQU07O0FBQ3pDLE1BQUksQ0FBQyxNQUFNLEVBQUU7QUFDWCxRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLHlCQUF5QixDQUFDLEVBQUU7QUFDOUMsYUFBTywyREFBZ0IsQ0FBQztLQUN6Qjs7QUFFRCxRQUFJLENBQUMsU0FBUyxDQUFDLElBQUksb0JBQWEsQ0FBQztBQUNqQyxXQUFPLElBQUksQ0FBQztHQUNiOztBQUVELFNBQ0U7O01BQUssU0FBUyxFQUFDLHVCQUF1QjtJQUNuQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQyxLQUFLO2FBQ3JDLHVEQUFPLEdBQUcsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQUFBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRztLQUM5QyxDQUFDO0lBQ0Y7O1FBQUssU0FBUyxFQUFDLFdBQVc7TUFDeEI7OztBQUNFLG1CQUFTLEVBQUMsZ0NBQWdDO0FBQzFDLGlCQUFPLEVBQUUsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLEFBQUM7OztPQUcvQjtNQUNUOzs7QUFDRSxtQkFBUyxFQUFDLGtDQUFrQztBQUM1QyxpQkFBTyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsV0FBVyxBQUFDOzs7T0FHbEM7S0FDTDtHQUNGLENBQ047Q0FDSCxDQUFDLENBQUM7O3FCQUVZLE9BQU8iLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMvd2F0Y2gtc2lkZWJhci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuXG5pbXBvcnQgV2F0Y2ggZnJvbSBcIi4vd2F0Y2hcIjtcbmltcG9ydCB7IFdBVENIRVNfVVJJLCBFbXB0eU1lc3NhZ2UgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLy4uLy4uL2tlcm5lbFwiO1xuaW1wb3J0IHR5cGVvZiBzdG9yZSBmcm9tIFwiLi4vLi4vc3RvcmVcIjtcblxuY29uc3QgV2F0Y2hlcyA9IG9ic2VydmVyKCh7IHN0b3JlOiB7IGtlcm5lbCB9IH06IHsgc3RvcmU6IHN0b3JlIH0pID0+IHtcbiAgaWYgKCFrZXJuZWwpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KFwiSHlkcm9nZW4ub3V0cHV0QXJlYURvY2tcIikpIHtcbiAgICAgIHJldHVybiA8RW1wdHlNZXNzYWdlIC8+O1xuICAgIH1cblxuICAgIGF0b20ud29ya3NwYWNlLmhpZGUoV0FUQ0hFU19VUkkpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInNpZGViYXIgd2F0Y2gtc2lkZWJhclwiPlxuICAgICAge2tlcm5lbC53YXRjaGVzU3RvcmUud2F0Y2hlcy5tYXAoKHdhdGNoKSA9PiAoXG4gICAgICAgIDxXYXRjaCBrZXk9e3dhdGNoLmVkaXRvci5pZH0gc3RvcmU9e3dhdGNofSAvPlxuICAgICAgKSl9XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImJ0bi1ncm91cFwiPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1wcmltYXJ5IGljb24gaWNvbi1wbHVzXCJcbiAgICAgICAgICBvbkNsaWNrPXtrZXJuZWwud2F0Y2hlc1N0b3JlLmFkZFdhdGNofVxuICAgICAgICA+XG4gICAgICAgICAgQWRkIHdhdGNoXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgY2xhc3NOYW1lPVwiYnRuIGJ0bi1lcnJvciBpY29uIGljb24tdHJhc2hjYW5cIlxuICAgICAgICAgIG9uQ2xpY2s9e2tlcm5lbC53YXRjaGVzU3RvcmUucmVtb3ZlV2F0Y2h9XG4gICAgICAgID5cbiAgICAgICAgICBSZW1vdmUgd2F0Y2hcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBXYXRjaGVzO1xuIl19