Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _atom = require("atom");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _mobx = require("mobx");

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _panesInspector = require("./panes/inspector");

var _panesInspector2 = _interopRequireDefault(_panesInspector);

var _panesWatches = require("./panes/watches");

var _panesWatches2 = _interopRequireDefault(_panesWatches);

var _panesOutputArea = require("./panes/output-area");

var _panesOutputArea2 = _interopRequireDefault(_panesOutputArea);

var _panesKernelMonitor = require("./panes/kernel-monitor");

var _panesKernelMonitor2 = _interopRequireDefault(_panesKernelMonitor);

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _kernel = require("./kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _wsKernelPicker = require("./ws-kernel-picker");

var _wsKernelPicker2 = _interopRequireDefault(_wsKernelPicker);

var _existingKernelPicker = require("./existing-kernel-picker");

var _existingKernelPicker2 = _interopRequireDefault(_existingKernelPicker);

var _pluginApiHydrogenProvider = require("./plugin-api/hydrogen-provider");

var _pluginApiHydrogenProvider2 = _interopRequireDefault(_pluginApiHydrogenProvider);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _kernelManager = require("./kernel-manager");

var _kernelManager2 = _interopRequireDefault(_kernelManager);

var _services = require("./services");

var _services2 = _interopRequireDefault(_services);

var _commands = require("./commands");

var commands = _interopRequireWildcard(_commands);

var _codeManager = require("./code-manager");

var codeManager = _interopRequireWildcard(_codeManager);

var _result = require("./result");

var result = _interopRequireWildcard(_result);

var _utils = require("./utils");

var _exportNotebook = require("./export-notebook");

var _exportNotebook2 = _interopRequireDefault(_exportNotebook);

var _importNotebook = require("./import-notebook");

var Hydrogen = {
  config: _config2["default"].schema,

  activate: function activate() {
    var _this = this;

    this.emitter = new _atom.Emitter();

    var skipLanguageMappingsChange = false;
    _store2["default"].subscriptions.add(atom.config.onDidChange("Hydrogen.languageMappings", function (_ref) {
      var newValue = _ref.newValue;
      var oldValue = _ref.oldValue;

      if (skipLanguageMappingsChange) {
        skipLanguageMappingsChange = false;
        return;
      }

      if (_store2["default"].runningKernels.length != 0) {
        skipLanguageMappingsChange = true;

        atom.config.set("Hydrogen.languageMappings", oldValue);

        atom.notifications.addError("Hydrogen", {
          description: "`languageMappings` cannot be updated while kernels are running",
          dismissable: false
        });
      }
    }));

    _store2["default"].subscriptions.add(atom.config.observe("Hydrogen.statusBarDisable", function (newValue) {
      _store2["default"].setConfigValue("Hydrogen.statusBarDisable", Boolean(newValue));
    }), atom.config.observe("Hydrogen.statusBarKernelInfo", function (newValue) {
      _store2["default"].setConfigValue("Hydrogen.statusBarKernelInfo", Boolean(newValue));
    }));

    _store2["default"].subscriptions.add(atom.commands.add("atom-text-editor:not([mini])", {
      "hydrogen:run": function hydrogenRun() {
        return _this.run();
      },
      "hydrogen:run-all": function hydrogenRunAll() {
        return _this.runAll();
      },
      "hydrogen:run-all-above": function hydrogenRunAllAbove() {
        return _this.runAllAbove();
      },
      "hydrogen:run-and-move-down": function hydrogenRunAndMoveDown() {
        return _this.run(true);
      },
      "hydrogen:run-cell": function hydrogenRunCell() {
        return _this.runCell();
      },
      "hydrogen:run-cell-and-move-down": function hydrogenRunCellAndMoveDown() {
        return _this.runCell(true);
      },
      "hydrogen:toggle-watches": function hydrogenToggleWatches() {
        return atom.workspace.toggle(_utils.WATCHES_URI);
      },
      "hydrogen:toggle-output-area": function hydrogenToggleOutputArea() {
        return commands.toggleOutputMode();
      },
      "hydrogen:toggle-kernel-monitor": _asyncToGenerator(function* () {
        var lastItem = atom.workspace.getActivePaneItem();
        var lastPane = atom.workspace.paneForItem(lastItem);
        yield atom.workspace.toggle(_utils.KERNEL_MONITOR_URI);
        if (lastPane) lastPane.activate();
      }),
      "hydrogen:start-local-kernel": function hydrogenStartLocalKernel() {
        return _this.startZMQKernel();
      },
      "hydrogen:connect-to-remote-kernel": function hydrogenConnectToRemoteKernel() {
        return _this.connectToWSKernel();
      },
      "hydrogen:connect-to-existing-kernel": function hydrogenConnectToExistingKernel() {
        return _this.connectToExistingKernel();
      },
      "hydrogen:add-watch": function hydrogenAddWatch() {
        if (_store2["default"].kernel) {
          _store2["default"].kernel.watchesStore.addWatchFromEditor(_store2["default"].editor);
          (0, _utils.openOrShowDock)(_utils.WATCHES_URI);
        }
      },
      "hydrogen:remove-watch": function hydrogenRemoveWatch() {
        if (_store2["default"].kernel) {
          _store2["default"].kernel.watchesStore.removeWatch();
          (0, _utils.openOrShowDock)(_utils.WATCHES_URI);
        }
      },
      "hydrogen:update-kernels": function hydrogenUpdateKernels() {
        return _kernelManager2["default"].updateKernelSpecs();
      },
      "hydrogen:toggle-inspector": function hydrogenToggleInspector() {
        return commands.toggleInspector(_store2["default"]);
      },
      "hydrogen:interrupt-kernel": function hydrogenInterruptKernel() {
        return _this.handleKernelCommand({ command: "interrupt-kernel" }, _store2["default"]);
      },
      "hydrogen:restart-kernel": function hydrogenRestartKernel() {
        return _this.handleKernelCommand({ command: "restart-kernel" }, _store2["default"]);
      },
      "hydrogen:shutdown-kernel": function hydrogenShutdownKernel() {
        return _this.handleKernelCommand({ command: "shutdown-kernel" }, _store2["default"]);
      },
      "hydrogen:clear-result": function hydrogenClearResult() {
        return result.clearResult(_store2["default"]);
      },
      "hydrogen:export-notebook": function hydrogenExportNotebook() {
        return (0, _exportNotebook2["default"])();
      },
      "hydrogen:fold-current-cell": function hydrogenFoldCurrentCell() {
        return _this.foldCurrentCell();
      },
      "hydrogen:fold-all-but-current-cell": function hydrogenFoldAllButCurrentCell() {
        return _this.foldAllButCurrentCell();
      },
      "hydrogen:clear-results": function hydrogenClearResults() {
        return result.clearResults(_store2["default"]);
      }
    }));

    _store2["default"].subscriptions.add(atom.commands.add("atom-workspace", {
      "hydrogen:import-notebook": _importNotebook.importNotebook
    }));

    if (atom.inDevMode()) {
      _store2["default"].subscriptions.add(atom.commands.add("atom-workspace", {
        "hydrogen:hot-reload-package": function hydrogenHotReloadPackage() {
          return (0, _utils.hotReloadPackage)();
        }
      }));
    }

    _store2["default"].subscriptions.add(atom.workspace.observeActiveTextEditor(function (editor) {
      _store2["default"].updateEditor(editor);
    }));

    _store2["default"].subscriptions.add(atom.workspace.observeTextEditors(function (editor) {
      var editorSubscriptions = new _atom.CompositeDisposable();
      editorSubscriptions.add(editor.onDidChangeGrammar(function () {
        _store2["default"].setGrammar(editor);
      }));

      if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
        editorSubscriptions.add(editor.onDidChangeCursorPosition(_lodash2["default"].debounce(function () {
          _store2["default"].setGrammar(editor);
        }, 75)));
      }

      editorSubscriptions.add(editor.onDidDestroy(function () {
        editorSubscriptions.dispose();
      }));

      editorSubscriptions.add(editor.onDidChangeTitle(function (newTitle) {
        return _store2["default"].forceEditorUpdate();
      }));

      _store2["default"].subscriptions.add(editorSubscriptions);
    }));

    this.hydrogenProvider = null;

    _store2["default"].subscriptions.add(atom.workspace.addOpener(function (uri) {
      switch (uri) {
        case _utils.INSPECTOR_URI:
          return new _panesInspector2["default"](_store2["default"]);
        case _utils.WATCHES_URI:
          return new _panesWatches2["default"](_store2["default"]);
        case _utils.OUTPUT_AREA_URI:
          return new _panesOutputArea2["default"](_store2["default"]);
        case _utils.KERNEL_MONITOR_URI:
          return new _panesKernelMonitor2["default"](_store2["default"]);
      }
    }));
    _store2["default"].subscriptions.add(atom.workspace.addOpener(_importNotebook.ipynbOpener));

    _store2["default"].subscriptions.add(
    // Destroy any Panes when the package is deactivated.
    new _atom.Disposable(function () {
      atom.workspace.getPaneItems().forEach(function (item) {
        if (item instanceof _panesInspector2["default"] || item instanceof _panesWatches2["default"] || item instanceof _panesOutputArea2["default"] || item instanceof _panesKernelMonitor2["default"]) {
          item.destroy();
        }
      });
    }));

    (0, _mobx.autorun)(function () {
      _this.emitter.emit("did-change-kernel", _store2["default"].kernel);
    });
  },

  deactivate: function deactivate() {
    _store2["default"].dispose();
  },

  /*-------------- Service Providers --------------*/
  provideHydrogen: function provideHydrogen() {
    if (!this.hydrogenProvider) {
      this.hydrogenProvider = new _pluginApiHydrogenProvider2["default"](this);
    }

    return this.hydrogenProvider;
  },

  provideAutocompleteResults: function provideAutocompleteResults() {
    return _services2["default"].provided.autocomplete.provideAutocompleteResults(_store2["default"]);
  },
  /*-----------------------------------------------*/

  /*-------------- Service Consumers --------------*/
  consumeAutocompleteWatchEditor: function consumeAutocompleteWatchEditor(watchEditor) {
    return _services2["default"].consumed.autocomplete.consume(_store2["default"], watchEditor);
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    return _services2["default"].consumed.statusBar.addStatusBar(_store2["default"], statusBar, this.handleKernelCommand.bind(this));
  },
  /*-----------------------------------------------*/

  connectToExistingKernel: function connectToExistingKernel() {
    if (!this.existingKernelPicker) {
      this.existingKernelPicker = new _existingKernelPicker2["default"]();
    }
    this.existingKernelPicker.toggle();
  },

  handleKernelCommand: function handleKernelCommand(_ref2, _ref3) {
    var command = _ref2.command;
    var payload = _ref2.payload;
    var kernel = _ref3.kernel;
    var markers = _ref3.markers;
    return (function () {
      (0, _utils.log)("handleKernelCommand:", arguments);

      if (!kernel) {
        var message = "No running kernel for grammar or editor found";
        atom.notifications.addError(message);
        return;
      }

      if (command === "interrupt-kernel") {
        kernel.interrupt();
      } else if (command === "restart-kernel") {
        kernel.restart();
      } else if (command === "shutdown-kernel") {
        if (markers) markers.clear();
        // Note that destroy alone does not shut down a WSKernel
        kernel.shutdown();
        kernel.destroy();
      } else if (command === "rename-kernel" && kernel.transport instanceof _wsKernel2["default"]) {
        kernel.transport.promptRename();
      } else if (command === "disconnect-kernel") {
        if (markers) markers.clear();
        kernel.destroy();
      }
    }).apply(this, arguments);
  },

  run: function run() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var editor = _store2["default"].editor;
    if (!editor) return;
    // https://github.com/nteract/hydrogen/issues/1452
    atom.commands.dispatch(editor.element, "autocomplete-plus:cancel");
    var codeBlock = codeManager.findCodeBlock(editor);
    if (!codeBlock) {
      return;
    }

    var codeNullable = codeBlock.code;
    if (codeNullable === null) return;

    var row = codeBlock.row;

    var cellType = codeManager.getMetadataForRow(editor, new _atom.Point(row, 0));

    var code = cellType === "markdown" ? codeManager.removeCommentsMarkdownCell(editor, codeNullable) : codeNullable;

    if (moveDown === true) {
      codeManager.moveDown(editor, row);
    }

    this.checkForKernel(_store2["default"], function (kernel) {
      result.createResult(_store2["default"], { code: code, row: row, cellType: cellType });
    });
  },

  runAll: function runAll(breakpoints) {
    var _this2 = this;

    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var grammar = _store2["default"].grammar;
    var filePath = _store2["default"].filePath;

    if (!editor || !grammar || !filePath) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All" is not supported for this file type!');
      return;
    }

    if (editor && kernel) {
      this._runAll(editor, kernel, breakpoints);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (kernel) {
      _this2._runAll(editor, kernel, breakpoints);
    });
  },

  _runAll: function _runAll(editor, kernel, breakpoints) {
    var _this3 = this;

    var cells = codeManager.getCells(editor, breakpoints);

    var _loop = function (cell) {
      var start = cell.start;
      var end = cell.end;

      var codeNullable = codeManager.getTextInRange(editor, start, end);
      if (codeNullable === null) return "continue";

      var row = codeManager.escapeBlankRows(editor, start.row, end.row == editor.getLastBufferRow() ? end.row : end.row - 1);
      var cellType = codeManager.getMetadataForRow(editor, start);

      var code = cellType === "markdown" ? codeManager.removeCommentsMarkdownCell(editor, codeNullable) : codeNullable;

      _this3.checkForKernel(_store2["default"], function (kernel) {
        result.createResult(_store2["default"], { code: code, row: row, cellType: cellType });
      });
    };

    for (var cell of cells) {
      var _ret = _loop(cell);

      if (_ret === "continue") continue;
    }
  },

  runAllAbove: function runAllAbove() {
    var _this4 = this;

    var editor = _store2["default"].editor;
    var kernel = _store2["default"].kernel;
    var grammar = _store2["default"].grammar;
    var filePath = _store2["default"].filePath;

    if (!editor || !grammar || !filePath) return;
    if ((0, _utils.isMultilanguageGrammar)(editor.getGrammar())) {
      atom.notifications.addError('"Run All Above" is not supported for this file type!');
      return;
    }

    if (editor && kernel) {
      this._runAllAbove(editor, kernel);
      return;
    }

    _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (kernel) {
      _this4._runAllAbove(editor, kernel);
    });
  },

  _runAllAbove: function _runAllAbove(editor, kernel) {
    var _this5 = this;

    var cursor = editor.getCursorBufferPosition();
    cursor.column = editor.getBuffer().lineLengthForRow(cursor.row);
    var breakpoints = codeManager.getBreakpoints(editor);
    breakpoints.push(cursor);
    var cells = codeManager.getCells(editor, breakpoints);

    var _loop2 = function (cell) {
      var start = cell.start;
      var end = cell.end;

      var codeNullable = codeManager.getTextInRange(editor, start, end);

      var row = codeManager.escapeBlankRows(editor, start.row, end.row == editor.getLastBufferRow() ? end.row : end.row - 1);
      var cellType = codeManager.getMetadataForRow(editor, start);

      if (codeNullable !== null) {
        (function () {
          var code = cellType === "markdown" ? codeManager.removeCommentsMarkdownCell(editor, codeNullable) : codeNullable;

          _this5.checkForKernel(_store2["default"], function (kernel) {
            result.createResult(_store2["default"], { code: code, row: row, cellType: cellType });
          });
        })();
      }

      if (cell.containsPoint(cursor)) {
        return "break";
      }
    };

    for (var cell of cells) {
      var _ret2 = _loop2(cell);

      if (_ret2 === "break") break;
    }
  },

  runCell: function runCell() {
    var moveDown = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

    var editor = _store2["default"].editor;
    if (!editor) return;
    // https://github.com/nteract/hydrogen/issues/1452
    atom.commands.dispatch(editor.element, "autocomplete-plus:cancel");

    var _codeManager$getCurrentCell = codeManager.getCurrentCell(editor);

    var start = _codeManager$getCurrentCell.start;
    var end = _codeManager$getCurrentCell.end;

    var codeNullable = codeManager.getTextInRange(editor, start, end);
    if (codeNullable === null) return;

    var row = codeManager.escapeBlankRows(editor, start.row, end.row == editor.getLastBufferRow() ? end.row : end.row - 1);
    var cellType = codeManager.getMetadataForRow(editor, start);

    var code = cellType === "markdown" ? codeManager.removeCommentsMarkdownCell(editor, codeNullable) : codeNullable;

    if (moveDown === true) {
      codeManager.moveDown(editor, row);
    }

    this.checkForKernel(_store2["default"], function (kernel) {
      result.createResult(_store2["default"], { code: code, row: row, cellType: cellType });
    });
  },

  foldCurrentCell: function foldCurrentCell() {
    var editor = _store2["default"].editor;
    if (!editor) return;
    codeManager.foldCurrentCell(editor);
  },

  foldAllButCurrentCell: function foldAllButCurrentCell() {
    var editor = _store2["default"].editor;
    if (!editor) return;
    codeManager.foldAllButCurrentCell(editor);
  },

  startZMQKernel: function startZMQKernel() {
    var _this6 = this;

    _kernelManager2["default"].getAllKernelSpecsForGrammar(_store2["default"].grammar).then(function (kernelSpecs) {
      if (_this6.kernelPicker) {
        _this6.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        _this6.kernelPicker = new _kernelPicker2["default"](kernelSpecs);

        _this6.kernelPicker.onConfirmed = function (kernelSpec) {
          var editor = _store2["default"].editor;
          var grammar = _store2["default"].grammar;
          var filePath = _store2["default"].filePath;
          var markers = _store2["default"].markers;

          if (!editor || !grammar || !filePath || !markers) return;
          markers.clear();

          _kernelManager2["default"].startKernel(kernelSpec, grammar, editor, filePath);
        };
      }

      _this6.kernelPicker.toggle();
    });
  },

  connectToWSKernel: function connectToWSKernel() {
    if (!this.wsKernelPicker) {
      this.wsKernelPicker = new _wsKernelPicker2["default"](function (transport) {
        var kernel = new _kernel2["default"](transport);
        var editor = _store2["default"].editor;
        var grammar = _store2["default"].grammar;
        var filePath = _store2["default"].filePath;
        var markers = _store2["default"].markers;

        if (!editor || !grammar || !filePath || !markers) return;
        markers.clear();

        if (kernel.transport instanceof _zmqKernel2["default"]) kernel.destroy();

        _store2["default"].newKernel(kernel, filePath, editor, grammar);
      });
    }

    this.wsKernelPicker.toggle(function (kernelSpec) {
      return (0, _utils.kernelSpecProvidesGrammar)(kernelSpec, _store2["default"].grammar);
    });
  },

  // Accepts store as an arg
  checkForKernel: function checkForKernel(_ref4, callback) {
    var editor = _ref4.editor;
    var grammar = _ref4.grammar;
    var filePath = _ref4.filePath;
    var kernel = _ref4.kernel;
    return (function () {
      if (!filePath || !grammar) {
        return atom.notifications.addError("The language grammar must be set in order to start a kernel. The easiest way to do this is to save the file.");
      }

      if (kernel) {
        callback(kernel);
        return;
      }

      _kernelManager2["default"].startKernelFor(grammar, editor, filePath, function (newKernel) {
        return callback(newKernel);
      });
    })();
  }
};

exports["default"] = Hydrogen;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7b0JBUU8sTUFBTTs7c0JBRUMsUUFBUTs7OztvQkFDRSxNQUFNOztxQkFDWixPQUFPOzs7OzhCQUVDLG1CQUFtQjs7Ozs0QkFDckIsaUJBQWlCOzs7OytCQUNsQixxQkFBcUI7Ozs7a0NBQ2Qsd0JBQXdCOzs7O3NCQUNuQyxVQUFVOzs7O3lCQUNQLGNBQWM7Ozs7d0JBQ2YsYUFBYTs7OztzQkFDZixVQUFVOzs7OzRCQUNKLGlCQUFpQjs7Ozs4QkFDZixvQkFBb0I7Ozs7b0NBQ2QsMEJBQTBCOzs7O3lDQUM5QixnQ0FBZ0M7Ozs7cUJBRTNDLFNBQVM7Ozs7NkJBQ0Qsa0JBQWtCOzs7O3dCQUN2QixZQUFZOzs7O3dCQUNQLFlBQVk7O0lBQTFCLFFBQVE7OzJCQUNTLGdCQUFnQjs7SUFBakMsV0FBVzs7c0JBQ0MsVUFBVTs7SUFBdEIsTUFBTTs7cUJBZVgsU0FBUzs7OEJBRVcsbUJBQW1COzs7OzhCQUNGLG1CQUFtQjs7QUFFL0QsSUFBTSxRQUFRLEdBQUc7QUFDZixRQUFNLEVBQUUsb0JBQU8sTUFBTTs7QUFFckIsVUFBUSxFQUFBLG9CQUFHOzs7QUFDVCxRQUFJLENBQUMsT0FBTyxHQUFHLG1CQUFhLENBQUM7O0FBRTdCLFFBQUksMEJBQTBCLEdBQUcsS0FBSyxDQUFDO0FBQ3ZDLHVCQUFNLGFBQWEsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUNyQiwyQkFBMkIsRUFDM0IsVUFBQyxJQUFzQixFQUFLO1VBQXpCLFFBQVEsR0FBVixJQUFzQixDQUFwQixRQUFRO1VBQUUsUUFBUSxHQUFwQixJQUFzQixDQUFWLFFBQVE7O0FBQ25CLFVBQUksMEJBQTBCLEVBQUU7QUFDOUIsa0NBQTBCLEdBQUcsS0FBSyxDQUFDO0FBQ25DLGVBQU87T0FDUjs7QUFFRCxVQUFJLG1CQUFNLGNB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YSxRQUFRIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IHtcbiAgRW1pdHRlcixcbiAgQ29tcG9zaXRlRGlzcG9zYWJsZSxcbiAgRGlzcG9zYWJsZSxcbiAgUG9pbnQsXG4gIFRleHRFZGl0b3IsXG59IGZyb20gXCJhdG9tXCI7XG5cbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7IGF1dG9ydW4gfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuXG5pbXBvcnQgSW5zcGVjdG9yUGFuZSBmcm9tIFwiLi9wYW5lcy9pbnNwZWN0b3JcIjtcbmltcG9ydCBXYXRjaGVzUGFuZSBmcm9tIFwiLi9wYW5lcy93YXRjaGVzXCI7XG5pbXBvcnQgT3V0cHV0UGFuZSBmcm9tIFwiLi9wYW5lcy9vdXRwdXQtYXJlYVwiO1xuaW1wb3J0IEtlcm5lbE1vbml0b3JQYW5lIGZyb20gXCIuL3BhbmVzL2tlcm5lbC1tb25pdG9yXCI7XG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IFpNUUtlcm5lbCBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5pbXBvcnQgV1NLZXJuZWwgZnJvbSBcIi4vd3Mta2VybmVsXCI7XG5pbXBvcnQgS2VybmVsIGZyb20gXCIuL2tlcm5lbFwiO1xuaW1wb3J0IEtlcm5lbFBpY2tlciBmcm9tIFwiLi9rZXJuZWwtcGlja2VyXCI7XG5pbXBvcnQgV1NLZXJuZWxQaWNrZXIgZnJvbSBcIi4vd3Mta2VybmVsLXBpY2tlclwiO1xuaW1wb3J0IEV4aXN0aW5nS2VybmVsUGlja2VyIGZyb20gXCIuL2V4aXN0aW5nLWtlcm5lbC1waWNrZXJcIjtcbmltcG9ydCBIeWRyb2dlblByb3ZpZGVyIGZyb20gXCIuL3BsdWdpbi1hcGkvaHlkcm9nZW4tcHJvdmlkZXJcIjtcblxuaW1wb3J0IHN0b3JlIGZyb20gXCIuL3N0b3JlXCI7XG5pbXBvcnQga2VybmVsTWFuYWdlciBmcm9tIFwiLi9rZXJuZWwtbWFuYWdlclwiO1xuaW1wb3J0IHNlcnZpY2VzIGZyb20gXCIuL3NlcnZpY2VzXCI7XG5pbXBvcnQgKiBhcyBjb21tYW5kcyBmcm9tIFwiLi9jb21tYW5kc1wiO1xuaW1wb3J0ICogYXMgY29kZU1hbmFnZXIgZnJvbSBcIi4vY29kZS1tYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyByZXN1bHQgZnJvbSBcIi4vcmVzdWx0XCI7XG5cbmltcG9ydCB0eXBlIE1hcmtlclN0b3JlIGZyb20gXCIuL3N0b3JlL21hcmtlcnNcIjtcblxuaW1wb3J0IHtcbiAgbG9nLFxuICByZWFjdEZhY3RvcnksXG4gIGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIsXG4gIElOU1BFQ1RPUl9VUkksXG4gIFdBVENIRVNfVVJJLFxuICBPVVRQVVRfQVJFQV9VUkksXG4gIEtFUk5FTF9NT05JVE9SX1VSSSxcbiAgaG90UmVsb2FkUGFja2FnZSxcbiAgb3Blbk9yU2hvd0RvY2ssXG4gIGtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIsXG59IGZyb20gXCIuL3V0aWxzXCI7XG5cbmltcG9ydCBleHBvcnROb3RlYm9vayBmcm9tIFwiLi9leHBvcnQtbm90ZWJvb2tcIjtcbmltcG9ydCB7IGltcG9ydE5vdGVib29rLCBpcHluYk9wZW5lciB9IGZyb20gXCIuL2ltcG9ydC1ub3RlYm9va1wiO1xuXG5jb25zdCBIeWRyb2dlbiA9IHtcbiAgY29uZmlnOiBDb25maWcuc2NoZW1hLFxuXG4gIGFjdGl2YXRlKCkge1xuICAgIHRoaXMuZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBsZXQgc2tpcExhbmd1YWdlTWFwcGluZ3NDaGFuZ2UgPSBmYWxzZTtcbiAgICBzdG9yZS5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKFxuICAgICAgICBcIkh5ZHJvZ2VuLmxhbmd1YWdlTWFwcGluZ3NcIixcbiAgICAgICAgKHsgbmV3VmFsdWUsIG9sZFZhbHVlIH0pID0+IHtcbiAgICAgICAgICBpZiAoc2tpcExhbmd1YWdlTWFwcGluZ3NDaGFuZ2UpIHtcbiAgICAgICAgICAgIHNraXBMYW5ndWFnZU1hcHBpbmdzQ2hhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHN0b3JlLnJ1bm5pbmdLZXJuZWxzLmxlbmd0aCAhPSAwKSB7XG4gICAgICAgICAgICBza2lwTGFuZ3VhZ2VNYXBwaW5nc0NoYW5nZSA9IHRydWU7XG5cbiAgICAgICAgICAgIGF0b20uY29uZmlnLnNldChcIkh5ZHJvZ2VuLmxhbmd1YWdlTWFwcGluZ3NcIiwgb2xkVmFsdWUpO1xuXG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJIeWRyb2dlblwiLCB7XG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgIFwiYGxhbmd1YWdlTWFwcGluZ3NgIGNhbm5vdCBiZSB1cGRhdGVkIHdoaWxlIGtlcm5lbHMgYXJlIHJ1bm5pbmdcIixcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IGZhbHNlLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIkh5ZHJvZ2VuLnN0YXR1c0JhckRpc2FibGVcIiwgKG5ld1ZhbHVlKSA9PiB7XG4gICAgICAgIHN0b3JlLnNldENvbmZpZ1ZhbHVlKFwiSHlkcm9nZW4uc3RhdHVzQmFyRGlzYWJsZVwiLCBCb29sZWFuKG5ld1ZhbHVlKSk7XG4gICAgICB9KSxcbiAgICAgIGF0b20uY29uZmlnLm9ic2VydmUoXCJIeWRyb2dlbi5zdGF0dXNCYXJLZXJuZWxJbmZvXCIsIChuZXdWYWx1ZSkgPT4ge1xuICAgICAgICBzdG9yZS5zZXRDb25maWdWYWx1ZShcIkh5ZHJvZ2VuLnN0YXR1c0Jhcktlcm5lbEluZm9cIiwgQm9vbGVhbihuZXdWYWx1ZSkpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20tdGV4dC1lZGl0b3I6bm90KFttaW5pXSlcIiwge1xuICAgICAgICBcImh5ZHJvZ2VuOnJ1blwiOiAoKSA9PiB0aGlzLnJ1bigpLFxuICAgICAgICBcImh5ZHJvZ2VuOnJ1bi1hbGxcIjogKCkgPT4gdGhpcy5ydW5BbGwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tYWxsLWFib3ZlXCI6ICgpID0+IHRoaXMucnVuQWxsQWJvdmUoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tYW5kLW1vdmUtZG93blwiOiAoKSA9PiB0aGlzLnJ1bih0cnVlKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tY2VsbFwiOiAoKSA9PiB0aGlzLnJ1bkNlbGwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpydW4tY2VsbC1hbmQtbW92ZS1kb3duXCI6ICgpID0+IHRoaXMucnVuQ2VsbCh0cnVlKSxcbiAgICAgICAgXCJoeWRyb2dlbjp0b2dnbGUtd2F0Y2hlc1wiOiAoKSA9PiBhdG9tLndvcmtzcGFjZS50b2dnbGUoV0FUQ0hFU19VUkkpLFxuICAgICAgICBcImh5ZHJvZ2VuOnRvZ2dsZS1vdXRwdXQtYXJlYVwiOiAoKSA9PiBjb21tYW5kcy50b2dnbGVPdXRwdXRNb2RlKCksXG4gICAgICAgIFwiaHlkcm9nZW46dG9nZ2xlLWtlcm5lbC1tb25pdG9yXCI6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICBjb25zdCBsYXN0SXRlbSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgICAgICAgY29uc3QgbGFzdFBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbShsYXN0SXRlbSk7XG4gICAgICAgICAgYXdhaXQgYXRvbS53b3Jrc3BhY2UudG9nZ2xlKEtFUk5FTF9NT05JVE9SX1VSSSk7XG4gICAgICAgICAgaWYgKGxhc3RQYW5lKSBsYXN0UGFuZS5hY3RpdmF0ZSgpO1xuICAgICAgICB9LFxuICAgICAgICBcImh5ZHJvZ2VuOnN0YXJ0LWxvY2FsLWtlcm5lbFwiOiAoKSA9PiB0aGlzLnN0YXJ0Wk1RS2VybmVsKCksXG4gICAgICAgIFwiaHlkcm9nZW46Y29ubmVjdC10by1yZW1vdGUta2VybmVsXCI6ICgpID0+IHRoaXMuY29ubmVjdFRvV1NLZXJuZWwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjpjb25uZWN0LXRvLWV4aXN0aW5nLWtlcm5lbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuY29ubmVjdFRvRXhpc3RpbmdLZXJuZWwoKSxcbiAgICAgICAgXCJoeWRyb2dlbjphZGQtd2F0Y2hcIjogKCkgPT4ge1xuICAgICAgICAgIGlmIChzdG9yZS5rZXJuZWwpIHtcbiAgICAgICAgICAgIHN0b3JlLmtlcm5lbC53YXRjaGVzU3RvcmUuYWRkV2F0Y2hGcm9tRWRpdG9yKHN0b3JlLmVkaXRvcik7XG4gICAgICAgICAgICBvcGVuT3JTaG93RG9jayhXQVRDSEVTX1VSSSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcImh5ZHJvZ2VuOnJlbW92ZS13YXRjaFwiOiAoKSA9PiB7XG4gICAgICAgICAgaWYgKHN0b3JlLmtlcm5lbCkge1xuICAgICAgICAgICAgc3RvcmUua2VybmVsLndhdGNoZXNTdG9yZS5yZW1vdmVXYXRjaCgpO1xuICAgICAgICAgICAgb3Blbk9yU2hvd0RvY2soV0FUQ0hFU19VUkkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJoeWRyb2dlbjp1cGRhdGUta2VybmVsc1wiOiAoKSA9PiBrZXJuZWxNYW5hZ2VyLnVwZGF0ZUtlcm5lbFNwZWNzKCksXG4gICAgICAgIFwiaHlkcm9nZW46dG9nZ2xlLWluc3BlY3RvclwiOiAoKSA9PiBjb21tYW5kcy50b2dnbGVJbnNwZWN0b3Ioc3RvcmUpLFxuICAgICAgICBcImh5ZHJvZ2VuOmludGVycnVwdC1rZXJuZWxcIjogKCkgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiBcImludGVycnVwdC1rZXJuZWxcIiB9LCBzdG9yZSksXG4gICAgICAgIFwiaHlkcm9nZW46cmVzdGFydC1rZXJuZWxcIjogKCkgPT5cbiAgICAgICAgICB0aGlzLmhhbmRsZUtlcm5lbENvbW1hbmQoeyBjb21tYW5kOiBcInJlc3RhcnQta2VybmVsXCIgfSwgc3RvcmUpLFxuICAgICAgICBcImh5ZHJvZ2VuOnNodXRkb3duLWtlcm5lbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZCh7IGNvbW1hbmQ6IFwic2h1dGRvd24ta2VybmVsXCIgfSwgc3RvcmUpLFxuICAgICAgICBcImh5ZHJvZ2VuOmNsZWFyLXJlc3VsdFwiOiAoKSA9PiByZXN1bHQuY2xlYXJSZXN1bHQoc3RvcmUpLFxuICAgICAgICBcImh5ZHJvZ2VuOmV4cG9ydC1ub3RlYm9va1wiOiAoKSA9PiBleHBvcnROb3RlYm9vaygpLFxuICAgICAgICBcImh5ZHJvZ2VuOmZvbGQtY3VycmVudC1jZWxsXCI6ICgpID0+IHRoaXMuZm9sZEN1cnJlbnRDZWxsKCksXG4gICAgICAgIFwiaHlkcm9nZW46Zm9sZC1hbGwtYnV0LWN1cnJlbnQtY2VsbFwiOiAoKSA9PlxuICAgICAgICAgIHRoaXMuZm9sZEFsbEJ1dEN1cnJlbnRDZWxsKCksXG4gICAgICAgIFwiaHlkcm9nZW46Y2xlYXItcmVzdWx0c1wiOiAoKSA9PiByZXN1bHQuY2xlYXJSZXN1bHRzKHN0b3JlKSxcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoXCJhdG9tLXdvcmtzcGFjZVwiLCB7XG4gICAgICAgIFwiaHlkcm9nZW46aW1wb3J0LW5vdGVib29rXCI6IGltcG9ydE5vdGVib29rLFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgaWYgKGF0b20uaW5EZXZNb2RlKCkpIHtcbiAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICBhdG9tLmNvbW1hbmRzLmFkZChcImF0b20td29ya3NwYWNlXCIsIHtcbiAgICAgICAgICBcImh5ZHJvZ2VuOmhvdC1yZWxvYWQtcGFja2FnZVwiOiAoKSA9PiBob3RSZWxvYWRQYWNrYWdlKCksXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZUFjdGl2ZVRleHRFZGl0b3IoKGVkaXRvcikgPT4ge1xuICAgICAgICBzdG9yZS51cGRhdGVFZGl0b3IoZWRpdG9yKTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2Uub2JzZXJ2ZVRleHRFZGl0b3JzKChlZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgZWRpdG9yU3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgICAgIGVkaXRvci5vbkRpZENoYW5nZUdyYW1tYXIoKCkgPT4ge1xuICAgICAgICAgICAgc3RvcmUuc2V0R3JhbW1hcihlZGl0b3IpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZWRpdG9yLmdldEdyYW1tYXIoKSkpIHtcbiAgICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgICAgIGVkaXRvci5vbkRpZENoYW5nZUN1cnNvclBvc2l0aW9uKFxuICAgICAgICAgICAgICBfLmRlYm91bmNlKCgpID0+IHtcbiAgICAgICAgICAgICAgICBzdG9yZS5zZXRHcmFtbWFyKGVkaXRvcik7XG4gICAgICAgICAgICAgIH0sIDc1KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBlZGl0b3JTdWJzY3JpcHRpb25zLmFkZChcbiAgICAgICAgICBlZGl0b3Iub25EaWREZXN0cm95KCgpID0+IHtcbiAgICAgICAgICAgIGVkaXRvclN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgICAgICAgIH0pXG4gICAgICAgICk7XG5cbiAgICAgICAgZWRpdG9yU3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAgICAgZWRpdG9yLm9uRGlkQ2hhbmdlVGl0bGUoKG5ld1RpdGxlKSA9PiBzdG9yZS5mb3JjZUVkaXRvclVwZGF0ZSgpKVxuICAgICAgICApO1xuXG4gICAgICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKGVkaXRvclN1YnNjcmlwdGlvbnMpO1xuICAgICAgfSlcbiAgICApO1xuXG4gICAgdGhpcy5oeWRyb2dlblByb3ZpZGVyID0gbnVsbDtcblxuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS53b3Jrc3BhY2UuYWRkT3BlbmVyKCh1cmkpID0+IHtcbiAgICAgICAgc3dpdGNoICh1cmkpIHtcbiAgICAgICAgICBjYXNlIElOU1BFQ1RPUl9VUkk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEluc3BlY3RvclBhbmUoc3RvcmUpO1xuICAgICAgICAgIGNhc2UgV0FUQ0hFU19VUkk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IFdhdGNoZXNQYW5lKHN0b3JlKTtcbiAgICAgICAgICBjYXNlIE9VVFBVVF9BUkVBX1VSSTpcbiAgICAgICAgICAgIHJldHVybiBuZXcgT3V0cHV0UGFuZShzdG9yZSk7XG4gICAgICAgICAgY2FzZSBLRVJORUxfTU9OSVRPUl9VUkk6XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtlcm5lbE1vbml0b3JQYW5lKHN0b3JlKTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICApO1xuICAgIHN0b3JlLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20ud29ya3NwYWNlLmFkZE9wZW5lcihpcHluYk9wZW5lcikpO1xuXG4gICAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICAvLyBEZXN0cm95IGFueSBQYW5lcyB3aGVuIHRoZSBwYWNrYWdlIGlzIGRlYWN0aXZhdGVkLlxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5nZXRQYW5lSXRlbXMoKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIEluc3BlY3RvclBhbmUgfHxcbiAgICAgICAgICAgIGl0ZW0gaW5zdGFuY2VvZiBXYXRjaGVzUGFuZSB8fFxuICAgICAgICAgICAgaXRlbSBpbnN0YW5jZW9mIE91dHB1dFBhbmUgfHxcbiAgICAgICAgICAgIGl0ZW0gaW5zdGFuY2VvZiBLZXJuZWxNb25pdG9yUGFuZVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaXRlbS5kZXN0cm95KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgKTtcblxuICAgIGF1dG9ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5lbWl0dGVyLmVtaXQoXCJkaWQtY2hhbmdlLWtlcm5lbFwiLCBzdG9yZS5rZXJuZWwpO1xuICAgIH0pO1xuICB9LFxuXG4gIGRlYWN0aXZhdGUoKSB7XG4gICAgc3RvcmUuZGlzcG9zZSgpO1xuICB9LFxuXG4gIC8qLS0tLS0tLS0tLS0tLS0gU2VydmljZSBQcm92aWRlcnMgLS0tLS0tLS0tLS0tLS0qL1xuICBwcm92aWRlSHlkcm9nZW4oKSB7XG4gICAgaWYgKCF0aGlzLmh5ZHJvZ2VuUHJvdmlkZXIpIHtcbiAgICAgIHRoaXMuaHlkcm9nZW5Qcm92aWRlciA9IG5ldyBIeWRyb2dlblByb3ZpZGVyKHRoaXMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmh5ZHJvZ2VuUHJvdmlkZXI7XG4gIH0sXG5cbiAgcHJvdmlkZUF1dG9jb21wbGV0ZVJlc3VsdHMoKSB7XG4gICAgcmV0dXJuIHNlcnZpY2VzLnByb3ZpZGVkLmF1dG9jb21wbGV0ZS5wcm92aWRlQXV0b2NvbXBsZXRlUmVzdWx0cyhzdG9yZSk7XG4gIH0sXG4gIC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xuXG4gIC8qLS0tLS0tLS0tLS0tLS0gU2VydmljZSBDb25zdW1lcnMgLS0tLS0tLS0tLS0tLS0qL1xuICBjb25zdW1lQXV0b2NvbXBsZXRlV2F0Y2hFZGl0b3Iod2F0Y2hFZGl0b3I6IEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIHNlcnZpY2VzLmNvbnN1bWVkLmF1dG9jb21wbGV0ZS5jb25zdW1lKHN0b3JlLCB3YXRjaEVkaXRvcik7XG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXI6IGF0b20kU3RhdHVzQmFyKSB7XG4gICAgcmV0dXJuIHNlcnZpY2VzLmNvbnN1bWVkLnN0YXR1c0Jhci5hZGRTdGF0dXNCYXIoXG4gICAgICBzdG9yZSxcbiAgICAgIHN0YXR1c0JhcixcbiAgICAgIHRoaXMuaGFuZGxlS2VybmVsQ29tbWFuZC5iaW5kKHRoaXMpXG4gICAgKTtcbiAgfSxcbiAgLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovXG5cbiAgY29ubmVjdFRvRXhpc3RpbmdLZXJuZWwoKSB7XG4gICAgaWYgKCF0aGlzLmV4aXN0aW5nS2VybmVsUGlja2VyKSB7XG4gICAgICB0aGlzLmV4aXN0aW5nS2VybmVsUGlja2VyID0gbmV3IEV4aXN0aW5nS2VybmVsUGlja2VyKCk7XG4gICAgfVxuICAgIHRoaXMuZXhpc3RpbmdLZXJuZWxQaWNrZXIudG9nZ2xlKCk7XG4gIH0sXG5cbiAgaGFuZGxlS2VybmVsQ29tbWFuZChcbiAgICB7IGNvbW1hbmQsIHBheWxvYWQgfTogeyBjb21tYW5kOiBzdHJpbmcsIHBheWxvYWQ6ID9LZXJuZWxzcGVjIH0sXG4gICAgeyBrZXJuZWwsIG1hcmtlcnMgfTogeyBrZXJuZWw6ID9LZXJuZWwsIG1hcmtlcnM6ID9NYXJrZXJTdG9yZSB9XG4gICkge1xuICAgIGxvZyhcImhhbmRsZUtlcm5lbENvbW1hbmQ6XCIsIGFyZ3VtZW50cyk7XG5cbiAgICBpZiAoIWtlcm5lbCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IFwiTm8gcnVubmluZyBrZXJuZWwgZm9yIGdyYW1tYXIgb3IgZWRpdG9yIGZvdW5kXCI7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNvbW1hbmQgPT09IFwiaW50ZXJydXB0LWtlcm5lbFwiKSB7XG4gICAgICBrZXJuZWwuaW50ZXJydXB0KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInJlc3RhcnQta2VybmVsXCIpIHtcbiAgICAgIGtlcm5lbC5yZXN0YXJ0KCk7XG4gICAgfSBlbHNlIGlmIChjb21tYW5kID09PSBcInNodXRkb3duLWtlcm5lbFwiKSB7XG4gICAgICBpZiAobWFya2VycykgbWFya2Vycy5jbGVhcigpO1xuICAgICAgLy8gTm90ZSB0aGF0IGRlc3Ryb3kgYWxvbmUgZG9lcyBub3Qgc2h1dCBkb3duIGEgV1NLZXJuZWxcbiAgICAgIGtlcm5lbC5zaHV0ZG93bigpO1xuICAgICAga2VybmVsLmRlc3Ryb3koKTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgY29tbWFuZCA9PT0gXCJyZW5hbWUta2VybmVsXCIgJiZcbiAgICAgIGtlcm5lbC50cmFuc3BvcnQgaW5zdGFuY2VvZiBXU0tlcm5lbFxuICAgICkge1xuICAgICAga2VybmVsLnRyYW5zcG9ydC5wcm9tcHRSZW5hbWUoKTtcbiAgICB9IGVsc2UgaWYgKGNvbW1hbmQgPT09IFwiZGlzY29ubmVjdC1rZXJuZWxcIikge1xuICAgICAgaWYgKG1hcmtlcnMpIG1hcmtlcnMuY2xlYXIoKTtcbiAgICAgIGtlcm5lbC5kZXN0cm95KCk7XG4gICAgfVxuICB9LFxuXG4gIHJ1bihtb3ZlRG93bjogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgY29uc3QgZWRpdG9yID0gc3RvcmUuZWRpdG9yO1xuICAgIGlmICghZWRpdG9yKSByZXR1cm47XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL250ZXJhY3QvaHlkcm9nZW4vaXNzdWVzLzE0NTJcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGVkaXRvci5lbGVtZW50LCBcImF1dG9jb21wbGV0ZS1wbHVzOmNhbmNlbFwiKTtcbiAgICBjb25zdCBjb2RlQmxvY2sgPSBjb2RlTWFuYWdlci5maW5kQ29kZUJsb2NrKGVkaXRvcik7XG4gICAgaWYgKCFjb2RlQmxvY2spIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjb2RlTnVsbGFibGUgPSBjb2RlQmxvY2suY29kZTtcbiAgICBpZiAoY29kZU51bGxhYmxlID09PSBudWxsKSByZXR1cm47XG5cbiAgICBjb25zdCB7IHJvdyB9ID0gY29kZUJsb2NrO1xuICAgIGNvbnN0IGNlbGxUeXBlID0gY29kZU1hbmFnZXIuZ2V0TWV0YWRhdGFGb3JSb3coZWRpdG9yLCBuZXcgUG9pbnQocm93LCAwKSk7XG5cbiAgICBjb25zdCBjb2RlID1cbiAgICAgIGNlbGxUeXBlID09PSBcIm1hcmtkb3duXCJcbiAgICAgICAgPyBjb2RlTWFuYWdlci5yZW1vdmVDb21tZW50c01hcmtkb3duQ2VsbChlZGl0b3IsIGNvZGVOdWxsYWJsZSlcbiAgICAgICAgOiBjb2RlTnVsbGFibGU7XG5cbiAgICBpZiAobW92ZURvd24gPT09IHRydWUpIHtcbiAgICAgIGNvZGVNYW5hZ2VyLm1vdmVEb3duKGVkaXRvciwgcm93KTtcbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrRm9yS2VybmVsKHN0b3JlLCAoa2VybmVsKSA9PiB7XG4gICAgICByZXN1bHQuY3JlYXRlUmVzdWx0KHN0b3JlLCB7IGNvZGUsIHJvdywgY2VsbFR5cGUgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgcnVuQWxsKGJyZWFrcG9pbnRzOiA/QXJyYXk8YXRvbSRQb2ludD4pIHtcbiAgICBjb25zdCB7IGVkaXRvciwga2VybmVsLCBncmFtbWFyLCBmaWxlUGF0aCB9ID0gc3RvcmU7XG4gICAgaWYgKCFlZGl0b3IgfHwgIWdyYW1tYXIgfHwgIWZpbGVQYXRoKSByZXR1cm47XG4gICAgaWYgKGlzTXVsdGlsYW5ndWFnZUdyYW1tYXIoZWRpdG9yLmdldEdyYW1tYXIoKSkpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgJ1wiUnVuIEFsbFwiIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHRoaXMgZmlsZSB0eXBlISdcbiAgICAgICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGVkaXRvciAmJiBrZXJuZWwpIHtcbiAgICAgIHRoaXMuX3J1bkFsbChlZGl0b3IsIGtlcm5lbCwgYnJlYWtwb2ludHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGtlcm5lbE1hbmFnZXIuc3RhcnRLZXJuZWxGb3IoXG4gICAgICBncmFtbWFyLFxuICAgICAgZWRpdG9yLFxuICAgICAgZmlsZVBhdGgsXG4gICAgICAoa2VybmVsOiBLZXJuZWwpID0+IHtcbiAgICAgICAgdGhpcy5fcnVuQWxsKGVkaXRvciwga2VybmVsLCBicmVha3BvaW50cyk7XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICBfcnVuQWxsKFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIGtlcm5lbDogS2VybmVsLFxuICAgIGJyZWFrcG9pbnRzPzogQXJyYXk8YXRvbSRQb2ludD5cbiAgKSB7XG4gICAgbGV0IGNlbGxzID0gY29kZU1hbmFnZXIuZ2V0Q2VsbHMoZWRpdG9yLCBicmVha3BvaW50cyk7XG4gICAgZm9yIChjb25zdCBjZWxsIG9mIGNlbGxzKSB7XG4gICAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGNlbGw7XG4gICAgICBjb25zdCBjb2RlTnVsbGFibGUgPSBjb2RlTWFuYWdlci5nZXRUZXh0SW5SYW5nZShlZGl0b3IsIHN0YXJ0LCBlbmQpO1xuICAgICAgaWYgKGNvZGVOdWxsYWJsZSA9PT0gbnVsbCkgY29udGludWU7XG5cbiAgICAgIGNvbnN0IHJvdyA9IGNvZGVNYW5hZ2VyLmVzY2FwZUJsYW5rUm93cyhcbiAgICAgICAgZWRpdG9yLFxuICAgICAgICBzdGFydC5yb3csXG4gICAgICAgIGVuZC5yb3cgPT0gZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSA/IGVuZC5yb3cgOiBlbmQucm93IC0gMVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNlbGxUeXBlID0gY29kZU1hbmFnZXIuZ2V0TWV0YWRhdGFGb3JSb3coZWRpdG9yLCBzdGFydCk7XG5cbiAgICAgIGNvbnN0IGNvZGUgPVxuICAgICAgICBjZWxsVHlwZSA9PT0gXCJtYXJrZG93blwiXG4gICAgICAgICAgPyBjb2RlTWFuYWdlci5yZW1vdmVDb21tZW50c01hcmtkb3duQ2VsbChlZGl0b3IsIGNvZGVOdWxsYWJsZSlcbiAgICAgICAgICA6IGNvZGVOdWxsYWJsZTtcblxuICAgICAgdGhpcy5jaGVja0Zvcktlcm5lbChzdG9yZSwgKGtlcm5lbCkgPT4ge1xuICAgICAgICByZXN1bHQuY3JlYXRlUmVzdWx0KHN0b3JlLCB7IGNvZGUsIHJvdywgY2VsbFR5cGUgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgcnVuQWxsQWJvdmUoKSB7XG4gICAgY29uc3QgeyBlZGl0b3IsIGtlcm5lbCwgZ3JhbW1hciwgZmlsZVBhdGggfSA9IHN0b3JlO1xuICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyIHx8ICFmaWxlUGF0aCkgcmV0dXJuO1xuICAgIGlmIChpc011bHRpbGFuZ3VhZ2VHcmFtbWFyKGVkaXRvci5nZXRHcmFtbWFyKCkpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICdcIlJ1biBBbGwgQWJvdmVcIiBpcyBub3Qgc3VwcG9ydGVkIGZvciB0aGlzIGZpbGUgdHlwZSEnXG4gICAgICApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChlZGl0b3IgJiYga2VybmVsKSB7XG4gICAgICB0aGlzLl9ydW5BbGxBYm92ZShlZGl0b3IsIGtlcm5lbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAga2VybmVsTWFuYWdlci5zdGFydEtlcm5lbEZvcihcbiAgICAgIGdyYW1tYXIsXG4gICAgICBlZGl0b3IsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIChrZXJuZWw6IEtlcm5lbCkgPT4ge1xuICAgICAgICB0aGlzLl9ydW5BbGxBYm92ZShlZGl0b3IsIGtlcm5lbCk7XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICBfcnVuQWxsQWJvdmUoZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsIGtlcm5lbDogS2VybmVsKSB7XG4gICAgY29uc3QgY3Vyc29yID0gZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCk7XG4gICAgY3Vyc29yLmNvbHVtbiA9IGVkaXRvci5nZXRCdWZmZXIoKS5saW5lTGVuZ3RoRm9yUm93KGN1cnNvci5yb3cpO1xuICAgIGNvbnN0IGJyZWFrcG9pbnRzID0gY29kZU1hbmFnZXIuZ2V0QnJlYWtwb2ludHMoZWRpdG9yKTtcbiAgICBicmVha3BvaW50cy5wdXNoKGN1cnNvcik7XG4gICAgY29uc3QgY2VsbHMgPSBjb2RlTWFuYWdlci5nZXRDZWxscyhlZGl0b3IsIGJyZWFrcG9pbnRzKTtcbiAgICBmb3IgKGNvbnN0IGNlbGwgb2YgY2VsbHMpIHtcbiAgICAgIGNvbnN0IHsgc3RhcnQsIGVuZCB9ID0gY2VsbDtcbiAgICAgIGNvbnN0IGNvZGVOdWxsYWJsZSA9IGNvZGVNYW5hZ2VyLmdldFRleHRJblJhbmdlKGVkaXRvciwgc3RhcnQsIGVuZCk7XG5cbiAgICAgIGNvbnN0IHJvdyA9IGNvZGVNYW5hZ2VyLmVzY2FwZUJsYW5rUm93cyhcbiAgICAgICAgZWRpdG9yLFxuICAgICAgICBzdGFydC5yb3csXG4gICAgICAgIGVuZC5yb3cgPT0gZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKSA/IGVuZC5yb3cgOiBlbmQucm93IC0gMVxuICAgICAgKTtcbiAgICAgIGNvbnN0IGNlbGxUeXBlID0gY29kZU1hbmFnZXIuZ2V0TWV0YWRhdGFGb3JSb3coZWRpdG9yLCBzdGFydCk7XG5cbiAgICAgIGlmIChjb2RlTnVsbGFibGUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgY29kZSA9XG4gICAgICAgICAgY2VsbFR5cGUgPT09IFwibWFya2Rvd25cIlxuICAgICAgICAgICAgPyBjb2RlTWFuYWdlci5yZW1vdmVDb21tZW50c01hcmtkb3duQ2VsbChlZGl0b3IsIGNvZGVOdWxsYWJsZSlcbiAgICAgICAgICAgIDogY29kZU51bGxhYmxlO1xuXG4gICAgICAgIHRoaXMuY2hlY2tGb3JLZXJuZWwoc3RvcmUsIChrZXJuZWwpID0+IHtcbiAgICAgICAgICByZXN1bHQuY3JlYXRlUmVzdWx0KHN0b3JlLCB7IGNvZGUsIHJvdywgY2VsbFR5cGUgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAoY2VsbC5jb250YWluc1BvaW50KGN1cnNvcikpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIHJ1bkNlbGwobW92ZURvd246IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IGVkaXRvciA9IHN0b3JlLmVkaXRvcjtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9udGVyYWN0L2h5ZHJvZ2VuL2lzc3Vlcy8xNDUyXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChlZGl0b3IuZWxlbWVudCwgXCJhdXRvY29tcGxldGUtcGx1czpjYW5jZWxcIik7XG5cbiAgICBjb25zdCB7IHN0YXJ0LCBlbmQgfSA9IGNvZGVNYW5hZ2VyLmdldEN1cnJlbnRDZWxsKGVkaXRvcik7XG4gICAgY29uc3QgY29kZU51bGxhYmxlID0gY29kZU1hbmFnZXIuZ2V0VGV4dEluUmFuZ2UoZWRpdG9yLCBzdGFydCwgZW5kKTtcbiAgICBpZiAoY29kZU51bGxhYmxlID09PSBudWxsKSByZXR1cm47XG5cbiAgICBjb25zdCByb3cgPSBjb2RlTWFuYWdlci5lc2NhcGVCbGFua1Jvd3MoXG4gICAgICBlZGl0b3IsXG4gICAgICBzdGFydC5yb3csXG4gICAgICBlbmQucm93ID09IGVkaXRvci5nZXRMYXN0QnVmZmVyUm93KCkgPyBlbmQucm93IDogZW5kLnJvdyAtIDFcbiAgICApO1xuICAgIGNvbnN0IGNlbGxUeXBlID0gY29kZU1hbmFnZXIuZ2V0TWV0YWRhdGFGb3JSb3coZWRpdG9yLCBzdGFydCk7XG5cbiAgICBjb25zdCBjb2RlID1cbiAgICAgIGNlbGxUeXBlID09PSBcIm1hcmtkb3duXCJcbiAgICAgICAgPyBjb2RlTWFuYWdlci5yZW1vdmVDb21tZW50c01hcmtkb3duQ2VsbChlZGl0b3IsIGNvZGVOdWxsYWJsZSlcbiAgICAgICAgOiBjb2RlTnVsbGFibGU7XG5cbiAgICBpZiAobW92ZURvd24gPT09IHRydWUpIHtcbiAgICAgIGNvZGVNYW5hZ2VyLm1vdmVEb3duKGVkaXRvciwgcm93KTtcbiAgICB9XG5cbiAgICB0aGlzLmNoZWNrRm9yS2VybmVsKHN0b3JlLCAoa2VybmVsKSA9PiB7XG4gICAgICByZXN1bHQuY3JlYXRlUmVzdWx0KHN0b3JlLCB7IGNvZGUsIHJvdywgY2VsbFR5cGUgfSk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZm9sZEN1cnJlbnRDZWxsKCkge1xuICAgIGNvbnN0IGVkaXRvciA9IHN0b3JlLmVkaXRvcjtcbiAgICBpZiAoIWVkaXRvcikgcmV0dXJuO1xuICAgIGNvZGVNYW5hZ2VyLmZvbGRDdXJyZW50Q2VsbChlZGl0b3IpO1xuICB9LFxuXG4gIGZvbGRBbGxCdXRDdXJyZW50Q2VsbCgpIHtcbiAgICBjb25zdCBlZGl0b3IgPSBzdG9yZS5lZGl0b3I7XG4gICAgaWYgKCFlZGl0b3IpIHJldHVybjtcbiAgICBjb2RlTWFuYWdlci5mb2xkQWxsQnV0Q3VycmVudENlbGwoZWRpdG9yKTtcbiAgfSxcblxuICBzdGFydFpNUUtlcm5lbCgpIHtcbiAgICBrZXJuZWxNYW5hZ2VyXG4gICAgICAuZ2V0QWxsS2VybmVsU3BlY3NGb3JHcmFtbWFyKHN0b3JlLmdyYW1tYXIpXG4gICAgICAudGhlbigoa2VybmVsU3BlY3MpID0+IHtcbiAgICAgICAgaWYgKHRoaXMua2VybmVsUGlja2VyKSB7XG4gICAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIua2VybmVsU3BlY3MgPSBrZXJuZWxTcGVjcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmtlcm5lbFBpY2tlciA9IG5ldyBLZXJuZWxQaWNrZXIoa2VybmVsU3BlY3MpO1xuXG4gICAgICAgICAgdGhpcy5rZXJuZWxQaWNrZXIub25Db25maXJtZWQgPSAoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT4ge1xuICAgICAgICAgICAgY29uc3QgeyBlZGl0b3IsIGdyYW1tYXIsIGZpbGVQYXRoLCBtYXJrZXJzIH0gPSBzdG9yZTtcbiAgICAgICAgICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyIHx8ICFmaWxlUGF0aCB8fCAhbWFya2VycykgcmV0dXJuO1xuICAgICAgICAgICAgbWFya2Vycy5jbGVhcigpO1xuXG4gICAgICAgICAgICBrZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsKGtlcm5lbFNwZWMsIGdyYW1tYXIsIGVkaXRvciwgZmlsZVBhdGgpO1xuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmtlcm5lbFBpY2tlci50b2dnbGUoKTtcbiAgICAgIH0pO1xuICB9LFxuXG4gIGNvbm5lY3RUb1dTS2VybmVsKCkge1xuICAgIGlmICghdGhpcy53c0tlcm5lbFBpY2tlcikge1xuICAgICAgdGhpcy53c0tlcm5lbFBpY2tlciA9IG5ldyBXU0tlcm5lbFBpY2tlcigodHJhbnNwb3J0OiBXU0tlcm5lbCkgPT4ge1xuICAgICAgICBjb25zdCBrZXJuZWwgPSBuZXcgS2VybmVsKHRyYW5zcG9ydCk7XG4gICAgICAgIGNvbnN0IHsgZWRpdG9yLCBncmFtbWFyLCBmaWxlUGF0aCwgbWFya2VycyB9ID0gc3RvcmU7XG4gICAgICAgIGlmICghZWRpdG9yIHx8ICFncmFtbWFyIHx8ICFmaWxlUGF0aCB8fCAhbWFya2VycykgcmV0dXJuO1xuICAgICAgICBtYXJrZXJzLmNsZWFyKCk7XG5cbiAgICAgICAgaWYgKGtlcm5lbC50cmFuc3BvcnQgaW5zdGFuY2VvZiBaTVFLZXJuZWwpIGtlcm5lbC5kZXN0cm95KCk7XG5cbiAgICAgICAgc3RvcmUubmV3S2VybmVsKGtlcm5lbCwgZmlsZVBhdGgsIGVkaXRvciwgZ3JhbW1hcik7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLndzS2VybmVsUGlja2VyLnRvZ2dsZSgoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT5cbiAgICAgIGtlcm5lbFNwZWNQcm92aWRlc0dyYW1tYXIoa2VybmVsU3BlYywgc3RvcmUuZ3JhbW1hcilcbiAgICApO1xuICB9LFxuXG4gIC8vIEFjY2VwdHMgc3RvcmUgYXMgYW4gYXJnXG4gIGNoZWNrRm9yS2VybmVsKFxuICAgIHtcbiAgICAgIGVkaXRvcixcbiAgICAgIGdyYW1tYXIsXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGtlcm5lbCxcbiAgICB9OiB7XG4gICAgICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgICAgIGdyYW1tYXI6IGF0b20kR3JhbW1hcixcbiAgICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgICBrZXJuZWw/OiBLZXJuZWwsXG4gICAgfSxcbiAgICBjYWxsYmFjazogKGtlcm5lbDogS2VybmVsKSA9PiB2b2lkXG4gICkge1xuICAgIGlmICghZmlsZVBhdGggfHwgIWdyYW1tYXIpIHtcbiAgICAgIHJldHVybiBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgIFwiVGhlIGxhbmd1YWdlIGdyYW1tYXIgbXVzdCBiZSBzZXQgaW4gb3JkZXIgdG8gc3RhcnQgYSBrZXJuZWwuIFRoZSBlYXNpZXN0IHdheSB0byBkbyB0aGlzIGlzIHRvIHNhdmUgdGhlIGZpbGUuXCJcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGtlcm5lbCkge1xuICAgICAgY2FsbGJhY2soa2VybmVsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBrZXJuZWxNYW5hZ2VyLnN0YXJ0S2VybmVsRm9yKFxuICAgICAgZ3JhbW1hcixcbiAgICAgIGVkaXRvcixcbiAgICAgIGZpbGVQYXRoLFxuICAgICAgKG5ld0tlcm5lbDogS2VybmVsKSA9PiBjYWxsYmFjayhuZXdLZXJuZWwpXG4gICAgKTtcbiAgfSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEh5ZHJvZ2VuO1xuIl19