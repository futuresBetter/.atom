Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _jmp = require("jmp");

var _uuid = require("uuid");

var _spawnteract = require("spawnteract");

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _kernelTransport = require("./kernel-transport");

var _kernelTransport2 = _interopRequireDefault(_kernelTransport);

var _utils = require("./utils");

var ZMQKernel = (function (_KernelTransport) {
  _inherits(ZMQKernel, _KernelTransport);

  function ZMQKernel(kernelSpec, grammar, options, onStarted) {
    var _this = this;

    _classCallCheck(this, ZMQKernel);

    _get(Object.getPrototypeOf(ZMQKernel.prototype), "constructor", this).call(this, kernelSpec, grammar);
    this.executionCallbacks = {};
    this.options = options || {};
    // Otherwise spawnteract deletes the file and hydrogen's restart kernel fails
    options.cleanupConnectionFile = false;

    (0, _spawnteract.launchSpec)(kernelSpec, options).then(function (_ref) {
      var config = _ref.config;
      var connectionFile = _ref.connectionFile;
      var spawn = _ref.spawn;

      _this.connection = config;
      _this.connectionFile = connectionFile;
      _this.kernelProcess = spawn;

      _this.monitorNotifications(spawn);

      _this.connect(function () {
        _this._executeStartupCode();

        if (onStarted) onStarted(_this);
      });
    });
  }

  _createClass(ZMQKernel, [{
    key: "connect",
    value: function connect(done) {
      var scheme = this.connection.signature_scheme.slice("hmac-".length);
      var key = this.connection.key;

      this.shellSocket = new _jmp.Socket("dealer", scheme, key);
      this.stdinSocket = new _jmp.Socket("dealer", scheme, key);
      this.ioSocket = new _jmp.Socket("sub", scheme, key);

      var id = (0, _uuid.v4)();
      this.shellSocket.identity = "dealer" + id;
      this.stdinSocket.identity = "dealer" + id;
      this.ioSocket.identity = "sub" + id;

      var address = this.connection.transport + "://" + this.connection.ip + ":";
      this.shellSocket.connect(address + this.connection.shell_port);
      this.ioSocket.connect(address + this.connection.iopub_port);
      this.ioSocket.subscribe("");
      this.stdinSocket.connect(address + this.connection.stdin_port);

      this.shellSocket.on("message", this.onShellMessage.bind(this));
      this.ioSocket.on("message", this.onIOMessage.bind(this));
      this.stdinSocket.on("message", this.onStdinMessage.bind(this));

      this.monitor(done);
    }
  }, {
    key: "monitorNotifications",
    value: function monitorNotifications(childProcess) {
      var _this2 = this;

      childProcess.stdout.on("data", function (data) {
        data = data.toString();

        if (atom.config.get("Hydrogen.kernelNotifications")) {
          atom.notifications.addInfo(_this2.kernelSpec.display_name, {
            description: data,
            dismissable: true
          });
        } else {
          (0, _utils.log)("ZMQKernel: stdout:", data);
        }
      });

      childProcess.stderr.on("data", function (data) {
        atom.notifications.addError(_this2.kernelSpec.display_name, {
          description: data.toString(),
          dismissable: true
        });
      });
    }
  }, {
    key: "monitor",
    value: function monitor(done) {
      var _this3 = this;

      try {
        (function () {
          var socketNames = ["shellSocket", "ioSocket"];

          var waitGroup = socketNames.length;

          var onConnect = function onConnect(_ref2) {
            var socketName = _ref2.socketName;
            var socket = _ref2.socket;

            (0, _utils.log)("ZMQKernel: " + socketName + " connected");
            socket.unmonitor();

            waitGroup--;
            if (waitGroup === 0) {
              (0, _utils.log)("ZMQKernel: all main sockets connected");
              _this3.setExecutionState("idle");
              if (done) done();
            }
          };

          var monitor = function monitor(socketName, socket) {
            (0, _utils.log)("ZMQKernel: monitor " + socketName);
            socket.on("connect", onConnect.bind(_this3, { socketName: socketName, socket: socket }));
            socket.monitor();
          };

          monitor("shellSocket", _this3.shellSocket);
          monitor("ioSocket", _this3.ioSocket);
        })();
      } catch (err) {
        (0, _utils.log)("ZMQKernel:", err);
      }
    }
  }, {
    key: "interrupt",
    value: function interrupt() {
      if (process.platform === "win32") {
        atom.notifications.addWarning("Cannot interrupt this kernel", {
          detail: "Kernel interruption is currently not supported in Windows."
        });
      } else {
        (0, _utils.log)("ZMQKernel: sending SIGINT");
        this.kernelProcess.kill("SIGINT");
      }
    }
  }, {
    key: "_kill",
    value: function _kill() {
      (0, _utils.log)("ZMQKernel: sending SIGKILL");
      this.kernelProcess.kill("SIGKILL");
    }
  }, {
    key: "_executeStartupCode",
    value: function _executeStartupCode() {
      var displayName = this.kernelSpec.display_name;
      var startupCode = _config2["default"].getJson("startupCode")[displayName];
      if (startupCode) {
        (0, _utils.log)("KernelManager: Executing startup code:", startupCode);
        startupCode += "\n";
        this.execute(startupCode, function (message, channel) {});
      }
    }
  }, {
    key: "shutdown",
    value: function shutdown() {
      this._socketShutdown();
    }
  }, {
    key: "restart",
    value: function restart(onRestarted) {
      this._socketRestart(onRestarted);
    }
  }, {
    key: "_socketShutdown",
    value: function _socketShutdown() {
      var restart = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var requestId = "shutdown_" + (0, _uuid.v4)();
      var message = this._createMessage("shutdown_request", requestId);

      message.content = { restart: restart };

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "_socketRestart",
    value: function _socketRestart(onRestarted) {
      var _this4 = this;

      if (this.executionState === "restarting") {
        return;
      }
      this.setExecutionState("restarting");
      this._socketShutdown(true);
      this._kill();

      var _launchSpecFromConnectionInfo = (0, _spawnteract.launchSpecFromConnectionInfo)(this.kernelSpec, this.connection, this.connectionFile, this.options);

      var spawn = _launchSpecFromConnectionInfo.spawn;

      this.kernelProcess = spawn;
      this.monitor(function () {
        _this4._executeStartupCode();
        if (onRestarted) onRestarted();
      });
    }

    // onResults is a callback that may be called multiple times
    // as results come in from the kernel
  }, {
    key: "execute",
    value: function execute(code, onResults) {
      (0, _utils.log)("ZMQKernel.execute:", code);
      var requestId = "execute_" + (0, _uuid.v4)();

      var message = this._createMessage("execute_request", requestId);

      message.content = {
        code: code,
        silent: false,
        store_history: true,
        user_expressions: {},
        allow_stdin: true
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "complete",
    value: function complete(code, onResults) {
      (0, _utils.log)("ZMQKernel.complete:", code);

      var requestId = "complete_" + (0, _uuid.v4)();

      var message = this._createMessage("complete_request", requestId);

      message.content = {
        code: code,
        text: code,
        line: code,
        cursor_pos: (0, _utils.js_idx_to_char_idx)(code.length, code)
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "inspect",
    value: function inspect(code, cursorPos, onResults) {
      (0, _utils.log)("ZMQKernel.inspect:", code, cursorPos);

      var requestId = "inspect_" + (0, _uuid.v4)();

      var message = this._createMessage("inspect_request", requestId);

      message.content = {
        code: code,
        cursor_pos: cursorPos,
        detail_level: 0
      };

      this.executionCallbacks[requestId] = onResults;

      this.shellSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "inputReply",
    value: function inputReply(input) {
      var requestId = "input_reply_" + (0, _uuid.v4)();

      var message = this._createMessage("input_reply", requestId);

      message.content = { value: input };

      this.stdinSocket.send(new _jmp.Message(message));
    }
  }, {
    key: "onShellMessage",
    value: function onShellMessage(message) {
      (0, _utils.log)("shell message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (callback) {
        callback(message, "shell");
      }
    }
  }, {
    key: "onStdinMessage",
    value: function onStdinMessage(message) {
      (0, _utils.log)("stdin message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      // input_request messages are attributable to particular execution requests,
      // and should pass through the middleware stack to allow plugins to see them
      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (callback) {
        callback(message, "stdin");
      }
    }
  }, {
    key: "onIOMessage",
    value: function onIOMessage(message) {
      (0, _utils.log)("IO message:", message);

      if (!this._isValidMessage(message)) {
        return;
      }

      var msg_type = message.header.msg_type;

      if (msg_type === "status") {
        var _status = message.content.execution_state;
        this.setExecutionState(_status);
      }

      var msg_id = message.parent_header.msg_id;

      var callback = undefined;
      if (msg_id) {
        callback = this.executionCallbacks[msg_id];
      }

      if (callback) {
        callback(message, "iopub");
      }
    }
  }, {
    key: "_isValidMessage",
    value: function _isValidMessage(message) {
      if (!message) {
        (0, _utils.log)("Invalid message: null");
        return false;
      }

      if (!message.content) {
        (0, _utils.log)("Invalid message: Missing content");
        return false;
      }

      if (message.content.execution_state === "starting") {
        // Kernels send a starting status message with an empty parent_header
        (0, _utils.log)("Dropped starting status IO message");
        return false;
      }

      if (!message.parent_header) {
        (0, _utils.log)("Invalid message: Missing parent_header");
        return false;
      }

      if (!message.parent_header.msg_id) {
        (0, _utils.log)("Invalid message: Missing parent_header.msg_id");
        return false;
      }

      if (!message.parent_header.msg_type) {
        (0, _utils.log)("Invalid message: Missing parent_header.msg_type");
        return false;
      }

      if (!message.header) {
        (0, _utils.log)("Invalid message: Missing header");
        return false;
      }

      if (!message.header.msg_id) {
        (0, _utils.log)("Invalid message: Missing header.msg_id");
        return false;
      }

      if (!message.header.msg_type) {
        (0, _utils.log)("Invalid message: Missing header.msg_type");
        return false;
      }

      return true;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      (0, _utils.log)("ZMQKernel: destroy:", this);

      this.shutdown();

      this._kill();
      _fs2["default"].unlinkSync(this.connectionFile);

      this.shellSocket.close();
      this.ioSocket.close();
      this.stdinSocket.close();

      _get(Object.getPrototypeOf(ZMQKernel.prototype), "destroy", this).call(this);
    }
  }, {
    key: "_getUsername",
    value: function _getUsername() {
      return process.env.LOGNAME || process.env.USER || process.env.LNAME || process.env.USERNAME;
    }
  }, {
    key: "_createMessage",
    value: function _createMessage(msgType) {
      var msgId = arguments.length <= 1 || arguments[1] === undefined ? (0, _uuid.v4)() : arguments[1];

      var message = {
        header: {
          username: this._getUsername(),
          session: "00000000-0000-0000-0000-000000000000",
          msg_type: msgType,
          msg_id: msgId,
          date: new Date(),
          version: "5.0"
        },
        metadata: {},
        parent_header: {},
        content: {}
      };

      return message;
    }
  }]);

  return ZMQKernel;
})(_kernelTransport2["default"]);

exports["default"] = ZMQKernel;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi96bXEta2VybmVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O2tCQUVlLElBQUk7Ozs7bUJBQ2EsS0FBSzs7b0JBQ2xCLE1BQU07OzJCQUNnQyxhQUFhOztzQkFFbkQsVUFBVTs7OzsrQkFDRCxvQkFBb0I7Ozs7cUJBRVIsU0FBUzs7SUFlNUIsU0FBUztZQUFULFNBQVM7O0FBV2pCLFdBWFEsU0FBUyxDQVkxQixVQUFzQixFQUN0QixPQUFxQixFQUNyQixPQUFlLEVBQ2YsU0FBb0IsRUFDcEI7OzswQkFoQmlCLFNBQVM7O0FBaUIxQiwrQkFqQmlCLFNBQVMsNkNBaUJwQixVQUFVLEVBQUUsT0FBTyxFQUFFO1NBaEI3QixrQkFBa0IsR0FBVyxFQUFFO0FBaUI3QixRQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLENBQUM7O0FBRTdCLFdBQU8sQ0FBQyxxQkFBcUIsR0FBRyxLQUFLLENBQUM7O0FBRXRDLGlDQUFXLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQ2xDLFVBQUMsSUFBaUMsRUFBSztVQUFwQyxNQUFNLEdBQVIsSUFBaUMsQ0FBL0IsTUFBTTtVQUFFLGNBQWMsR0FBeEIsSUFBaUMsQ0FBdkIsY0FBYztVQUFFLEtBQUssR0FBL0IsSUFBaUMsQ0FBUCxLQUFLOztBQUM5QixZQUFLLFVBQVUsR0FBRyxNQUFNLENBQUM7QUFDekIsWUFBSyxjQUFjLEdBQUcsY0FBYyxDQUFDO0FBQ3JDLFlBQUssYUFBYSxHQUFHLEtBQUssQ0FBQzs7QUFFM0IsWUFBSyxvQkFBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFakMsWUFBSyxPQUFPLENBQUMsWUFBTTtBQUNqQixjQUFLLG1CQUFtQixFQUFFLENBQUM7O0FBRTNCLFlBQUksU0FBUyxFQUFFLFNBQVMsT0FBTSxDQUFDO09BQ2hDLENBQUMsQ0FBQztLQUNKLENBQ0YsQ0FBQztH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OztBQUVoQixVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDYixzQkFBRyxVQUFVLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDOztBQUVuQyxVQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3pCLFVBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDdEIsVUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQzs7QUFFekIsaUNBclhpQixTQUFTLHlDQXFYVjtLQUNqQjs7O1dBRVcsd0JBQUc7QUFDYixhQUNFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUNuQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksSUFDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQ2pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUNwQjtLQUNIOzs7V0FFYSx3QkFBQyxPQUFlLEVBQXdCO1VBQXRCLEtBQWEseURBQUcsZUFBSTs7QUFDbEQsVUFBTSxPQUFPLEdBQUc7QUFDZCxjQUFNLEVBQUU7QUFDTixrQkFBUSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDN0IsaUJBQU8sRUFBRSxzQ0FBc0M7QUFDL0Msa0JBQVEsRUFBRSxPQUFPO0FBQ2pCLGdCQUFNLEVBQUUsS0FBSztBQUNiLGNBQUksRUFBRSxJQUFJLElBQUksRUFBRTtBQUNoQixpQkFBTyxFQUFFLEtBQUs7U0FDZjtBQUNELGdCQUFRLEVBQUUsRUFBRTtBQUNaLHFCQUFhLEVBQUUsRUFBRTtBQUNqQixlQUFPLEVBQUUsRUFBRTtPQUNaLENBQUM7O0FBRUYsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztTQWpaa0IsU0FBUzs7O3FCQUFULFNBQVMiLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3ptcS1rZXJuZWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgeyBNZXNzYWdlLCBTb2NrZXQgfSBmcm9tIFwiam1wXCI7XG5pbXBvcnQgeyB2NCB9IGZyb20gXCJ1dWlkXCI7XG5pbXBvcnQgeyBsYXVuY2hTcGVjLCBsYXVuY2hTcGVjRnJvbUNvbm5lY3Rpb25JbmZvIH0gZnJvbSBcInNwYXdudGVyYWN0XCI7XG5cbmltcG9ydCBDb25maWcgZnJvbSBcIi4vY29uZmlnXCI7XG5pbXBvcnQgS2VybmVsVHJhbnNwb3J0IGZyb20gXCIuL2tlcm5lbC10cmFuc3BvcnRcIjtcbmltcG9ydCB0eXBlIHsgUmVzdWx0c0NhbGxiYWNrIH0gZnJvbSBcIi4va2VybmVsLXRyYW5zcG9ydFwiO1xuaW1wb3J0IHsgbG9nLCBqc19pZHhfdG9fY2hhcl9pZHggfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5leHBvcnQgdHlwZSBDb25uZWN0aW9uID0ge1xuICBjb250cm9sX3BvcnQ6IG51bWJlcixcbiAgaGJfcG9ydDogbnVtYmVyLFxuICBpb3B1Yl9wb3J0OiBudW1iZXIsXG4gIGlwOiBzdHJpbmcsXG4gIGtleTogc3RyaW5nLFxuICBzaGVsbF9wb3J0OiBudW1iZXIsXG4gIHNpZ25hdHVyZV9zY2hlbWU6IHN0cmluZyxcbiAgc3RkaW5fcG9ydDogbnVtYmVyLFxuICB0cmFuc3BvcnQ6IHN0cmluZyxcbiAgdmVyc2lvbjogbnVtYmVyLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWk1RS2VybmVsIGV4dGVuZHMgS2VybmVsVHJhbnNwb3J0IHtcbiAgZXhlY3V0aW9uQ2FsbGJhY2tzOiBPYmplY3QgPSB7fTtcbiAgY29ubmVjdGlvbjogQ29ubmVjdGlvbjtcbiAgY29ubmVjdGlvbkZpbGU6IHN0cmluZztcbiAga2VybmVsUHJvY2VzczogY2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIG9wdGlvbnM6IE9iamVjdDtcblxuICBzaGVsbFNvY2tldDogU29ja2V0O1xuICBzdGRpblNvY2tldDogU29ja2V0O1xuICBpb1NvY2tldDogU29ja2V0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGtlcm5lbFNwZWM6IEtlcm5lbHNwZWMsXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyLFxuICAgIG9wdGlvbnM6IE9iamVjdCxcbiAgICBvblN0YXJ0ZWQ6ID9GdW5jdGlvblxuICApIHtcbiAgICBzdXBlcihrZXJuZWxTcGVjLCBncmFtbWFyKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIC8vIE90aGVyd2lzZSBzcGF3bnRlcmFjdCBkZWxldGVzIHRoZSBmaWxlIGFuZCBoeWRyb2dlbidzIHJlc3RhcnQga2VybmVsIGZhaWxzXG4gICAgb3B0aW9ucy5jbGVhbnVwQ29ubmVjdGlvbkZpbGUgPSBmYWxzZTtcblxuICAgIGxhdW5jaFNwZWMoa2VybmVsU3BlYywgb3B0aW9ucykudGhlbihcbiAgICAgICh7IGNvbmZpZywgY29ubmVjdGlvbkZpbGUsIHNwYXduIH0pID0+IHtcbiAgICAgICAgdGhpcy5jb25uZWN0aW9uID0gY29uZmlnO1xuICAgICAgICB0aGlzLmNvbm5lY3Rpb25GaWxlID0gY29ubmVjdGlvbkZpbGU7XG4gICAgICAgIHRoaXMua2VybmVsUHJvY2VzcyA9IHNwYXduO1xuXG4gICAgICAgIHRoaXMubW9uaXRvck5vdGlmaWNhdGlvbnMoc3Bhd24pO1xuXG4gICAgICAgIHRoaXMuY29ubmVjdCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZXhlY3V0ZVN0YXJ0dXBDb2RlKCk7XG5cbiAgICAgICAgICBpZiAob25TdGFydGVkKSBvblN0YXJ0ZWQodGhpcyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICk7XG4gIH1cblxuICBjb25uZWN0KGRvbmU6ID9GdW5jdGlvbikge1xuICAgIGNvbnN0IHNjaGVtZSA9IHRoaXMuY29ubmVjdGlvbi5zaWduYXR1cmVfc2NoZW1lLnNsaWNlKFwiaG1hYy1cIi5sZW5ndGgpO1xuICAgIGNvbnN0IHsga2V5IH0gPSB0aGlzLmNvbm5lY3Rpb247XG5cbiAgICB0aGlzLnNoZWxsU29ja2V0ID0gbmV3IFNvY2tldChcImRlYWxlclwiLCBzY2hlbWUsIGtleSk7XG4gICAgdGhpcy5zdGRpblNvY2tldCA9IG5ldyBTb2NrZXQoXCJkZWFsZXJcIiwgc2NoZW1lLCBrZXkpO1xuICAgIHRoaXMuaW9Tb2NrZXQgPSBuZXcgU29ja2V0KFwic3ViXCIsIHNjaGVtZSwga2V5KTtcblxuICAgIGNvbnN0IGlkID0gdjQoKTtcbiAgICB0aGlzLnNoZWxsU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmlkZW50aXR5ID0gYGRlYWxlciR7aWR9YDtcbiAgICB0aGlzLmlvU29ja2V0LmlkZW50aXR5ID0gYHN1YiR7aWR9YDtcblxuICAgIGNvbnN0IGFkZHJlc3MgPSBgJHt0aGlzLmNvbm5lY3Rpb24udHJhbnNwb3J0fTovLyR7dGhpcy5jb25uZWN0aW9uLmlwfTpgO1xuICAgIHRoaXMuc2hlbGxTb2NrZXQuY29ubmVjdChhZGRyZXNzICsgdGhpcy5jb25uZWN0aW9uLnNoZWxsX3BvcnQpO1xuICAgIHRoaXMuaW9Tb2NrZXQuY29ubmVjdChhZGRyZXNzICsgdGhpcy5jb25uZWN0aW9uLmlvcHViX3BvcnQpO1xuICAgIHRoaXMuaW9Tb2NrZXQuc3Vic2NyaWJlKFwiXCIpO1xuICAgIHRoaXMuc3RkaW5Tb2NrZXQuY29ubmVjdChhZGRyZXNzICsgdGhpcy5jb25uZWN0aW9uLnN0ZGluX3BvcnQpO1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldC5vbihcIm1lc3NhZ2VcIiwgdGhpcy5vblNoZWxsTWVzc2FnZS5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLmlvU29ja2V0Lm9uKFwibWVzc2FnZVwiLCB0aGlzLm9uSU9NZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuc3RkaW5Tb2NrZXQub24oXCJtZXNzYWdlXCIsIHRoaXMub25TdGRpbk1lc3NhZ2UuYmluZCh0aGlzKSk7XG5cbiAgICB0aGlzLm1vbml0b3IoZG9uZSk7XG4gIH1cblxuICBtb25pdG9yTm90aWZpY2F0aW9ucyhjaGlsZFByb2Nlc3M6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzKSB7XG4gICAgY2hpbGRQcm9jZXNzLnN0ZG91dC5vbihcImRhdGFcIiwgKGRhdGE6IHN0cmluZyB8IEJ1ZmZlcikgPT4ge1xuICAgICAgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLmtlcm5lbE5vdGlmaWNhdGlvbnNcIikpIHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8odGhpcy5rZXJuZWxTcGVjLmRpc3BsYXlfbmFtZSwge1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZyhcIlpNUUtlcm5lbDogc3Rkb3V0OlwiLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoaWxkUHJvY2Vzcy5zdGRlcnIub24oXCJkYXRhXCIsIChkYXRhOiBzdHJpbmcgfCBCdWZmZXIpID0+IHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih0aGlzLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiBkYXRhLnRvU3RyaW5nKCksXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBtb25pdG9yKGRvbmU6ID9GdW5jdGlvbikge1xuICAgIHRyeSB7XG4gICAgICBsZXQgc29ja2V0TmFtZXMgPSBbXCJzaGVsbFNvY2tldFwiLCBcImlvU29ja2V0XCJdO1xuXG4gICAgICBsZXQgd2FpdEdyb3VwID0gc29ja2V0TmFtZXMubGVuZ3RoO1xuXG4gICAgICBjb25zdCBvbkNvbm5lY3QgPSAoeyBzb2NrZXROYW1lLCBzb2NrZXQgfSkgPT4ge1xuICAgICAgICBsb2coXCJaTVFLZXJuZWw6IFwiICsgc29ja2V0TmFtZSArIFwiIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgc29ja2V0LnVubW9uaXRvcigpO1xuXG4gICAgICAgIHdhaXRHcm91cC0tO1xuICAgICAgICBpZiAod2FpdEdyb3VwID09PSAwKSB7XG4gICAgICAgICAgbG9nKFwiWk1RS2VybmVsOiBhbGwgbWFpbiBzb2NrZXRzIGNvbm5lY3RlZFwiKTtcbiAgICAgICAgICB0aGlzLnNldEV4ZWN1dGlvblN0YXRlKFwiaWRsZVwiKTtcbiAgICAgICAgICBpZiAoZG9uZSkgZG9uZSgpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBjb25zdCBtb25pdG9yID0gKHNvY2tldE5hbWUsIHNvY2tldCkgPT4ge1xuICAgICAgICBsb2coXCJaTVFLZXJuZWw6IG1vbml0b3IgXCIgKyBzb2NrZXROYW1lKTtcbiAgICAgICAgc29ja2V0Lm9uKFwiY29ubmVjdFwiLCBvbkNvbm5lY3QuYmluZCh0aGlzLCB7IHNvY2tldE5hbWUsIHNvY2tldCB9KSk7XG4gICAgICAgIHNvY2tldC5tb25pdG9yKCk7XG4gICAgICB9O1xuXG4gICAgICBtb25pdG9yKFwic2hlbGxTb2NrZXRcIiwgdGhpcy5zaGVsbFNvY2tldCk7XG4gICAgICBtb25pdG9yKFwiaW9Tb2NrZXRcIiwgdGhpcy5pb1NvY2tldCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2coXCJaTVFLZXJuZWw6XCIsIGVycik7XG4gICAgfVxuICB9XG5cbiAgaW50ZXJydXB0KCkge1xuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSBcIndpbjMyXCIpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nKFwiQ2Fubm90IGludGVycnVwdCB0aGlzIGtlcm5lbFwiLCB7XG4gICAgICAgIGRldGFpbDogXCJLZXJuZWwgaW50ZXJydXB0aW9uIGlzIGN1cnJlbnRseSBub3Qgc3VwcG9ydGVkIGluIFdpbmRvd3MuXCIsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nKFwiWk1RS2VybmVsOiBzZW5kaW5nIFNJR0lOVFwiKTtcbiAgICAgIHRoaXMua2VybmVsUHJvY2Vzcy5raWxsKFwiU0lHSU5UXCIpO1xuICAgIH1cbiAgfVxuXG4gIF9raWxsKCkge1xuICAgIGxvZyhcIlpNUUtlcm5lbDogc2VuZGluZyBTSUdLSUxMXCIpO1xuICAgIHRoaXMua2VybmVsUHJvY2Vzcy5raWxsKFwiU0lHS0lMTFwiKTtcbiAgfVxuXG4gIF9leGVjdXRlU3RhcnR1cENvZGUoKSB7XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSB0aGlzLmtlcm5lbFNwZWMuZGlzcGxheV9uYW1lO1xuICAgIGxldCBzdGFydHVwQ29kZSA9IENvbmZpZy5nZXRKc29uKFwic3RhcnR1cENvZGVcIilbZGlzcGxheU5hbWVdO1xuICAgIGlmIChzdGFydHVwQ29kZSkge1xuICAgICAgbG9nKFwiS2VybmVsTWFuYWdlcjogRXhlY3V0aW5nIHN0YXJ0dXAgY29kZTpcIiwgc3RhcnR1cENvZGUpO1xuICAgICAgc3RhcnR1cENvZGUgKz0gXCJcXG5cIjtcbiAgICAgIHRoaXMuZXhlY3V0ZShzdGFydHVwQ29kZSwgKG1lc3NhZ2UsIGNoYW5uZWwpID0+IHt9KTtcbiAgICB9XG4gIH1cblxuICBzaHV0ZG93bigpIHtcbiAgICB0aGlzLl9zb2NrZXRTaHV0ZG93bigpO1xuICB9XG5cbiAgcmVzdGFydChvblJlc3RhcnRlZDogP0Z1bmN0aW9uKSB7XG4gICAgdGhpcy5fc29ja2V0UmVzdGFydChvblJlc3RhcnRlZCk7XG4gIH1cblxuICBfc29ja2V0U2h1dGRvd24ocmVzdGFydDogP2Jvb2xlYW4gPSBmYWxzZSkge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBzaHV0ZG93bl8ke3Y0KCl9YDtcbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShcInNodXRkb3duX3JlcXVlc3RcIiwgcmVxdWVzdElkKTtcblxuICAgIG1lc3NhZ2UuY29udGVudCA9IHsgcmVzdGFydCB9O1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldC5zZW5kKG5ldyBNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIF9zb2NrZXRSZXN0YXJ0KG9uUmVzdGFydGVkOiA/RnVuY3Rpb24pIHtcbiAgICBpZiAodGhpcy5leGVjdXRpb25TdGF0ZSA9PT0gXCJyZXN0YXJ0aW5nXCIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zZXRFeGVjdXRpb25TdGF0ZShcInJlc3RhcnRpbmdcIik7XG4gICAgdGhpcy5fc29ja2V0U2h1dGRvd24odHJ1ZSk7XG4gICAgdGhpcy5fa2lsbCgpO1xuICAgIGNvbnN0IHsgc3Bhd24gfSA9IGxhdW5jaFNwZWNGcm9tQ29ubmVjdGlvbkluZm8oXG4gICAgICB0aGlzLmtlcm5lbFNwZWMsXG4gICAgICB0aGlzLmNvbm5lY3Rpb24sXG4gICAgICB0aGlzLmNvbm5lY3Rpb25GaWxlLFxuICAgICAgdGhpcy5vcHRpb25zXG4gICAgKTtcbiAgICB0aGlzLmtlcm5lbFByb2Nlc3MgPSBzcGF3bjtcbiAgICB0aGlzLm1vbml0b3IoKCkgPT4ge1xuICAgICAgdGhpcy5fZXhlY3V0ZVN0YXJ0dXBDb2RlKCk7XG4gICAgICBpZiAob25SZXN0YXJ0ZWQpIG9uUmVzdGFydGVkKCk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBvblJlc3VsdHMgaXMgYSBjYWxsYmFjayB0aGF0IG1heSBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXNcbiAgLy8gYXMgcmVzdWx0cyBjb21lIGluIGZyb20gdGhlIGtlcm5lbFxuICBleGVjdXRlKGNvZGU6IHN0cmluZywgb25SZXN1bHRzOiBSZXN1bHRzQ2FsbGJhY2spIHtcbiAgICBsb2coXCJaTVFLZXJuZWwuZXhlY3V0ZTpcIiwgY29kZSk7XG4gICAgY29uc3QgcmVxdWVzdElkID0gYGV4ZWN1dGVfJHt2NCgpfWA7XG5cbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5fY3JlYXRlTWVzc2FnZShcImV4ZWN1dGVfcmVxdWVzdFwiLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0ge1xuICAgICAgY29kZSxcbiAgICAgIHNpbGVudDogZmFsc2UsXG4gICAgICBzdG9yZV9oaXN0b3J5OiB0cnVlLFxuICAgICAgdXNlcl9leHByZXNzaW9uczoge30sXG4gICAgICBhbGxvd19zdGRpbjogdHJ1ZSxcbiAgICB9O1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3NbcmVxdWVzdElkXSA9IG9uUmVzdWx0cztcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICBjb21wbGV0ZShjb2RlOiBzdHJpbmcsIG9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrKSB7XG4gICAgbG9nKFwiWk1RS2VybmVsLmNvbXBsZXRlOlwiLCBjb2RlKTtcblxuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBjb21wbGV0ZV8ke3Y0KCl9YDtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKFwiY29tcGxldGVfcmVxdWVzdFwiLCByZXF1ZXN0SWQpO1xuXG4gICAgbWVzc2FnZS5jb250ZW50ID0ge1xuICAgICAgY29kZSxcbiAgICAgIHRleHQ6IGNvZGUsXG4gICAgICBsaW5lOiBjb2RlLFxuICAgICAgY3Vyc29yX3BvczoganNfaWR4X3RvX2NoYXJfaWR4KGNvZGUubGVuZ3RoLCBjb2RlKSxcbiAgICB9O1xuXG4gICAgdGhpcy5leGVjdXRpb25DYWxsYmFja3NbcmVxdWVzdElkXSA9IG9uUmVzdWx0cztcblxuICAgIHRoaXMuc2hlbGxTb2NrZXQuc2VuZChuZXcgTWVzc2FnZShtZXNzYWdlKSk7XG4gIH1cblxuICBpbnNwZWN0KGNvZGU6IHN0cmluZywgY3Vyc29yUG9zOiBudW1iZXIsIG9uUmVzdWx0czogUmVzdWx0c0NhbGxiYWNrKSB7XG4gICAgbG9nKFwiWk1RS2VybmVsLmluc3BlY3Q6XCIsIGNvZGUsIGN1cnNvclBvcyk7XG5cbiAgICBjb25zdCByZXF1ZXN0SWQgPSBgaW5zcGVjdF8ke3Y0KCl9YDtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKFwiaW5zcGVjdF9yZXF1ZXN0XCIsIHJlcXVlc3RJZCk7XG5cbiAgICBtZXNzYWdlLmNvbnRlbnQgPSB7XG4gICAgICBjb2RlLFxuICAgICAgY3Vyc29yX3BvczogY3Vyc29yUG9zLFxuICAgICAgZGV0YWlsX2xldmVsOiAwLFxuICAgIH07XG5cbiAgICB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1tyZXF1ZXN0SWRdID0gb25SZXN1bHRzO1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldC5zZW5kKG5ldyBNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIGlucHV0UmVwbHkoaW5wdXQ6IHN0cmluZykge1xuICAgIGNvbnN0IHJlcXVlc3RJZCA9IGBpbnB1dF9yZXBseV8ke3Y0KCl9YDtcblxuICAgIGNvbnN0IG1lc3NhZ2UgPSB0aGlzLl9jcmVhdGVNZXNzYWdlKFwiaW5wdXRfcmVwbHlcIiwgcmVxdWVzdElkKTtcblxuICAgIG1lc3NhZ2UuY29udGVudCA9IHsgdmFsdWU6IGlucHV0IH07XG5cbiAgICB0aGlzLnN0ZGluU29ja2V0LnNlbmQobmV3IE1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgb25TaGVsbE1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGxvZyhcInNoZWxsIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkTWVzc2FnZShtZXNzYWdlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbXNnX2lkIH0gPSBtZXNzYWdlLnBhcmVudF9oZWFkZXI7XG4gICAgbGV0IGNhbGxiYWNrO1xuICAgIGlmIChtc2dfaWQpIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5leGVjdXRpb25DYWxsYmFja3NbbXNnX2lkXTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UsIFwic2hlbGxcIik7XG4gICAgfVxuICB9XG5cbiAgb25TdGRpbk1lc3NhZ2UobWVzc2FnZTogTWVzc2FnZSkge1xuICAgIGxvZyhcInN0ZGluIG1lc3NhZ2U6XCIsIG1lc3NhZ2UpO1xuXG4gICAgaWYgKCF0aGlzLl9pc1ZhbGlkTWVzc2FnZShtZXNzYWdlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlucHV0X3JlcXVlc3QgbWVzc2FnZXMgYXJlIGF0dHJpYnV0YWJsZSB0byBwYXJ0aWN1bGFyIGV4ZWN1dGlvbiByZXF1ZXN0cyxcbiAgICAvLyBhbmQgc2hvdWxkIHBhc3MgdGhyb3VnaCB0aGUgbWlkZGxld2FyZSBzdGFjayB0byBhbGxvdyBwbHVnaW5zIHRvIHNlZSB0aGVtXG4gICAgY29uc3QgeyBtc2dfaWQgfSA9IG1lc3NhZ2UucGFyZW50X2hlYWRlcjtcbiAgICBsZXQgY2FsbGJhY2s7XG4gICAgaWYgKG1zZ19pZCkge1xuICAgICAgY2FsbGJhY2sgPSB0aGlzLmV4ZWN1dGlvbkNhbGxiYWNrc1ttc2dfaWRdO1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2sobWVzc2FnZSwgXCJzdGRpblwiKTtcbiAgICB9XG4gIH1cblxuICBvbklPTWVzc2FnZShtZXNzYWdlOiBNZXNzYWdlKSB7XG4gICAgbG9nKFwiSU8gbWVzc2FnZTpcIiwgbWVzc2FnZSk7XG5cbiAgICBpZiAoIXRoaXMuX2lzVmFsaWRNZXNzYWdlKG1lc3NhZ2UpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBtc2dfdHlwZSB9ID0gbWVzc2FnZS5oZWFkZXI7XG4gICAgaWYgKG1zZ190eXBlID09PSBcInN0YXR1c1wiKSB7XG4gICAgICBjb25zdCBzdGF0dXMgPSBtZXNzYWdlLmNvbnRlbnQuZXhlY3V0aW9uX3N0YXRlO1xuICAgICAgdGhpcy5zZXRFeGVjdXRpb25TdGF0ZShzdGF0dXMpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgbXNnX2lkIH0gPSBtZXNzYWdlLnBhcmVudF9oZWFkZXI7XG4gICAgbGV0IGNhbGxiYWNrO1xuICAgIGlmIChtc2dfaWQpIHtcbiAgICAgIGNhbGxiYWNrID0gdGhpcy5leGVjdXRpb25DYWxsYmFja3NbbXNnX2lkXTtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKG1lc3NhZ2UsIFwiaW9wdWJcIik7XG4gICAgfVxuICB9XG5cbiAgX2lzVmFsaWRNZXNzYWdlKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcbiAgICBpZiAoIW1lc3NhZ2UpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogbnVsbFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuY29udGVudCkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGNvbnRlbnRcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKG1lc3NhZ2UuY29udGVudC5leGVjdXRpb25fc3RhdGUgPT09IFwic3RhcnRpbmdcIikge1xuICAgICAgLy8gS2VybmVscyBzZW5kIGEgc3RhcnRpbmcgc3RhdHVzIG1lc3NhZ2Ugd2l0aCBhbiBlbXB0eSBwYXJlbnRfaGVhZGVyXG4gICAgICBsb2coXCJEcm9wcGVkIHN0YXJ0aW5nIHN0YXR1cyBJTyBtZXNzYWdlXCIpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghbWVzc2FnZS5wYXJlbnRfaGVhZGVyKSB7XG4gICAgICBsb2coXCJJbnZhbGlkIG1lc3NhZ2U6IE1pc3NpbmcgcGFyZW50X2hlYWRlclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UucGFyZW50X2hlYWRlci5tc2dfaWQpIHtcbiAgICAgIGxvZyhcIkludmFsaWQgbWVzc2FnZTogTWlzc2luZyBwYXJlbnRfaGVhZGVyLm1zZ19pZFwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UucGFyZW50X2hlYWRlci5tc2dfdHlwZSkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIHBhcmVudF9oZWFkZXIubXNnX3R5cGVcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmhlYWRlcikge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlclwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIW1lc3NhZ2UuaGVhZGVyLm1zZ19pZCkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlci5tc2dfaWRcIik7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFtZXNzYWdlLmhlYWRlci5tc2dfdHlwZSkge1xuICAgICAgbG9nKFwiSW52YWxpZCBtZXNzYWdlOiBNaXNzaW5nIGhlYWRlci5tc2dfdHlwZVwiKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgbG9nKFwiWk1RS2VybmVsOiBkZXN0cm95OlwiLCB0aGlzKTtcblxuICAgIHRoaXMuc2h1dGRvd24oKTtcblxuICAgIHRoaXMuX2tpbGwoKTtcbiAgICBmcy51bmxpbmtTeW5jKHRoaXMuY29ubmVjdGlvbkZpbGUpO1xuXG4gICAgdGhpcy5zaGVsbFNvY2tldC5jbG9zZSgpO1xuICAgIHRoaXMuaW9Tb2NrZXQuY2xvc2UoKTtcbiAgICB0aGlzLnN0ZGluU29ja2V0LmNsb3NlKCk7XG5cbiAgICBzdXBlci5kZXN0cm95KCk7XG4gIH1cblxuICBfZ2V0VXNlcm5hbWUoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHByb2Nlc3MuZW52LkxPR05BTUUgfHxcbiAgICAgIHByb2Nlc3MuZW52LlVTRVIgfHxcbiAgICAgIHByb2Nlc3MuZW52LkxOQU1FIHx8XG4gICAgICBwcm9jZXNzLmVudi5VU0VSTkFNRVxuICAgICk7XG4gIH1cblxuICBfY3JlYXRlTWVzc2FnZShtc2dUeXBlOiBzdHJpbmcsIG1zZ0lkOiBzdHJpbmcgPSB2NCgpKSB7XG4gICAgY29uc3QgbWVzc2FnZSA9IHtcbiAgICAgIGhlYWRlcjoge1xuICAgICAgICB1c2VybmFtZTogdGhpcy5fZ2V0VXNlcm5hbWUoKSxcbiAgICAgICAgc2Vzc2lvbjogXCIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDBcIixcbiAgICAgICAgbXNnX3R5cGU6IG1zZ1R5cGUsXG4gICAgICAgIG1zZ19pZDogbXNnSWQsXG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgIHZlcnNpb246IFwiNS4wXCIsXG4gICAgICB9LFxuICAgICAgbWV0YWRhdGE6IHt9LFxuICAgICAgcGFyZW50X2hlYWRlcjoge30sXG4gICAgICBjb250ZW50OiB7fSxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG1lc3NhZ2U7XG4gIH1cbn1cbiJdfQ==