Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

exports.createResult = createResult;
exports.importResult = importResult;
exports.clearResult = clearResult;
exports.clearResults = clearResults;
exports.convertMarkdownToOutput = convertMarkdownToOutput;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _componentsResultView = require("./components/result-view");

var _componentsResultView2 = _interopRequireDefault(_componentsResultView);

var _panesOutputArea = require("./panes/output-area");

var _panesOutputArea2 = _interopRequireDefault(_panesOutputArea);

var _panesWatches = require("./panes/watches");

var _panesWatches2 = _interopRequireDefault(_panesWatches);

var _utils = require("./utils");

/**
 * Creates and renders a ResultView.
 *
 * @param {Object} store - Global Hydrogen Store
 * @param {atom$TextEditor} store.editor - TextEditor associated with the result.
 * @param {Kernel} store.kernel - Kernel to run code and associate with the result.
 * @param {MarkerStore} store.markers - MarkerStore that belongs to `store.editor`.
 * @param {Object} codeBlock - A Hydrogen Cell.
 * @param {String} codeBlock.code - Source string of the cell.
 * @param {Number} codeBlock.row - Row to display the result on.
 * @param {HydrogenCellType} codeBlock.cellType - Cell type of the cell.
 */

function createResult(_ref, _ref2) {
  var editor = _ref.editor;
  var kernel = _ref.kernel;
  var markers = _ref.markers;
  var code = _ref2.code;
  var row = _ref2.row;
  var cellType = _ref2.cellType;
  return (function () {
    if (!editor || !kernel || !markers) return;

    if (atom.workspace.getActivePaneItem() instanceof _panesWatches2["default"]) {
      kernel.watchesStore.run();
      return;
    }
    var globalOutputStore = atom.config.get("Hydrogen.outputAreaDefault") || atom.workspace.getPaneItems().find(function (item) {
      return item instanceof _panesOutputArea2["default"];
    }) ? kernel.outputStore : null;

    if (globalOutputStore) (0, _utils.openOrShowDock)(_utils.OUTPUT_AREA_URI);

    var _ref3 = new _componentsResultView2["default"](markers, kernel, editor, row, !globalOutputStore || cellType == "markdown");

    var outputStore = _ref3.outputStore;

    if (code.search(/[\S]/) != -1) {
      switch (cellType) {
        case "markdown":
          if (globalOutputStore) globalOutputStore.appendOutput(convertMarkdownToOutput(code));else outputStore.appendOutput(convertMarkdownToOutput(code));
          outputStore.appendOutput({ data: "ok", stream: "status" });
          break;
        case "codecell":
          kernel.execute(code, function (result) {
            outputStore.appendOutput(result);
            if (globalOutputStore) globalOutputStore.appendOutput(result);
          });
          break;
      }
    } else {
      outputStore.appendOutput({ data: "ok", stream: "status" });
    }
  })();
}

/**
 * Creates inline results from Kernel Responses without a tie to a kernel.
 *
 * @param {Store} store - Hydrogen store
 * @param {atom$TextEditor} store.editor - The editor to display the results in.
 * @param {MarkerStore} store.markers - Should almost always be the editor's `MarkerStore`
 * @param {Object} bundle - The bundle to display.
 * @param {Array<Object>} bundle.outputs - The Kernel Responses to display.
 * @param {Number} bundle.row - The editor row to display the results on.
 */

function importResult(_ref4, _ref5) {
  var editor = _ref4.editor;
  var markers = _ref4.markers;
  var outputs = _ref5.outputs;
  var row = _ref5.row;
  return (function () {
    if (!editor || !markers) return;

    var _ref6 = new _componentsResultView2["default"](markers, null, editor, row, true // Always show inline
    );

    var outputStore = _ref6.outputStore;

    for (var output of outputs) {
      outputStore.appendOutput(output);
    }
  })();
}

/**
 * Clears a ResultView or selection of ResultViews.
 * To select a result to clear, put your cursor on the row on the ResultView.
 * To select multiple ResultViews, select text starting on the row of
 * the first ResultView to remove all the way to text on the row of the
 * last ResultView to remove. *This must be one selection and
 * the last selection made*
 *
 * @param {Object} store - Global Hydrogen Store
 * @param {atom$TextEditor} store.editor - TextEditor associated with the ResultView.
 * @param {MarkerStore} store.markers - MarkerStore that belongs to `store.editor` and the ResultView.
 */

function clearResult(_ref7) {
  var editor = _ref7.editor;
  var markers = _ref7.markers;
  return (function () {
    if (!editor || !markers) return;

    var _editor$getLastSelection$getBufferRowRange = editor.getLastSelection().getBufferRowRange();

    var _editor$getLastSelection$getBufferRowRange2 = _slicedToArray(_editor$getLastSelection$getBufferRowRange, 2);

    var startRow = _editor$getLastSelection$getBufferRowRange2[0];
    var endRow = _editor$getLastSelection$getBufferRowRange2[1];

    for (var row = startRow; row <= endRow; row++) {
      markers.clearOnRow(row);
    }
  })();
}

/**
 * Clears all ResultViews of a MarkerStore.
 * It also clears the currect kernel results.
 *
 * @param {Object} store - Global Hydrogen Store
 * @param {Kernel} store.kernel - Kernel to clear outputs.
 * @param {MarkerStore} store.markers - MarkerStore to clear.
 */

function clearResults(_ref8) {
  var kernel = _ref8.kernel;
  var markers = _ref8.markers;
  return (function () {
    if (markers) markers.clear();
    if (!kernel) return;
    kernel.outputStore.clear();
  })();
}

/**
 * Converts a string of raw markdown to a display_data Kernel Response.
 * This allows for hydrogen to display markdown text as if is was any normal
 * result that came back from the kernel.
 *
 * @param {String} markdownString - A string of raw markdown code.
 * @return {Object} A fake display_data Kernel Response.
 */

function convertMarkdownToOutput(markdownString) {
  return {
    output_type: "display_data",
    data: {
      "text/markdown": markdownString
    },
    metadata: {}
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9yZXN1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7b0NBQ3VCLDBCQUEwQjs7OzsrQkFDMUIscUJBQXFCOzs7OzRCQUNwQixpQkFBaUI7Ozs7cUJBQ08sU0FBUzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JsRCxTQUFTLFlBQVksQ0FDMUIsSUFRRSxFQUNGLEtBSTREO01BWjFELE1BQU0sR0FEUixJQVFFLENBUEEsTUFBTTtNQUNOLE1BQU0sR0FGUixJQVFFLENBTkEsTUFBTTtNQUNOLE9BQU8sR0FIVCxJQVFFLENBTEEsT0FBTztNQU9QLElBQUksR0FETixLQUk0RCxDQUgxRCxJQUFJO01BQ0osR0FBRyxHQUZMLEtBSTRELENBRjFELEdBQUc7TUFDSCxRQUFRLEdBSFYsS0FJNEQsQ0FEMUQsUUFBUTtzQkFFVjtBQUNBLFFBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTzs7QUFFM0MsUUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLHFDQUF1QixFQUFFO0FBQzdELFlBQU0sQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDMUIsYUFBTztLQUNSO0FBQ0QsUUFBTSxpQkFBaUIsR0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLENBQUMsSUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJO2FBQUssSUFBSSx3Q0FBc0I7S0FBQSxDQUFDLEdBQ3BFLE1BQU0sQ0FBQyxXQUFXLEdBQ2xCLElBQUksQ0FBQzs7QUFFWCxRQUFJLGlCQUFpQixFQUFFLGtEQUErQixDQUFDOztnQkFFL0Isc0NBQ3RCLE9BQU8sRUFDUCxNQUFNLEVBQ04sTUFBTSxFQUNOLEdBQUcsRUFDSCxDQUFDLGlCQUFpQixJQUFJLFFBQVEs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RSxFQUFFO0dBQ2IsQ0FBQztDQUNIIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9yZXN1bHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuaW1wb3J0IFJlc3VsdFZpZXcgZnJvbSBcIi4vY29tcG9uZW50cy9yZXN1bHQtdmlld1wiO1xuaW1wb3J0IE91dHB1dFBhbmUgZnJvbSBcIi4vcGFuZXMvb3V0cHV0LWFyZWFcIjtcbmltcG9ydCBXYXRjaGVzUGFuZSBmcm9tIFwiLi9wYW5lcy93YXRjaGVzXCI7XG5pbXBvcnQgeyBPVVRQVVRfQVJFQV9VUkksIG9wZW5PclNob3dEb2NrIH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuaW1wb3J0IHR5cGUgTWFya2VyU3RvcmUgZnJvbSBcIi4vc3RvcmUvbWFya2Vyc1wiO1xuXG4vKipcbiAqIENyZWF0ZXMgYW5kIHJlbmRlcnMgYSBSZXN1bHRWaWV3LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdG9yZSAtIEdsb2JhbCBIeWRyb2dlbiBTdG9yZVxuICogQHBhcmFtIHthdG9tJFRleHRFZGl0b3J9IHN0b3JlLmVkaXRvciAtIFRleHRFZGl0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSByZXN1bHQuXG4gKiBAcGFyYW0ge0tlcm5lbH0gc3RvcmUua2VybmVsIC0gS2VybmVsIHRvIHJ1biBjb2RlIGFuZCBhc3NvY2lhdGUgd2l0aCB0aGUgcmVzdWx0LlxuICogQHBhcmFtIHtNYXJrZXJTdG9yZX0gc3RvcmUubWFya2VycyAtIE1hcmtlclN0b3JlIHRoYXQgYmVsb25ncyB0byBgc3RvcmUuZWRpdG9yYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb2RlQmxvY2sgLSBBIEh5ZHJvZ2VuIENlbGwuXG4gKiBAcGFyYW0ge1N0cmluZ30gY29kZUJsb2NrLmNvZGUgLSBTb3VyY2Ugc3RyaW5nIG9mIHRoZSBjZWxsLlxuICogQHBhcmFtIHtOdW1iZXJ9IGNvZGVCbG9jay5yb3cgLSBSb3cgdG8gZGlzcGxheSB0aGUgcmVzdWx0IG9uLlxuICogQHBhcmFtIHtIeWRyb2dlbkNlbGxUeXBlfSBjb2RlQmxvY2suY2VsbFR5cGUgLSBDZWxsIHR5cGUgb2YgdGhlIGNlbGwuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVSZXN1bHQoXG4gIHtcbiAgICBlZGl0b3IsXG4gICAga2VybmVsLFxuICAgIG1hcmtlcnMsXG4gIH06ICRSZWFkT25seTx7XG4gICAgZWRpdG9yOiA/YXRvbSRUZXh0RWRpdG9yLFxuICAgIGtlcm5lbDogP0tlcm5lbCxcbiAgICBtYXJrZXJzOiA/TWFya2VyU3RvcmUsXG4gIH0+LFxuICB7XG4gICAgY29kZSxcbiAgICByb3csXG4gICAgY2VsbFR5cGUsXG4gIH06IHsgY29kZTogc3RyaW5nLCByb3c6IG51bWJlciwgY2VsbFR5cGU6IEh5ZHJvZ2VuQ2VsbFR5cGUgfVxuKSB7XG4gIGlmICghZWRpdG9yIHx8ICFrZXJuZWwgfHwgIW1hcmtlcnMpIHJldHVybjtcblxuICBpZiAoYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKSBpbnN0YW5jZW9mIFdhdGNoZXNQYW5lKSB7XG4gICAga2VybmVsLndhdGNoZXNTdG9yZS5ydW4oKTtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3QgZ2xvYmFsT3V0cHV0U3RvcmUgPVxuICAgIGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLm91dHB1dEFyZWFEZWZhdWx0XCIpIHx8XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZUl0ZW1zKCkuZmluZCgoaXRlbSkgPT4gaXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmUpXG4gICAgICA/IGtlcm5lbC5vdXRwdXRTdG9yZVxuICAgICAgOiBudWxsO1xuXG4gIGlmIChnbG9iYWxPdXRwdXRTdG9yZSkgb3Blbk9yU2hvd0RvY2soT1VUUFVUX0FSRUFfVVJJKTtcblxuICBjb25zdCB7IG91dHB1dFN0b3JlIH0gPSBuZXcgUmVzdWx0VmlldyhcbiAgICBtYXJrZXJzLFxuICAgIGtlcm5lbCxcbiAgICBlZGl0b3IsXG4gICAgcm93LFxuICAgICFnbG9iYWxPdXRwdXRTdG9yZSB8fCBjZWxsVHlwZSA9PSBcIm1hcmtkb3duXCJcbiAgKTtcbiAgaWYgKGNvZGUuc2VhcmNoKC9bXFxTXS8pICE9IC0xKSB7XG4gICAgc3dpdGNoIChjZWxsVHlwZSkge1xuICAgICAgY2FzZSBcIm1hcmtkb3duXCI6XG4gICAgICAgIGlmIChnbG9iYWxPdXRwdXRTdG9yZSlcbiAgICAgICAgICBnbG9iYWxPdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQoY29udmVydE1hcmtkb3duVG9PdXRwdXQoY29kZSkpO1xuICAgICAgICBlbHNlIG91dHB1dFN0b3JlLmFwcGVuZE91dHB1dChjb252ZXJ0TWFya2Rvd25Ub091dHB1dChjb2RlKSk7XG4gICAgICAgIG91dHB1dFN0b3JlLmFwcGVuZE91dHB1dCh7IGRhdGE6IFwib2tcIiwgc3RyZWFtOiBcInN0YXR1c1wiIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgXCJjb2RlY2VsbFwiOlxuICAgICAgICBrZXJuZWwuZXhlY3V0ZShjb2RlLCAocmVzdWx0KSA9PiB7XG4gICAgICAgICAgb3V0cHV0U3RvcmUuYXBwZW5kT3V0cHV0KHJlc3VsdCk7XG4gICAgICAgICAgaWYgKGdsb2JhbE91dHB1dFN0b3JlKSBnbG9iYWxPdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQocmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBvdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQoeyBkYXRhOiBcIm9rXCIsIHN0cmVhbTogXCJzdGF0dXNcIiB9KTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgaW5saW5lIHJlc3VsdHMgZnJvbSBLZXJuZWwgUmVzcG9uc2VzIHdpdGhvdXQgYSB0aWUgdG8gYSBrZXJuZWwuXG4gKlxuICogQHBhcmFtIHtTdG9yZX0gc3RvcmUgLSBIeWRyb2dlbiBzdG9yZVxuICogQHBhcmFtIHthdG9tJFRleHRFZGl0b3J9IHN0b3JlLmVkaXRvciAtIFRoZSBlZGl0b3IgdG8gZGlzcGxheSB0aGUgcmVzdWx0cyBpbi5cbiAqIEBwYXJhbSB7TWFya2VyU3RvcmV9IHN0b3JlLm1hcmtlcnMgLSBTaG91bGQgYWxtb3N0IGFsd2F5cyBiZSB0aGUgZWRpdG9yJ3MgYE1hcmtlclN0b3JlYFxuICogQHBhcmFtIHtPYmplY3R9IGJ1bmRsZSAtIFRoZSBidW5kbGUgdG8gZGlzcGxheS5cbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gYnVuZGxlLm91dHB1dHMgLSBUaGUgS2VybmVsIFJlc3BvbnNlcyB0byBkaXNwbGF5LlxuICogQHBhcmFtIHtOdW1iZXJ9IGJ1bmRsZS5yb3cgLSBUaGUgZWRpdG9yIHJvdyB0byBkaXNwbGF5IHRoZSByZXN1bHRzIG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaW1wb3J0UmVzdWx0KFxuICB7XG4gICAgZWRpdG9yLFxuICAgIG1hcmtlcnMsXG4gIH06IHtcbiAgICBlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IsXG4gICAgbWFya2VyczogP01hcmtlclN0b3JlLFxuICB9LFxuICB7IG91dHB1dHMsIHJvdyB9OiB7IG91dHB1dHM6IEFycmF5PE9iamVjdD4sIHJvdzogbnVtYmVyIH1cbikge1xuICBpZiAoIWVkaXRvciB8fCAhbWFya2VycykgcmV0dXJuO1xuXG4gIGNvbnN0IHsgb3V0cHV0U3RvcmUgfSA9IG5ldyBSZXN1bHRWaWV3KFxuICAgIG1hcmtlcnMsXG4gICAgbnVsbCxcbiAgICBlZGl0b3IsXG4gICAgcm93LFxuICAgIHRydWUgLy8gQWx3YXlzIHNob3cgaW5saW5lXG4gICk7XG5cbiAgZm9yIChsZXQgb3V0cHV0IG9mIG91dHB1dHMpIHtcbiAgICBvdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQob3V0cHV0KTtcbiAgfVxufVxuXG4vKipcbiAqIENsZWFycyBhIFJlc3VsdFZpZXcgb3Igc2VsZWN0aW9uIG9mIFJlc3VsdFZpZXdzLlxuICogVG8gc2VsZWN0IGEgcmVzdWx0IHRvIGNsZWFyLCBwdXQgeW91ciBjdXJzb3Igb24gdGhlIHJvdyBvbiB0aGUgUmVzdWx0Vmlldy5cbiAqIFRvIHNlbGVjdCBtdWx0aXBsZSBSZXN1bHRWaWV3cywgc2VsZWN0IHRleHQgc3RhcnRpbmcgb24gdGhlIHJvdyBvZlxuICogdGhlIGZpcnN0IFJlc3VsdFZpZXcgdG8gcmVtb3ZlIGFsbCB0aGUgd2F5IHRvIHRleHQgb24gdGhlIHJvdyBvZiB0aGVcbiAqIGxhc3QgUmVzdWx0VmlldyB0byByZW1vdmUuICpUaGlzIG11c3QgYmUgb25lIHNlbGVjdGlvbiBhbmRcbiAqIHRoZSBsYXN0IHNlbGVjdGlvbiBtYWRlKlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBzdG9yZSAtIEdsb2JhbCBIeWRyb2dlbiBTdG9yZVxuICogQHBhcmFtIHthdG9tJFRleHRFZGl0b3J9IHN0b3JlLmVkaXRvciAtIFRleHRFZGl0b3IgYXNzb2NpYXRlZCB3aXRoIHRoZSBSZXN1bHRWaWV3LlxuICogQHBhcmFtIHtNYXJrZXJTdG9yZX0gc3RvcmUubWFya2VycyAtIE1hcmtlclN0b3JlIHRoYXQgYmVsb25ncyB0byBgc3RvcmUuZWRpdG9yYCBhbmQgdGhlIFJlc3VsdFZpZXcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclJlc3VsdCh7XG4gIGVkaXRvcixcbiAgbWFya2Vycyxcbn06ICRSZWFkT25seTx7XG4gIGVkaXRvcjogP2F0b20kVGV4dEVkaXRvcixcbiAgbWFya2VyczogP01hcmtlclN0b3JlLFxufT4pIHtcbiAgaWYgKCFlZGl0b3IgfHwgIW1hcmtlcnMpIHJldHVybjtcbiAgY29uc3QgW3N0YXJ0Um93LCBlbmRSb3ddID0gZWRpdG9yLmdldExhc3RTZWxlY3Rpb24oKS5nZXRCdWZmZXJSb3dSYW5nZSgpO1xuXG4gIGZvciAobGV0IHJvdyA9IHN0YXJ0Um93OyByb3cgPD0gZW5kUm93OyByb3crKykge1xuICAgIG1hcmtlcnMuY2xlYXJPblJvdyhyb3cpO1xuICB9XG59XG5cbi8qKlxuICogQ2xlYXJzIGFsbCBSZXN1bHRWaWV3cyBvZiBhIE1hcmtlclN0b3JlLlxuICogSXQgYWxzbyBjbGVhcnMgdGhlIGN1cnJlY3Qga2VybmVsIHJlc3VsdHMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHN0b3JlIC0gR2xvYmFsIEh5ZHJvZ2VuIFN0b3JlXG4gKiBAcGFyYW0ge0tlcm5lbH0gc3RvcmUua2VybmVsIC0gS2VybmVsIHRvIGNsZWFyIG91dHB1dHMuXG4gKiBAcGFyYW0ge01hcmtlclN0b3JlfSBzdG9yZS5tYXJrZXJzIC0gTWFya2VyU3RvcmUgdG8gY2xlYXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhclJlc3VsdHMoe1xuICBrZXJuZWwsXG4gIG1hcmtlcnMsXG59OiAkUmVhZE9ubHk8e1xuICBrZXJuZWw6ID9LZXJuZWwsXG4gIG1hcmtlcnM6ID9NYXJrZXJTdG9yZSxcbn0+KSB7XG4gIGlmIChtYXJrZXJzKSBtYXJrZXJzLmNsZWFyKCk7XG4gIGlmICgha2VybmVsKSByZXR1cm47XG4gIGtlcm5lbC5vdXRwdXRTdG9yZS5jbGVhcigpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIHJhdyBtYXJrZG93biB0byBhIGRpc3BsYXlfZGF0YSBLZXJuZWwgUmVzcG9uc2UuXG4gKiBUaGlzIGFsbG93cyBmb3IgaHlkcm9nZW4gdG8gZGlzcGxheSBtYXJrZG93biB0ZXh0IGFzIGlmIGlzIHdhcyBhbnkgbm9ybWFsXG4gKiByZXN1bHQgdGhhdCBjYW1lIGJhY2sgZnJvbSB0aGUga2VybmVsLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtYXJrZG93blN0cmluZyAtIEEgc3RyaW5nIG9mIHJhdyBtYXJrZG93biBjb2RlLlxuICogQHJldHVybiB7T2JqZWN0fSBBIGZha2UgZGlzcGxheV9kYXRhIEtlcm5lbCBSZXNwb25zZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRNYXJrZG93blRvT3V0cHV0KG1hcmtkb3duU3RyaW5nOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHtcbiAgICBvdXRwdXRfdHlwZTogXCJkaXNwbGF5X2RhdGFcIixcbiAgICBkYXRhOiB7XG4gICAgICBcInRleHQvbWFya2Rvd25cIjogbWFya2Rvd25TdHJpbmcsXG4gICAgfSxcbiAgICBtZXRhZGF0YToge30sXG4gIH07XG59XG4iXX0=