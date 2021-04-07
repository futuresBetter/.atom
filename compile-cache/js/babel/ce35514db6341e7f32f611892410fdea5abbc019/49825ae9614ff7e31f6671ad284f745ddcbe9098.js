Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.toggleInspector = toggleInspector;
exports.toggleOutputMode = toggleOutputMode;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _utils = require("./utils");

var _codeManager = require("./code-manager");

var _panesOutputArea = require("./panes/output-area");

var _panesOutputArea2 = _interopRequireDefault(_panesOutputArea);

function toggleInspector(store) {
  var editor = store.editor;
  var kernel = store.kernel;

  if (!editor || !kernel) {
    atom.notifications.addInfo("No kernel running!");
    return;
  }

  var _getCodeToInspect = (0, _codeManager.getCodeToInspect)(editor);

  var _getCodeToInspect2 = _slicedToArray(_getCodeToInspect, 2);

  var code = _getCodeToInspect2[0];
  var cursorPos = _getCodeToInspect2[1];

  if (!code || cursorPos === 0) {
    atom.notifications.addInfo("No code to introspect!");
    return;
  }

  kernel.inspect(code, cursorPos, function (result) {
    (0, _utils.log)("Inspector: Result:", result);

    if (!result.found) {
      atom.workspace.hide(_utils.INSPECTOR_URI);
      atom.notifications.addInfo("No introspection available!");
      return;
    }

    kernel.setInspectorResult(result.data, editor);
  });
}

function toggleOutputMode() {
  // There should never be more than one instance of OutputArea
  var outputArea = atom.workspace.getPaneItems().find(function (paneItem) {
    return paneItem instanceof _panesOutputArea2["default"];
  });

  if (outputArea) {
    return outputArea.destroy();
  } else {
    (0, _utils.openOrShowDock)(_utils.OUTPUT_AREA_URI);
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21tYW5kcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztxQkFRTyxTQUFTOzsyQkFDaUIsZ0JBQWdCOzsrQkFDMUIscUJBQXFCOzs7O0FBSXJDLFNBQVMsZUFBZSxDQUFDLEtBQVksRUFBRTtNQUNwQyxNQUFNLEdBQWEsS0FBSyxDQUF4QixNQUFNO01BQUUsTUFBTSxHQUFLLEtBQUssQ0FBaEIsTUFBTTs7QUFDdEIsTUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUN0QixRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ2pELFdBQU87R0FDUjs7MEJBRXlCLG1DQUFpQixNQUFNLENBQUM7Ozs7TUFBM0MsSUFBSTtNQUFFLFNBQVM7O0FBQ3RCLE1BQUksQ0FBQyxJQUFJLElBQUksU0FBUyxLQUFLLENBQUMsRUFBRTtBQUM1QixRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO0FBQ3JELFdBQU87R0FDUjs7QUFFRCxRQUFNLENBQUMsT0FBTyxDQUNaLElBQUksRUFDSixTQUFTLEVBQ1QsVUFBQyxNQUFNLEVBQXVDO0FBQzVDLG9CQUFJLG9CQUFvQixFQUFFLE1BQU0sQ0FBQyxDQUFDOztBQUVsQyxRQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRTtBQUNqQixVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksc0JBQWUsQ0FBQztBQUNuQyxVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQzFELGFBQU87S0FDUjs7QUFFRCxVQUFNLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNoRCxDQUNGLENBQUM7Q0FDSDs7QUFFTSxTQUFTLGdCQUFnQixHQUFTOztBQUV2QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUM5QixZQUFZLEVBQUUsQ0FDZCxJQUFJLENBQUMsVUFBQyxRQUFRO1dBQUssUUFBUSx3Q0FBc0I7R0FBQSxDQUFDLENBQUM7O0FBRXRELE1BQUksVUFBVSxFQUFFO0FBQ2QsV0FBTyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDN0IsTUFBTTtBQUNMLHNEQUErQixDQUFDO0dBQ2pDO0NBQ0YiLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL2NvbW1hbmRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHtcbiAgbG9nLFxuICByZWFjdEZhY3RvcnksXG4gIElOU1BFQ1RPUl9VUkksXG4gIE9VVFBVVF9BUkVBX1VSSSxcbiAgb3Blbk9yU2hvd0RvY2ssXG59IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgeyBnZXRDb2RlVG9JbnNwZWN0IH0gZnJvbSBcIi4vY29kZS1tYW5hZ2VyXCI7XG5pbXBvcnQgT3V0cHV0UGFuZSBmcm9tIFwiLi9wYW5lcy9vdXRwdXQtYXJlYVwiO1xuXG5pbXBvcnQgdHlwZW9mIHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVJbnNwZWN0b3Ioc3RvcmU6IHN0b3JlKSB7XG4gIGNvbnN0IHsgZWRpdG9yLCBrZXJuZWwgfSA9IHN0b3JlO1xuICBpZiAoIWVkaXRvciB8fCAha2VybmVsKSB7XG4gICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8oXCJObyBrZXJuZWwgcnVubmluZyFcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgW2NvZGUsIGN1cnNvclBvc10gPSBnZXRDb2RlVG9JbnNwZWN0KGVkaXRvcik7XG4gIGlmICghY29kZSB8fCBjdXJzb3JQb3MgPT09IDApIHtcbiAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGNvZGUgdG8gaW50cm9zcGVjdCFcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAga2VybmVsLmluc3BlY3QoXG4gICAgY29kZSxcbiAgICBjdXJzb3JQb3MsXG4gICAgKHJlc3VsdDogeyBkYXRhOiBPYmplY3QsIGZvdW5kOiBCb29sZWFuIH0pID0+IHtcbiAgICAgIGxvZyhcIkluc3BlY3RvcjogUmVzdWx0OlwiLCByZXN1bHQpO1xuXG4gICAgICBpZiAoIXJlc3VsdC5mb3VuZCkge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5oaWRlKElOU1BFQ1RPUl9VUkkpO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhcIk5vIGludHJvc3BlY3Rpb24gYXZhaWxhYmxlIVwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBrZXJuZWwuc2V0SW5zcGVjdG9yUmVzdWx0KHJlc3VsdC5kYXRhLCBlZGl0b3IpO1xuICAgIH1cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZU91dHB1dE1vZGUoKTogdm9pZCB7XG4gIC8vIFRoZXJlIHNob3VsZCBuZXZlciBiZSBtb3JlIHRoYW4gb25lIGluc3RhbmNlIG9mIE91dHB1dEFyZWFcbiAgY29uc3Qgb3V0cHV0QXJlYSA9IGF0b20ud29ya3NwYWNlXG4gICAgLmdldFBhbmVJdGVtcygpXG4gICAgLmZpbmQoKHBhbmVJdGVtKSA9PiBwYW5lSXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmUpO1xuXG4gIGlmIChvdXRwdXRBcmVhKSB7XG4gICAgcmV0dXJuIG91dHB1dEFyZWEuZGVzdHJveSgpO1xuICB9IGVsc2Uge1xuICAgIG9wZW5PclNob3dEb2NrKE9VVFBVVF9BUkVBX1VSSSk7XG4gIH1cbn1cbiJdfQ==