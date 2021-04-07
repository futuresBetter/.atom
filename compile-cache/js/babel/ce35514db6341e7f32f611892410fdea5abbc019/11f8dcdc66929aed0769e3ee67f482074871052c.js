Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atom = require("atom");

var _mobx = require("mobx");

var _lodash = require("lodash");

var _utils = require("./utils");

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _storeWatches = require("./store/watches");

var _storeWatches2 = _interopRequireDefault(_storeWatches);

var _storeOutput = require("./store/output");

var _storeOutput2 = _interopRequireDefault(_storeOutput);

var _pluginApiHydrogenKernel = require("./plugin-api/hydrogen-kernel");

var _pluginApiHydrogenKernel2 = _interopRequireDefault(_pluginApiHydrogenKernel);

var _inputView = require("./input-view");

var _inputView2 = _interopRequireDefault(_inputView);

var _kernelTransport = require("./kernel-transport");

var _kernelTransport2 = _interopRequireDefault(_kernelTransport);

function protectFromInvalidMessages(onResults) {
  var wrappedOnResults = function wrappedOnResults(message, channel) {
    if (!message) {
      (0, _utils.log)("Invalid message: null");
      return;
    }

    if (!message.content) {
      (0, _utils.log)("Invalid message: Missing content");
      return;
    }

    if (message.content.execution_state === "starting") {
      // Kernels send a starting status message with an empty parent_header
      (0, _utils.log)("Dropped starting status IO message");
      return;
    }

    if (!message.parent_header) {
      (0, _utils.log)("Invalid message: Missing parent_header");
      return;
    }

    if (!message.parent_header.msg_id) {
      (0, _utils.log)("Invalid message: Missing parent_header.msg_id");
      return;
    }

    if (!message.parent_header.msg_type) {
      (0, _utils.log)("Invalid message: Missing parent_header.msg_type");
      return;
    }

    if (!message.header) {
      (0, _utils.log)("Invalid message: Missing header");
      return;
    }

    if (!message.header.msg_id) {
      (0, _utils.log)("Invalid message: Missing header.msg_id");
      return;
    }

    if (!message.header.msg_type) {
      (0, _utils.log)("Invalid message: Missing header.msg_type");
      return;
    }

    onResults(message, channel);
  };
  return wrappedOnResults;
}

// Adapts middleware objects provided by plugins to an internal interface. In
// particular, this implements fallthrough logic for when a plugin defines some
// methods (e.g. execute) but doesn't implement others (e.g. interrupt). Note
// that HydrogenKernelMiddleware objects are mutable: they may lose/gain methods
// at any time, including in the middle of processing a request. This class also
// adds basic checks that messages passed via the `onResults` callbacks are not
// missing key mandatory fields specified in the Jupyter messaging spec.

var MiddlewareAdapter = (function () {
  function MiddlewareAdapter(middleware, next) {
    _classCallCheck(this, MiddlewareAdapter);

    this._middleware = middleware;
    this._next = next;
  }

  // The return value of this method gets passed to plugins! For now we just
  // return the MiddlewareAdapter object itself, which is why all private
  // functionality is prefixed with _, and why MiddlewareAdapter is marked as
  // implementing HydrogenKernelMiddlewareThunk. Once multiple plugin API
  // versions exist, we may want to generate a HydrogenKernelMiddlewareThunk
  // specialized for a particular plugin API version.

  _createClass(MiddlewareAdapter, [{
    key: "interrupt",
    value: function interrupt() {
      if (this._middleware.interrupt) {
        this._middleware.interrupt(this._nextAsPluginType);
      } else {
        this._next.interrupt();
      }
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      if (this._middleware.shutdown) {
        this._middleware.shutdown(this._nextAsPluginType);
      } else {
        this._next.shutdown();
      }
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      if (this._middleware.restart) {
        this._middleware.restart(this._nextAsPluginType, onRestarted);
      } else {
        this._next.restart(onRestarted);
      }
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      // We don't want to repeatedly wrap the onResults callback every time we
      // fall through, but we need to do it at least once before delegating to
      // the KernelTransport.
      var safeOnResults = this._middleware.execute || this._next instanceof _kernelTransport2["default"] ? protectFromInvalidMessages(onResults) : onResults;

      if (this._middleware.execute) {
        this._middleware.execute(this._nextAsPluginType, code, safeOnResults);
      } else {
        this._next.execute(code, safeOnResults);
      }
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      var safeOnResults = this._middleware.complete || this._next instanceof _kernelTransport2["default"] ? protectFromInvalidMessages(onResults) : onResults;

      if (this._middleware.complete) {
        this._middleware.complete(this._nextAsPluginType, code, safeOnResults);
      } else {
        this._next.complete(code, safeOnResults);
      }
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      var safeOnResults = this._middleware.inspect || this._next instanceof _kernelTransport2["default"] ? protectFromInvalidMessages(onResults) : onResults;
      if (this._middleware.inspect) {
        this._middleware.inspect(this._nextAsPluginType, code, cursorPos, safeOnResults);
      } else {
        this._next.inspect(code, cursorPos, safeOnResults);
      }
    }
  }, {
    key: "_nextAsPluginType",
    get: function get() {
      if (this._next instanceof _kernelTransport2["default"]) {
        throw new Error("MiddlewareAdapter: _nextAsPluginType must never be called when _next is KernelTransport");
      }
      return this._next;
    }
  }]);

  return MiddlewareAdapter;
})();

var Kernel = (function () {
  var _instanceInitializers = {};
  var _instanceInitializers = {};

  _createDecoratedClass(Kernel, [{
    key: "inspector",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return { bundle: {} };
    },
    enumerable: true
  }], null, _instanceInitializers);

  function Kernel(kernel) {
    _classCallCheck(this, Kernel);

    _defineDecoratedPropertyDescriptor(this, "inspector", _instanceInitializers);

    this.outputStore = new _storeOutput2["default"]();
    this.watchCallbacks = [];
    this.emitter = new _atom.Emitter();
    this.pluginWrapper = null;

    this.transport = kernel;

    this.watchesStore = new _storeWatches2["default"](this);

    // A MiddlewareAdapter that forwards all requests to `this.transport`.
    // Needed to terminate the middleware chain in a way such that the `next`
    // object passed to the last middleware is not the KernelTransport instance
    // itself (which would be violate isolation of internals from plugins).
    var delegateToTransport = new MiddlewareAdapter({}, this.transport);
    this.middleware = [delegateToTransport];
  }

  _createDecoratedClass(Kernel, [{
    key: "addMiddleware",
    value: function addMiddleware(middleware) {
      this.middleware.unshift(new MiddlewareAdapter(middleware, this.middleware[0]));
    }
  }, {
    key: "setExecutionState",
    value: function setExecutionState(state) {
      this.transport.setExecutionState(state);
    }
  }, {
    key: "setExecutionCount",
    value: function setExecutionCount(count) {
      this.transport.setExecutionCount(count);
    }
  }, {
    key: "setLastExecutionTime",
    value: function setLastExecutionTime(timeString) {
      this.transport.setLastExecutionTime(timeString);
    }
  }, {
    key: "setInspectorResult",
    decorators: [_mobx.action],
    value: _asyncToGenerator(function* (bundle, editor) {
      if ((0, _lodash.isEqual)(this.inspector.bundle, bundle)) {
        yield atom.workspace.toggle(_utils.INSPECTOR_URI);
      } else if (bundle.size !== 0) {
        this.inspector.bundle = bundle;
        yield atom.workspace.open(_utils.INSPECTOR_URI, { searchAllPanes: true });
      }
      (0, _utils.focus)(editor);
    })
  }, {
    key: "getPluginWrapper",
    value: function getPluginWrapper() {
      if (!this.pluginWrapper) {
        this.pluginWrapper = new _pluginApiHydrogenKernel2["default"](this);
      }

      return this.pluginWrapper;
    }
  }, {
    key: "addWatchCallback",
    value: function addWatchCallback(watchCallback) {
      this.watchCallbacks.push(watchCallback);
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      this.firstMiddlewareAdapter.interrupt();
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      this.firstMiddlewareAdapter.shutdown();
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      this.firstMiddlewareAdapter.restart(onRestarted);
      this.setExecutionCount(0);
      this.setLastExecutionTime("No execution");
    }
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      var _this = this;

      var wrappedOnResults = this._wrapExecutionResultsCallback(onResults);
      this.firstMiddlewareAdapter.execute(code, function (message, channel) {
        wrappedOnResults(message, channel);

        var msg_type = message.header.msg_type;

        if (msg_type === "execute_input") {
          _this.setLastExecutionTime("Running ...");
        }

        if (msg_type === "execute_reply") {
          var count = message.content.execution_count;
          _this.setExecutionCount(count);
          var timeString = (0, _utils.executionTime)(message);
          _this.setLastExecutionTime(timeString);
        }

        var execution_state = message.content.execution_state;

        if (channel == "iopub" && msg_type === "status" && execution_state === "idle") {
          _this._callWatchCallbacks();
        }
      });
    }
  }, {
    key: "executeWatch",
    value: function executeWatch(code, onResults) {
      this.firstMiddlewareAdapter.execute(code, this._wrapExecutionResultsCallback(onResults));
    }
  }, {
    key: "_callWatchCallbacks",
    value: function _callWatchCallbacks() {
      this.watchCallbacks.forEach(function (watchCallback) {
        return watchCallback();
      });
    }

    /*
     * Takes a callback that accepts execution results in a hydrogen-internal
     * format and wraps it to accept Jupyter message/channel pairs instead.
     * Kernels and plugins all operate on types specified by the Jupyter messaging
     * protocol in order to maximize compatibility, but hydrogen internally uses
     * its own types.
     */
  }, {
    key: "_wrapExecutionResultsCallback",
    value: function _wrapExecutionResultsCallback(onResults) {
      var _this2 = this;

      return function (message, channel) {
        if (channel === "shell") {
          var _status = message.content.status;

          if (_status === "error" || _status === "ok") {
            onResults({
              data: _status,
              stream: "status"
            });
          } else {
            (0, _utils.log)("Kernel: ignoring unexpected value for message.content.status");
          }
        } else if (channel === "iopub") {
          if (message.header.msg_type === "execute_input") {
            onResults({
              data: message.content.execution_count,
              stream: "execution_count"
            });
          }

          // TODO(nikita): Consider converting to V5 elsewhere, so that plugins
          // never have to deal with messages in the V4 format
          var result = (0, _utils.msgSpecToNotebookFormat)((0, _utils.msgSpecV4toV5)(message));
          onResults(result);
        } else if (channel === "stdin") {
          if (message.header.msg_type !== "input_request") {
            return;
          }

          var _message$content = message.content;
          var _prompt = _message$content.prompt;
          var password = _message$content.password;

          // TODO(nikita): perhaps it would make sense to install middleware for
          // sending input replies
          var inputView = new _inputView2["default"]({ prompt: _prompt, password: password }, function (input) {
            return _this2.transport.inputReply(input);
          });

          inputView.attach();
        }
      };
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      this.firstMiddlewareAdapter.complete(code, function (message, channel) {
        if (channel !== "shell") {
          (0, _utils.log)("Invalid reply: wrong channel");
          return;
        }
        onResults(message.content);
      });
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      this.firstMiddlewareAdapter.inspect(code, cursorPos, function (message, channel) {
        if (channel !== "shell") {
          (0, _utils.log)("Invalid reply: wrong channel");
          return;
        }
        onResults({
          data: message.content.data,
          found: message.content.found
        });
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("Kernel: Destroying");
      // This is for cleanup to improve performance
      this.watchesStore.destroy();
      _store2["default"].deleteKernel(this);
      this.transport.destroy();
      if (this.pluginWrapper) {
        this.pluginWrapper.destroyed = true;
      }
      this.emitter.emit("did-destroy");
      this.emitter.dispose();
    }
  }, {
    key: "kernelSpec",
    get: function get() {
      return this.transport.kernelSpec;
    }
  }, {
    key: "grammar",
    get: function get() {
      return this.transport.grammar;
    }
  }, {
    key: "language",
    get: function get() {
      return this.transport.language;
    }
  }, {
    key: "displayName",
    get: function get() {
      return this.transport.displayName;
    }
  }, {
    key: "firstMiddlewareAdapter",
    get: function get() {
      return this.middleware[0];
    }
  }, {
    key: "executionState",
    decorators: [_mobx.computed],
    get: function get() {
      return this.transport.executionState;
    }
  }, {
    key: "executionCount",
    decorators: [_mobx.computed],
    get: function get() {
      return this.transport.executionCount;
    }
  }, {
    key: "lastExecutionTime",
    decorators: [_mobx.computed],
    get: function get() {
      return this.transport.lastExecutionTime;
    }
  }], null, _instanceInitializers);

  return Kernel;
})();

exports["default"] = Kernel;
module.exports = exports["default"];

// Invariant: the `._next` of each entry in this array must point to the next
// element of the array. The `._next` of the last element must point to
// `this.transport`.
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztvQkFFd0IsTUFBTTs7b0JBQ2UsTUFBTTs7c0JBQzNCLFFBQVE7O3FCQVF6QixTQUFTOztxQkFDRSxTQUFTOzs7OzRCQUVGLGlCQUFpQjs7OzsyQkFDbEIsZ0JBQWdCOzs7O3VDQUNiLDhCQUE4Qjs7Ozt5QkFLbkMsY0FBYzs7OzsrQkFDUixvQkFBb0I7Ozs7QUFJaEQsU0FBUywwQkFBMEIsQ0FDakMsU0FBMEIsRUFDVDtBQUNqQixNQUFNLGdCQUFpQyxHQUFHLFNBQXBDLGdCQUFpQyxDQUFJLE9BQU8sRUFBRSxPQUFPLEVBQUs7QUFDOUQsUUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLHNCQUFJLHVCQUF1QixDQUFDLENBQUM7QUFDN0IsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3BCLHNCQUFJLGtDQUFrQyxDQUFDLENBQUM7QUFDeEMsYUFBTztLQUNSOztBQUVELFFBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEtBQUssVUFBVSxFQUFFOztBQUVsRCxzQkFBSSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQzFDLGFBQU87S0FDUjs7QUFFRCxRQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRTtBQUMxQixzQkFBSSx3Q0FBd0MsQ0FBQyxDQUFDO0FBQzlDLGFBQU87S0FDUjs7QUFFRCxRQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUU7QUFDakMsc0JBQUksK0NBQStDLENBQUMsQ0FBQztBQUNyRCxhQUFPO0tBQ1I7O0FBRUQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFO0FBQ25DLHNCQUFJLGlEQUFpRCxDQUFDLENBQUM7QUFDdkQsYUFBTztLQUNSOztBQUVELFFBQUksQ0FBQyxPQUFPLENBQUMsTUFB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dEM7Ozs7U0FPaUIsZUFBVztBQUMzQixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDO0tBQ3RDOzs7O1NBT29CLGVBQVc7QUFDOUIsYUFBTyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDO0tBQ3pDOzs7U0E3RWtCLE1BQU07OztxQkFBTixNQUFNIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBFbWl0dGVyIH0gZnJvbSBcImF0b21cIjtcbmltcG9ydCB7IG9ic2VydmFibGUsIGFjdGlvbiwgY29tcHV0ZWQgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgaXNFcXVhbCB9IGZyb20gXCJsb2Rhc2hcIjtcblxuaW1wb3J0IHtcbiAgbG9nLFxuICBmb2N1cyxcbiAgbXNnU3BlY1RvTm90ZWJvb2tGb3JtYXQsXG4gIG1zZ1NwZWNWNHRvVjUsXG4gIElOU1BFQ1RPUl9VUkksXG59IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgc3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxuaW1wb3J0IFdhdGNoZXNTdG9yZSBmcm9tIFwiLi9zdG9yZS93YXRjaGVzXCI7XG5pbXBvcnQgT3V0cHV0U3RvcmUgZnJvbSBcIi4vc3RvcmUvb3V0cHV0XCI7XG5pbXBvcnQgSHlkcm9nZW5LZXJuZWwgZnJvbSBcIi4vcGx1Z2luLWFwaS9oeWRyb2dlbi1rZXJuZWxcIjtcbmltcG9ydCB0eXBlIHtcbiAgSHlkcm9nZW5LZXJuZWxNaWRkbGV3YXJlVGh1bmssXG4gIEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZSxcbn0gZnJvbSBcIi4vcGx1Z2luLWFwaS9oeWRyb2dlbi10eXBlc1wiO1xuaW1wb3J0IElucHV0VmlldyBmcm9tIFwiLi9pbnB1dC12aWV3XCI7XG5pbXBvcnQgS2VybmVsVHJhbnNwb3J0IGZyb20gXCIuL2tlcm5lbC10cmFuc3BvcnRcIjtcbmltcG9ydCB0eXBlIHsgUmVzdWx0c0NhbGxiYWNrIH0gZnJvbSBcIi4va2VybmVsLXRyYW5zcG9ydFwiO1xuaW1wb3J0IHsgZXhlY3V0aW9uVGltZSB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmZ1bmN0aW9uIHByb3RlY3RGcm9tSW52YWxpZE1lc3NhZ2VzKFxuICBvblJlc3VsdHM6IFJlc3VsdHNDYWxsYmFja1xuKTogUmVzdWx0c0NhbGxiYWNrIHtcbiAgY29uc3Qgd3JhcHBlZE9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrID0gKG1lc3NhZ2UsIGNoYW5uZWwpID0+IHtcbiAgICBpZiAoIW1lc3NhZ2UpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogbnVsbFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuY29udGVudCkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGNvbnRlbnRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fc3RhdGUgPT09IFwic3RhcnRpbmdcIikge1xuICAgICAgLy8gS2VybmVscyBzZW5kIGEgc3RhcnRpbmcgc3RhdHVzIG1lc3NhZ2Ugd2l0aCBhbiBlbXB0eSBwYXJlbnRfaGVhZGVyXG4gICAgICBsb2coXCJEcm9wcGVkIHN0YXJ0aW5nIHN0YXR1cyBJTyBtZXNzYWdlXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5wYXJlbnRfaGVhZGVyKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgcGFyZW50X2hlYWRlclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UucGFyZW50X2hlYWRlci5tc2dfaWQpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBwYXJlbnRfaGVhZGVyLm1zZ19pZFwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UucGFyZW50X2hlYWRlci5tc2dfdHlwZSkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXIubXNnX3R5cGVcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmhlYWRlcikge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlclwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyLm1zZ19pZCkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlci5tc2dfaWRcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmhlYWRlci5tc2dfdHlwZSkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlci5tc2dfdHlwZVwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBvblJlc3VsdHMobWVzc2FnZSwgY2hhbm5lbCk7XG4gIH07XG4gIHJldHVybiB3cmFwcGVkT25SZXN1bHRzO1xufVxuXG4vLyBBZGFwdHMgbWlkZGxld2FyZSBvYmplY3RzIHByb3ZpZGVkIGJ5IHBsdWdpbnMgdG8gYW4gaW50ZXJuYWwgaW50ZXJmYWNlLiBJblxuLy8gcGFydGljdWxhciwgdGhpcyBpbXBsZW1lbnRzIGZhbGx0aHJvdWdoIGxvZ2ljIGZvciB3aGVuIGEgcGx1Z2luIGRlZmluZXMgc29tZVxuLy8gbWV0aG9kcyAoZS5nLiBleGVjdXRlKSBidXQgZG9lc24ndCBpbXBsZW1lbnQgb3RoZXJzIChlLmcuIGludGVycnVwdCkuIE5vdGVcbi8vIHRoYXQgSHlkcm9nZW5LZXJuZWxNaWRkbGV3YXJlIG9iamVjdHMgYXJlIG11dGFibGU6IHRoZXkgbWF5IGxvc2UvZ2FpbiBtZXRob2RzXG4vLyBhdCBhbnkgdGltZSwgaW5jbHVkaW5nIGluIHRoZSBtaWRkbGUgb2YgcHJvY2Vzc2luZyBhIHJlcXVlc3QuIFRoaXMgY2xhc3MgYWxzb1xuLy8gYWRkcyBiYXNpYyBjaGVja3MgdGhhdCBtZXNzYWdlcyBwYXNzZWQgdmlhIHRoZSBgb25SZXN1bHRzYCBjYWxsYmFja3MgYXJlIG5vdFxuLy8gbWlzc2luZyBrZXkgbWFuZGF0b3J5IGZpZWxkcyBzcGVjaWZpZWQgaW4gdGhlIEp1cHl0ZXIgbWVzc2FnaW5nIHNwZWMuXG5jbGFzcyBNaWRkbGV3YXJlQWRhcHRlciBpbXBsZW1lbnRzIEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZVRodW5rIHtcbiAgX21pZGRsZXdhcmU6IEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZTtcbiAgX25leHQ6IE1pZGRsZXdhcmVBZGFwdGVyIHwgS2VybmVsVHJhbnNwb3J0O1xuICBjb25zdHJ1Y3RvcihcbiAgICBtaWRkbGV3YXJlOiBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmUsXG4gICAgbmV4dDogTWlkZGxld2FyZUFkYXB0ZXIgfCBLZXJuZWxUcmFuc3BvcnRcbiAgKSB7XG4gICAgdGhpcy5fbWlkZGxld2FyZSA9IG1pZGRsZXdhcmU7XG4gICAgdGhpcy5fbmV4dCA9IG5leHQ7XG4gIH1cblxuICAvLyBUaGUgcmV0dXJuIHZhbHVlIG9mIHRoaXMgbWV0aG9kIGdldHMgcGFzc2VkIHRvIHBsdWdpbnMhIEZvciBub3cgd2UganVzdFxuICAvLyByZXR1cm4gdGhlIE1pZGRsZXdhcmVBZGFwdGVyIG9iamVjdCBpdHNlbGYsIHdoaWNoIGlzIHdoeSBhbGwgcHJpdmF0ZVxuICAvLyBmdW5jdGlvbmFsaXR5IGlzIHByZWZpeGVkIHdpdGggXywgYW5kIHdoeSBNaWRkbGV3YXJlQWRhcHRlciBpcyBtYXJrZWQgYXNcbiAgLy8gaW1wbGVtZW50aW5nIEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZVRodW5rLiBPbmNlIG11bHRpcGxlIHBsdWdpbiBBUElcbiAgLy8gdmVyc2lvbnMgZXhpc3QsIHdlIG1heSB3YW50IHRvIGdlbmVyYXRlIGEgSHlkcm9nZW5LZXJuZWxNaWRkbGV3YXJlVGh1bmtcbiAgLy8gc3BlY2lhbGl6ZWQgZm9yIGEgcGFydGljdWxhciBwbHVnaW4gQVBJIHZlcnNpb24uXG4gIGdldCBfbmV4dEFzUGx1Z2luVHlwZSgpOiBIeWRyb2dlbktlcm5lbE1pZGRsZXdhcmVUaHVuayB7XG4gICAgaWYgKHRoaXMuX25leHQgaW5zdGFuY2VvZiBLZXJuZWxUcmFuc3BvcnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgXCJNaWRkbGV3YXJlQWRhcHRlcjogX25leHRBc1BsdWdpblR5cGUgbXVzdCBuZXZlciBiZSBjYWxsZWQgd2hlbiBfbmV4dCBpcyBLZXJuZWxUcmFuc3BvcnRcIlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX25leHQ7XG4gIH1cblxuICBpbnRlcnJ1cHQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX21pZGRsZXdhcmUuaW50ZXJydXB0KSB7XG4gICAgICB0aGlzLl9taWRkbGV3YXJlLmludGVycnVwdCh0aGlzLl9uZXh0QXNQbHVnaW5UeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmV4dC5pbnRlcnJ1cHQoKTtcbiAgICB9XG4gIH1cblxuICBzaHV0ZG93bigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fbWlkZGxld2FyZS5zaHV0ZG93bikge1xuICAgICAgdGhpcy5fbWlkZGxld2FyZS5zaHV0ZG93bih0aGlzLl9uZXh0QXNQbHVnaW5UeXBlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fbmV4dC5zaHV0ZG93bigpO1xuICAgIH1cbiAgfVxuXG4gIHJlc3RhcnQob25SZXN0YXJ0ZWQ6ID9GdW5jdGlvbik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9taWRkbGV3YXJlLnJlc3RhcnQpIHtcbiAgICAgIHRoaXMuX21pZGRsZXdhcmUucmVzdGFydCh0aGlzLl9uZXh0QXNQbHVnaW5UeXBlLCBvblJlc3RhcnRlZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25leHQucmVzdGFydChvblJlc3RhcnRlZCk7XG4gICAgfVxuICB9XG5cbiAgZXhlY3V0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrKTogdm9pZCB7XG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB0byByZXBlYXRlZGx5IHdyYXAgdGhlIG9uUmVzdWx0cyBjYWxsYmFjayBldmVyeSB0aW1lIHdlXG4gICAgLy8gZmFsbCB0aHJvdWdoLCBidXQgd2UgbmVlZCB0byBkbyBpdCBhdCBsZWFzdCBvbmNlIGJlZm9yZSBkZWxlZ2F0aW5nIHRvXG4gICAgLy8gdGhlIEtlcm5lbFRyYW5zcG9ydC5cbiAgICBsZXQgc2FmZU9uUmVzdWx0cyA9XG4gICAgICB0aGlzLl9taWRkbGV3YXJlLmV4ZWN1dGUgfHwgdGhpcy5fbmV4dCBpbnN0YW5jZW9mIEtlcm5lbFRyYW5zcG9ydFxuICAgICAgICA/IHByb3RlY3RGcm9tSW52YWxpZE1lc3NhZ2VzKG9uUmVzdWx0cylcbiAgICAgICAgOiBvblJlc3VsdHM7XG5cbiAgICBpZiAodGhpcy5fbWlkZGxld2FyZS5leGVjdXRlKSB7XG4gICAgICB0aGlzLl9taWRkbGV3YXJlLmV4ZWN1dGUodGhpcy5fbmV4dEFzUGx1Z2luVHlwZSwgY29kZSwgc2FmZU9uUmVzdWx0cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25leHQuZXhlY3V0ZShjb2RlLCBzYWZlT25SZXN1bHRzKTtcbiAgICB9XG4gIH1cblxuICBjb21wbGV0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrKTogdm9pZCB7XG4gICAgbGV0IHNhZmVPblJlc3VsdHMgPVxuICAgICAgdGhpcy5fbWlkZGxld2FyZS5jb21wbGV0ZSB8fCB0aGlzLl9uZXh0IGluc3RhbmNlb2YgS2VybmVsVHJhbnNwb3J0XG4gICAgICAgID8gcHJvdGVjdEZyb21JbnZhbGlkTWVzc2FnZXMob25SZXN1bHRzKVxuICAgICAgICA6IG9uUmVzdWx0cztcblxuICAgIGlmICh0aGlzLl9taWRkbGV3YXJlLmNvbXBsZXRlKSB7XG4gICAgICB0aGlzLl9taWRkbGV3YXJlLmNvbXBsZXRlKHRoaXMuX25leHRBc1BsdWdpblR5cGUsIGNvZGUsIHNhZmVPblJlc3VsdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9uZXh0LmNvbXBsZXRlKGNvZGUsIHNhZmVPblJlc3VsdHMpO1xuICAgIH1cbiAgfVxuXG4gIGluc3BlY3QoY29kZTogc3RyaW5nLCBjdXJzb3JQb3M6IG51bWJlciwgb25SZXN1bHRzOiBSZXN1bHRzQ2FsbGJhY2spOiB2b2lkIHtcbiAgICBsZXQgc2FmZU9uUmVzdWx0cyA9XG4gICAgICB0aGlzLl9taWRkbGV3YXJlLmluc3BlY3QgfHwgdGhpcy5fbmV4dCBpbnN0YW5jZW9mIEtlcm5lbFRyYW5zcG9ydFxuICAgICAgICA/IHByb3RlY3RGcm9tSW52YWxpZE1lc3NhZ2VzKG9uUmVzdWx0cylcbiAgICAgICAgOiBvblJlc3VsdHM7XG4gICAgaWYgKHRoaXMuX21pZGRsZXdhcmUuaW5zcGVjdCkge1xuICAgICAgdGhpcy5fbWlkZGxld2FyZS5pbnNwZWN0KFxuICAgICAgICB0aGlzLl9uZXh0QXNQbHVnaW5UeXBlLFxuICAgICAgICBjb2RlLFxuICAgICAgICBjdXJzb3JQb3MsXG4gICAgICAgIHNhZmVPblJlc3VsdHNcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX25leHQuaW5zcGVjdChjb2RlLCBjdXJzb3JQb3MsIHNhZmVPblJlc3VsdHMpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXJuZWwge1xuICBAb2JzZXJ2YWJsZVxuICBpbnNwZWN0b3IgPSB7IGJ1bmRsZToge30gfTtcbiAgb3V0cHV0U3RvcmUgPSBuZXcgT3V0cHV0U3RvcmUoKTtcblxuICB3YXRjaGVzU3RvcmU6IFdhdGNoZXNTdG9yZTtcbiAgd2F0Y2hDYWxsYmFja3M6IEFycmF5PEZ1bmN0aW9uPiA9IFtdO1xuXG4gIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuICBwbHVnaW5XcmFwcGVyOiBIeWRyb2dlbktlcm5lbCB8IG51bGwgPSBudWxsO1xuICB0cmFuc3BvcnQ6IEtlcm5lbFRyYW5zcG9ydDtcblxuICAvLyBJbnZhcmlhbnQ6IHRoZSBgLl9uZXh0YCBvZiBlYWNoIGVudHJ5IGluIHRoaXMgYXJyYXkgbXVzdCBwb2ludCB0byB0aGUgbmV4dFxuICAvLyBlbGVtZW50IG9mIHRoZSBhcnJheS4gVGhlIGAuX25leHRgIG9mIHRoZSBsYXN0IGVsZW1lbnQgbXVzdCBwb2ludCB0b1xuICAvLyBgdGhpcy50cmFuc3BvcnRgLlxuICBtaWRkbGV3YXJlOiBBcnJheTxNaWRkbGV3YXJlQWRhcHRlcj47XG5cbiAgY29uc3RydWN0b3Ioa2VybmVsOiBLZXJuZWxUcmFuc3BvcnQpIHtcbiAgICB0aGlzLnRyYW5zcG9ydCA9IGtlcm5lbDtcblxuICAgIHRoaXMud2F0Y2hlc1N0b3JlID0gbmV3IFdhdGNoZXNTdG9yZSh0aGlzKTtcblxuICAgIC8vIEEgTWlkZGxld2FyZUFkYXB0ZXIgdGhhdCBmb3J3YXJkcyBhbGwgcmVxdWVzdHMgdG8gYHRoaXMudHJhbnNwb3J0YC5cbiAgICAvLyBOZWVkZWQgdG8gdGVybWluYXRlIHRoZSBtaWRkbGV3YXJlIGNoYWluIGluIGEgd2F5IHN1Y2ggdGhhdCB0aGUgYG5leHRgXG4gICAgLy8gb2JqZWN0IHBhc3NlZCB0byB0aGUgbGFzdCBtaWRkbGV3YXJlIGlzIG5vdCB0aGUgS2VybmVsVHJhbnNwb3J0IGluc3RhbmNlXG4gICAgLy8gaXRzZWxmICh3aGljaCB3b3VsZCBiZSB2aW9sYXRlIGlzb2xhdGlvbiBvZiBpbnRlcm5hbHMgZnJvbSBwbHVnaW5zKS5cbiAgICBjb25zdCBkZWxlZ2F0ZVRvVHJhbnNwb3J0ID0gbmV3IE1pZGRsZXdhcmVBZGFwdGVyKHt9LCB0aGlzLnRyYW5zcG9ydCk7XG4gICAgdGhpcy5taWRkbGV3YXJlID0gW2RlbGVnYXRlVG9UcmFuc3BvcnRdO1xuICB9XG5cbiAgZ2V0IGtlcm5lbFNwZWMoKTogS2VybmVsc3BlYyB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0Lmtlcm5lbFNwZWM7XG4gIH1cblxuICBnZXQgZ3JhbW1hcigpOiBhdG9tJEdyYW1tYXIge1xuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5ncmFtbWFyO1xuICB9XG5cbiAgZ2V0IGxhbmd1YWdlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0Lmxhbmd1YWdlO1xuICB9XG5cbiAgZ2V0IGRpc3BsYXlOYW1lKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LmRpc3BsYXlOYW1lO1xuICB9XG5cbiAgZ2V0IGZpcnN0TWlkZGxld2FyZUFkYXB0ZXIoKTogTWlkZGxld2FyZUFkYXB0ZXIge1xuICAgIHJldHVybiB0aGlzLm1pZGRsZXdhcmVbMF07XG4gIH1cblxuICBhZGRNaWRkbGV3YXJlKG1pZGRsZXdhcmU6IEh5ZHJvZ2VuS2VybmVsTWlkZGxld2FyZSkge1xuICAgIHRoaXMubWlkZGxld2FyZS51bnNoaWZ0KFxuICAgICAgbmV3IE1pZGRsZXdhcmVBZGFwdGVyKG1pZGRsZXdhcmUsIHRoaXMubWlkZGxld2FyZVswXSlcbiAgICApO1xuICB9XG5cbiAgQGNvbXB1dGVkXG4gIGdldCBleGVjdXRpb25TdGF0ZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnRyYW5zcG9ydC5leGVjdXRpb25TdGF0ZTtcbiAgfVxuXG4gIHNldEV4ZWN1dGlvblN0YXRlKHN0YXRlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRyYW5zcG9ydC5zZXRFeGVjdXRpb25TdGF0ZShzdGF0ZSk7XG4gIH1cblxuICBAY29tcHV0ZWRcbiAgZ2V0IGV4ZWN1dGlvbkNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNwb3J0LmV4ZWN1dGlvbkNvdW50O1xuICB9XG5cbiAgc2V0RXhlY3V0aW9uQ291bnQoY291bnQ6IG51bWJlcikge1xuICAgIHRoaXMudHJhbnNwb3J0LnNldEV4ZWN1dGlvbkNvdW50KGNvdW50KTtcbiAgfVxuXG4gIEBjb21wdXRlZFxuICBnZXQgbGFzdEV4ZWN1dGlvblRpbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc3BvcnQubGFzdEV4ZWN1dGlvblRpbWU7XG4gIH1cblxuICBzZXRMYXN0RXhlY3V0aW9uVGltZSh0aW1lU3RyaW5nOiBzdHJpbmcpIHtcbiAgICB0aGlzLnRyYW5zcG9ydC5zZXRMYXN0RXhlY3V0aW9uVGltZSh0aW1lU3RyaW5nKTtcbiAgfVxuXG4gIEBhY3Rpb25cbiAgYXN5bmMgc2V0SW5zcGVjdG9yUmVzdWx0KGJ1bmRsZTogT2JqZWN0LCBlZGl0b3I6ID9hdG9tJFRleHRFZGl0b3IpIHtcbiAgICBpZiAoaXNFcXVhbCh0aGlzLmluc3BlY3Rvci5idW5kbGUsIGJ1bmRsZSkpIHtcbiAgICAgIGF3YWl0IGF0b20ud29ya3NwYWNlLnRvZ2dsZShJTlNQRUNUT1JfVVJJKTtcbiAgICB9IGVsc2UgaWYgKGJ1bmRsZS5zaXplICE9PSAwKSB7XG4gICAgICB0aGlzLmluc3BlY3Rvci5idW5kbGUgPSBidW5kbGU7XG4gICAgICBhd2FpdCBhdG9tLndvcmtzcGFjZS5vcGVuKElOU1BFQ1RPUl9VUkksIHsgc2VhcmNoQWxsUGFuZXM6IHRydWUgfSk7XG4gICAgfVxuICAgIGZvY3VzKGVkaXRvcik7XG4gIH1cblxuICBnZXRQbHVnaW5XcmFwcGVyKCkge1xuICAgIGlmICghdGhpcy5wbHVnaW5XcmFwcGVyKSB7XG4gICAgICB0aGlzLnBsdWdpbldyYXBwZXIgPSBuZXcgSHlkcm9nZW5LZXJuZWwodGhpcyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGx1Z2luV3JhcHBlcjtcbiAgfVxuXG4gIGFkZFdhdGNoQ2FsbGJhY2sod2F0Y2hDYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICB0aGlzLndhdGNoQ2FsbGJhY2tzLnB1c2god2F0Y2hDYWxsYmFjayk7XG4gIH1cblxuICBpbnRlcnJ1cHQoKSB7XG4gICAgdGhpcy5maXJzdE1pZGRsZXdhcmVBZGFwdGVyLmludGVycnVwdCgpO1xuICB9XG5cbiAgc2h1dGRvd24oKSB7XG4gICAgdGhpcy5maXJzdE1pZGRsZXdhcmVBZGFwdGVyLnNodXRkb3duKCk7XG4gIH1cblxuICByZXN0YXJ0KG9uUmVzdGFydGVkOiA/RnVuY3Rpb24pIHtcbiAgICB0aGlzLmZpcnN0TWlkZGxld2FyZUFkYXB0ZXIucmVzdGFydChvblJlc3RhcnRlZCk7XG4gICAgdGhpcy5zZXRFeGVjdXRpb25Db3VudCgwKTtcbiAgICB0aGlzLnNldExhc3RFeGVjdXRpb25UaW1lKFwiTm8gZXhlY3V0aW9uXCIpO1xuICB9XG5cbiAgZXhlY3V0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogRnVuY3Rpb24pIHtcbiAgICBjb25zdCB3cmFwcGVkT25SZXN1bHRzID0gdGhpcy5fd3JhcEV4ZWN1dGlvblJlc3VsdHNDYWxsYmFjayhvblJlc3VsdHMpO1xuICAgIHRoaXMuZmlyc3RNaWRkbGV3YXJlQWRhcHRlci5leGVjdXRlKFxuICAgICAgY29kZSxcbiAgICAgIChtZXNzYWdlOiBNZXNzYWdlLCBjaGFubmVsOiBzdHJpbmcpID0+IHtcbiAgICAgICAgd3JhcHBlZE9uUmVzdWx0cyhtZXNzYWdlLCBjaGFubmVsKTtcblxuICAgICAgICBjb25zdCB7IG1zZ190eXBlIH0gPSBtZXNzYWdlLmhlYWRlcjtcbiAgICAgICAgaWYgKG1zZ190eXBlID09PSBcImV4ZWN1dGVfaW5wdXRcIikge1xuICAgICAgICAgIHRoaXMuc2V0TGFzdEV4ZWN1dGlvblRpbWUoXCJSdW5uaW5nIC4uLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtc2dfdHlwZSA9PT0gXCJleGVjdXRlX3JlcGx5XCIpIHtcbiAgICAgICAgICBjb25zdCBjb3VudCA9IG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fY291bnQ7XG4gICAgICAgICAgdGhpcy5zZXRFeGVjdXRpb25Db3VudChjb3VudCk7XG4gICAgICAgICAgY29uc3QgdGltZVN0cmluZyA9IGV4ZWN1dGlvblRpbWUobWVzc2FnZSk7XG4gICAgICAgICAgdGhpcy5zZXRMYXN0RXhlY3V0aW9uVGltZSh0aW1lU3RyaW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHsgZXhlY3V0aW9uX3N0YXRlIH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBjaGFubmVsID09IFwiaW9wdWJcIiAmJlxuICAgICAgICAgIG1zZ190eXBlID09PSBcInN0YXR1c1wiICYmXG4gICAgICAgICAgZXhlY3V0aW9uX3N0YXRlID09PSBcImlkbGVcIlxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9jYWxsV2F0Y2hDYWxsYmFja3MoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBleGVjdXRlV2F0Y2goY29kZTogc3RyaW5nLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5maXJzdE1pZGRsZXdhcmVBZGFwdGVyLmV4ZWN1dGUoXG4gICAgICBjb2RlLFxuICAgICAgdGhpcy5fd3JhcEV4ZWN1dGlvblJlc3VsdHNDYWxsYmFjayhvblJlc3VsdHMpXG4gICAgKTtcbiAgfVxuXG4gIF9jYWxsV2F0Y2hDYWxsYmFja3MoKSB7XG4gICAgdGhpcy53YXRjaENhbGxiYWNrcy5mb3JFYWNoKCh3YXRjaENhbGxiYWNrKSA9PiB3YXRjaENhbGxiYWNrKCkpO1xuICB9XG5cbiAgLypcbiAgICogVGFrZXMgYSBjYWxsYmFjayB0aGF0IGFjY2VwdHMgZXhlY3V0aW9uIHJlc3VsdHMgaW4gYSBoeWRyb2dlbi1pbnRlcm5hbFxuICAgKiBmb3JtYXQgYW5kIHdyYXBzIGl0IHRvIGFjY2VwdCBKdXB5dGVyIG1lc3NhZ2UvY2hhbm5lbCBwYWlycyBpbnN0ZWFkLlxuICAgKiBLZXJuZWxzIGFuZCBwbHVnaW5zIGFsbCBvcGVyYXRlIG9uIHR5cGVzIHNwZWNpZmllZCBieSB0aGUgSnVweXRlciBtZXNzYWdpbmdcbiAgICogcHJvdG9jb2wgaW4gb3JkZXIgdG8gbWF4aW1pemUgY29tcGF0aWJpbGl0eSwgYnV0IGh5ZHJvZ2VuIGludGVybmFsbHkgdXNlc1xuICAgKiBpdHMgb3duIHR5cGVzLlxuICAgKi9cbiAgX3dyYXBFeGVjdXRpb25SZXN1bHRzQ2FsbGJhY2sob25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHJldHVybiAobWVzc2FnZTogTWVzc2FnZSwgY2hhbm5lbDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAoY2hhbm5lbCA9PT0gXCJzaGVsbFwiKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdHVzIH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG4gICAgICAgIGlmIChzdGF0dXMgPT09IFwiZXJyb3JcIiB8fCBzdGF0dXMgPT09IFwib2tcIikge1xuICAgICAgICAgIG9uUmVzdWx0cyh7XG4gICAgICAgICAgICBkYXRhOiBzdGF0dXMsXG4gICAgICAgICAgICBzdHJlYW06IFwic3RhdHVzXCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbG9nKFwiS2VybmVsOiBpZ25vcmluZyB1bmV4cGVjdGVkIHZhbHVlIGZvciBtZXNzYWdlLmNvbnRlbnQuc3RhdHVzXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGNoYW5uZWwgPT09IFwiaW9wdWJcIikge1xuICAgICAgICBpZiAobWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgPT09IFwiZXhlY3V0ZV9pbnB1dFwiKSB7XG4gICAgICAgICAgb25SZXN1bHRzKHtcbiAgICAgICAgICAgIGRhdGE6IG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fY291bnQsXG4gICAgICAgICAgICBzdHJlYW06IFwiZXhlY3V0aW9uX2NvdW50XCIsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPKG5pa2l0YSk6IENvbnNpZGVyIGNvbnZlcnRpbmcgdG8gVjUgZWxzZXdoZXJlLCBzbyB0aGF0IHBsdWdpbnNcbiAgICAgICAgLy8gbmV2ZXIgaGF2ZSB0byBkZWFsIHdpdGggbWVzc2FnZXMgaW4gdGhlIFY0IGZvcm1hdFxuICAgICAgICBjb25zdCByZXN1bHQgPSBtc2dTcGVjVG9Ob3RlYm9va0Zvcm1hdChtc2dTcGVjVjR0b1Y1KG1lc3NhZ2UpKTtcbiAgICAgICAgb25SZXN1bHRzKHJlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKGNoYW5uZWwgPT09IFwic3RkaW5cIikge1xuICAgICAgICBpZiAobWVzc2FnZS5oZWFkZXIubXNnX3R5cGUgIT09IFwiaW5wdXRfcmVxdWVzdFwiKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgeyBwcm9tcHQsIHBhc3N3b3JkIH0gPSBtZXNzYWdlLmNvbnRlbnQ7XG5cbiAgICAgICAgLy8gVE9ETyhuaWtpdGEpOiBwZXJoYXBzIGl0IHdvdWxkIG1ha2Ugc2Vuc2UgdG8gaW5zdGFsbCBtaWRkbGV3YXJlIGZvclxuICAgICAgICAvLyBzZW5kaW5nIGlucHV0IHJlcGxpZXNcbiAgICAgICAgY29uc3QgaW5wdXRWaWV3ID0gbmV3IElucHV0Vmlldyh7IHByb21wdCwgcGFzc3dvcmQgfSwgKGlucHV0OiBzdHJpbmcpID0+XG4gICAgICAgICAgdGhpcy50cmFuc3BvcnQuaW5wdXRSZXBseShpbnB1dClcbiAgICAgICAgKTtcblxuICAgICAgICBpbnB1dFZpZXcuYXR0YWNoKCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGNvbXBsZXRlKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBGdW5jdGlvbikge1xuICAgIHRoaXMuZmlyc3RNaWRkbGV3YXJlQWRhcHRlci5jb21wbGV0ZShcbiAgICAgIGNvZGUsXG4gICAgICAobWVzc2FnZTogTWVzc2FnZSwgY2hhbm5lbDogc3RyaW5nKSA9PiB7XG4gICAgICAgIGlmIChjaGFubmVsICE9PSBcInNoZWxsXCIpIHtcbiAgICAgICAgICBsb2coXCJJbnZhbGlkIHJlcGx5OiB3cm9uZyBjaGFubmVsXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBvblJlc3VsdHMobWVzc2FnZS5jb250ZW50KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgaW5zcGVjdChjb2RlOiBzdHJpbmcsIGN1cnNvclBvczogbnVtYmVyLCBvblJlc3VsdHM6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5maXJzdE1pZGRsZXdhcmVBZGFwdGVyLmluc3BlY3QoXG4gICAgICBjb2RlLFxuICAgICAgY3Vyc29yUG9zLFxuICAgICAgKG1lc3NhZ2U6IE1lc3NhZ2UsIGNoYW5uZWw6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAoY2hhbm5lbCAhPT0gXCJzaGVsbFwiKSB7XG4gICAgICAgICAgbG9nKFwiSW52YWxpZCByZXBseTogd3JvbmcgY2hhbm5lbFwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgb25SZXN1bHRzKHtcbiAgICAgICAgICBkYXRhOiBtZXNzYWdlLmNvbnRlbnQuZGF0YSxcbiAgICAgICAgICBmb3VuZDogbWVzc2FnZS5jb250ZW50LmZvdW5kLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICApO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBsb2coXCJLZXJuZWw6IERlc3Ryb3lpbmdcIik7XG4gICAgLy8gVGhpcyBpcyBmb3IgY2xlYW51cCB0byBpbXByb3ZlIHBlcmZvcm1hbmNlXG4gICAgdGhpcy53YXRjaGVzU3RvcmUuZGVzdHJveSgpO1xuICAgIHN0b3JlLmRlbGV0ZUtlcm5lbCh0aGlzKTtcbiAgICB0aGlzLnRyYW5zcG9ydC5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMucGx1Z2luV3JhcHBlcikge1xuICAgICAgdGhpcy5wbHVnaW5XcmFwcGVyLmRlc3Ryb3llZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuZW1pdHRlci5lbWl0KFwiZGlkLWRlc3Ryb3lcIik7XG4gICAgdGhpcy5lbWl0dGVyLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19