Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _atom = require("atom");

var _statusBarComponent = require("./status-bar-component");

var _statusBarComponent2 = _interopRequireDefault(_statusBarComponent);

var _signalListView = require("./signal-list-view");

var _signalListView2 = _interopRequireDefault(_signalListView);

var _utils = require("../../../utils");

var StatusBarConsumer = (function () {
  function StatusBarConsumer() {
    _classCallCheck(this, StatusBarConsumer);
  }

  _createClass(StatusBarConsumer, [{
    key: "addStatusBar",
    value: function addStatusBar(store, statusBar, handleKernelCommand) {
      var _this = this;

      var statusBarElement = document.createElement("div");
      statusBarElement.classList.add("inline-block", "hydrogen");

      var statusBarTile = statusBar.addLeftTile({
        item: statusBarElement,
        priority: 100
      });

      var onClick = function onClick(store) {
        _this.showKernelCommands(store, handleKernelCommand);
      };

      (0, _utils.reactFactory)(_react2["default"].createElement(_statusBarComponent2["default"], { store: store, onClick: onClick }), statusBarElement);

      var disposable = new _atom.Disposable(function () {
        return statusBarTile.destroy();
      });
      store.subscriptions.add(disposable);
      return disposable;
    }
  }, {
    key: "showKernelCommands",
    value: function showKernelCommands(store, handleKernelCommand) {
      var signalListView = this.signalListView;
      if (!signalListView) {
        signalListView = new _signalListView2["default"](store, handleKernelCommand);
        this.signalListView = signalListView;
      } else {
        signalListView.store = store;
      }
      signalListView.toggle();
    }
  }]);

  return StatusBarConsumer;
})();

exports.StatusBarConsumer = StatusBarConsumer;

var statusBarConsumer = new StatusBarConsumer();
exports["default"] = statusBarConsumer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zZXJ2aWNlcy9jb25zdW1lZC9zdGF0dXMtYmFyL3N0YXR1cy1iYXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztxQkFFa0IsT0FBTzs7OztvQkFDRSxNQUFNOztrQ0FFWCx3QkFBd0I7Ozs7OEJBQ25CLG9CQUFvQjs7OztxQkFFbEIsZ0JBQWdCOztJQU1oQyxpQkFBaUI7V0FBakIsaUJBQWlCOzBCQUFqQixpQkFBaUI7OztlQUFqQixpQkFBaUI7O1dBR2hCLHNCQUNWLEtBQVksRUFDWixTQUF5QixFQUN6QixtQkFBNkIsRUFDN0I7OztBQUNBLFVBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2RCxzQkFBZ0IsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFM0QsVUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQztBQUMxQyxZQUFJLEVBQUUsZ0JBQWdCO0FBQ3RCLGdCQUFRLEVBQUUsR0FBRztPQUNkLENBQUMsQ0FBQzs7QUFFSCxVQUFNLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxLQUFLLEVBQVk7QUFDaEMsY0FBSyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztPQUNyRCxDQUFDOztBQUVGLCtCQUNFLG9FQUFXLEtBQUssRUFBRSxLQUFLLEFBQUMsRUFBQyxPQUFPLEVBQUUsT0FBTyxBQUFDLEdBQUcsRUFDN0MsZ0JBQWdCLENBQ2pCLENBQUM7O0FBRUYsVUFBTSxVQUFVLEdBQUcscUJBQWU7ZUFBTSxhQUFhLENBQUMsT0FBTyxFQUFFO09BQUEsQ0FBQyxDQUFDO0FBQ2pFLFdBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3BDLGFBQU8sVUFBVSxDQUFDO0tBQ25COzs7V0FFaUIsNEJBQUMsS0FBWSxFQUFFLG1CQUE2QixFQUFFO0FBQzlELFVBQUksY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7QUFDekMsVUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixzQkFBYyxHQUFHLGdDQUFtQixLQUFLLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUNoRSxZQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztPQUN0QyxNQUFNO0FBQ0wsc0JBQWMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO09BQzlCO0FBQ0Qsb0JBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUN6Qjs7O1NBdkNVLGlCQUFpQjs7Ozs7QUEwQzlCLElBQU0saUJBQWlCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO3FCQUNuQyxpQkFBaUIiLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3NlcnZpY2VzL2NvbnN1bWVkL3N0YXR1cy1iYXIvc3RhdHVzLWJhci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IERpc3Bvc2FibGUgfSBmcm9tIFwiYXRvbVwiO1xuXG5pbXBvcnQgU3RhdHVzQmFyIGZyb20gXCIuL3N0YXR1cy1iYXItY29tcG9uZW50XCI7XG5pbXBvcnQgU2lnbmFsTGlzdFZpZXcgZnJvbSBcIi4vc2lnbmFsLWxpc3Qtdmlld1wiO1xuXG5pbXBvcnQgeyByZWFjdEZhY3RvcnkgfSBmcm9tIFwiLi4vLi4vLi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgeyBTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZVwiO1xuaW1wb3J0IHR5cGUgS2VybmVsIGZyb20gXCIuLi8uLi8uLi9rZXJuZWxcIjtcbmltcG9ydCB0eXBlIE1hcmtlclN0b3JlIGZyb20gXCIuLi8uLi8uLi9zdG9yZS9tYXJrZXJzXCI7XG5cbmV4cG9ydCBjbGFzcyBTdGF0dXNCYXJDb25zdW1lciB7XG4gIHNpZ25hbExpc3RWaWV3OiBTaWduYWxMaXN0VmlldztcblxuICBhZGRTdGF0dXNCYXIoXG4gICAgc3RvcmU6IFN0b3JlLFxuICAgIHN0YXR1c0JhcjogYXRvbSRTdGF0dXNCYXIsXG4gICAgaGFuZGxlS2VybmVsQ29tbWFuZDogRnVuY3Rpb25cbiAgKSB7XG4gICAgY29uc3Qgc3RhdHVzQmFyRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgc3RhdHVzQmFyRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaW5saW5lLWJsb2NrXCIsIFwiaHlkcm9nZW5cIik7XG5cbiAgICBjb25zdCBzdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtcbiAgICAgIGl0ZW06IHN0YXR1c0JhckVsZW1lbnQsXG4gICAgICBwcmlvcml0eTogMTAwLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25DbGljayA9IChzdG9yZTogU3RvcmUpID0+IHtcbiAgICAgIHRoaXMuc2hvd0tlcm5lbENvbW1hbmRzKHN0b3JlLCBoYW5kbGVLZXJuZWxDb21tYW5kKTtcbiAgICB9O1xuXG4gICAgcmVhY3RGYWN0b3J5KFxuICAgICAgPFN0YXR1c0JhciBzdG9yZT17c3RvcmV9IG9uQ2xpY2s9e29uQ2xpY2t9IC8+LFxuICAgICAgc3RhdHVzQmFyRWxlbWVudFxuICAgICk7XG5cbiAgICBjb25zdCBkaXNwb3NhYmxlID0gbmV3IERpc3Bvc2FibGUoKCkgPT4gc3RhdHVzQmFyVGlsZS5kZXN0cm95KCkpO1xuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKGRpc3Bvc2FibGUpO1xuICAgIHJldHVybiBkaXNwb3NhYmxlO1xuICB9XG5cbiAgc2hvd0tlcm5lbENvbW1hbmRzKHN0b3JlOiBTdG9yZSwgaGFuZGxlS2VybmVsQ29tbWFuZDogRnVuY3Rpb24pIHtcbiAgICBsZXQgc2lnbmFsTGlzdFZpZXcgPSB0aGlzLnNpZ25hbExpc3RWaWV3O1xuICAgIGlmICghc2lnbmFsTGlzdFZpZXcpIHtcbiAgICAgIHNpZ25hbExpc3RWaWV3ID0gbmV3IFNpZ25hbExpc3RWaWV3KHN0b3JlLCBoYW5kbGVLZXJuZWxDb21tYW5kKTtcbiAgICAgIHRoaXMuc2lnbmFsTGlzdFZpZXcgPSBzaWduYWxMaXN0VmlldztcbiAgICB9IGVsc2Uge1xuICAgICAgc2lnbmFsTGlzdFZpZXcuc3RvcmUgPSBzdG9yZTtcbiAgICB9XG4gICAgc2lnbmFsTGlzdFZpZXcudG9nZ2xlKCk7XG4gIH1cbn1cblxuY29uc3Qgc3RhdHVzQmFyQ29uc3VtZXIgPSBuZXcgU3RhdHVzQmFyQ29uc3VtZXIoKTtcbmV4cG9ydCBkZWZhdWx0IHN0YXR1c0JhckNvbnN1bWVyO1xuIl19