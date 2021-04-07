Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("./utils");

var KernelPicker = (function () {
  function KernelPicker(kernelSpecs) {
    var _this = this;

    _classCallCheck(this, KernelPicker);

    this.kernelSpecs = kernelSpecs;
    this.onConfirmed = null;

    this.selectListView = new _atomSelectList2["default"]({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.display_name;
      },
      elementForItem: function elementForItem(item) {
        var element = document.createElement("li");
        element.textContent = item.display_name;
        return element;
      },
      didConfirmSelection: function didConfirmSelection(item) {
        (0, _utils.log)("Selected kernel:", item);
        if (_this.onConfirmed) _this.onConfirmed(item);
        _this.cancel();
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      },
      emptyMessage: "No kernels found"
    });
  }

  _createClass(KernelPicker, [{
    key: "destroy",
    value: function destroy() {
      this.cancel();
      return this.selectListView.destroy();
    }
  }, {
    key: "cancel",
    value: function cancel() {
      if (this.panel != null) {
        this.panel.destroy();
      }
      this.panel = null;
      if (this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }
    }
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      if (this.panel == null) this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      this.selectListView.focus();
      this.selectListView.reset();
    }
  }, {
    key: "toggle",
    value: _asyncToGenerator(function* () {
      if (this.panel != null) {
        this.cancel();
      } else {
        yield this.selectListView.update({ items: this.kernelSpecs });
        this.attach();
      }
    })
  }]);

  return KernelPicker;
})();

exports["default"] = KernelPicker;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtcGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3NCQUMvQixRQUFROzs7O3FCQUVGLFNBQVM7O0lBRVIsWUFBWTtBQU1wQixXQU5RLFlBQVksQ0FNbkIsV0FBOEIsRUFBRTs7OzBCQU56QixZQUFZOztBQU83QixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztBQUMvQixRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQzs7QUFFeEIsUUFBSSxDQUFDLGNBQWMsR0FBRyxnQ0FBbUI7QUFDdkMsb0JBQWMsRUFBRSxDQUFDLGFBQWEsQ0FBQztBQUMvQixXQUFLLEVBQUUsRUFBRTtBQUNULHNCQUFnQixFQUFFLDBCQUFDLElBQUk7ZUFBSyxJQUFJLENBQUMsWUFBWTtPQUFBO0FBQzdDLG9CQUFjLEVBQUUsd0JBQUMsSUFBSSxFQUFLO0FBQ3hCLFlBQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsZUFBTyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0FBQ3hDLGVBQU8sT0FBTyxDQUFDO09BQ2hCO0FBQ0QseUJBQW1CLEVBQUUsNkJBQUMsSUFBSSxFQUFLO0FBQzdCLHdCQUFJLGtCQUFrQixFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzlCLFlBQUksTUFBSyxXQUFXLEVBQUUsTUFBSyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsY0FBSyxNQUFNLEVBQUUsQ0FBQztPQUNmO0FBQ0Qsd0JBQWtCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0FBQ3ZDLGtCQUFZLEVBQUUsa0JBQWtCO0tBQ2pDLENBQUMsQ0FBQztHQUNKOztlQTNCa0IsWUFBWTs7V0E2QnhCLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ2QsYUFBTyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3RDOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ2pDLFlBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN0QyxZQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO09BQ3RDO0tBQ0Y7OztXQUVLLGtCQUFHO0FBQ1AsVUFBSSxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUM7QUFDdkQsVUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztBQUMzRSxVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQzVCLFVBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDN0I7Ozs2QkFFVyxhQUFHO0FBQ2IsVUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRTtBQUN0QixZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZixNQUFNO0FBQ0wsY0FBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztBQUM5RCxZQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7T0FDZjtLQUNGOzs7U0E1RGtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtcGlja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gXCJhdG9tLXNlbGVjdC1saXN0XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5cbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEtlcm5lbFBpY2tlciB7XG4gIGtlcm5lbFNwZWNzOiBBcnJheTxLZXJuZWxzcGVjPjtcbiAgb25Db25maXJtZWQ6ID8oa2VybmVsU3BlY3M6IEtlcm5lbHNwZWMpID0+IHZvaWQ7XG4gIHNlbGVjdExpc3RWaWV3OiBTZWxlY3RMaXN0VmlldztcbiAgcGFuZWw6ID9hdG9tJFBhbmVsO1xuICBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcbiAgY29uc3RydWN0b3Ioa2VybmVsU3BlY3M6IEFycmF5PEtlcm5lbHNwZWM+KSB7XG4gICAgdGhpcy5rZXJuZWxTcGVjcyA9IGtlcm5lbFNwZWNzO1xuICAgIHRoaXMub25Db25maXJtZWQgPSBudWxsO1xuXG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiAoaXRlbSkgPT4gaXRlbS5kaXNwbGF5X25hbWUsXG4gICAgICBlbGVtZW50Rm9ySXRlbTogKGl0ZW0pID0+IHtcbiAgICAgICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgZWxlbWVudC50ZXh0Q29udGVudCA9IGl0ZW0uZGlzcGxheV9uYW1lO1xuICAgICAgICByZXR1cm4gZWxlbWVudDtcbiAgICAgIH0sXG4gICAgICBkaWRDb25maXJtU2VsZWN0aW9uOiAoaXRlbSkgPT4ge1xuICAgICAgICBsb2coXCJTZWxlY3RlZCBrZXJuZWw6XCIsIGl0ZW0pO1xuICAgICAgICBpZiAodGhpcy5vbkNvbmZpcm1lZCkgdGhpcy5vbkNvbmZpcm1lZChpdGVtKTtcbiAgICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICAgIH0sXG4gICAgICBkaWRDYW5jZWxTZWxlY3Rpb246ICgpID0+IHRoaXMuY2FuY2VsKCksXG4gICAgICBlbXB0eU1lc3NhZ2U6IFwiTm8ga2VybmVscyBmb3VuZFwiLFxuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNhbmNlbCgpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdExpc3RWaWV3LmRlc3Ryb3koKTtcbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG4gICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgaWYgKHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50KSB7XG4gICAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudC5mb2N1cygpO1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgaWYgKHRoaXMucGFuZWwgPT0gbnVsbClcbiAgICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcy5zZWxlY3RMaXN0VmlldyB9KTtcbiAgICB0aGlzLnNlbGVjdExpc3RWaWV3LmZvY3VzKCk7XG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5yZXNldCgpO1xuICB9XG5cbiAgYXN5bmMgdG9nZ2xlKCkge1xuICAgIGlmICh0aGlzLnBhbmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMuY2FuY2VsKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHsgaXRlbXM6IHRoaXMua2VybmVsU3BlY3MgfSk7XG4gICAgICB0aGlzLmF0dGFjaCgpO1xuICAgIH1cbiAgfVxufVxuIl19