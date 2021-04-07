Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atomSelectList = require("atom-select-list");

var _atomSelectList2 = _interopRequireDefault(_atomSelectList);

var _wsKernel = require("../../../ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _utils = require("../../../utils");

var basicCommands = [{ name: "Interrupt", value: "interrupt-kernel" }, { name: "Restart", value: "restart-kernel" }, { name: "Shut Down", value: "shutdown-kernel" }];

var wsKernelCommands = [{ name: "Rename session for", value: "rename-kernel" }, { name: "Disconnect from", value: "disconnect-kernel" }];

var SignalListView = (function () {
  function SignalListView(store, handleKernelCommand) {
    var _this = this;

    _classCallCheck(this, SignalListView);

    this.store = store;
    this.handleKernelCommand = handleKernelCommand;
    this.selectListView = new _atomSelectList2["default"]({
      itemsClassList: ["mark-active"],
      items: [],
      filterKeyForItem: function filterKeyForItem(item) {
        return item.name;
      },
      elementForItem: function elementForItem(item) {
        var element = document.createElement("li");
        element.textContent = item.name;
        return element;
      },
      didConfirmSelection: function didConfirmSelection(item) {
        (0, _utils.log)("Selected command:", item);
        _this.onConfirmed(item);
        _this.cancel();
      },
      didCancelSelection: function didCancelSelection() {
        return _this.cancel();
      },
      emptyMessage: "No running kernels for this file type."
    });
  }

  _createClass(SignalListView, [{
    key: "onConfirmed",
    value: function onConfirmed(kernelCommand) {
      if (this.handleKernelCommand) {
        this.handleKernelCommand(kernelCommand, this.store);
      }
    }
  }, {
    key: "toggle",
    value: _asyncToGenerator(function* () {
      if (this.panel != null) {
        this.cancel();
      }
      if (!this.store) return;
      var kernel = this.store.kernel;
      if (!kernel) return;
      var commands = kernel.transport instanceof _wsKernel2["default"] ? [].concat(basicCommands, wsKernelCommands) : basicCommands;

      var listItems = commands.map(function (command) {
        return {
          name: command.name + " " + kernel.kernelSpec.display_name + " kernel",
          command: command.value
        };
      });

      yield this.selectListView.update({ items: listItems });
      this.attach();
    })
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      if (this.panel == null) this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      this.selectListView.focus();
      this.selectListView.reset();
    }
  }, {
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
  }]);

  return SignalListView;
})();

exports["default"] = SignalListView;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zZXJ2aWNlcy9jb25zdW1lZC9zdGF0dXMtYmFyL3NpZ25hbC1saXN0LXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OzhCQUUyQixrQkFBa0I7Ozs7d0JBRXhCLG9CQUFvQjs7OztxQkFDckIsZ0JBQWdCOztBQUdwQyxJQUFNLGFBQWEsR0FBRyxDQUNwQixFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLGtCQUFrQixFQUFFLEVBQ2hELEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsZ0JBQWdCLEVBQUUsRUFDNUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxDQUNoRCxDQUFDOztBQUVGLElBQU0sZ0JBQWdCLEdBQUcsQ0FDdkIsRUFBRSxJQUFJLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxFQUN0RCxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsbUJBQW1CLEVBQUUsQ0FDeEQsQ0FBQzs7SUFFbUIsY0FBYztBQU90QixXQVBRLGNBQWMsQ0FPckIsS0FBWSxFQUFFLG1CQUE2QixFQUFFOzs7MEJBUHRDLGNBQWM7O0FBUS9CLFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxtQkFBbUIsQ0FBQztBQUMvQyxRQUFJLENBQUMsY0FBYyxHQUFHLGdDQUFtQjtBQUN2QyxvQkFBYyxFQUFFLENBQUMsYUFBYSxDQUFDO0FBQy9CLFdBQUssRUFBRSxFQUFFO0FBQ1Qsc0JBQWdCLEVBQUUsMEJBQUMsSUFBSTtlQUFLLElBQUksQ0FBQyxJQUFJO09BQUE7QUFDckMsb0JBQWMsRUFBRSx3QkFBQyxJQUFJLEVBQUs7QUFDeEIsWUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxlQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDaEMsZUFBTyxPQUFPLENBQUM7T0FDaEI7QUFDRCx5QkFBbUIsRUFBRSw2QkFBQyxJQUFJLEVBQUs7QUFDN0Isd0JBQUksbUJBQW1CLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDL0IsY0FBSyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsY0FBSyxNQUFNLEVBQUUsQ0FBQztPQUNmO0FBQ0Qsd0JBQWtCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0FBQ3ZDLGtCQUFZLEVBQUUsd0NBQXdDO0tBQ3ZELENBQUMsQ0FBQztHQUNKOztlQTNCa0IsY0FBYzs7V0E2QnRCLHFCQUFDLGFBQWtDLEVBQUU7QUFDOUMsVUFBSSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7QUFDNUIsWUFBSSxDQUFDLG1CQUFtQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7T0FDckQ7S0FDRjs7OzZCQUVXLGFBQUc7QUFDYixVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUNmO0FBQ0QsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTztBQUN4QixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNqQyxVQUFJLENBQUMsTUFBTSxFQUFFLE9BQU87QUFDcEIsVUFBTSxRQUFRLEdBQ1osTUFBTSxDQUFDLFNBQVMsaUNBQW9CLGFBQzVCLGFBQWEsRUFBSyxnQkFBZ0IsSUFDdEMsYUFBYSxDQUFDOztBQUVwQixVQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUMsT0FBTztlQUFNO0FBQzNDLGNBQUksRUFBSyxPQUFPLENBQUMsSUFBSSxTQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsWUFBWSxZQUFTO0FBQ2hFLGlCQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUs7U0FDdkI7T0FBQyxDQUFDLENBQUM7O0FBRUosWUFBTSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZELFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztLQUNmOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDO0FBQ3ZELFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUM7QUFDM0UsVUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM1QixVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzdCOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNkLGFBQU8sSUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN0Qzs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ3RCLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7QUFDRCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLElBQUksQ0FBQyx3QkFBd0IsRUFBRTtBQUNqQyxZQUFJLENBQUMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEMsWUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQztPQUN0QztLQUNGOzs7U0E5RWtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zZXJ2aWNlcy9jb25zdW1lZC9zdGF0dXMtYmFyL3NpZ25hbC1saXN0LXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgU2VsZWN0TGlzdFZpZXcgZnJvbSBcImF0b20tc2VsZWN0LWxpc3RcIjtcblxuaW1wb3J0IFdTS2VybmVsIGZyb20gXCIuLi8uLi8uLi93cy1rZXJuZWxcIjtcbmltcG9ydCB7IGxvZyB9IGZyb20gXCIuLi8uLi8uLi91dGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBTdG9yZSB9IGZyb20gXCIuLi8uLi8uLi9zdG9yZVwiO1xuXG5jb25zdCBiYXNpY0NvbW1hbmRzID0gW1xuICB7IG5hbWU6IFwiSW50ZXJydXB0XCIsIHZhbHVlOiBcImludGVycnVwdC1rZXJuZWxcIiB9LFxuICB7IG5hbWU6IFwiUmVzdGFydFwiLCB2YWx1ZTogXCJyZXN0YXJ0LWtlcm5lbFwiIH0sXG4gIHsgbmFtZTogXCJTaHV0IERvd25cIiwgdmFsdWU6IFwic2h1dGRvd24ta2VybmVsXCIgfSxcbl07XG5cbmNvbnN0IHdzS2VybmVsQ29tbWFuZHMgPSBbXG4gIHsgbmFtZTogXCJSZW5hbWUgc2Vzc2lvbiBmb3JcIiwgdmFsdWU6IFwicmVuYW1lLWtlcm5lbFwiIH0sXG4gIHsgbmFtZTogXCJEaXNjb25uZWN0IGZyb21cIiwgdmFsdWU6IFwiZGlzY29ubmVjdC1rZXJuZWxcIiB9LFxuXTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2lnbmFsTGlzdFZpZXcge1xuICBwYW5lbDogP2F0b20kUGFuZWw7XG4gIHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDogP0hUTUxFbGVtZW50O1xuICBzZWxlY3RMaXN0VmlldzogU2VsZWN0TGlzdFZpZXc7XG4gIHN0b3JlOiA/U3RvcmU7XG4gIGhhbmRsZUtlcm5lbENvbW1hbmQ6ID9GdW5jdGlvbjtcblxuICBjb25zdHJ1Y3RvcihzdG9yZTogU3RvcmUsIGhhbmRsZUtlcm5lbENvbW1hbmQ6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5zdG9yZSA9IHN0b3JlO1xuICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZCA9IGhhbmRsZUtlcm5lbENvbW1hbmQ7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiAoaXRlbSkgPT4gaXRlbS5uYW1lLFxuICAgICAgZWxlbWVudEZvckl0ZW06IChpdGVtKSA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBpdGVtLm5hbWU7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfSxcbiAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IChpdGVtKSA9PiB7XG4gICAgICAgIGxvZyhcIlNlbGVjdGVkIGNvbW1hbmQ6XCIsIGl0ZW0pO1xuICAgICAgICB0aGlzLm9uQ29uZmlybWVkKGl0ZW0pO1xuICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBydW5uaW5nIGtlcm5lbHMgZm9yIHRoaXMgZmlsZSB0eXBlLlwiLFxuICAgIH0pO1xuICB9XG5cbiAgb25Db25maXJtZWQoa2VybmVsQ29tbWFuZDogeyBjb21tYW5kOiBzdHJpbmcgfSkge1xuICAgIGlmICh0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQpIHtcbiAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZChrZXJuZWxDb21tYW5kLCB0aGlzLnN0b3JlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB0b2dnbGUoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5jYW5jZWwoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLnN0b3JlKSByZXR1cm47XG4gICAgY29uc3Qga2VybmVsID0gdGhpcy5zdG9yZS5rZXJuZWw7XG4gICAgaWYgKCFrZXJuZWwpIHJldHVybjtcbiAgICBjb25zdCBjb21tYW5kcyA9XG4gICAgICBrZXJuZWwudHJhbnNwb3J0IGluc3RhbmNlb2YgV1NLZXJuZWxcbiAgICAgICAgPyBbLi4uYmFzaWNDb21tYW5kcywgLi4ud3NLZXJuZWxDb21tYW5kc11cbiAgICAgICAgOiBiYXNpY0NvbW1hbmRzO1xuXG4gICAgY29uc3QgbGlzdEl0ZW1zID0gY29tbWFuZHMubWFwKChjb21tYW5kKSA9PiAoe1xuICAgICAgbmFtZTogYCR7Y29tbWFuZC5uYW1lfSAke2tlcm5lbC5rZXJuZWxTcGVjLmRpc3BsYXlfbmFtZX0ga2VybmVsYCxcbiAgICAgIGNvbW1hbmQ6IGNvbW1hbmQudmFsdWUsXG4gICAgfSkpO1xuXG4gICAgYXdhaXQgdGhpcy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoeyBpdGVtczogbGlzdEl0ZW1zIH0pO1xuICAgIHRoaXMuYXR0YWNoKCk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIGlmICh0aGlzLnBhbmVsID09IG51bGwpXG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMuc2VsZWN0TGlzdFZpZXcgfSk7XG4gICAgdGhpcy5zZWxlY3RMaXN0Vmlldy5mb2N1cygpO1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcucmVzZXQoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0Vmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIGlmICh0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkge1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==