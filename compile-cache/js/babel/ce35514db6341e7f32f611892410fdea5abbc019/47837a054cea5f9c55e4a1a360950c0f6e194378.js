Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === "function") { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError("The decorator for method " + descriptor.key + " is of the invalid type " + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

exports.reduceOutputs = reduceOutputs;
exports.isSingleLine = isSingleLine;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineDecoratedPropertyDescriptor(target, key, descriptors) { var _descriptor = descriptors[key]; if (!_descriptor) return; var descriptor = {}; for (var _key in _descriptor) descriptor[_key] = _descriptor[_key]; descriptor.value = descriptor.initializer ? descriptor.initializer.call(target) : undefined; Object.defineProperty(target, key, descriptor); }

var _mobx = require("mobx");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _escapeCarriage = require("escape-carriage");

var _componentsResultViewDisplay = require("../components/result-view/display");

var outputTypes = ["execute_result", "display_data", "stream", "error"];

/**
 * https://github.com/nteract/hydrogen/issues/466#issuecomment-274822937
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Array<Object>} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Array<Object>} updated-outputs - Outputs + Output
 */

function reduceOutputs(outputs, output) {
  var last = outputs.length - 1;
  if (outputs.length > 0 && output.output_type === "stream" && outputs[last].output_type === "stream") {
    var appendText = function appendText(previous, next) {
      previous.text = (0, _escapeCarriage.escapeCarriageReturnSafe)(previous.text + next.text);
    };

    if (outputs[last].name === output.name) {
      appendText(outputs[last], output);
      return outputs;
    }

    if (outputs.length > 1 && outputs[last - 1].name === output.name) {
      appendText(outputs[last - 1], output);
      return outputs;
    }
  }
  outputs.push(output);
  return outputs;
}

function isSingleLine(text, availableSpace) {
  // If it turns out escapeCarriageReturn is a bottleneck, we should remove it.
  return (!text || text.indexOf("\n") === -1 || text.indexOf("\n") === text.length - 1) && availableSpace > (0, _escapeCarriage.escapeCarriageReturn)(text).length;
}

var OutputStore = (function () {
  var _instanceInitializers = {};

  function OutputStore() {
    _classCallCheck(this, OutputStore);

    _defineDecoratedPropertyDescriptor(this, "outputs", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "status", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "executionCount", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "index", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "position", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "setIndex", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "incrementIndex", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "decrementIndex", _instanceInitializers);

    _defineDecoratedPropertyDescriptor(this, "clear", _instanceInitializers);
  }

  _createDecoratedClass(OutputStore, [{
    key: "appendOutput",
    decorators: [_mobx.action],
    value: function appendOutput(message) {
      if (message.stream === "execution_count") {
        this.executionCount = message.data;
      } else if (message.stream === "status") {
        this.status = message.data;
      } else if (outputTypes.indexOf(message.output_type) > -1) {
        reduceOutputs(this.outputs, message);
        this.setIndex(this.outputs.length - 1);
      }
    }
  }, {
    key: "updatePosition",
    decorators: [_mobx.action],
    value: function updatePosition(position) {
      Object.assign(this.position, position);
    }
  }, {
    key: "outputs",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return [];
    },
    enumerable: true
  }, {
    key: "status",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return "running";
    },
    enumerable: true
  }, {
    key: "executionCount",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return null;
    },
    enumerable: true
  }, {
    key: "index",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return -1;
    },
    enumerable: true
  }, {
    key: "position",
    decorators: [_mobx.observable],
    initializer: function initializer() {
      return {
        lineHeight: 0,
        lineLength: 0,
        editorWidth: 0,
        charWidth: 0
      };
    },
    enumerable: true
  }, {
    key: "isPlain",
    decorators: [_mobx.computed],
    get: function get() {
      if (this.outputs.length !== 1) return false;

      var availableSpace = Math.floor((this.position.editorWidth - this.position.lineLength) / this.position.charWidth);
      if (availableSpace <= 0) return false;

      var output = this.outputs[0];
      switch (output.output_type) {
        case "execute_result":
        case "display_data":
          {
            var bundle = output.data;
            return (0, _componentsResultViewDisplay.isTextOutputOnly)(bundle) ? isSingleLine(bundle["text/plain"], availableSpace) : false;
          }
        case "stream":
          {
            return isSingleLine(output.text, availableSpace);
          }
        default:
          {
            return false;
          }
      }
    }
  }, {
    key: "setIndex",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this = this;

      return function (index) {
        if (index < 0) {
          _this.index = 0;
        } else if (index < _this.outputs.length) {
          _this.index = index;
        } else {
          _this.index = _this.outputs.length - 1;
        }
      };
    },
    enumerable: true
  }, {
    key: "incrementIndex",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this2 = this;

      return function () {
        _this2.index = _this2.index < _this2.outputs.length - 1 ? _this2.index + 1 : _this2.outputs.length - 1;
      };
    },
    enumerable: true
  }, {
    key: "decrementIndex",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this3 = this;

      return function () {
        _this3.index = _this3.index > 0 ? _this3.index - 1 : 0;
      };
    },
    enumerable: true
  }, {
    key: "clear",
    decorators: [_mobx.action],
    initializer: function initializer() {
      var _this4 = this;

      return function () {
        _this4.outputs = [];
        _this4.index = -1;
      };
    },
    enumerable: true
  }], null, _instanceInitializers);

  return OutputStore;
})();

exports["default"] = OutputStore;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zdG9yZS9vdXRwdXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O29CQUU2QyxNQUFNOztzQkFDckMsUUFBUTs7Ozs4QkFJZixpQkFBaUI7OzJDQUdTLG1DQUFtQzs7QUFDcEUsSUFBTSxXQUFXLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7O0FBWW5FLFNBQVMsYUFBYSxDQUMzQixPQUFzQixFQUN0QixNQUFjLEVBQ0M7QUFDZixNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUNoQyxNQUNFLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUNsQixNQUFNLENBQUMsV0FBVyxLQUFLLFFBQVEsSUFDL0IsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsS0FBSyxRQUFRLEVBQ3RDO1FBQ1MsVUFBVSxHQUFuQixTQUFTLFVBQVUsQ0FBQyxRQUFnQixFQUFFLElBQVksRUFBRTtBQUNsRCxjQUFRLENBQUMsSUFBSSxHQUFHLDhDQUF5QixRQUFRLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNyRTs7QUFFRCxRQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksRUFBRTtBQUN0QyxnQkFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNsQyxhQUFPLE9BQU8sQ0FBQztLQUNoQjs7QUFFRCxRQUFJLE9BQU8sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDaEUsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsSUFB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T0FDRjtLQUNGOzs7Ozs7O2FBd0JVLFVBQUMsS0FBSyxFQUFhO0FBQzVCLFlBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNiLGdCQUFLLEtBQUssR0FBRyxDQUFDLENBQUM7U0FDaEIsTUFBTSxJQUFJLEtBQUssR0FBRyxNQUFLLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDdEMsZ0JBQUssS0FBSyxHQUFHLEtBQUssQ0FBQztTQUNwQixNQUFNO0FBQ0wsZ0JBQUssS0FBSyxHQUFHLE1BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7U0FDdEM7T0FDRjs7Ozs7Ozs7O2FBR2dCLFlBQU07QUFDckIsZUFBSyxLQUFLLEdBQ1IsT0FBSyxLQUFLLEdBQUcsT0FBSyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsR0FDaEMsT0FBSyxLQUFLLEdBQUcsQ0FBQyxHQUNkLE9BQUssT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7T0FDL0I7Ozs7Ozs7OzthQUdnQixZQUFNO0FBQ3JCLGVBQUssS0FBSyxHQUFHLE9BQUssS0FBSyxHQUFHLENBQUMsR0FBRyxPQUFLLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ2xEOzs7Ozs7Ozs7YUFHTyxZQUFNO0FBQ1osZUFBSyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLGVBQUssS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQ2pCOzs7OztTQTlGa0IsV0FBVzs7O3FCQUFYLFdBQVciLCJmaWxlIjoiL1VzZXJzL2RjeGltYWMvLmF0b20vcGFja2FnZXMvSHlkcm9nZW4vbGliL3N0b3JlL291dHB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IGFjdGlvbiwgY29tcHV0ZWQsIG9ic2VydmFibGUgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtcbiAgZXNjYXBlQ2FycmlhZ2VSZXR1cm4sXG4gIGVzY2FwZUNhcnJpYWdlUmV0dXJuU2FmZSxcbn0gZnJvbSBcImVzY2FwZS1jYXJyaWFnZVwiO1xuXG5pbXBvcnQgdHlwZSB7IElPYnNlcnZhYmxlQXJyYXkgfSBmcm9tIFwibW9ieFwiO1xuaW1wb3J0IHsgaXNUZXh0T3V0cHV0T25seSB9IGZyb20gXCIuLi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L2Rpc3BsYXlcIjtcbmNvbnN0IG91dHB1dFR5cGVzID0gW1wiZXhlY3V0ZV9yZXN1bHRcIiwgXCJkaXNwbGF5X2RhdGFcIiwgXCJzdHJlYW1cIiwgXCJlcnJvclwiXTtcblxuLyoqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbnRlcmFjdC9oeWRyb2dlbi9pc3N1ZXMvNDY2I2lzc3VlY29tbWVudC0yNzQ4MjI5MzdcbiAqIEFuIG91dHB1dCBjYW4gYmUgYSBzdHJlYW0gb2YgZGF0YSB0aGF0IGRvZXMgbm90IGFycml2ZSBhdCBhIHNpbmdsZSB0aW1lLiBUaGlzXG4gKiBmdW5jdGlvbiBoYW5kbGVzIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2Ygb3V0cHV0cyBhbmQgYWNjdW11bGF0ZXMgdGhlIGRhdGFcbiAqIGludG8gYSByZWR1Y2VkIG91dHB1dC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5PE9iamVjdD59IG91dHB1dHMgLSBLZXJuZWwgb3V0cHV0IG1lc3NhZ2VzXG4gKiBAcGFyYW0ge09iamVjdH0gb3V0cHV0IC0gT3V0cHV0dGVkIHRvIGJlIHJlZHVjZWQgaW50byBsaXN0IG9mIG91dHB1dHNcbiAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59IHVwZGF0ZWQtb3V0cHV0cyAtIE91dHB1dHMgKyBPdXRwdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlZHVjZU91dHB1dHMoXG4gIG91dHB1dHM6IEFycmF5PE9iamVjdD4sXG4gIG91dHB1dDogT2JqZWN0XG4pOiBBcnJheTxPYmplY3Q+IHtcbiAgY29uc3QgbGFzdCA9IG91dHB1dHMubGVuZ3RoIC0gMTtcbiAgaWYgKFxuICAgIG91dHB1dHMubGVuZ3RoID4gMCAmJlxuICAgIG91dHB1dC5vdXRwdXRfdHlwZSA9PT0gXCJzdHJlYW1cIiAmJlxuICAgIG91dHB1dHNbbGFzdF0ub3V0cHV0X3R5cGUgPT09IFwic3RyZWFtXCJcbiAgKSB7XG4gICAgZnVuY3Rpb24gYXBwZW5kVGV4dChwcmV2aW91czogT2JqZWN0LCBuZXh0OiBPYmplY3QpIHtcbiAgICAgIHByZXZpb3VzLnRleHQgPSBlc2NhcGVDYXJyaWFnZVJldHVyblNhZmUocHJldmlvdXMudGV4dCArIG5leHQudGV4dCk7XG4gICAgfVxuXG4gICAgaWYgKG91dHB1dHNbbGFzdF0ubmFtZSA9PT0gb3V0cHV0Lm5hbWUpIHtcbiAgICAgIGFwcGVuZFRleHQob3V0cHV0c1tsYXN0XSwgb3V0cHV0KTtcbiAgICAgIHJldHVybiBvdXRwdXRzO1xuICAgIH1cblxuICAgIGlmIChvdXRwdXRzLmxlbmd0aCA+IDEgJiYgb3V0cHV0c1tsYXN0IC0gMV0ubmFtZSA9PT0gb3V0cHV0Lm5hbWUpIHtcbiAgICAgIGFwcGVuZFRleHQob3V0cHV0c1tsYXN0IC0gMV0sIG91dHB1dCk7XG4gICAgICByZXR1cm4gb3V0cHV0cztcbiAgICB9XG4gIH1cbiAgb3V0cHV0cy5wdXNoKG91dHB1dCk7XG4gIHJldHVybiBvdXRwdXRzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNTaW5nbGVMaW5lKHRleHQ6ID9zdHJpbmcsIGF2YWlsYWJsZVNwYWNlOiBudW1iZXIpIHtcbiAgLy8gSWYgaXQgdHVybnMgb3V0IGVzY2FwZUNhcnJpYWdlUmV0dXJuIGlzIGEgYm90dGxlbmVjaywgd2Ugc2hvdWxkIHJlbW92ZSBpdC5cbiAgcmV0dXJuIChcbiAgICAoIXRleHQgfHxcbiAgICAgIHRleHQuaW5kZXhPZihcIlxcblwiKSA9PT0gLTEgfHxcbiAgICAgIHRleHQuaW5kZXhPZihcIlxcblwiKSA9PT0gdGV4dC5sZW5ndGggLSAxKSAmJlxuICAgIGF2YWlsYWJsZVNwYWNlID4gZXNjYXBlQ2FycmlhZ2VSZXR1cm4odGV4dCkubGVuZ3RoXG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE91dHB1dFN0b3JlIHtcbiAgQG9ic2VydmFibGVcbiAgb3V0cHV0czogQXJyYXk8T2JqZWN0PiA9IFtdO1xuICBAb2JzZXJ2YWJsZVxuICBzdGF0dXM6IHN0cmluZyA9IFwicnVubmluZ1wiO1xuICBAb2JzZXJ2YWJsZVxuICBleGVjdXRpb25Db3VudDogP251bWJlciA9IG51bGw7XG4gIEBvYnNlcnZhYmxlXG4gIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgQG9ic2VydmFibGVcbiAgcG9zaXRpb24gPSB7XG4gICAgbGluZUhlaWdodDogMCxcbiAgICBsaW5lTGVuZ3RoOiAwLFxuICAgIGVkaXRvcldpZHRoOiAwLFxuICAgIGNoYXJXaWR0aDogMCxcbiAgfTtcblxuICBAY29tcHV0ZWRcbiAgZ2V0IGlzUGxhaW4oKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMub3V0cHV0cy5sZW5ndGggIT09IDEpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGF2YWlsYWJsZVNwYWNlID0gTWF0aC5mbG9vcihcbiAgICAgICh0aGlzLnBvc2l0aW9uLmVkaXRvcldpZHRoIC0gdGhpcy5wb3NpdGlvbi5saW5lTGVuZ3RoKSAvXG4gICAgICAgIHRoaXMucG9zaXRpb24uY2hhcldpZHRoXG4gICAgKTtcbiAgICBpZiAoYXZhaWxhYmxlU3BhY2UgPD0gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3Qgb3V0cHV0ID0gdGhpcy5vdXRwdXRzWzBdO1xuICAgIHN3aXRjaCAob3V0cHV0Lm91dHB1dF90eXBlKSB7XG4gICAgICBjYXNlIFwiZXhlY3V0ZV9yZXN1bHRcIjpcbiAgICAgIGNhc2UgXCJkaXNwbGF5X2RhdGFcIjoge1xuICAgICAgICBjb25zdCBidW5kbGUgPSBvdXRwdXQuZGF0YTtcbiAgICAgICAgcmV0dXJuIGlzVGV4dE91dHB1dE9ubHkoYnVuZGxlKVxuICAgICAgICAgID8gaXNTaW5nbGVMaW5lKGJ1bmRsZVtcInRleHQvcGxhaW5cIl0sIGF2YWlsYWJsZVNwYWNlKVxuICAgICAgICAgIDogZmFsc2U7XG4gICAgICB9XG4gICAgICBjYXNlIFwic3RyZWFtXCI6IHtcbiAgICAgICAgcmV0dXJuIGlzU2luZ2xlTGluZShvdXRwdXQudGV4dCwgYXZhaWxhYmxlU3BhY2UpO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgQGFjdGlvblxuICBhcHBlbmRPdXRwdXQobWVzc2FnZTogT2JqZWN0KSB7XG4gICAgaWYgKG1lc3NhZ2Uuc3RyZWFtID09PSBcImV4ZWN1dGlvbl9jb3VudFwiKSB7XG4gICAgICB0aGlzLmV4ZWN1dGlvbkNvdW50ID0gbWVzc2FnZS5kYXRhO1xuICAgIH0gZWxzZSBpZiAobWVzc2FnZS5zdHJlYW0gPT09IFwic3RhdHVzXCIpIHtcbiAgICAgIHRoaXMuc3RhdHVzID0gbWVzc2FnZS5kYXRhO1xuICAgIH0gZWxzZSBpZiAob3V0cHV0VHlwZXMuaW5kZXhPZihtZXNzYWdlLm91dHB1dF90eXBlKSA+IC0xKSB7XG4gICAgICByZWR1Y2VPdXRwdXRzKHRoaXMub3V0cHV0cywgbWVzc2FnZSk7XG4gICAgICB0aGlzLnNldEluZGV4KHRoaXMub3V0cHV0cy5sZW5ndGggLSAxKTtcbiAgICB9XG4gIH1cblxuICBAYWN0aW9uXG4gIHVwZGF0ZVBvc2l0aW9uKHBvc2l0aW9uOiB7XG4gICAgbGluZUhlaWdodD86IG51bWJlcixcbiAgICBsaW5lTGVuZ3RoPzogbnVtYmVyLFxuICAgIGVkaXRvcldpZHRoPzogbnVtYmVyLFxuICB9KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnBvc2l0aW9uLCBwb3NpdGlvbik7XG4gIH1cblxuICBAYWN0aW9uXG4gIHNldEluZGV4ID0gKGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICB0aGlzLmluZGV4ID0gMDtcbiAgICB9IGVsc2UgaWYgKGluZGV4IDwgdGhpcy5vdXRwdXRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5pbmRleCA9IGluZGV4O1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmluZGV4ID0gdGhpcy5vdXRwdXRzLmxlbmd0aCAtIDE7XG4gICAgfVxuICB9O1xuXG4gIEBhY3Rpb25cbiAgaW5jcmVtZW50SW5kZXggPSAoKSA9PiB7XG4gICAgdGhpcy5pbmRleCA9XG4gICAgICB0aGlzLmluZGV4IDwgdGhpcy5vdXRwdXRzLmxlbmd0aCAtIDFcbiAgICAgICAgPyB0aGlzLmluZGV4ICsgMVxuICAgICAgICA6IHRoaXMub3V0cHV0cy5sZW5ndGggLSAxO1xuICB9O1xuXG4gIEBhY3Rpb25cbiAgZGVjcmVtZW50SW5kZXggPSAoKSA9PiB7XG4gICAgdGhpcy5pbmRleCA9IHRoaXMuaW5kZXggPiAwID8gdGhpcy5pbmRleCAtIDEgOiAwO1xuICB9O1xuXG4gIEBhY3Rpb25cbiAgY2xlYXIgPSAoKSA9PiB7XG4gICAgdGhpcy5vdXRwdXRzID0gW107XG4gICAgdGhpcy5pbmRleCA9IC0xO1xuICB9O1xufVxuIl19