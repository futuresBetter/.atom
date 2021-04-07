Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require("mobx");

var _output = require("./output");

var _output2 = _interopRequireDefault(_output);

var _utils = require("./../utils");

var WatchStore = (function () {
  var _instanceInitializers = {};

  function WatchStore(kernel) {
    var _this = this;

    _classCallCheck(this, WatchStore);

    this.outputStore = new _output2["default"]();

    _defineDecoratedPropertyDescriptor(this, "run", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setCode", _instanceInitializers);

    this.getCode = function () {
      return _this.editor.getText();
    };

    this.focus = function () {
      _this.editor.element.focus();
    };

    this.kernel = kernel;
    this.editor = atom.workspace.buildTextEditor({
      softWrapped: true,
      lineNumberGutterVisible: false
    });
    var grammar = this.kernel.grammar;
    if (grammar) atom.grammars.assignLanguageMode(this.editor, grammar.scopeName);
    this.editor.moveToTop();
    this.editor.element.classList.add("watch-input");
  }

  _createDecoratedClass(WatchStore, [{
    key: "run",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        var code = _this2.getCode();
        (0, _utils.log)("watchview running:", code);
        if (code && code.length > 0) {
          _this2.kernel.executeWatch(code, function (result) {
            _this2.outputStore.appendOutput(result);
          });
        }
      };
    },
    enumerable: true
  }, {
    key: "setCode",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function (code) {
        _this3.editor.setText(code);
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  return WatchStore;
})();

exports["default"] = WatchStore;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS93YXRjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7b0JBRXVCLE1BQU07O3NCQUVMLFVBQVU7Ozs7cUJBQ2QsWUFBWTs7SUFJWCxVQUFVOzs7QUFNbEIsV0FOUSxVQUFVLENBTWpCLE1BQWMsRUFBRTs7OzBCQU5ULFVBQVU7O1NBRzdCLFdBQVcsR0FBRyx5QkFBaUI7Ozs7OztTQWdDL0IsT0FBTyxHQUFHLFlBQU07QUFDZCxhQUFPLE1BQUssTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOztTQUVELEtBQUssR0FBRyxZQUFNO0FBQ1osWUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzdCOztBQWxDQyxRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDO0FBQzNDLGlCQUFXLEVBQUUsSUFBSTtBQUNqQiw2QkFBdUIsRUFBRSxLQUFLO0tBQy9CLENBQUMsQ0FBQztBQUNILFFBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFFBQUksT0FBTyxFQUNULElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkUsUUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUN4QixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0dBQ2xEOzt3QkFqQmtCLFVBQVU7Ozs7OzthQW9CdkIsWUFBTTtBQUNWLFlBQU0sSUFBSSxHQUFHLE9BQUssT0FBTyxFQUFFLENBQUM7QUFDNUIsd0JBQUksb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDaEMsWUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDM0IsaUJBQUssTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBQyxNQUFNLEVBQUs7QUFDekMsbUJBQUssV0FBVyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztXQUN2QyxDQUFDLENBQUM7U0FDSjtPQUNGOzs7Ozs7Ozs7YUFHUyxVQUFDLElBQUksRUFBYTtBQUMxQixlQUFLLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDM0I7Ozs7O1NBakNrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvVXNlcnMvZGN4aW1hYy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvc3RvcmUvd2F0Y2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5pbXBvcnQgeyBhY3Rpb24gfSBmcm9tIFwibW9ieFwiO1xuXG5pbXBvcnQgT3V0cHV0U3RvcmUgZnJvbSBcIi4vb3V0cHV0XCI7XG5pbXBvcnQgeyBsb2cgfSBmcm9tIFwiLi8uLi91dGlsc1wiO1xuXG5pbXBvcnQgdHlwZSBLZXJuZWwgZnJvbSBcIi4vLi4va2VybmVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoU3RvcmUge1xuICBrZXJuZWw6IEtlcm5lbDtcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3I7XG4gIG91dHB1dFN0b3JlID0gbmV3IE91dHB1dFN0b3JlKCk7XG4gIGF1dG9jb21wbGV0ZURpc3Bvc2FibGU6ID9hdG9tJERpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3Ioa2VybmVsOiBLZXJuZWwpIHtcbiAgICB0aGlzLmtlcm5lbCA9IGtlcm5lbDtcbiAgICB0aGlzLmVkaXRvciA9IGF0b20ud29ya3NwYWNlLmJ1aWxkVGV4dEVkaXRvcih7XG4gICAgICBzb2Z0V3JhcHBlZDogdHJ1ZSxcbiAgICAgIGxpbmVOdW1iZXJHdXR0ZXJWaXNpYmxlOiBmYWxzZSxcbiAgICB9KTtcbiAgICBjb25zdCBncmFtbWFyID0gdGhpcy5rZXJuZWwuZ3JhbW1hcjtcbiAgICBpZiAoZ3JhbW1hcilcbiAgICAgIGF0b20uZ3JhbW1hcnMuYXNzaWduTGFuZ3VhZ2VNb2RlKHRoaXMuZWRpdG9yLCBncmFtbWFyLnNjb3BlTmFtZSk7XG4gICAgdGhpcy5lZGl0b3IubW92ZVRvVG9wKCk7XG4gICAgdGhpcy5lZGl0b3IuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwid2F0Y2gtaW5wdXRcIik7XG4gIH1cblxuICBAYWN0aW9uXG4gIHJ1biA9ICgpID0+IHtcbiAgICBjb25zdCBjb2RlID0gdGhpcy5nZXRDb2RlKCk7XG4gICAgbG9nKFwid2F0Y2h2aWV3IHJ1bm5pbmc6XCIsIGNvZGUpO1xuICAgIGlmIChjb2RlICYmIGNvZGUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5rZXJuZWwuZXhlY3V0ZVdhdGNoKGNvZGUsIChyZXN1bHQpID0+IHtcbiAgICAgICAgdGhpcy5vdXRwdXRTdG9yZS5hcHBlbmRPdXRwdXQocmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBAYWN0aW9uXG4gIHNldENvZGUgPSAoY29kZTogc3RyaW5nKSA9PiB7XG4gICAgdGhpcy5lZGl0b3Iuc2V0VGV4dChjb2RlKTtcbiAgfTtcblxuICBnZXRDb2RlID0gKCkgPT4ge1xuICAgIHJldHVybiB0aGlzLmVkaXRvci5nZXRUZXh0KCk7XG4gIH07XG5cbiAgZm9jdXMgPSAoKSA9PiB7XG4gICAgdGhpcy5lZGl0b3IuZWxlbWVudC5mb2N1cygpO1xuICB9O1xufVxuIl19