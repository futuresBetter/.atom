Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atom = require("atom");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _utils = require("./../utils");

var _componentsOutputArea = require("./../components/output-area");

var _componentsOutputArea2 = _interopRequireDefault(_componentsOutputArea);

var OutputPane = (function () {
  function OutputPane(store) {
    _classCallCheck(this, OutputPane);

    this.element = document.createElement("div");
    this.disposer = new _atom.CompositeDisposable();

    this.getTitle = function () {
      return "Hydrogen Output Area";
    };

    this.getURI = function () {
      return _utils.OUTPUT_AREA_URI;
    };

    this.getDefaultLocation = function () {
      return "right";
    };

    this.getAllowedLocations = function () {
      return ["left", "right", "bottom"];
    };

    this.element.classList.add("hydrogen");

    this.disposer.add(new _atom.Disposable(function () {
      if (store.kernel) store.kernel.outputStore.clear();
    }));

    (0, _utils.reactFactory)(_react2["default"].createElement(_componentsOutputArea2["default"], { store: store }), this.element, null, this.disposer);
  }

  _createClass(OutputPane, [{
    key: "destroy",
    value: function destroy() {
      this.disposer.dispose();

      // When a user manually clicks the close icon, the pane holding the OutputArea
      // is destroyed along with the OutputArea item. We mimic this here so that we can call
      //  outputArea.destroy() and fully clean up the OutputArea without user clicking
      var pane = atom.workspace.paneForURI(_utils.OUTPUT_AREA_URI);
      if (!pane) return;
      pane.destroyItem(this);
    }
  }]);

  return OutputPane;
})();

exports["default"] = OutputPane;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9wYW5lcy9vdXRwdXQtYXJlYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O29CQUVnRCxNQUFNOztxQkFFcEMsT0FBTzs7OztxQkFFcUIsWUFBWTs7b0NBRW5DLDZCQUE2Qjs7OztJQUUvQixVQUFVO0FBSWxCLFdBSlEsVUFBVSxDQUlqQixLQUFZLEVBQUU7MEJBSlAsVUFBVTs7U0FDN0IsT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDO1NBQ3ZDLFFBQVEsR0FBRywrQkFBeUI7O1NBbUJwQyxRQUFRLEdBQUc7YUFBTSxzQkFBc0I7S0FBQTs7U0FFdkMsTUFBTSxHQUFHOztLQUFxQjs7U0FFOUIsa0JBQWtCLEdBQUc7YUFBTSxPQUFPO0tBQUE7O1NBRWxDLG1CQUFtQixHQUFHO2FBQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQztLQUFBOztBQXRCckQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUV2QyxRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FDZixxQkFBZSxZQUFNO0FBQ25CLFVBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNwRCxDQUFDLENBQ0gsQ0FBQzs7QUFFRiw2QkFDRSxzRUFBWSxLQUFLLEVBQUUsS0FBSyxBQUFDLEdBQUcsRUFDNUIsSUFBSSxDQUFDLE9BQU8sRUFDWixJQUFJLEVBQ0osSUFBSSxDQUFDLFFBQVEsQ0FDZCxDQUFDO0dBQ0g7O2VBbkJrQixVQUFVOztXQTZCdEIsbUJBQUc7QUFDUixVQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDOzs7OztBQUt4QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsd0JBQWlCLENBQUM7QUFDeEQsVUFBSSxDQUFDLElBQUksRUFBRSxPQUFPO0FBQ2xCLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEI7OztTQXRDa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3BhbmVzL291dHB1dC1hcmVhLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSB9IGZyb20gXCJhdG9tXCI7XG5cbmltcG9ydCBSZWFjdCBmcm9tIFwicmVhY3RcIjtcblxuaW1wb3J0IHsgcmVhY3RGYWN0b3J5LCBPVVRQVVRfQVJFQV9VUkkgfSBmcm9tIFwiLi8uLi91dGlsc1wiO1xuaW1wb3J0IHR5cGVvZiBzdG9yZSBmcm9tIFwiLi4vc3RvcmVcIjtcbmltcG9ydCBPdXRwdXRBcmVhIGZyb20gXCIuLy4uL2NvbXBvbmVudHMvb3V0cHV0LWFyZWFcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3V0cHV0UGFuZSB7XG4gIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICBkaXNwb3NlciA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgY29uc3RydWN0b3Ioc3RvcmU6IHN0b3JlKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJoeWRyb2dlblwiKTtcblxuICAgIHRoaXMuZGlzcG9zZXIuYWRkKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAoc3RvcmUua2VybmVsKSBzdG9yZS5rZXJuZWwub3V0cHV0U3RvcmUuY2xlYXIoKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHJlYWN0RmFjdG9yeShcbiAgICAgIDxPdXRwdXRBcmVhIHN0b3JlPXtzdG9yZX0gLz4sXG4gICAgICB0aGlzLmVsZW1lbnQsXG4gICAgICBudWxsLFxuICAgICAgdGhpcy5kaXNwb3NlclxuICAgICk7XG4gIH1cblxuICBnZXRUaXRsZSA9ICgpID0+IFwiSHlkcm9nZW4gT3V0cHV0IEFyZWFcIjtcblxuICBnZXRVUkkgPSAoKSA9PiBPVVRQVVRfQVJFQV9VUkk7XG5cbiAgZ2V0RGVmYXVsdExvY2F0aW9uID0gKCkgPT4gXCJyaWdodFwiO1xuXG4gIGdldEFsbG93ZWRMb2NhdGlvbnMgPSAoKSA9PiBbXCJsZWZ0XCIsIFwicmlnaHRcIiwgXCJib3R0b21cIl07XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmRpc3Bvc2VyLmRpc3Bvc2UoKTtcblxuICAgIC8vIFdoZW4gYSB1c2VyIG1hbnVhbGx5IGNsaWNrcyB0aGUgY2xvc2UgaWNvbiwgdGhlIHBhbmUgaG9sZGluZyB0aGUgT3V0cHV0QXJlYVxuICAgIC8vIGlzIGRlc3Ryb3llZCBhbG9uZyB3aXRoIHRoZSBPdXRwdXRBcmVhIGl0ZW0uIFdlIG1pbWljIHRoaXMgaGVyZSBzbyB0aGF0IHdlIGNhbiBjYWxsXG4gICAgLy8gIG91dHB1dEFyZWEuZGVzdHJveSgpIGFuZCBmdWxseSBjbGVhbiB1cCB0aGUgT3V0cHV0QXJlYSB3aXRob3V0IHVzZXIgY2xpY2tpbmdcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShPVVRQVVRfQVJFQV9VUkkpO1xuICAgIGlmICghcGFuZSkgcmV0dXJuO1xuICAgIHBhbmUuZGVzdHJveUl0ZW0odGhpcyk7XG4gIH1cbn1cbiJdfQ==