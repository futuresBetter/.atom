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

var _tildify = require("tildify");

var _tildify2 = _interopRequireDefault(_tildify);

var _uuid = require("uuid");

var _ws = require("ws");

var _ws2 = _interopRequireDefault(_ws);

var _xmlhttprequest = require("xmlhttprequest");

var _xmlhttprequest2 = _interopRequireDefault(_xmlhttprequest);

var _url = require("url");

var _jupyterlabServices = require("@jupyterlab/services");

var _config = require("./config");

var _config2 = _interopRequireDefault(_config);

var _wsKernel = require("./ws-kernel");

var _wsKernel2 = _interopRequireDefault(_wsKernel);

var _inputView = require("./input-view");

var _inputView2 = _interopRequireDefault(_inputView);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var CustomListView = (function () {
  function CustomListView() {
    var _this = this;

    _classCallCheck(this, CustomListView);

    this.onConfirmed = null;
    this.onCancelled = null;

    this.previouslyFocusedElement = document.activeElement;
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
        if (_this.onConfirmed) _this.onConfirmed(item);
      },
      didCancelSelection: function didCancelSelection() {
        _this.cancel();
        if (_this.onCancelled) _this.onCancelled();
      }
    });
  }

  _createClass(CustomListView, [{
    key: "show",
    value: function show() {
      if (!this.panel) {
        this.panel = atom.workspace.addModalPanel({ item: this.selectListView });
      }
      this.panel.show();
      this.selectListView.focus();
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

  return CustomListView;
})();

var WSKernelPicker = (function () {
  function WSKernelPicker(onChosen) {
    _classCallCheck(this, WSKernelPicker);

    this._onChosen = onChosen;
    this.listView = new CustomListView();
  }

  _createClass(WSKernelPicker, [{
    key: "toggle",
    value: _asyncToGenerator(function* (_kernelSpecFilter) {
      this.listView.previouslyFocusedElement = document.activeElement;
      this._kernelSpecFilter = _kernelSpecFilter;
      var gateways = _config2["default"].getJson("gateways") || [];
      if (_lodash2["default"].isEmpty(gateways)) {
        atom.notifications.addError("No remote kernel gateways available", {
          description: "Use the Hydrogen package settings to specify the list of remote servers. Hydrogen can use remote kernels on either a Jupyter Kernel Gateway or Jupyter notebook server."
        });
        return;
      }

      this._path = (_store2["default"].filePath || "unsaved") + "-" + (0, _uuid.v4)();

      this.listView.onConfirmed = this.onGateway.bind(this);

      yield this.listView.selectListView.update({
        items: gateways,
        infoMessage: "Select a gateway",
        emptyMessage: "No gateways available",
        loadingMessage: null
      });

      this.listView.show();
    })
  }, {
    key: "promptForText",
    value: _asyncToGenerator(function* (prompt) {
      var previouslyFocusedElement = this.listView.previouslyFocusedElement;
      this.listView.cancel();

      var inputPromise = new Promise(function (resolve, reject) {
        var inputView = new _inputView2["default"]({ prompt: prompt }, resolve);
        atom.commands.add(inputView.element, {
          "core:cancel": function coreCancel() {
            inputView.close();
            reject();
          }
        });
        inputView.attach();
      });

      var response = undefined;
      try {
        response = yield inputPromise;
        if (response === "") {
          return null;
        }
      } catch (e) {
        return null;
      }

      // Assume that no response to the prompt will cancel the entire flow, so
      // only restore listView if a response was received
      this.listView.show();
      this.listView.previouslyFocusedElement = previouslyFocusedElement;
      return response;
    })
  }, {
    key: "promptForCookie",
    value: _asyncToGenerator(function* (options) {
      var cookie = yield this.promptForText("Cookie:");
      if (cookie === null) {
        return false;
      }

      if (options.requestHeaders === undefined) {
        options.requestHeaders = {};
      }
      options.requestHeaders.Cookie = cookie;
      options.xhrFactory = function () {
        var request = new _xmlhttprequest2["default"].XMLHttpRequest();
        // Disable protections against setting the Cookie header
        request.setDisableHeaderCheck(true);
        return request;
      };
      options.wsFactory = function (url, protocol) {
        // Authentication requires requests to appear to be same-origin
        var parsedUrl = new _url.URL(url);
        if (parsedUrl.protocol == "wss:") {
          parsedUrl.protocol = "https:";
        } else {
          parsedUrl.protocol = "http:";
        }
        var headers = { Cookie: cookie };
        var origin = parsedUrl.origin;
        var host = parsedUrl.host;
        return new _ws2["default"](url, protocol, { headers: headers, origin: origin, host: host });
      };
      return true;
    })
  }, {
    key: "promptForToken",
    value: _asyncToGenerator(function* (options) {
      var token = yield this.promptForText("Token:");
      if (token === null) {
        return false;
      }

      options.token = token;
      return true;
    })
  }, {
    key: "promptForCredentials",
    value: _asyncToGenerator(function* (options) {
      var _this2 = this;

      yield this.listView.selectListView.update({
        items: [{
          name: "Authenticate with a token",
          action: "token"
        }, {
          name: "Authenticate with a cookie",
          action: "cookie"
        }, {
          name: "Cancel",
          action: "cancel"
        }],
        infoMessage: "Connection to gateway failed. Your settings may be incorrect, the server may be unavailable, or you may lack sufficient privileges to complete the connection.",
        loadingMessage: null,
        emptyMessage: null
      });

      var action = yield new Promise(function (resolve, reject) {
        _this2.listView.onConfirmed = function (item) {
          return resolve(item.action);
        };
        _this2.listView.onCancelled = function () {
          return resolve("cancel");
        };
      });
      if (action === "token") {
        return yield this.promptForToken(options);
      }

      if (action === "cookie") {
        return yield this.promptForCookie(options);
      }

      // action === "cancel"
      this.listView.cancel();
      return false;
    })
  }, {
    key: "onGateway",
    value: _asyncToGenerator(function* (gatewayInfo) {
      var _this3 = this;

      this.listView.onConfirmed = null;
      yield this.listView.selectListView.update({
        items: [],
        infoMessage: null,
        loadingMessage: "Loading sessions...",
        emptyMessage: "No sessions available"
      });

      var gatewayOptions = Object.assign({
        xhrFactory: function xhrFactory() {
          return new _xmlhttprequest2["default"].XMLHttpRequest();
        },
        wsFactory: function wsFactory(url, protocol) {
          return new _ws2["default"](url, protocol);
        }
      }, gatewayInfo.options);

      var serverSettings = _jupyterlabServices.ServerConnection.makeSettings(gatewayOptions);
      var specModels = undefined;

      try {
        specModels = yield _jupyterlabServices.Kernel.getSpecs(serverSettings);
      } catch (error) {
        // The error types you get back at this stage are fairly opaque. In
        // particular, having invalid credentials typically triggers ECONNREFUSED
        // rather than 403 Forbidden. This does some basic checks and then assumes
        // that all remaining error types could be caused by invalid credentials.
        if (!error.xhr || !error.xhr.responseText) {
          throw error;
        } else if (error.xhr.responseText.includes("ETIMEDOUT")) {
          atom.notifications.addError("Connection to gateway failed");
          this.listView.cancel();
          return;
        } else {
          var promptSucceeded = yield this.promptForCredentials(gatewayOptions);
          if (!promptSucceeded) {
            return;
          }
          serverSettings = _jupyterlabServices.ServerConnection.makeSettings(gatewayOptions);
          yield this.listView.selectListView.update({
            items: [],
            infoMessage: null,
            loadingMessage: "Loading sessions...",
            emptyMessage: "No sessions available"
          });
        }
      }

      try {
        yield* (function* () {
          if (!specModels) {
            specModels = yield _jupyterlabServices.Kernel.getSpecs(serverSettings);
          }

          var kernelSpecs = _lodash2["default"].filter(specModels.kernelspecs, function (spec) {
            return _this3._kernelSpecFilter(spec);
          });

          var kernelNames = _lodash2["default"].map(kernelSpecs, function (specModel) {
            return specModel.name;
          });

          try {
            var sessionModels = yield _jupyterlabServices.Session.listRunning(serverSettings);
            sessionModels = sessionModels.filter(function (model) {
              var name = model.kernel ? model.kernel.name : null;
              return name ? kernelNames.includes(name) : true;
            });
            var items = sessionModels.map(function (model) {
              var name = undefined;
              if (model.path) {
                name = (0, _tildify2["default"])(model.path);
              } else if (model.notebook && model.notebook.path) {
                name = (0, _tildify2["default"])(model.notebook.path);
              } else {
                name = "Session " + model.id;
              }
              return { name: name, model: model, options: serverSettings };
            });
            items.unshift({
              name: "[new session]",
              model: null,
              options: serverSettings,
              kernelSpecs: kernelSpecs
            });
            _this3.listView.onConfirmed = _this3.onSession.bind(_this3, gatewayInfo.name);
            yield _this3.listView.selectListView.update({
              items: items,
              loadingMessage: null
            });
          } catch (error) {
            if (!error.xhr || error.xhr.status !== 403) throw error;
            // Gateways offer the option of never listing sessions, for security
            // reasons.
            // Assume this is the case and proceed to creating a new session.
            _this3.onSession(gatewayInfo.name, {
              name: "[new session]",
              model: null,
              options: serverSettings,
              kernelSpecs: kernelSpecs
            });
          }
        })();
      } catch (e) {
        atom.notifications.addError("Connection to gateway failed");
        this.listView.cancel();
      }
    })
  }, {
    key: "onSession",
    value: _asyncToGenerator(function* (gatewayName, sessionInfo) {
      var _this4 = this;

      if (!sessionInfo.model) {
        if (!sessionInfo.name) {
          yield this.listView.selectListView.update({
            items: [],
            errorMessage: "This gateway does not support listing sessions",
            loadingMessage: null,
            infoMessage: null
          });
        }
        var items = _lodash2["default"].map(sessionInfo.kernelSpecs, function (spec) {
          var options = {
            serverSettings: sessionInfo.options,
            kernelName: spec.name,
            path: _this4._path
          };
          return {
            name: spec.display_name,
            options: options
          };
        });

        this.listView.onConfirmed = this.startSession.bind(this, gatewayName);
        yield this.listView.selectListView.update({
          items: items,
          emptyMessage: "No kernel specs available",
          infoMessage: "Select a session",
          loadingMessage: null
        });
      } else {
        this.onSessionChosen(gatewayName, (yield _jupyterlabServices.Session.connectTo(sessionInfo.model.id, sessionInfo.options)));
      }
    })
  }, {
    key: "startSession",
    value: function startSession(gatewayName, sessionInfo) {
      _jupyterlabServices.Session.startNew(sessionInfo.options).then(this.onSessionChosen.bind(this, gatewayName));
    }
  }, {
    key: "onSessionChosen",
    value: _asyncToGenerator(function* (gatewayName, session) {
      this.listView.cancel();
      var kernelSpec = yield session.kernel.getSpec();
      if (!_store2["default"].grammar) return;

      var kernel = new _wsKernel2["default"](gatewayName, kernelSpec, _store2["default"].grammar, session);
      this._onChosen(kernel);
    })
  }]);

  return WSKernelPicker;
})();

exports["default"] = WSKernelPicker;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwtcGlja2VyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs4QkFFMkIsa0JBQWtCOzs7O3NCQUMvQixRQUFROzs7O3VCQUNGLFNBQVM7Ozs7b0JBQ1YsTUFBTTs7a0JBQ1YsSUFBSTs7Ozs4QkFDSCxnQkFBZ0I7Ozs7bUJBQ1osS0FBSzs7a0NBQ3lCLHNCQUFzQjs7c0JBRXJELFVBQVU7Ozs7d0JBQ1IsYUFBYTs7Ozt5QkFDWixjQUFjOzs7O3FCQUNsQixTQUFTOzs7O0lBRXJCLGNBQWM7QUFPUCxXQVBQLGNBQWMsR0FPSjs7OzBCQVBWLGNBQWM7O1NBQ2xCLFdBQVcsR0FBYyxJQUFJO1NBQzdCLFdBQVcsR0FBYyxJQUFJOztBQU0zQixRQUFJLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztBQUN2RCxRQUFJLENBQUMsY0FBYyxHQUFHLGdDQUFtQjtBQUN2QyxvQkFBYyxFQUFFLENBQUMsYUFBYSxDQUFDO0FBQy9CLFdBQUssRUFBRSxFQUFFO0FBQ1Qsc0JBQWdCLEVBQUUsMEJBQUMsSUFBSTtlQUFLLElBQUksQ0FBQyxJQUFJO09BQUE7QUFDckMsb0JBQWMsRUFBRSx3QkFBQyxJQUFJLEVBQUs7QUFDeEIsWUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxlQUFPLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDaEMsZUFBTyxPQUFPLENBQUM7T0FDaEI7QUFDRCx5QkFBbUIsRUFBRSw2QkFBQyxJQUFJLEVBQUs7QUFDN0IsWUFBSSxNQUFLLFdBQVcsRUFBRSxNQUFLLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUM5QztBQUNELHdCQUFrQixFQUFFLDhCQUFNO0FBQ3hCLGNBQUssTUFBTSxFQUFFLENBQUM7QUFDZCxZQUFJLE1BQUssV0FBVyxF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O09BQ0g7S0FDRjs7O1dBRVcsc0JBQUMsV0FBbUIsRUFBRSxXQUFnQixFQUFFO0FBQ2xELGtDQUFRLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUN4QyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQzdDLENBQUM7S0FDSDs7OzZCQUVvQixXQUFDLFdBQW1CLEVBQUUsT0FBWSxFQUFFO0FBQ3ZELFVBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdkIsVUFBTSxVQUFVLEdBQUcsTUFBTSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2xELFVBQUksQ0FBQyxtQkFBTSxPQUFPLEVBQUUsT0FBTzs7QUFFM0IsVUFBTSxNQUFNLEdBQUcsMEJBQ2IsV0FBVyxFQUNYLFVBQVUsRUFDVixtQkFBTSxPQUFPLEVBQ2IsT0FBTyxDQUNSLENBQUM7QUFDRixVQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hCOzs7U0F0VGtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi93cy1rZXJuZWwtcGlja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IFNlbGVjdExpc3RWaWV3IGZyb20gXCJhdG9tLXNlbGVjdC1saXN0XCI7XG5pbXBvcnQgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgdGlsZGlmeSBmcm9tIFwidGlsZGlmeVwiO1xuaW1wb3J0IHsgdjQgfSBmcm9tIFwidXVpZFwiO1xuaW1wb3J0IHdzIGZyb20gXCJ3c1wiO1xuaW1wb3J0IHhociBmcm9tIFwieG1saHR0cHJlcXVlc3RcIjtcbmltcG9ydCB7IFVSTCB9IGZyb20gXCJ1cmxcIjtcbmltcG9ydCB7IEtlcm5lbCwgU2Vzc2lvbiwgU2VydmVyQ29ubmVjdGlvbiB9IGZyb20gXCJAanVweXRlcmxhYi9zZXJ2aWNlc1wiO1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gXCIuL2NvbmZpZ1wiO1xuaW1wb3J0IFdTS2VybmVsIGZyb20gXCIuL3dzLWtlcm5lbFwiO1xuaW1wb3J0IElucHV0VmlldyBmcm9tIFwiLi9pbnB1dC12aWV3XCI7XG5pbXBvcnQgc3RvcmUgZnJvbSBcIi4vc3RvcmVcIjtcblxuY2xhc3MgQ3VzdG9tTGlzdFZpZXcge1xuICBvbkNvbmZpcm1lZDogP0Z1bmN0aW9uID0gbnVsbDtcbiAgb25DYW5jZWxsZWQ6ID9GdW5jdGlvbiA9IG51bGw7XG4gIHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDogP0hUTUxFbGVtZW50O1xuICBzZWxlY3RMaXN0VmlldzogU2VsZWN0TGlzdFZpZXc7XG4gIHBhbmVsOiA/YXRvbSRQYW5lbDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gICAgdGhpcy5zZWxlY3RMaXN0VmlldyA9IG5ldyBTZWxlY3RMaXN0Vmlldyh7XG4gICAgICBpdGVtc0NsYXNzTGlzdDogW1wibWFyay1hY3RpdmVcIl0sXG4gICAgICBpdGVtczogW10sXG4gICAgICBmaWx0ZXJLZXlGb3JJdGVtOiAoaXRlbSkgPT4gaXRlbS5uYW1lLFxuICAgICAgZWxlbWVudEZvckl0ZW06IChpdGVtKSA9PiB7XG4gICAgICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgIGVsZW1lbnQudGV4dENvbnRlbnQgPSBpdGVtLm5hbWU7XG4gICAgICAgIHJldHVybiBlbGVtZW50O1xuICAgICAgfSxcbiAgICAgIGRpZENvbmZpcm1TZWxlY3Rpb246IChpdGVtKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLm9uQ29uZmlybWVkKSB0aGlzLm9uQ29uZmlybWVkKGl0ZW0pO1xuICAgICAgfSxcbiAgICAgIGRpZENhbmNlbFNlbGVjdGlvbjogKCkgPT4ge1xuICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICBpZiAodGhpcy5vbkNhbmNlbGxlZCkgdGhpcy5vbkNhbmNlbGxlZCgpO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHNob3coKSB7XG4gICAgaWYgKCF0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7IGl0ZW06IHRoaXMuc2VsZWN0TGlzdFZpZXcgfSk7XG4gICAgfVxuICAgIHRoaXMucGFuZWwuc2hvdygpO1xuICAgIHRoaXMuc2VsZWN0TGlzdFZpZXcuZm9jdXMoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jYW5jZWwoKTtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RMaXN0Vmlldy5kZXN0cm95KCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgfVxuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIGlmICh0aGlzLnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCkge1xuICAgICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQuZm9jdXMoKTtcbiAgICAgIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV1NLZXJuZWxQaWNrZXIge1xuICBfb25DaG9zZW46IChrZXJuZWw6IEtlcm5lbCkgPT4gdm9pZDtcbiAgX2tlcm5lbFNwZWNGaWx0ZXI6IChrZXJuZWxTcGVjOiBLZXJuZWxzcGVjKSA9PiBib29sZWFuO1xuICBfcGF0aDogc3RyaW5nO1xuICBsaXN0VmlldzogQ3VzdG9tTGlzdFZpZXc7XG5cbiAgY29uc3RydWN0b3Iob25DaG9zZW46IChrZXJuZWw6IEtlcm5lbCkgPT4gdm9pZCkge1xuICAgIHRoaXMuX29uQ2hvc2VuID0gb25DaG9zZW47XG4gICAgdGhpcy5saXN0VmlldyA9IG5ldyBDdXN0b21MaXN0VmlldygpO1xuICB9XG5cbiAgYXN5bmMgdG9nZ2xlKF9rZXJuZWxTcGVjRmlsdGVyOiAoa2VybmVsU3BlYzogS2VybmVsc3BlYykgPT4gYm9vbGVhbikge1xuICAgIHRoaXMubGlzdFZpZXcucHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcbiAgICB0aGlzLl9rZXJuZWxTcGVjRmlsdGVyID0gX2tlcm5lbFNwZWNGaWx0ZXI7XG4gICAgY29uc3QgZ2F0ZXdheXMgPSBDb25maWcuZ2V0SnNvbihcImdhdGV3YXlzXCIpIHx8IFtdO1xuICAgIGlmIChfLmlzRW1wdHkoZ2F0ZXdheXMpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJObyByZW1vdGUga2VybmVsIGdhdGV3YXlzIGF2YWlsYWJsZVwiLCB7XG4gICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgIFwiVXNlIHRoZSBIeWRyb2dlbiBwYWNrYWdlIHNldHRpbmdzIHRvIHNwZWNpZnkgdGhlIGxpc3Qgb2YgcmVtb3RlIHNlcnZlcnMuIEh5ZHJvZ2VuIGNhbiB1c2UgcmVtb3RlIGtlcm5lbHMgb24gZWl0aGVyIGEgSnVweXRlciBLZXJuZWwgR2F0ZXdheSBvciBKdXB5dGVyIG5vdGVib29rIHNlcnZlci5cIixcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3BhdGggPSBgJHtzdG9yZS5maWxlUGF0aCB8fCBcInVuc2F2ZWRcIn0tJHt2NCgpfWA7XG5cbiAgICB0aGlzLmxpc3RWaWV3Lm9uQ29uZmlybWVkID0gdGhpcy5vbkdhdGV3YXkuYmluZCh0aGlzKTtcblxuICAgIGF3YWl0IHRoaXMubGlzdFZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgIGl0ZW1zOiBnYXRld2F5cyxcbiAgICAgIGluZm9NZXNzYWdlOiBcIlNlbGVjdCBhIGdhdGV3YXlcIixcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBnYXRld2F5cyBhdmFpbGFibGVcIixcbiAgICAgIGxvYWRpbmdNZXNzYWdlOiBudWxsLFxuICAgIH0pO1xuXG4gICAgdGhpcy5saXN0Vmlldy5zaG93KCk7XG4gIH1cblxuICBhc3luYyBwcm9tcHRGb3JUZXh0KHByb21wdDogc3RyaW5nKSB7XG4gICAgY29uc3QgcHJldmlvdXNseUZvY3VzZWRFbGVtZW50ID0gdGhpcy5saXN0Vmlldy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ7XG4gICAgdGhpcy5saXN0Vmlldy5jYW5jZWwoKTtcblxuICAgIGNvbnN0IGlucHV0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGlucHV0VmlldyA9IG5ldyBJbnB1dFZpZXcoeyBwcm9tcHQgfSwgcmVzb2x2ZSk7XG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChpbnB1dFZpZXcuZWxlbWVudCwge1xuICAgICAgICBcImNvcmU6Y2FuY2VsXCI6ICgpID0+IHtcbiAgICAgICAgICBpbnB1dFZpZXcuY2xvc2UoKTtcbiAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgaW5wdXRWaWV3LmF0dGFjaCgpO1xuICAgIH0pO1xuXG4gICAgbGV0IHJlc3BvbnNlO1xuICAgIHRyeSB7XG4gICAgICByZXNwb25zZSA9IGF3YWl0IGlucHV0UHJvbWlzZTtcbiAgICAgIGlmIChyZXNwb25zZSA9PT0gXCJcIikge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBBc3N1bWUgdGhhdCBubyByZXNwb25zZSB0byB0aGUgcHJvbXB0IHdpbGwgY2FuY2VsIHRoZSBlbnRpcmUgZmxvdywgc29cbiAgICAvLyBvbmx5IHJlc3RvcmUgbGlzdFZpZXcgaWYgYSByZXNwb25zZSB3YXMgcmVjZWl2ZWRcbiAgICB0aGlzLmxpc3RWaWV3LnNob3coKTtcbiAgICB0aGlzLmxpc3RWaWV3LnByZXZpb3VzbHlGb2N1c2VkRWxlbWVudCA9IHByZXZpb3VzbHlGb2N1c2VkRWxlbWVudDtcbiAgICByZXR1cm4gcmVzcG9uc2U7XG4gIH1cblxuICBhc3luYyBwcm9tcHRGb3JDb29raWUob3B0aW9uczogYW55KSB7XG4gICAgY29uc3QgY29va2llID0gYXdhaXQgdGhpcy5wcm9tcHRGb3JUZXh0KFwiQ29va2llOlwiKTtcbiAgICBpZiAoY29va2llID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucmVxdWVzdEhlYWRlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgb3B0aW9ucy5yZXF1ZXN0SGVhZGVycyA9IHt9O1xuICAgIH1cbiAgICBvcHRpb25zLnJlcXVlc3RIZWFkZXJzLkNvb2tpZSA9IGNvb2tpZTtcbiAgICBvcHRpb25zLnhockZhY3RvcnkgPSAoKSA9PiB7XG4gICAgICBsZXQgcmVxdWVzdCA9IG5ldyB4aHIuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgIC8vIERpc2FibGUgcHJvdGVjdGlvbnMgYWdhaW5zdCBzZXR0aW5nIHRoZSBDb29raWUgaGVhZGVyXG4gICAgICByZXF1ZXN0LnNldERpc2FibGVIZWFkZXJDaGVjayh0cnVlKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH07XG4gICAgb3B0aW9ucy53c0ZhY3RvcnkgPSAodXJsLCBwcm90b2NvbCkgPT4ge1xuICAgICAgLy8gQXV0aGVudGljYXRpb24gcmVxdWlyZXMgcmVxdWVzdHMgdG8gYXBwZWFyIHRvIGJlIHNhbWUtb3JpZ2luXG4gICAgICBsZXQgcGFyc2VkVXJsID0gbmV3IFVSTCh1cmwpO1xuICAgICAgaWYgKHBhcnNlZFVybC5wcm90b2NvbCA9PSBcIndzczpcIikge1xuICAgICAgICBwYXJzZWRVcmwucHJvdG9jb2wgPSBcImh0dHBzOlwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyc2VkVXJsLnByb3RvY29sID0gXCJodHRwOlwiO1xuICAgICAgfVxuICAgICAgY29uc3QgaGVhZGVycyA9IHsgQ29va2llOiBjb29raWUgfTtcbiAgICAgIGNvbnN0IG9yaWdpbiA9IHBhcnNlZFVybC5vcmlnaW47XG4gICAgICBjb25zdCBob3N0ID0gcGFyc2VkVXJsLmhvc3Q7XG4gICAgICByZXR1cm4gbmV3IHdzKHVybCwgcHJvdG9jb2wsIHsgaGVhZGVycywgb3JpZ2luLCBob3N0IH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBwcm9tcHRGb3JUb2tlbihvcHRpb25zOiBhbnkpIHtcbiAgICBjb25zdCB0b2tlbiA9IGF3YWl0IHRoaXMucHJvbXB0Rm9yVGV4dChcIlRva2VuOlwiKTtcbiAgICBpZiAodG9rZW4gPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBvcHRpb25zLnRva2VuID0gdG9rZW47XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBhc3luYyBwcm9tcHRGb3JDcmVkZW50aWFscyhvcHRpb25zOiBhbnkpIHtcbiAgICBhd2FpdCB0aGlzLmxpc3RWaWV3LnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7XG4gICAgICBpdGVtczogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJBdXRoZW50aWNhdGUgd2l0aCBhIHRva2VuXCIsXG4gICAgICAgICAgYWN0aW9uOiBcInRva2VuXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBcIkF1dGhlbnRpY2F0ZSB3aXRoIGEgY29va2llXCIsXG4gICAgICAgICAgYWN0aW9uOiBcImNvb2tpZVwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogXCJDYW5jZWxcIixcbiAgICAgICAgICBhY3Rpb246IFwiY2FuY2VsXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgaW5mb01lc3NhZ2U6XG4gICAgICAgIFwiQ29ubmVjdGlvbiB0byBnYXRld2F5IGZhaWxlZC4gWW91ciBzZXR0aW5ncyBtYXkgYmUgaW5jb3JyZWN0LCB0aGUgc2VydmVyIG1heSBiZSB1bmF2YWlsYWJsZSwgb3IgeW91IG1heSBsYWNrIHN1ZmZpY2llbnQgcHJpdmlsZWdlcyB0byBjb21wbGV0ZSB0aGUgY29ubmVjdGlvbi5cIixcbiAgICAgIGxvYWRpbmdNZXNzYWdlOiBudWxsLFxuICAgICAgZW1wdHlNZXNzYWdlOiBudWxsLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5saXN0Vmlldy5vbkNvbmZpcm1lZCA9IChpdGVtKSA9PiByZXNvbHZlKGl0ZW0uYWN0aW9uKTtcbiAgICAgIHRoaXMubGlzdFZpZXcub25DYW5jZWxsZWQgPSAoKSA9PiByZXNvbHZlKFwiY2FuY2VsXCIpO1xuICAgIH0pO1xuICAgIGlmIChhY3Rpb24gPT09IFwidG9rZW5cIikge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucHJvbXB0Rm9yVG9rZW4ob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKGFjdGlvbiA9PT0gXCJjb29raWVcIikge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMucHJvbXB0Rm9yQ29va2llKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8vIGFjdGlvbiA9PT0gXCJjYW5jZWxcIlxuICAgIHRoaXMubGlzdFZpZXcuY2FuY2VsKCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgYXN5bmMgb25HYXRld2F5KGdhdGV3YXlJbmZvOiBhbnkpIHtcbiAgICB0aGlzLmxpc3RWaWV3Lm9uQ29uZmlybWVkID0gbnVsbDtcbiAgICBhd2FpdCB0aGlzLmxpc3RWaWV3LnNlbGVjdExpc3RWaWV3LnVwZGF0ZSh7XG4gICAgICBpdGVtczogW10sXG4gICAgICBpbmZvTWVzc2FnZTogbnVsbCxcbiAgICAgIGxvYWRpbmdNZXNzYWdlOiBcIkxvYWRpbmcgc2Vzc2lvbnMuLi5cIixcbiAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBzZXNzaW9ucyBhdmFpbGFibGVcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IGdhdGV3YXlPcHRpb25zID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHtcbiAgICAgICAgeGhyRmFjdG9yeTogKCkgPT4gbmV3IHhoci5YTUxIdHRwUmVxdWVzdCgpLFxuICAgICAgICB3c0ZhY3Rvcnk6ICh1cmwsIHByb3RvY29sKSA9PiBuZXcgd3ModXJsLCBwcm90b2NvbCksXG4gICAgICB9LFxuICAgICAgZ2F0ZXdheUluZm8ub3B0aW9uc1xuICAgICk7XG5cbiAgICBsZXQgc2VydmVyU2V0dGluZ3MgPSBTZXJ2ZXJDb25uZWN0aW9uLm1ha2VTZXR0aW5ncyhnYXRld2F5T3B0aW9ucyk7XG4gICAgbGV0IHNwZWNNb2RlbHM7XG5cbiAgICB0cnkge1xuICAgICAgc3BlY01vZGVscyA9IGF3YWl0IEtlcm5lbC5nZXRTcGVjcyhzZXJ2ZXJTZXR0aW5ncyk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIC8vIFRoZSBlcnJvciB0eXBlcyB5b3UgZ2V0IGJhY2sgYXQgdGhpcyBzdGFnZSBhcmUgZmFpcmx5IG9wYXF1ZS4gSW5cbiAgICAgIC8vIHBhcnRpY3VsYXIsIGhhdmluZyBpbnZhbGlkIGNyZWRlbnRpYWxzIHR5cGljYWxseSB0cmlnZ2VycyBFQ09OTlJFRlVTRURcbiAgICAgIC8vIHJhdGhlciB0aGFuIDQwMyBGb3JiaWRkZW4uIFRoaXMgZG9lcyBzb21lIGJhc2ljIGNoZWNrcyBhbmQgdGhlbiBhc3N1bWVzXG4gICAgICAvLyB0aGF0IGFsbCByZW1haW5pbmcgZXJyb3IgdHlwZXMgY291bGQgYmUgY2F1c2VkIGJ5IGludmFsaWQgY3JlZGVudGlhbHMuXG4gICAgICBpZiAoIWVycm9yLnhociB8fCAhZXJyb3IueGhyLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3IueGhyLnJlc3BvbnNlVGV4dC5pbmNsdWRlcyhcIkVUSU1FRE9VVFwiKSkge1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXCJDb25uZWN0aW9uIHRvIGdhdGV3YXkgZmFpbGVkXCIpO1xuICAgICAgICB0aGlzLmxpc3RWaWV3LmNhbmNlbCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBwcm9tcHRTdWNjZWVkZWQgPSBhd2FpdCB0aGlzLnByb21wdEZvckNyZWRlbnRpYWxzKGdhdGV3YXlPcHRpb25zKTtcbiAgICAgICAgaWYgKCFwcm9tcHRTdWNjZWVkZWQpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VydmVyU2V0dGluZ3MgPSBTZXJ2ZXJDb25uZWN0aW9uLm1ha2VTZXR0aW5ncyhnYXRld2F5T3B0aW9ucyk7XG4gICAgICAgIGF3YWl0IHRoaXMubGlzdFZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgaW5mb01lc3NhZ2U6IG51bGwsXG4gICAgICAgICAgbG9hZGluZ01lc3NhZ2U6IFwiTG9hZGluZyBzZXNzaW9ucy4uLlwiLFxuICAgICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBzZXNzaW9ucyBhdmFpbGFibGVcIixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlmICghc3BlY01vZGVscykge1xuICAgICAgICBzcGVjTW9kZWxzID0gYXdhaXQgS2VybmVsLmdldFNwZWNzKHNlcnZlclNldHRpbmdzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qga2VybmVsU3BlY3MgPSBfLmZpbHRlcihzcGVjTW9kZWxzLmtlcm5lbHNwZWNzLCAoc3BlYykgPT5cbiAgICAgICAgdGhpcy5fa2VybmVsU3BlY0ZpbHRlcihzcGVjKVxuICAgICAgKTtcblxuICAgICAgY29uc3Qga2VybmVsTmFtZXMgPSBfLm1hcChrZXJuZWxTcGVjcywgKHNwZWNNb2RlbCkgPT4gc3BlY01vZGVsLm5hbWUpO1xuXG4gICAgICB0cnkge1xuICAgICAgICBsZXQgc2Vzc2lvbk1vZGVscyA9IGF3YWl0IFNlc3Npb24ubGlzdFJ1bm5pbmcoc2VydmVyU2V0dGluZ3MpO1xuICAgICAgICBzZXNzaW9uTW9kZWxzID0gc2Vzc2lvbk1vZGVscy5maWx0ZXIoKG1vZGVsKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IG1vZGVsLmtlcm5lbCA/IG1vZGVsLmtlcm5lbC5uYW1lIDogbnVsbDtcbiAgICAgICAgICByZXR1cm4gbmFtZSA/IGtlcm5lbE5hbWVzLmluY2x1ZGVzKG5hbWUpIDogdHJ1ZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGl0ZW1zID0gc2Vzc2lvbk1vZGVscy5tYXAoKG1vZGVsKSA9PiB7XG4gICAgICAgICAgbGV0IG5hbWU7XG4gICAgICAgICAgaWYgKG1vZGVsLnBhdGgpIHtcbiAgICAgICAgICAgIG5hbWUgPSB0aWxkaWZ5KG1vZGVsLnBhdGgpO1xuICAgICAgICAgIH0gZWxzZSBpZiAobW9kZWwubm90ZWJvb2sgJiYgbW9kZWwubm90ZWJvb2sucGF0aCkge1xuICAgICAgICAgICAgbmFtZSA9IHRpbGRpZnkobW9kZWwubm90ZWJvb2sucGF0aCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5hbWUgPSBgU2Vzc2lvbiAke21vZGVsLmlkfWA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IG5hbWUsIG1vZGVsLCBvcHRpb25zOiBzZXJ2ZXJTZXR0aW5ncyB9O1xuICAgICAgICB9KTtcbiAgICAgICAgaXRlbXMudW5zaGlmdCh7XG4gICAgICAgICAgbmFtZTogXCJbbmV3IHNlc3Npb25dXCIsXG4gICAgICAgICAgbW9kZWw6IG51bGwsXG4gICAgICAgICAgb3B0aW9uczogc2VydmVyU2V0dGluZ3MsXG4gICAgICAgICAga2VybmVsU3BlY3MsXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmxpc3RWaWV3Lm9uQ29uZmlybWVkID0gdGhpcy5vblNlc3Npb24uYmluZCh0aGlzLCBnYXRld2F5SW5mby5uYW1lKTtcbiAgICAgICAgYXdhaXQgdGhpcy5saXN0Vmlldy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe1xuICAgICAgICAgIGl0ZW1zOiBpdGVtcyxcbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZTogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBpZiAoIWVycm9yLnhociB8fCBlcnJvci54aHIuc3RhdHVzICE9PSA0MDMpIHRocm93IGVycm9yO1xuICAgICAgICAvLyBHYXRld2F5cyBvZmZlciB0aGUgb3B0aW9uIG9mIG5ldmVyIGxpc3Rpbmcgc2Vzc2lvbnMsIGZvciBzZWN1cml0eVxuICAgICAgICAvLyByZWFzb25zLlxuICAgICAgICAvLyBBc3N1bWUgdGhpcyBpcyB0aGUgY2FzZSBhbmQgcHJvY2VlZCB0byBjcmVhdGluZyBhIG5ldyBzZXNzaW9uLlxuICAgICAgICB0aGlzLm9uU2Vzc2lvbihnYXRld2F5SW5mby5uYW1lLCB7XG4gICAgICAgICAgbmFtZTogXCJbbmV3IHNlc3Npb25dXCIsXG4gICAgICAgICAgbW9kZWw6IG51bGwsXG4gICAgICAgICAgb3B0aW9uczogc2VydmVyU2V0dGluZ3MsXG4gICAgICAgICAga2VybmVsU3BlY3MsXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcIkNvbm5lY3Rpb24gdG8gZ2F0ZXdheSBmYWlsZWRcIik7XG4gICAgICB0aGlzLmxpc3RWaWV3LmNhbmNlbCgpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIG9uU2Vzc2lvbihnYXRld2F5TmFtZTogc3RyaW5nLCBzZXNzaW9uSW5mbzogYW55KSB7XG4gICAgaWYgKCFzZXNzaW9uSW5mby5tb2RlbCkge1xuICAgICAgaWYgKCFzZXNzaW9uSW5mby5uYW1lKSB7XG4gICAgICAgIGF3YWl0IHRoaXMubGlzdFZpZXcuc2VsZWN0TGlzdFZpZXcudXBkYXRlKHtcbiAgICAgICAgICBpdGVtczogW10sXG4gICAgICAgICAgZXJyb3JNZXNzYWdlOiBcIlRoaXMgZ2F0ZXdheSBkb2VzIG5vdCBzdXBwb3J0IGxpc3Rpbmcgc2Vzc2lvbnNcIixcbiAgICAgICAgICBsb2FkaW5nTWVzc2FnZTogbnVsbCxcbiAgICAgICAgICBpbmZvTWVzc2FnZTogbnVsbCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBjb25zdCBpdGVtcyA9IF8ubWFwKHNlc3Npb25JbmZvLmtlcm5lbFNwZWNzLCAoc3BlYykgPT4ge1xuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgIHNlcnZlclNldHRpbmdzOiBzZXNzaW9uSW5mby5vcHRpb25zLFxuICAgICAgICAgIGtlcm5lbE5hbWU6IHNwZWMubmFtZSxcbiAgICAgICAgICBwYXRoOiB0aGlzLl9wYXRoLFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIG5hbWU6IHNwZWMuZGlzcGxheV9uYW1lLFxuICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgIH07XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5saXN0Vmlldy5vbkNvbmZpcm1lZCA9IHRoaXMuc3RhcnRTZXNzaW9uLmJpbmQodGhpcywgZ2F0ZXdheU5hbWUpO1xuICAgICAgYXdhaXQgdGhpcy5saXN0Vmlldy5zZWxlY3RMaXN0Vmlldy51cGRhdGUoe1xuICAgICAgICBpdGVtczogaXRlbXMsXG4gICAgICAgIGVtcHR5TWVzc2FnZTogXCJObyBrZXJuZWwgc3BlY3MgYXZhaWxhYmxlXCIsXG4gICAgICAgIGluZm9NZXNzYWdlOiBcIlNlbGVjdCBhIHNlc3Npb25cIixcbiAgICAgICAgbG9hZGluZ01lc3NhZ2U6IG51bGwsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vblNlc3Npb25DaG9zZW4oXG4gICAgICAgIGdhdGV3YXlOYW1lLFxuICAgICAgICBhd2FpdCBTZXNzaW9uLmNvbm5lY3RUbyhzZXNzaW9uSW5mby5tb2RlbC5pZCwgc2Vzc2lvbkluZm8ub3B0aW9ucylcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgc3RhcnRTZXNzaW9uKGdhdGV3YXlOYW1lOiBzdHJpbmcsIHNlc3Npb25JbmZvOiBhbnkpIHtcbiAgICBTZXNzaW9uLnN0YXJ0TmV3KHNlc3Npb25JbmZvLm9wdGlvbnMpLnRoZW4oXG4gICAgICB0aGlzLm9uU2Vzc2lvbkNob3Nlbi5iaW5kKHRoaXMsIGdhdGV3YXlOYW1lKVxuICAgICk7XG4gIH1cblxuICBhc3luYyBvblNlc3Npb25DaG9zZW4oZ2F0ZXdheU5hbWU6IHN0cmluZywgc2Vzc2lvbjogYW55KSB7XG4gICAgdGhpcy5saXN0Vmlldy5jYW5jZWwoKTtcbiAgICBjb25zdCBrZXJuZWxTcGVjID0gYXdhaXQgc2Vzc2lvbi5rZXJuZWwuZ2V0U3BlYygpO1xuICAgIGlmICghc3RvcmUuZ3JhbW1hcikgcmV0dXJuO1xuXG4gICAgY29uc3Qga2VybmVsID0gbmV3IFdTS2VybmVsKFxuICAgICAgZ2F0ZXdheU5hbWUsXG4gICAgICBrZXJuZWxTcGVjLFxuICAgICAgc3RvcmUuZ3JhbW1hcixcbiAgICAgIHNlc3Npb25cbiAgICApO1xuICAgIHRoaXMuX29uQ2hvc2VuKGtlcm5lbCk7XG4gIH1cbn1cbiJdfQ==