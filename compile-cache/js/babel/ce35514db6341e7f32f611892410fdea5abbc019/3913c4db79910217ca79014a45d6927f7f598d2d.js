Object.defineProperty(exports, "__esModule", {
  value: true
});

var _this = this;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactTable = require("react-table");

var _reactTable2 = _interopRequireDefault(_reactTable);

var _mobxReact = require("mobx-react");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _kernel = require("../kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _utils = require("../utils");

var showKernelSpec = function showKernelSpec(kernelSpec) {
  atom.notifications.addInfo("Hydrogen: Kernel Spec", {
    detail: JSON.stringify(kernelSpec, null, 2),
    dismissable: true
  });
};
var interrupt = function interrupt(kernel) {
  kernel.interrupt();
};
var shutdown = function shutdown(kernel) {
  kernel.shutdown();
  kernel.destroy();
};
var restart = function restart(kernel) {
  kernel.restart();
};

// @TODO If our store holds editor IDs instead of file paths, these messy matching stuff below would
//       easily be replaced by simpler code. See also components/kernel-monitor.js for this problem.
var openUnsavedEditor = function openUnsavedEditor(filePath) {
  var editor = atom.workspace.getTextEditors().find(function (editor) {
    var match = filePath.match(/\d+/);
    if (!match) {
      return false;
    }
    return String(editor.id) === match[0];
  });
  // This path won't happen after https://github.com/nteract/hydrogen/pull/1662 since every deleted
  // editors would be deleted from `store.kernelMapping`. Just kept here for safety.
  if (!editor) return;
  atom.workspace.open(editor, {
    searchAllPanes: true
  });
};
var openEditor = function openEditor(filePath) {
  atom.workspace.open(filePath, {
    searchAllPanes: true
  })["catch"](function (err) {
    atom.notifications.addError("Hydrogen", {
      description: err
    });
  });
};

var kernelInfoCell = function kernelInfoCell(props) {
  var _props$value = props.value;
  var displayName = _props$value.displayName;
  var kernelSpec = _props$value.kernelSpec;

  return _react2["default"].createElement(
    "a",
    {
      className: "icon",
      onClick: showKernelSpec.bind(_this, kernelSpec),
      title: "Show kernel spec",
      key: displayName + "kernelInfo"
    },
    displayName
  );
};

// Set default properties of React-Table
Object.assign(_reactTable.ReactTableDefaults, {
  className: "kernel-monitor",
  showPagination: false
});
Object.assign(_reactTable.ReactTableDefaults.column, {
  className: "table-cell",
  headerClassName: "table-header",
  style: { textAlign: "center" }
});

var KernelMonitor = (0, _mobxReact.observer)(function (_ref) {
  var store = _ref.store;
  return (function () {
    var _this2 = this;

    if (store.runningKernels.length === 0) {
      return _react2["default"].createElement(
        "ul",
        { className: "background-message centered" },
        _react2["default"].createElement(
          "li",
          null,
          "No running kernels"
        )
      );
    }

    var data = _lodash2["default"].map(store.runningKernels, function (kernel, key) {
      return {
        gateway: kernel.transport.gatewayName || "Local",
        kernelInfo: {
          displayName: kernel.displayName,
          kernelSpec: kernel.kernelSpec
        },
        status: kernel.executionState,
        executionCount: kernel.executionCount,
        lastExecutionTime: kernel.lastExecutionTime,
        kernelKey: { kernel: kernel, key: String(key) },
        files: store.getFilesForKernel(kernel)
      };
    });
    var columns = [{
      Header: "Gateway",
      accessor: "gateway",
      maxWidth: 125
    }, {
      Header: "Kernel",
      accessor: "kernelInfo",
      Cell: kernelInfoCell,
      maxWidth: 125
    }, {
      Header: "Status",
      accessor: "status",
      maxWidth: 100
    }, {
      Header: "Count",
      accessor: "executionCount",
      maxWidth: 50,
      style: { textAlign: "right" }
    }, {
      Header: "Last Exec Time",
      accessor: "lastExecutionTime",
      maxWidth: 100,
      style: { textAlign: "right" }
    }, {
      Header: "Managements",
      accessor: "kernelKey",
      Cell: function Cell(props) {
        var _props$value2 = props.value;
        var kernel = _props$value2.kernel;
        var key = _props$value2.key;

        return [_react2["default"].createElement("a", {
          className: "icon icon-zap",
          onClick: interrupt.bind(_this2, kernel),
          title: "Interrupt kernel",
          key: key + "interrupt"
        }), _react2["default"].createElement("a", {
          className: "icon icon-sync",
          onClick: restart.bind(_this2, kernel),
          title: "Restart kernel",
          key: key + "restart"
        }), _react2["default"].createElement("a", {
          className: "icon icon-trashcan",
          onClick: shutdown.bind(_this2, kernel),
          title: "Shutdown kernel",
          key: key + "shutdown"
        })];
      },
      width: 150
    }, {
      Header: "Files",
      accessor: "files",
      Cell: function Cell(props) {
        return props.value.map(function (filePath, index) {
          var separator = index === 0 ? "" : "  |  ";
          var body = (0, _utils.isUnsavedFilePath)(filePath) ? _react2["default"].createElement(
            "a",
            {
              onClick: openUnsavedEditor.bind(_this2, filePath),
              title: "Jump to file",
              key: filePath + "jump"
            },
            filePath
          ) : _react2["default"].createElement(
            "a",
            {
              onClick: openEditor.bind(_this2, filePath),
              title: "Jump to file",
              key: filePath + "jump"
            },
            (0, _tildify2["default"])(filePath)
          );
          return _react2["default"].createElement(
            "div",
            { style: { display: "-webkit-inline-box" }, key: filePath },
            separator,
            body
          );
        });
      },
      style: { textAlign: "center", whiteSpace: "pre-wrap" }
    }];

    return _react2["default"].createElement(_reactTable2["default"], { data: data, columns: columns });
  })();
});

KernelMonitor.displayName = "KernelMonitor";
exports["default"] = KernelMonitor;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL2tlcm5lbC1tb25pdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O3FCQUVrQixPQUFPOzs7OzBCQUNGLGFBQWE7Ozs7eUJBRVgsWUFBWTs7c0JBQ3ZCLFFBQVE7Ozs7dUJBQ0YsU0FBUzs7OztzQkFHVixXQUFXOzs7O3FCQUNJLFVBQVU7O0FBRTVDLElBQU0sY0FBYyxHQUFHLFNBQWpCLGNBQWMsQ0FBSSxVQUFVLEVBQVM7QUFDekMsTUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUU7QUFDbEQsVUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0MsZUFBVyxFQUFFLElBQUk7R0FDbEIsQ0FBQyxDQUFDO0NBQ0osQ0FBQztBQUNGLElBQU0sU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFJLE1BQU0sRUFBYTtBQUNwQyxRQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Q0FDcEIsQ0FBQztBQUNGLElBQU0sUUFBUSxHQUFHLFNBQVgsUUFBUSxDQUFJLE1BQU0sRUFBYTtBQUNuQyxRQUFNLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEIsUUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ2xCLENBQUM7QUFDRixJQUFNLE9BQU8sR0FBRyxTQUFWLE9BQU8sQ0FBSSxNQUFNLEVBQWE7QUFDbEMsUUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0NBQ2xCLENBQUM7Ozs7QUFJRixJQUFNLGlCQUFpQixHQUFHLFNBQXBCLGlCQUFpQixDQUFJLFFBQVEsRUFBYTtBQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUM5RCxRQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFD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QUFJLEVBQUUsSUFBSSxBQUFDLEVBQUMsT0FBTyxFQUFFLE9BQU8sQUFBQyxHQUFHLENBQUM7R0FDckQ7Q0FBQSxDQUFDLENBQUM7O0FBRUgsYUFBYSxDQUFDLFdBQVcsR0FBRyxlQUFlLENBQUM7cUJBQzdCLGFBQWEiLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbXBvbmVudHMva2VybmVsLW1vbml0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgUmVhY3RUYWJsZSBmcm9tIFwicmVhY3QtdGFibGVcIjtcbmltcG9ydCB7IFJlYWN0VGFibGVEZWZhdWx0cyB9IGZyb20gXCJyZWFjdC10YWJsZVwiO1xuaW1wb3J0IHsgb2JzZXJ2ZXIgfSBmcm9tIFwibW9ieC1yZWFjdFwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHRpbGRpZnkgZnJvbSBcInRpbGRpZnlcIjtcblxuaW1wb3J0IHR5cGVvZiBzdG9yZSBmcm9tIFwiLi4vc3RvcmVcIjtcbmltcG9ydCBLZXJuZWwgZnJvbSBcIi4uL2tlcm5lbFwiO1xuaW1wb3J0IHsgaXNVbnNhdmVkRmlsZVBhdGggfSBmcm9tIFwiLi4vdXRpbHNcIjtcblxuY29uc3Qgc2hvd0tlcm5lbFNwZWMgPSAoa2VybmVsU3BlYzoge30pID0+IHtcbiAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJIeWRyb2dlbjogS2VybmVsIFNwZWNcIiwge1xuICAgIGRldGFpbDogSlNPTi5zdHJpbmdpZnkoa2VybmVsU3BlYywgbnVsbCwgMiksXG4gICAgZGlzbWlzc2FibGU6IHRydWUsXG4gIH0pO1xufTtcbmNvbnN0IGludGVycnVwdCA9IChrZXJuZWw6IEtlcm5lbCkgPT4ge1xuICBrZXJuZWwuaW50ZXJydXB0KCk7XG59O1xuY29uc3Qgc2h1dGRvd24gPSAoa2VybmVsOiBLZXJuZWwpID0+IHtcbiAga2VybmVsLnNodXRkb3duKCk7XG4gIGtlcm5lbC5kZXN0cm95KCk7XG59O1xuY29uc3QgcmVzdGFydCA9IChrZXJuZWw6IEtlcm5lbCkgPT4ge1xuICBrZXJuZWwucmVzdGFydCgpO1xufTtcblxuLy8gQFRPRE8gSWYgb3VyIHN0b3JlIGhvbGRzIGVkaXRvciBJRHMgaW5zdGVhZCBvZiBmaWxlIHBhdGhzLCB0aGVzZSBtZXNzeSBtYXRjaGluZyBzdHVmZiBiZWxvdyB3b3VsZFxuLy8gICAgICAgZWFzaWx5IGJlIHJlcGxhY2VkIGJ5IHNpbXBsZXIgY29kZS4gU2VlIGFsc28gY29tcG9uZW50cy9rZXJuZWwtbW9uaXRvci5qcyBmb3IgdGhpcyBwcm9ibGVtLlxuY29uc3Qgb3BlblVuc2F2ZWRFZGl0b3IgPSAoZmlsZVBhdGg6IHN0cmluZykgPT4ge1xuICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZpbmQoKGVkaXRvcikgPT4ge1xuICAgIGNvbnN0IG1hdGNoID0gZmlsZVBhdGgubWF0Y2goL1xcZCsvKTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBTdHJpbmcoZWRpdG9yLmlkKSA9PT0gbWF0Y2hbMF07XG4gIH0pO1xuICAvLyBUaGlzIHBhdGggd29uJ3QgaGFwcGVuIGFmdGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9udGVyYWN0L2h5ZHJvZ2VuL3B1bGwvMTY2MiBzaW5jZSBldmVyeSBkZWxldGVkXG4gIC8vIGVkaXRvcnMgd291bGQgYmUgZGVsZXRlZCBmcm9tIGBzdG9yZS5rZXJuZWxNYXBwaW5nYC4gSnVzdCBrZXB0IGhlcmUgZm9yIHNhZmV0eS5cbiAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgYXRvbS53b3Jrc3BhY2Uub3BlbihlZGl0b3IsIHtcbiAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgfSk7XG59O1xuY29uc3Qgb3BlbkVkaXRvciA9IChmaWxlUGF0aDogc3RyaW5nKSA9PiB7XG4gIGF0b20ud29ya3NwYWNlXG4gICAgLm9wZW4oZmlsZVBhdGgsIHtcbiAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlLFxuICAgIH0pXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIkh5ZHJvZ2VuXCIsIHtcbiAgICAgICAgZGVzY3JpcHRpb246IGVycixcbiAgICAgIH0pO1xuICAgIH0pO1xufTtcblxudHlwZSBLZXJuZWxJbmZvID0ge1xuICB2YWx1ZToge1xuICAgIGRpc3BsYXlOYW1lOiBzdHJpbmcsXG4gICAga2VybmVsU3BlYzogS2VybmVsc3BlYyxcbiAgfSxcbn07XG5jb25zdCBrZXJuZWxJbmZvQ2VsbCA9IChwcm9wczogS2VybmVsSW5mbykgPT4ge1xuICBjb25zdCB7IGRpc3BsYXlOYW1lLCBrZXJuZWxTcGVjIH0gPSBwcm9wcy52YWx1ZTtcbiAgcmV0dXJuIChcbiAgICA8YVxuICAgICAgY2xhc3NOYW1lPVwiaWNvblwiXG4gICAgICBvbkNsaWNrPXtzaG93S2VybmVsU3BlYy5iaW5kKHRoaXMsIGtlcm5lbFNwZWMpfVxuICAgICAgdGl0bGU9XCJTaG93IGtlcm5lbCBzcGVjXCJcbiAgICAgIGtleT17ZGlzcGxheU5hbWUgKyBcImtlcm5lbEluZm9cIn1cbiAgICA+XG4gICAgICB7ZGlzcGxheU5hbWV9XG4gICAgPC9hPlxuICApO1xufTtcblxuLy8gU2V0IGRlZmF1bHQgcHJvcGVydGllcyBvZiBSZWFjdC1UYWJsZVxuT2JqZWN0LmFzc2lnbihSZWFjdFRhYmxlRGVmYXVsdHMsIHtcbiAgY2xhc3NOYW1lOiBcImtlcm5lbC1tb25pdG9yXCIsXG4gIHNob3dQYWdpbmF0aW9uOiBmYWxzZSxcbn0pO1xuT2JqZWN0LmFzc2lnbihSZWFjdFRhYmxlRGVmYXVsdHMuY29sdW1uLCB7XG4gIGNsYXNzTmFtZTogXCJ0YWJsZS1jZWxsXCIsXG4gIGhlYWRlckNsYXNzTmFtZTogXCJ0YWJsZS1oZWFkZXJcIixcbiAgc3R5bGU6IHsgdGV4dEFsaWduOiBcImNlbnRlclwiIH0sXG59KTtcblxuY29uc3QgS2VybmVsTW9uaXRvciA9IG9ic2VydmVyKCh7IHN0b3JlIH06IHsgc3RvcmU6IHN0b3JlIH0pID0+IHtcbiAgaWYgKHN0b3JlLnJ1bm5pbmdLZXJuZWxzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwiYmFja2dyb3VuZC1tZXNzYWdlIGNlbnRlcmVkXCI+XG4gICAgICAgIDxsaT5ObyBydW5uaW5nIGtlcm5lbHM8L2xpPlxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbiAgY29uc3QgZGF0YSA9IF8ubWFwKHN0b3JlLnJ1bm5pbmdLZXJuZWxzLCAoa2VybmVsLCBrZXk6IG51bWJlcikgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBnYXRld2F5OiBrZXJuZWwudHJhbnNwb3J0LmdhdGV3YXlOYW1lIHx8IFwiTG9jYWxcIixcbiAgICAgIGtlcm5lbEluZm86IHtcbiAgICAgICAgZGlzcGxheU5hbWU6IGtlcm5lbC5kaXNwbGF5TmFtZSxcbiAgICAgICAga2VybmVsU3BlYzoga2VybmVsLmtlcm5lbFNwZWMsXG4gICAgICB9LFxuICAgICAgc3RhdHVzOiBrZXJuZWwuZXhlY3V0aW9uU3RhdGUsXG4gICAgICBleGVjdXRpb25Db3VudDoga2VybmVsLmV4ZWN1dGlvbkNvdW50LFxuICAgICAgbGFzdEV4ZWN1dGlvblRpbWU6IGtlcm5lbC5sYXN0RXhlY3V0aW9uVGltZSxcbiAgICAgIGtlcm5lbEtleTogeyBrZXJuZWw6IGtlcm5lbCwga2V5OiBTdHJpbmcoa2V5KSB9LFxuICAgICAgZmlsZXM6IHN0b3JlLmdldEZpbGVzRm9yS2VybmVsKGtlcm5lbCksXG4gICAgfTtcbiAgfSk7XG4gIGNvbnN0IGNvbHVtbnMgPSBbXG4gICAge1xuICAgICAgSGVhZGVyOiBcIkdhdGV3YXlcIixcbiAgICAgIGFjY2Vzc29yOiBcImdhdGV3YXlcIixcbiAgICAgIG1heFdpZHRoOiAxMjUsXG4gICAgfSxcbiAgICB7XG4gICAgICBIZWFkZXI6IFwiS2VybmVsXCIsXG4gICAgICBhY2Nlc3NvcjogXCJrZXJuZWxJbmZvXCIsXG4gICAgICBDZWxsOiBrZXJuZWxJbmZvQ2VsbCxcbiAgICAgIG1heFdpZHRoOiAxMjUsXG4gICAgfSxcbiAgICB7XG4gICAgICBIZWFkZXI6IFwiU3RhdHVzXCIsXG4gICAgICBhY2Nlc3NvcjogXCJzdGF0dXNcIixcbiAgICAgIG1heFdpZHRoOiAxMDAsXG4gICAgfSxcbiAgICB7XG4gICAgICBIZWFkZXI6IFwiQ291bnRcIixcbiAgICAgIGFjY2Vzc29yOiBcImV4ZWN1dGlvbkNvdW50XCIsXG4gICAgICBtYXhXaWR0aDogNTAsXG4gICAgICBzdHlsZTogeyB0ZXh0QWxpZ246IFwicmlnaHRcIiB9LFxuICAgIH0sXG4gICAge1xuICAgICAgSGVhZGVyOiBcIkxhc3QgRXhlYyBUaW1lXCIsXG4gICAgICBhY2Nlc3NvcjogXCJsYXN0RXhlY3V0aW9uVGltZVwiLFxuICAgICAgbWF4V2lkdGg6IDEwMCxcbiAgICAgIHN0eWxlOiB7IHRleHRBbGlnbjogXCJyaWdodFwiIH0sXG4gICAgfSxcbiAgICB7XG4gICAgICBIZWFkZXI6IFwiTWFuYWdlbWVudHNcIixcbiAgICAgIGFjY2Vzc29yOiBcImtlcm5lbEtleVwiLFxuICAgICAgQ2VsbDogKHByb3BzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsga2VybmVsLCBrZXkgfSA9IHByb3BzLnZhbHVlO1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIDxhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpY29uIGljb24temFwXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2ludGVycnVwdC5iaW5kKHRoaXMsIGtlcm5lbCl9XG4gICAgICAgICAgICB0aXRsZT1cIkludGVycnVwdCBrZXJuZWxcIlxuICAgICAgICAgICAga2V5PXtrZXkgKyBcImludGVycnVwdFwifVxuICAgICAgICAgIC8+LFxuICAgICAgICAgIDxhXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpY29uIGljb24tc3luY1wiXG4gICAgICAgICAgICBvbkNsaWNrPXtyZXN0YXJ0LmJpbmQodGhpcywga2VybmVsKX1cbiAgICAgICAgICAgIHRpdGxlPVwiUmVzdGFydCBrZXJuZWxcIlxuICAgICAgICAgICAga2V5PXtrZXkgKyBcInJlc3RhcnRcIn1cbiAgICAgICAgICAvPixcbiAgICAgICAgICA8YVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiaWNvbiBpY29uLXRyYXNoY2FuXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9e3NodXRkb3duLmJpbmQodGhpcywga2VybmVsKX1cbiAgICAgICAgICAgIHRpdGxlPVwiU2h1dGRvd24ga2VybmVsXCJcbiAgICAgICAgICAgIGtleT17a2V5ICsgXCJzaHV0ZG93blwifVxuICAgICAgICAgIC8+LFxuICAgICAgICBdO1xuICAgICAgfSxcbiAgICAgIHdpZHRoOiAxNTAsXG4gICAgfSxcbiAgICB7XG4gICAgICBIZWFkZXI6IFwiRmlsZXNcIixcbiAgICAgIGFjY2Vzc29yOiBcImZpbGVzXCIsXG4gICAgICBDZWxsOiAocHJvcHMpID0+IHtcbiAgICAgICAgcmV0dXJuIHByb3BzLnZhbHVlLm1hcCgoZmlsZVBhdGgsIGluZGV4KSA9PiB7XG4gICAgICAgICAgY29uc3Qgc2VwYXJhdG9yID0gaW5kZXggPT09IDAgPyBcIlwiIDogXCIgIHwgIFwiO1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBpc1Vuc2F2ZWRGaWxlUGF0aChmaWxlUGF0aCkgPyAoXG4gICAgICAgICAgICA8YVxuICAgICAgICAgICAgICBvbkNsaWNrPXtvcGVuVW5zYXZlZEVkaXRvci5iaW5kKHRoaXMsIGZpbGVQYXRoKX1cbiAgICAgICAgICAgICAgdGl0bGU9XCJKdW1wIHRvIGZpbGVcIlxuICAgICAgICAgICAgICBrZXk9e2ZpbGVQYXRoICsgXCJqdW1wXCJ9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtmaWxlUGF0aH1cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgb25DbGljaz17b3BlbkVkaXRvci5iaW5kKHRoaXMsIGZpbGVQYXRoKX1cbiAgICAgICAgICAgICAgdGl0bGU9XCJKdW1wIHRvIGZpbGVcIlxuICAgICAgICAgICAgICBrZXk9e2ZpbGVQYXRoICsgXCJqdW1wXCJ9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt0aWxkaWZ5KGZpbGVQYXRoKX1cbiAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6IFwiLXdlYmtpdC1pbmxpbmUtYm94XCIgfX0ga2V5PXtmaWxlUGF0aH0+XG4gICAgICAgICAgICAgIHtzZXBhcmF0b3J9XG4gICAgICAgICAgICAgIHtib2R5fVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgc3R5bGU6IHsgdGV4dEFsaWduOiBcImNlbnRlclwiLCB3aGl0ZVNwYWNlOiBcInByZS13cmFwXCIgfSxcbiAgICB9LFxuICBdO1xuXG4gIHJldHVybiA8UmVhY3RUYWJsZSBkYXRhPXtkYXRhfSBjb2x1bW5zPXtjb2x1bW5zfSAvPjtcbn0pO1xuXG5LZXJuZWxNb25pdG9yLmRpc3BsYXlOYW1lID0gXCJLZXJuZWxNb25pdG9yXCI7XG5leHBvcnQgZGVmYXVsdCBLZXJuZWxNb25pdG9yO1xuIl19