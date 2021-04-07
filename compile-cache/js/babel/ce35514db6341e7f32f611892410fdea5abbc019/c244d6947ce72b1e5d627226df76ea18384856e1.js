Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, "next"); var callThrow = step.bind(null, "throw"); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _kernelspecs = require("kernelspecs");

var kernelspecs = _interopRequireWildcard(_kernelspecs);

var _electron = require("electron");

var _zmqKernel = require("./zmq-kernel");

var _zmqKernel2 = _interopRequireDefault(_zmqKernel);

var _kernel = require("./kernel");

var _kernel2 = _interopRequireDefault(_kernel);

var _kernelPicker = require("./kernel-picker");

var _kernelPicker2 = _interopRequireDefault(_kernelPicker);

var _store = require("./store");

var _store2 = _interopRequireDefault(_store);

var _utils = require("./utils");

var ks = kernelspecs;

exports.ks = ks;

var KernelManager = (function () {
  function KernelManager() {
    _classCallCheck(this, KernelManager);

    this.kernelSpecs = null;
  }

  _createClass(KernelManager, [{
    key: "startKernelFor",
    value: function startKernelFor(grammar, editor, filePath, onStarted) {
      var _this = this;

      this.getKernelSpecForGrammar(grammar).then(function (kernelSpec) {
        if (!kernelSpec) {
          var message = "No kernel for grammar `" + grammar.name + "` found";
          var pythonDescription = grammar && /python/g.test(grammar.scopeName) ? "\n\nTo detect your current Python install you will need to run:<pre>python -m pip install ipykernel\npython -m ipykernel install --user</pre>" : "";
          var description = "Check that the language for this file is set in Atom, that you have a Jupyter kernel installed for it, and that you have configured the language mapping in Hydrogen preferences." + pythonDescription;
          atom.notifications.addError(message, {
            description: description,
            dismissable: pythonDescription !== ""
          });
          return;
        }

        _this.startKernel(kernelSpec, grammar, editor, filePath, onStarted);
      });
    }
  }, {
    key: "startKernel",
    value: function startKernel(kernelSpec, grammar, editor, filePath, onStarted) {
      var displayName = kernelSpec.display_name;

      // if kernel startup already in progress don't start additional kernel
      if (_store2["default"].startingKernels.get(displayName)) return;

      _store2["default"].startKernel(displayName);

      var currentPath = (0, _utils.getEditorDirectory)(editor);
      var projectPath = undefined;

      (0, _utils.log)("KernelManager: startKernel:", displayName);

      switch (atom.config.get("Hydrogen.startDir")) {
        case "firstProjectDir":
          projectPath = atom.project.getPaths()[0];
          break;
        case "projectDirOfFile":
          projectPath = atom.project.relativizePath(currentPath)[0];
          break;
      }

      var kernelStartDir = projectPath != null ? projectPath : currentPath;
      var options = {
        cwd: kernelStartDir,
        stdio: ["ignore", "pipe", "pipe"]
      };

      var transport = new _zmqKernel2["default"](kernelSpec, grammar, options, function () {
        var kernel = new _kernel2["default"](transport);
        _store2["default"].newKernel(kernel, filePath, editor, grammar);
        if (onStarted) onStarted(kernel);
      });
    }
  }, {
    key: "update",
    value: _asyncToGenerator(function* () {
      var kernelSpecs = yield ks.findAll();
      this.kernelSpecs = _lodash2["default"].sortBy(_lodash2["default"].map(_lodash2["default"].mapKeys(kernelSpecs, function (value, key) {
        return value.spec.name = key;
      }), "spec"), function (spec) {
        return spec.display_name;
      });
      return this.kernelSpecs;
    })
  }, {
    key: "getAllKernelSpecs",
    value: _asyncToGenerator(function* (grammar) {
      if (this.kernelSpecs) return this.kernelSpecs;
      return this.updateKernelSpecs(grammar);
    })
  }, {
    key: "getAllKernelSpecsForGrammar",
    value: _asyncToGenerator(function* (grammar) {
      if (!grammar) return [];

      var kernelSpecs = yield this.getAllKernelSpecs(grammar);
      return kernelSpecs.filter(function (spec) {
        return (0, _utils.kernelSpecProvidesGrammar)(spec, grammar);
      });
    })
  }, {
    key: "getKernelSpecForGrammar",
    value: _asyncToGenerator(function* (grammar) {
      var _this2 = this;

      var kernelSpecs = yield this.getAllKernelSpecsForGrammar(grammar);
      if (kernelSpecs.length <= 1) {
        return kernelSpecs[0];
      }

      if (this.kernelPicker) {
        this.kernelPicker.kernelSpecs = kernelSpecs;
      } else {
        this.kernelPicker = new _kernelPicker2["default"](kernelSpecs);
      }

      return new Promise(function (resolve) {
        if (!_this2.kernelPicker) return resolve(null);
        _this2.kernelPicker.onConfirmed = function (kernelSpec) {
          return resolve(kernelSpec);
        };
        _this2.kernelPicker.toggle();
      });
    })
  }, {
    key: "updateKernelSpecs",
    value: _asyncToGenerator(function* (grammar) {
      var kernelSpecs = yield this.update();

      if (kernelSpecs.length === 0) {
        var message = "No Kernels Installed";

        var options = {
          description: "No kernels are installed on your system so you will not be able to execute code in any language.",
          dismissable: true,
          buttons: [{
            text: "Install Instructions",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://nteract.gitbooks.io/hydrogen/docs/Installation.html");
            }
          }, {
            text: "Popular Kernels",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://nteract.io/kernels");
            }
          }, {
            text: "All Kernels",
            onDidClick: function onDidClick() {
              return _electron.shell.openExternal("https://github.com/jupyter/jupyter/wiki/Jupyter-kernels");
            }
          }]
        };
        atom.notifications.addError(message, options);
      } else {
        var message = "Hydrogen Kernels updated:";
        var options = {
          detail: _lodash2["default"].map(kernelSpecs, "display_name").join("\n")
        };
        atom.notifications.addInfo(message, options);
      }
      return kernelSpecs;
    })
  }]);

  return KernelManager;
})();

exports.KernelManager = KernelManager;
exports["default"] = new KernelManager();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtbWFuYWdlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztzQkFFYyxRQUFROzs7OzJCQUNPLGFBQWE7O0lBQTlCLFdBQVc7O3dCQUNELFVBQVU7O3lCQUVWLGNBQWM7Ozs7c0JBQ2pCLFVBQVU7Ozs7NEJBRUosaUJBQWlCOzs7O3FCQUN4QixTQUFTOzs7O3FCQUN3QyxTQUFTOztBQUlyRSxJQUFNLEVBQUUsR0FBRyxXQUFXLENBQUM7Ozs7SUFFakIsYUFBYTtXQUFiLGFBQWE7MEJBQWIsYUFBYTs7U0FDeEIsV0FBVyxHQUF1QixJQUFJOzs7ZUFEM0IsYUFBYTs7V0FJVix3QkFDWixPQUFxQixFQUNyQixNQUF1QixFQUN2QixRQUFnQixFQUNoQixTQUFtQyxFQUNuQzs7O0FBQ0EsVUFBSSxDQUFDLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLFVBQVUsRUFBSztBQUN6RCxZQUFJLENBQUMsVUFBVSxFQUFFO0FBQ2YsY0FBTSxPQUFPLCtCQUE4QixPQUFPLENBQUMsSUFBSSxZQUFVLENBQUM7QUFDbEUsY0FBTSxpQkFBaUIsR0FDckIsT0FBTyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUN4QywrSUFBK0ksR0FDL0ksRUFBRSxDQUFDO0FBQ1QsY0FBTSxXQUFXLHlMQUF1TCxpQkFBaUIsQUFBRSxDQUFDO0FBQzVOLGNBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtBQUNuQyx1QkFBVyxFQUFYLFdBQVc7QUFDWCx1QkFBVyxFQUFFLGlCQUFpQixLQUFLLEVBQUU7V0FDdEMsQ0FBQyxDQUFDO0FBQ0gsaUJBQU87U0FDUjs7QUFFRCxjQUFLLFdBQVcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsU0FBUyxDQUFDLENB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RUFBRSxhQUFhO0FBQ25CLHNCQUFVLEVBQUU7cUJBQ1YsZ0JBQU0sWUFBWSxDQUNoQix5REFBeUQsQ0FDMUQ7YUFBQTtXQUNKLENBQ0Y7U0FDRixDQUFDO0FBQ0YsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO09BQy9DLE1BQU07QUFDTCxZQUFNLE9BQU8sR0FBRywyQkFBMkIsQ0FBQztBQUM1QyxZQUFNLE9BQU8sR0FBRztBQUNkLGdCQUFNLEVBQUUsb0JBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO1NBQ3RELENBQUM7QUFDRixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDOUM7QUFDRCxhQUFPLFdBQVcsQ0FBQztLQUNwQjs7O1NBL0pVLGFBQWE7Ozs7cUJBa0tYLElBQUksYUFBYSxFQUFFIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9rZXJuZWwtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIGtlcm5lbHNwZWNzIGZyb20gXCJrZXJuZWxzcGVjc1wiO1xuaW1wb3J0IHsgc2hlbGwgfSBmcm9tIFwiZWxlY3Ryb25cIjtcblxuaW1wb3J0IFpNUUtlcm5lbCBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5pbXBvcnQgS2VybmVsIGZyb20gXCIuL2tlcm5lbFwiO1xuXG5pbXBvcnQgS2VybmVsUGlja2VyIGZyb20gXCIuL2tlcm5lbC1waWNrZXJcIjtcbmltcG9ydCBzdG9yZSBmcm9tIFwiLi9zdG9yZVwiO1xuaW1wb3J0IHsgZ2V0RWRpdG9yRGlyZWN0b3J5LCBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyLCBsb2cgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5pbXBvcnQgdHlwZSB7IENvbm5lY3Rpb24gfSBmcm9tIFwiLi96bXEta2VybmVsXCI7XG5cbmV4cG9ydCBjb25zdCBrcyA9IGtlcm5lbHNwZWNzO1xuXG5leHBvcnQgY2xhc3MgS2VybmVsTWFuYWdlciB7XG4gIGtlcm5lbFNwZWNzOiA/QXJyYXk8S2VybmVsc3BlYz4gPSBudWxsO1xuICBrZXJuZWxQaWNrZXI6ID9LZXJuZWxQaWNrZXI7XG5cbiAgc3RhcnRLZXJuZWxGb3IoXG4gICAgZ3JhbW1hcjogYXRvbSRHcmFtbWFyLFxuICAgIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgb25TdGFydGVkOiAoa2VybmVsOiBLZXJuZWwpID0+IHZvaWRcbiAgKSB7XG4gICAgdGhpcy5nZXRLZXJuZWxTcGVjRm9yR3JhbW1hcihncmFtbWFyKS50aGVuKChrZXJuZWxTcGVjKSA9PiB7XG4gICAgICBpZiAoIWtlcm5lbFNwZWMpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGBObyBrZXJuZWwgZm9yIGdyYW1tYXIgXFxgJHtncmFtbWFyLm5hbWV9XFxgIGZvdW5kYDtcbiAgICAgICAgY29uc3QgcHl0aG9uRGVzY3JpcHRpb24gPVxuICAgICAgICAgIGdyYW1tYXIgJiYgL3B5dGhvbi9nLnRlc3QoZ3JhbW1hci5zY29wZU5hbWUpXG4gICAgICAgICAgICA/IFwiXFxuXFxuVG8gZGV0ZWN0IHlvdXIgY3VycmVudCBQeXRob24gaW5zdGFsbCB5b3Ugd2lsbCBuZWVkIHRvIHJ1bjo8cHJlPnB5dGhvbiAtbSBwaXAgaW5zdGFsbCBpcHlrZXJuZWxcXG5weXRob24gLW0gaXB5a2VybmVsIGluc3RhbGwgLS11c2VyPC9wcmU+XCJcbiAgICAgICAgICAgIDogXCJcIjtcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBgQ2hlY2sgdGhhdCB0aGUgbGFuZ3VhZ2UgZm9yIHRoaXMgZmlsZSBpcyBzZXQgaW4gQXRvbSwgdGhhdCB5b3UgaGF2ZSBhIEp1cHl0ZXIga2VybmVsIGluc3RhbGxlZCBmb3IgaXQsIGFuZCB0aGF0IHlvdSBoYXZlIGNvbmZpZ3VyZWQgdGhlIGxhbmd1YWdlIG1hcHBpbmcgaW4gSHlkcm9nZW4gcHJlZmVyZW5jZXMuJHtweXRob25EZXNjcmlwdGlvbn1gO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IobWVzc2FnZSwge1xuICAgICAgICAgIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIGRpc21pc3NhYmxlOiBweXRob25EZXNjcmlwdGlvbiAhPT0gXCJcIixcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5zdGFydEtlcm5lbChrZXJuZWxTcGVjLCBncmFtbWFyLCBlZGl0b3IsIGZpbGVQYXRoLCBvblN0YXJ0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRLZXJuZWwoXG4gICAga2VybmVsU3BlYzogS2VybmVsc3BlYyxcbiAgICBncmFtbWFyOiBhdG9tJEdyYW1tYXIsXG4gICAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gICAgZmlsZVBhdGg6IHN0cmluZyxcbiAgICBvblN0YXJ0ZWQ6ID8oa2VybmVsOiBLZXJuZWwpID0+IHZvaWRcbiAgKSB7XG4gICAgY29uc3QgZGlzcGxheU5hbWUgPSBrZXJuZWxTcGVjLmRpc3BsYXlfbmFtZTtcblxuICAgIC8vIGlmIGtlcm5lbCBzdGFydHVwIGFscmVhZHkgaW4gcHJvZ3Jlc3MgZG9uJ3Qgc3RhcnQgYWRkaXRpb25hbCBrZXJuZWxcbiAgICBpZiAoc3RvcmUuc3RhcnRpbmdLZXJuZWxzLmdldChkaXNwbGF5TmFtZSkpIHJldHVybjtcblxuICAgIHN0b3JlLnN0YXJ0S2VybmVsKGRpc3BsYXlOYW1lKTtcblxuICAgIGxldCBjdXJyZW50UGF0aCA9IGdldEVkaXRvckRpcmVjdG9yeShlZGl0b3IpO1xuICAgIGxldCBwcm9qZWN0UGF0aDtcblxuICAgIGxvZyhcIktlcm5lbE1hbmFnZXI6IHN0YXJ0S2VybmVsOlwiLCBkaXNwbGF5TmFtZSk7XG5cbiAgICBzd2l0Y2ggKGF0b20uY29uZmlnLmdldChcIkh5ZHJvZ2VuLnN0YXJ0RGlyXCIpKSB7XG4gICAgICBjYXNlIFwiZmlyc3RQcm9qZWN0RGlyXCI6XG4gICAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBcInByb2plY3REaXJPZkZpbGVcIjpcbiAgICAgICAgcHJvamVjdFBhdGggPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoY3VycmVudFBhdGgpWzBdO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjb25zdCBrZXJuZWxTdGFydERpciA9IHByb2plY3RQYXRoICE9IG51bGwgPyBwcm9qZWN0UGF0aCA6IGN1cnJlbnRQYXRoO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBjd2Q6IGtlcm5lbFN0YXJ0RGlyLFxuICAgICAgc3RkaW86IFtcImlnbm9yZVwiLCBcInBpcGVcIiwgXCJwaXBlXCJdLFxuICAgIH07XG5cbiAgICBjb25zdCB0cmFuc3BvcnQgPSBuZXcgWk1RS2VybmVsKGtlcm5lbFNwZWMsIGdyYW1tYXIsIG9wdGlvbnMsICgpID0+IHtcbiAgICAgIGNvbnN0IGtlcm5lbCA9IG5ldyBLZXJuZWwodHJhbnNwb3J0KTtcbiAgICAgIHN0b3JlLm5ld0tlcm5lbChrZXJuZWwsIGZpbGVQYXRoLCBlZGl0b3IsIGdyYW1tYXIpO1xuICAgICAgaWYgKG9uU3RhcnRlZCkgb25TdGFydGVkKGtlcm5lbCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB1cGRhdGUoKTogUHJvbWlzZTxLZXJuZWxzcGVjW10+IHtcbiAgICBjb25zdCBrZXJuZWxTcGVjcyA9IGF3YWl0IGtzLmZpbmRBbGwoKTtcbiAgICB0aGlzLmtlcm5lbFNwZWNzID0gXy5zb3J0QnkoXG4gICAgICBfLm1hcChcbiAgICAgICAgXy5tYXBLZXlzKGtlcm5lbFNwZWNzLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgIHJldHVybiAodmFsdWUuc3BlYy5uYW1lID0ga2V5KTtcbiAgICAgICAgfSksXG4gICAgICAgIFwic3BlY1wiXG4gICAgICApLFxuICAgICAgKHNwZWMpID0+IHNwZWMuZGlzcGxheV9uYW1lXG4gICAgKTtcbiAgICByZXR1cm4gdGhpcy5rZXJuZWxTcGVjcztcbiAgfVxuXG4gIGFzeW5jIGdldEFsbEtlcm5lbFNwZWNzKGdyYW1tYXI6ID9hdG9tJEdyYW1tYXIpIHtcbiAgICBpZiAodGhpcy5rZXJuZWxTcGVjcykgcmV0dXJuIHRoaXMua2VybmVsU3BlY3M7XG4gICAgcmV0dXJuIHRoaXMudXBkYXRlS2VybmVsU3BlY3MoZ3JhbW1hcik7XG4gIH1cblxuICBhc3luYyBnZXRBbGxLZXJuZWxTcGVjc0ZvckdyYW1tYXIoXG4gICAgZ3JhbW1hcjogP2F0b20kR3JhbW1hclxuICApOiBQcm9taXNlPEtlcm5lbHNwZWNbXT4ge1xuICAgIGlmICghZ3JhbW1hcikgcmV0dXJuIFtdO1xuXG4gICAgY29uc3Qga2VybmVsU3BlY3MgPSBhd2FpdCB0aGlzLmdldEFsbEtlcm5lbFNwZWNzKGdyYW1tYXIpO1xuICAgIHJldHVybiBrZXJuZWxTcGVjcy5maWx0ZXIoKHNwZWMpID0+XG4gICAgICBrZXJuZWxTcGVjUHJvdmlkZXNHcmFtbWFyKHNwZWMsIGdyYW1tYXIpXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGdldEtlcm5lbFNwZWNGb3JHcmFtbWFyKGdyYW1tYXI6IGF0b20kR3JhbW1hcikge1xuICAgIGNvbnN0IGtlcm5lbFNwZWNzID0gYXdhaXQgdGhpcy5nZXRBbGxLZXJuZWxTcGVjc0ZvckdyYW1tYXIoZ3JhbW1hcik7XG4gICAgaWYgKGtlcm5lbFNwZWNzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4ga2VybmVsU3BlY3NbMF07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMua2VybmVsUGlja2VyKSB7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci5rZXJuZWxTcGVjcyA9IGtlcm5lbFNwZWNzO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlciA9IG5ldyBLZXJuZWxQaWNrZXIoa2VybmVsU3BlY3MpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmtlcm5lbFBpY2tlcikgcmV0dXJuIHJlc29sdmUobnVsbCk7XG4gICAgICB0aGlzLmtlcm5lbFBpY2tlci5vbkNvbmZpcm1lZCA9IChrZXJuZWxTcGVjKSA9PiByZXNvbHZlKGtlcm5lbFNwZWMpO1xuICAgICAgdGhpcy5rZXJuZWxQaWNrZXIudG9nZ2xlKCk7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVLZXJuZWxTcGVjcyhncmFtbWFyOiA/YXRvbSRHcmFtbWFyKSB7XG4gICAgY29uc3Qga2VybmVsU3BlY3MgPSBhd2FpdCB0aGlzLnVwZGF0ZSgpO1xuXG4gICAgaWYgKGtlcm5lbFNwZWNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IFwiTm8gS2VybmVscyBJbnN0YWxsZWRcIjtcblxuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgXCJObyBrZXJuZWxzIGFyZSBpbnN0YWxsZWQgb24geW91ciBzeXN0ZW0gc28geW91IHdpbGwgbm90IGJlIGFibGUgdG8gZXhlY3V0ZSBjb2RlIGluIGFueSBsYW5ndWFnZS5cIixcbiAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkluc3RhbGwgSW5zdHJ1Y3Rpb25zXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PlxuICAgICAgICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoXG4gICAgICAgICAgICAgICAgXCJodHRwczovL250ZXJhY3QuZ2l0Ym9va3MuaW8vaHlkcm9nZW4vZG9jcy9JbnN0YWxsYXRpb24uaHRtbFwiXG4gICAgICAgICAgICAgICksXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIlBvcHVsYXIgS2VybmVsc1wiLFxuICAgICAgICAgICAgb25EaWRDbGljazogKCkgPT4gc2hlbGwub3BlbkV4dGVybmFsKFwiaHR0cHM6Ly9udGVyYWN0LmlvL2tlcm5lbHNcIiksXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiBcIkFsbCBLZXJuZWxzXCIsXG4gICAgICAgICAgICBvbkRpZENsaWNrOiAoKSA9PlxuICAgICAgICAgICAgICBzaGVsbC5vcGVuRXh0ZXJuYWwoXG4gICAgICAgICAgICAgICAgXCJodHRwczovL2dpdGh1Yi5jb20vanVweXRlci9qdXB5dGVyL3dpa2kvSnVweXRlci1rZXJuZWxzXCJcbiAgICAgICAgICAgICAgKSxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfTtcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IFwiSHlkcm9nZW4gS2VybmVscyB1cGRhdGVkOlwiO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgZGV0YWlsOiBfLm1hcChrZXJuZWxTcGVjcywgXCJkaXNwbGF5X25hbWVcIikuam9pbihcIlxcblwiKSxcbiAgICAgIH07XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyhtZXNzYWdlLCBvcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIGtlcm5lbFNwZWNzO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IG5ldyBLZXJuZWxNYW5hZ2VyKCk7XG4iXX0=