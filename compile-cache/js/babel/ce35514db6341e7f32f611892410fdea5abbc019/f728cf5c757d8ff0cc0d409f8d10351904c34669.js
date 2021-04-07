Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.provideAutocompleteResults = provideAutocompleteResults;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _anser = require("anser");

var _utils = require("../../utils");

var iconHTML = "<img src='" + __dirname + "/../../../static/logo.svg' style='width: 100%;'>";

var regexes = {
  // pretty dodgy, adapted from http://stackoverflow.com/a/8396658
  r: /([^\d\W]|[.])[\w.$]*$/,

  // adapted from http://stackoverflow.com/q/5474008
  python: /([^\d\W]|[\u00A0-\uFFFF])[\w.\u00A0-\uFFFF]*$/,

  // adapted from http://php.net/manual/en/language.variables.basics.php
  php: /[$a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*$/
};

function parseCompletions(results, prefix) {
  var matches = results.matches;
  var metadata = results.metadata;

  // @NOTE: This can make invalid `replacedPrefix` and `replacedText` when a line includes unicode characters
  // @TODO (@aviatesk): Use `Regex` to detect them regardless of the `results.cursor_*` feedbacks from kernels
  var cursor_start = (0, _utils.char_idx_to_js_idx)(results.cursor_start, prefix);
  var cursor_end = (0, _utils.char_idx_to_js_idx)(results.cursor_end, prefix);

  if (metadata && metadata._jupyter_types_experimental) {
    var comps = metadata._jupyter_types_experimental;
    if (comps.length > 0 && comps[0].text) {
      return _lodash2["default"].map(comps, function (match) {
        var text = match.text;
        var start = match.start && match.end ? match.start : cursor_start;
        var end = match.start && match.end ? match.end : cursor_end;
        var replacementPrefix = prefix.slice(start, end);
        var replacedText = prefix.slice(0, start) + text;
        var type = match.type;
        return {
          text: text,
          replacementPrefix: replacementPrefix,
          replacedText: replacedText,
          iconHTML: !type || type === "<unknown>" ? iconHTML : undefined,
          type: type
        };
      });
    }
  }

  var replacementPrefix = prefix.slice(cursor_start, cursor_end);

  return _lodash2["default"].map(matches, function (match) {
    var text = match;
    var replacedText = prefix.slice(0, cursor_start) + text;
    return {
      text: text,
      replacementPrefix: replacementPrefix,
      replacedText: replacedText,
      iconHTML: iconHTML
    };
  });
}

function provideAutocompleteResults(store) {
  var autocompleteProvider = {
    enabled: atom.config.get("Hydrogen.autocomplete"),

    selector: ".source",
    disableForSelector: ".comment",

    // The default provider has an inclusion priority of 0.
    inclusionPriority: 1,

    // The default provider has a suggestion priority of 1.
    suggestionPriority: atom.config.get("Hydrogen.autocompleteSuggestionPriority"),

    // It won't suppress providers with lower priority.
    excludeLowerPriority: false,

    suggestionDetailsEnabled: atom.config.get("Hydrogen.showInspectorResultsInAutocomplete"),

    // Required: Return a promise, an array of suggestions, or null.
    getSuggestions: function getSuggestions(_ref) {
      var editor = _ref.editor;
      var bufferPosition = _ref.bufferPosition;
      var prefix = _ref.prefix;

      if (!this.enabled) return null;

      var kernel = store.kernel;
      if (!kernel || kernel.executionState !== "idle") return null;

      var line = editor.getTextInBufferRange([[bufferPosition.row, 0], bufferPosition]);

      var regex = regexes[kernel.language];
      if (regex) {
        prefix = _lodash2["default"].head(line.match(regex)) || "";
      } else {
        prefix = line;
      }

      // return if cursor is at whitespace
      if (prefix.trimRight().length < prefix.length) return null;

      var minimumWordLength = atom.config.get("autocomplete-plus.minimumWordLength");
      if (typeof minimumWordLength !== "number") {
        minimumWordLength = 3;
      }

      if (prefix.trim().length < minimumWordLength) return null;

      (0, _utils.log)("autocompleteProvider: request:", line, bufferPosition, prefix);

      var promise = new Promise(function (resolve) {
        kernel.complete(prefix, function (results) {
          return resolve(parseCompletions(results, prefix));
        });
      });

      return Promise.race([promise, this.timeout()]);
    },

    getSuggestionDetailsOnSelect: function getSuggestionDetailsOnSelect(_ref2) {
      var text = _ref2.text;
      var replacementPrefix = _ref2.replacementPrefix;
      var replacedText = _ref2.replacedText;
      var iconHTML = _ref2.iconHTML;
      var type = _ref2.type;

      if (!this.suggestionDetailsEnabled) return null;

      var kernel = store.kernel;
      if (!kernel || kernel.executionState !== "idle") return null;

      var promise = new Promise(function (resolve) {
        kernel.inspect(replacedText, replacedText.length, function (_ref3) {
          var found = _ref3.found;
          var data = _ref3.data;

          if (!found || !data["text/plain"]) {
            resolve(null);
            return;
          }
          var description = (0, _anser.ansiToText)(data["text/plain"]);
          resolve({
            text: text,
            replacementPrefix: replacementPrefix,
            replacedText: replacedText,
            iconHTML: iconHTML,
            type: type,
            description: description
          });
        });
      });

      return Promise.race([promise, this.timeout()]);
    },

    timeout: function timeout() {
      return new Promise(function (resolve) {
        setTimeout(function () {
          resolve(null);
        }, 1000);
      });
    }
  };

  store.subscriptions.add(atom.config.observe("Hydrogen.autocomplete", function (v) {
    autocompleteProvider.enabled = v;
  }), atom.config.observe("Hydrogen.autocompleteSuggestionPriority", function (v) {
    autocompleteProvider.suggestionPriority = v;
  }), atom.config.observe("Hydrogen.showInspectorResultsInAutocomplete", function (v) {
    autocompleteProvider.suggestionDetailsEnabled = v;
  }));

  return autocompleteProvider;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9zZXJ2aWNlcy9wcm92aWRlZC9hdXRvY29tcGxldGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztzQkFFYyxRQUFROzs7O3FCQUNLLE9BQU87O3FCQUVNLGFBQWE7O0FBaUJyRCxJQUFNLFFBQVEsa0JBQWdCLFNBQVMscURBQWtELENBQUM7O0FBRTFGLElBQU0sT0FBTyxHQUFHOztBQUVkLEdBQUMsRUFBRSx1QkFBdUI7OztBQUcxQixRQUFNLEVBQUUsK0NBQStDOzs7QUFHdkQsS0FBRyxFQUFFLDRDQUE0QztDQUNsRCxDQUFDOztBQUVGLFNBQVMsZ0JBQWdCLENBQUMsT0FBc0IsRUFBRSxNQUFjLEVBQUU7TUFDeEQsT0FBTyxHQUFlLE9BQU8sQ0FBN0IsT0FBTztNQUFFLFFBQVEsR0FBSyxPQUFPLENBQXBCLFFBQVE7Ozs7QUFHekIsTUFBTSxZQUFZLEdBQUcsK0JBQW1CLE9BQU8sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDdEUsTUFBTSxVQUFVLEdBQUcsK0JBQW1CLE9BQU8sQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRWxFLE1BQUksUUFBUSxJQUFJLFFBQVEsQ0FBQywyQkFBMkIsRUFBRTtBQUNwRCxRQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsMkJBQTJCLENBQUM7QUFDbkQsUUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQ3JDLGFBQU8sb0JBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxVQUFDLEtBQUssRUFBSztBQUM3QixZQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDO0FBQ3hCLFlBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FB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YSxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsdUJBQXVCLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDbEQsd0JBQW9CLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztHQUNsQyxDQUFDLEVBQ0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMseUNBQXlDLEVBQUUsVUFBQyxDQUFDLEVBQUs7QUFDcEUsd0JBQW9CLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDO0dBQzdDLENBQUMsRUFDRixJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyw2Q0FBNkMsRUFBRSxVQUFDLENBQUMsRUFBSztBQUN4RSx3QkFBb0IsQ0FBQyx3QkFBd0IsR0FBRyxDQUFDLENBQUM7R0FDbkQsQ0FBQyxDQUNILENBQUM7O0FBRUYsU0FBTyxvQkFBb0IsQ0FBQztDQUM3QiIsImZpbGUiOiIvVXNlcnMvZGN4aW1hYy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvc2VydmljZXMvcHJvdmlkZWQvYXV0b2NvbXBsZXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogQGZsb3cgKi9cblxuaW1wb3J0IF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHsgYW5zaVRvVGV4dCB9IGZyb20gXCJhbnNlclwiO1xuXG5pbXBvcnQgeyBsb2csIGNoYXJfaWR4X3RvX2pzX2lkeCB9IGZyb20gXCIuLi8uLi91dGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBTdG9yZSB9IGZyb20gXCIuLi8uLi9zdG9yZVwiO1xuXG50eXBlIENvbXBsZXRlUmVwbHkgPSB7XG4gIG1hdGNoZXM6IEFycmF5PHN0cmluZz4sXG4gIGN1cnNvcl9zdGFydDogbnVtYmVyLFxuICBjdXJzb3JfZW5kOiBudW1iZXIsXG4gIG1ldGFkYXRhPzoge1xuICAgIF9qdXB5dGVyX3R5cGVzX2V4cGVyaW1lbnRhbD86IEFycmF5PHtcbiAgICAgIHN0YXJ0PzogbnVtYmVyLFxuICAgICAgZW5kPzogbnVtYmVyLFxuICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgdHlwZT86IHN0cmluZyxcbiAgICB9PixcbiAgfSxcbn07XG5cbmNvbnN0IGljb25IVE1MID0gYDxpbWcgc3JjPScke19fZGlybmFtZX0vLi4vLi4vLi4vc3RhdGljL2xvZ28uc3ZnJyBzdHlsZT0nd2lkdGg6IDEwMCU7Jz5gO1xuXG5jb25zdCByZWdleGVzID0ge1xuICAvLyBwcmV0dHkgZG9kZ3ksIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84Mzk2NjU4XG4gIHI6IC8oW15cXGRcXFddfFsuXSlbXFx3LiRdKiQvLFxuXG4gIC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcS81NDc0MDA4XG4gIHB5dGhvbjogLyhbXlxcZFxcV118W1xcdTAwQTAtXFx1RkZGRl0pW1xcdy5cXHUwMEEwLVxcdUZGRkZdKiQvLFxuXG4gIC8vIGFkYXB0ZWQgZnJvbSBodHRwOi8vcGhwLm5ldC9tYW51YWwvZW4vbGFuZ3VhZ2UudmFyaWFibGVzLmJhc2ljcy5waHBcbiAgcGhwOiAvWyRhLXpBLVpfXFx4N2YtXFx4ZmZdW2EtekEtWjAtOV9cXHg3Zi1cXHhmZl0qJC8sXG59O1xuXG5mdW5jdGlvbiBwYXJzZUNvbXBsZXRpb25zKHJlc3VsdHM6IENvbXBsZXRlUmVwbHksIHByZWZpeDogc3RyaW5nKSB7XG4gIGNvbnN0IHsgbWF0Y2hlcywgbWV0YWRhdGEgfSA9IHJlc3VsdHM7XG4gIC8vIEBOT1RFOiBUaGlzIGNhbiBtYWtlIGludmFsaWQgYHJlcGxhY2VkUHJlZml4YCBhbmQgYHJlcGxhY2VkVGV4dGAgd2hlbiBhIGxpbmUgaW5jbHVkZXMgdW5pY29kZSBjaGFyYWN0ZXJzXG4gIC8vIEBUT0RPIChAYXZpYXRlc2spOiBVc2UgYFJlZ2V4YCB0byBkZXRlY3QgdGhlbSByZWdhcmRsZXNzIG9mIHRoZSBgcmVzdWx0cy5jdXJzb3JfKmAgZmVlZGJhY2tzIGZyb20ga2VybmVsc1xuICBjb25zdCBjdXJzb3Jfc3RhcnQgPSBjaGFyX2lkeF90b19qc19pZHgocmVzdWx0cy5jdXJzb3Jfc3RhcnQsIHByZWZpeCk7XG4gIGNvbnN0IGN1cnNvcl9lbmQgPSBjaGFyX2lkeF90b19qc19pZHgocmVzdWx0cy5jdXJzb3JfZW5kLCBwcmVmaXgpO1xuXG4gIGlmIChtZXRhZGF0YSAmJiBtZXRhZGF0YS5fanVweXRlcl90eXBlc19leHBlcmltZW50YWwpIHtcbiAgICBjb25zdCBjb21wcyA9IG1ldGFkYXRhLl9qdXB5dGVyX3R5cGVzX2V4cGVyaW1lbnRhbDtcbiAgICBpZiAoY29tcHMubGVuZ3RoID4gMCAmJiBjb21wc1swXS50ZXh0KSB7XG4gICAgICByZXR1cm4gXy5tYXAoY29tcHMsIChtYXRjaCkgPT4ge1xuICAgICAgICBjb25zdCB0ZXh0ID0gbWF0Y2gudGV4dDtcbiAgICAgICAgY29uc3Qgc3RhcnQgPSBtYXRjaC5zdGFydCAmJiBtYXRjaC5lbmQgPyBtYXRjaC5zdGFydCA6IGN1cnNvcl9zdGFydDtcbiAgICAgICAgY29uc3QgZW5kID0gbWF0Y2guc3RhcnQgJiYgbWF0Y2guZW5kID8gbWF0Y2guZW5kIDogY3Vyc29yX2VuZDtcbiAgICAgICAgY29uc3QgcmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXguc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgICAgIGNvbnN0IHJlcGxhY2VkVGV4dCA9IHByZWZpeC5zbGljZSgwLCBzdGFydCkgKyB0ZXh0O1xuICAgICAgICBjb25zdCB0eXBlID0gbWF0Y2gudHlwZTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIHJlcGxhY2VtZW50UHJlZml4LFxuICAgICAgICAgIHJlcGxhY2VkVGV4dCxcbiAgICAgICAgICBpY29uSFRNTDogIXR5cGUgfHwgdHlwZSA9PT0gXCI8dW5rbm93bj5cIiA/IGljb25IVE1MIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHR5cGUsXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjb25zdCByZXBsYWNlbWVudFByZWZpeCA9IHByZWZpeC5zbGljZShjdXJzb3Jfc3RhcnQsIGN1cnNvcl9lbmQpO1xuXG4gIHJldHVybiBfLm1hcChtYXRjaGVzLCAobWF0Y2gpID0+IHtcbiAgICBjb25zdCB0ZXh0ID0gbWF0Y2g7XG4gICAgY29uc3QgcmVwbGFjZWRUZXh0ID0gcHJlZml4LnNsaWNlKDAsIGN1cnNvcl9zdGFydCkgKyB0ZXh0O1xuICAgIHJldHVybiB7XG4gICAgICB0ZXh0LFxuICAgICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICByZXBsYWNlZFRleHQsXG4gICAgICBpY29uSFRNTCxcbiAgICB9O1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVBdXRvY29tcGxldGVSZXN1bHRzKFxuICBzdG9yZTogU3RvcmVcbik6IGF0b20kQXV0b2NvbXBsZXRlUHJvdmlkZXIge1xuICBjb25zdCBhdXRvY29tcGxldGVQcm92aWRlciA9IHtcbiAgICBlbmFibGVkOiBhdG9tLmNvbmZpZy5nZXQoXCJIeWRyb2dlbi5hdXRvY29tcGxldGVcIiksXG5cbiAgICBzZWxlY3RvcjogXCIuc291cmNlXCIsXG4gICAgZGlzYWJsZUZvclNlbGVjdG9yOiBcIi5jb21tZW50XCIsXG5cbiAgICAvLyBUaGUgZGVmYXVsdCBwcm92aWRlciBoYXMgYW4gaW5jbHVzaW9uIHByaW9yaXR5IG9mIDAuXG4gICAgaW5jbHVzaW9uUHJpb3JpdHk6IDEsXG5cbiAgICAvLyBUaGUgZGVmYXVsdCBwcm92aWRlciBoYXMgYSBzdWdnZXN0aW9uIHByaW9yaXR5IG9mIDEuXG4gICAgc3VnZ2VzdGlvblByaW9yaXR5OiBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICBcIkh5ZHJvZ2VuLmF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25Qcmlvcml0eVwiXG4gICAgKSxcblxuICAgIC8vIEl0IHdvbid0IHN1cHByZXNzIHByb3ZpZGVycyB3aXRoIGxvd2VyIHByaW9yaXR5LlxuICAgIGV4Y2x1ZGVMb3dlclByaW9yaXR5OiBmYWxzZSxcblxuICAgIHN1Z2dlc3Rpb25EZXRhaWxzRW5hYmxlZDogYXRvbS5jb25maWcuZ2V0KFxuICAgICAgXCJIeWRyb2dlbi5zaG93SW5zcGVjdG9yUmVzdWx0c0luQXV0b2NvbXBsZXRlXCJcbiAgICApLFxuXG4gICAgLy8gUmVxdWlyZWQ6IFJldHVybiBhIHByb21pc2UsIGFuIGFycmF5IG9mIHN1Z2dlc3Rpb25zLCBvciBudWxsLlxuICAgIGdldFN1Z2dlc3Rpb25zKHsgZWRpdG9yLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4IH0pIHtcbiAgICAgIGlmICghdGhpcy5lbmFibGVkKSByZXR1cm4gbnVsbDtcblxuICAgICAgY29uc3Qga2VybmVsID0gc3RvcmUua2VybmVsO1xuICAgICAgaWYgKCFrZXJuZWwgfHwga2VybmVsLmV4ZWN1dGlvblN0YXRlICE9PSBcImlkbGVcIikgcmV0dXJuIG51bGw7XG5cbiAgICAgIGNvbnN0IGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1xuICAgICAgICBbYnVmZmVyUG9zaXRpb24ucm93LCAwXSxcbiAgICAgICAgYnVmZmVyUG9zaXRpb24sXG4gICAgICBdKTtcblxuICAgICAgY29uc3QgcmVnZXggPSByZWdleGVzW2tlcm5lbC5sYW5ndWFnZV07XG4gICAgICBpZiAocmVnZXgpIHtcbiAgICAgICAgcHJlZml4ID0gXy5oZWFkKGxpbmUubWF0Y2gocmVnZXgpKSB8fCBcIlwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJlZml4ID0gbGluZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmV0dXJuIGlmIGN1cnNvciBpcyBhdCB3aGl0ZXNwYWNlXG4gICAgICBpZiAocHJlZml4LnRyaW1SaWdodCgpLmxlbmd0aCA8IHByZWZpeC5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgICBsZXQgbWluaW11bVdvcmRMZW5ndGggPSBhdG9tLmNvbmZpZy5nZXQoXG4gICAgICAgIFwiYXV0b2NvbXBsZXRlLXBsdXMubWluaW11bVdvcmRMZW5ndGhcIlxuICAgICAgKTtcbiAgICAgIGlmICh0eXBlb2YgbWluaW11bVdvcmRMZW5ndGggIT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgbWluaW11bVdvcmRMZW5ndGggPSAzO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJlZml4LnRyaW0oKS5sZW5ndGggPCBtaW5pbXVtV29yZExlbmd0aCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGxvZyhcImF1dG9jb21wbGV0ZVByb3ZpZGVyOiByZXF1ZXN0OlwiLCBsaW5lLCBidWZmZXJQb3NpdGlvbiwgcHJlZml4KTtcblxuICAgICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgIGtlcm5lbC5jb21wbGV0ZShwcmVmaXgsIChyZXN1bHRzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUocGFyc2VDb21wbGV0aW9ucyhyZXN1bHRzLCBwcmVmaXgpKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbcHJvbWlzZSwgdGhpcy50aW1lb3V0KCldKTtcbiAgICB9LFxuXG4gICAgZ2V0U3VnZ2VzdGlvbkRldGFpbHNPblNlbGVjdCh7XG4gICAgICB0ZXh0LFxuICAgICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICByZXBsYWNlZFRleHQsXG4gICAgICBpY29uSFRNTCxcbiAgICAgIHR5cGUsXG4gICAgfSkge1xuICAgICAgaWYgKCF0aGlzLnN1Z2dlc3Rpb25EZXRhaWxzRW5hYmxlZCkgcmV0dXJuIG51bGw7XG5cbiAgICAgIGNvbnN0IGtlcm5lbCA9IHN0b3JlLmtlcm5lbDtcbiAgICAgIGlmICgha2VybmVsIHx8IGtlcm5lbC5leGVjdXRpb25TdGF0ZSAhPT0gXCJpZGxlXCIpIHJldHVybiBudWxsO1xuXG4gICAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAga2VybmVsLmluc3BlY3QocmVwbGFjZWRUZXh0LCByZXBsYWNlZFRleHQubGVuZ3RoLCAoeyBmb3VuZCwgZGF0YSB9KSA9PiB7XG4gICAgICAgICAgaWYgKCFmb3VuZCB8fCAhZGF0YVtcInRleHQvcGxhaW5cIl0pIHtcbiAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGRlc2NyaXB0aW9uID0gYW5zaVRvVGV4dChkYXRhW1widGV4dC9wbGFpblwiXSk7XG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgcmVwbGFjZW1lbnRQcmVmaXgsXG4gICAgICAgICAgICByZXBsYWNlZFRleHQsXG4gICAgICAgICAgICBpY29uSFRNTCxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbixcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbcHJvbWlzZSwgdGhpcy50aW1lb3V0KCldKTtcbiAgICB9LFxuXG4gICAgdGltZW91dCgpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG5cbiAgc3RvcmUuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIkh5ZHJvZ2VuLmF1dG9jb21wbGV0ZVwiLCAodikgPT4ge1xuICAgICAgYXV0b2NvbXBsZXRlUHJvdmlkZXIuZW5hYmxlZCA9IHY7XG4gICAgfSksXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZShcIkh5ZHJvZ2VuLmF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25Qcmlvcml0eVwiLCAodikgPT4ge1xuICAgICAgYXV0b2NvbXBsZXRlUHJvdmlkZXIuc3VnZ2VzdGlvblByaW9yaXR5ID0gdjtcbiAgICB9KSxcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKFwiSHlkcm9nZW4uc2hvd0luc3BlY3RvclJlc3VsdHNJbkF1dG9jb21wbGV0ZVwiLCAodikgPT4ge1xuICAgICAgYXV0b2NvbXBsZXRlUHJvdmlkZXIuc3VnZ2VzdGlvbkRldGFpbHNFbmFibGVkID0gdjtcbiAgICB9KVxuICApO1xuXG4gIHJldHVybiBhdXRvY29tcGxldGVQcm92aWRlcjtcbn1cbiJdfQ==