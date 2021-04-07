Object.defineProperty(exports, "__esModule", {
  value: true
});

var Config = {
  getJson: function getJson(key) {
    var _default = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var value = atom.config.get("Hydrogen." + key);
    if (!value || typeof value !== "string") return _default;
    try {
      return JSON.parse(value);
    } catch (error) {
      var message = "Your Hydrogen config is broken: " + key;
      atom.notifications.addError(message, { detail: error });
    }
    return _default;
  },

  schema: {
    autocomplete: {
      title: "Enable Autocomplete",
      includeTitle: false,
      description: "If enabled, use autocomplete options provided by the current kernel.",
      type: "boolean",
      "default": true,
      order: 0
    },
    autocompleteSuggestionPriority: {
      title: "Autocomple Suggestion Priority",
      description: "Specify the sort order of Hydrogen's autocomplete suggestions. Note the default providers like snippets have priority of `1`.",
      type: "integer",
      "default": 3,
      order: 1
    },
    showInspectorResultsInAutocomplete: {
      title: "Enable Autocomplete description (Experimental)",
      description: "If enabled, Hydrogen will try to show [the results from kernel inspection](https://nteract.gitbooks.io/hydrogen/docs/Usage/GettingStarted.html#hydrogen-toggle-inspector) in each autocomplete suggestion's description. ⚠ May slow down the autocompletion performance. (**Note**: Even if you disable this, you would still get autocomplete suggestions.)",
      type: "boolean",
      "default": false,
      order: 2
    },
    importNotebookURI: {
      title: "Enable Notebook Auto-import",
      description: "If enabled, opening a file with extension `.ipynb` will [import the notebook](https://nteract.gitbooks.io/hydrogen/docs/Usage/NotebookFiles.html#notebook-import) file's source into a new tab. If disabled, or if the Hydrogen package is not activated, the raw file will open in Atom as normal.",
      type: "boolean",
      "default": true,
      order: 3
    },
    importNotebookResults: {
      title: "Enable Import of Notebook Results",
      description: "If enabled, anytime you import a notebook, the saved results are also rendered inline. If disabled, you can still import notebooks as normal.",
      type: "boolean",
      "default": true,
      order: 4
    },
    statusBarDisable: {
      title: "Disable the Hydrogen status bar",
      description: "If enabled, no kernel information will be provided in Atom's status bar.",
      type: "boolean",
      "default": false,
      order: 5
    },
    statusBarKernelInfo: {
      title: "Detailed kernel information in the Hydrogen status bar",
      description: "If enabled, more detailed kernel information (execution count, execution time if available) will be shown in the Hydrogen status bar. This requires the above **Disable the Hydrogen status bar** setting to be `false` to work.",
      type: "boolean",
      "default": true,
      order: 6
    },
    debug: {
      title: "Enable Debug Messages",
      includeTitle: false,
      description: "If enabled, log debug messages onto the dev console.",
      type: "boolean",
      "default": false,
      order: 7
    },
    autoScroll: {
      title: "Enable Autoscroll",
      includeTitle: false,
      description: "If enabled, Hydrogen will automatically scroll to the bottom of the result view.",
      type: "boolean",
      "default": true,
      order: 8
    },
    centerOnMoveDown: {
      title: "Center on Move Down",
      includeTitle: true,
      description: "If enabled, running center-and-move-down will center the screen on the new line",
      type: "boolean",
      "default": false,
      order: 9
    },
    wrapOutput: {
      title: "Enable Soft Wrap for Output",
      includeTitle: false,
      description: "If enabled, your output code from Hydrogen will break long text and items.",
      type: "boolean",
      "default": false,
      order: 10
    },
    outputAreaDefault: {
      title: "View output in the dock by default",
      description: "If enabled, output will be displayed in the dock by default rather than inline",
      type: "boolean",
      "default": false,
      order: 11
    },
    outputAreaDock: {
      title: "Leave output dock open",
      description: "Do not close dock when switching to an editor without a running kernel",
      type: "boolean",
      "default": false,
      order: 12
    },
    outputAreaFontSize: {
      title: "Output area fontsize",
      includeTitle: false,
      description: "Change the fontsize of the Output area.",
      type: "integer",
      minimum: 0,
      "default": 0,
      order: 13
    },
    globalMode: {
      title: "Enable Global Kernel",
      description: "If enabled, all files of the same grammar will share a single global kernel (requires Atom restart)",
      type: "boolean",
      "default": false,
      order: 14
    },
    kernelNotifications: {
      title: "Enable Kernel Notifications",
      includeTitle: false,
      description: "Notify if kernels writes to stdout. By default, kernel notifications are only displayed in the developer console.",
      type: "boolean",
      "default": false,
      order: 15
    },
    startDir: {
      title: "Directory to start kernel in",
      includeTitle: false,
      description: "Restart the kernel for changes to take effect.",
      type: "string",
      "enum": [{
        value: "firstProjectDir",
        description: "The first started project's directory (default)"
      }, {
        value: "projectDirOfFile",
        description: "The project directory relative to the file"
      }, {
        value: "dirOfFile",
        description: "Current directory of the file"
      }],
      "default": "firstProjectDir",
      order: 16
    },
    languageMappings: {
      title: "Language Mappings",
      includeTitle: false,
      description: 'Custom Atom grammars and some kernels use non-standard language names. That leaves Hydrogen unable to figure out what kernel to start for your code. This field should be a valid JSON mapping from a kernel language name to Atom\'s grammar name ``` { "kernel name": "grammar name" } ```. For example ``` { "scala211": "scala", "javascript": "babel es6 javascript", "python": "magicpython" } ```.',
      type: "string",
      "default": '{ "python": "magicpython" }',
      order: 17
    },
    startupCode: {
      title: "Startup Code",
      includeTitle: false,
      description: 'This code will be executed on kernel startup. Format: `{"kernel": "your code \\nmore code"}`. Example: `{"Python 2": "%matplotlib inline"}`',
      type: "string",
      "default": "{}",
      order: 18
    },
    gateways: {
      title: "Kernel Gateways",
      includeTitle: false,
      description: 'Hydrogen can connect to remote notebook servers and kernel gateways. Each gateway needs at minimum a name and a value for options.baseUrl. The options are passed directly to the `jupyter-js-services` npm package, which includes documentation for additional fields. Example value: ``` [{ "name": "Remote notebook", "options": { "baseUrl": "http://mysite.com:8888" } }] ```',
      type: "string",
      "default": "[]",
      order: 19
    }
  }
};

exports["default"] = Config;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb25maWcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUVBLElBQU0sTUFBTSxHQUFHO0FBQ2IsU0FBTyxFQUFBLGlCQUFDLEdBQVcsRUFBeUI7UUFBdkIsUUFBZ0IseURBQUcsRUFBRTs7QUFDeEMsUUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWEsR0FBRyxDQUFHLENBQUM7QUFDakQsUUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUUsT0FBTyxRQUFRLENBQUM7QUFDekQsUUFBSTtBQUNGLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUMxQixDQUFDLE9BQU8sS0FBSyxFQUFFO0FBQ2QsVUFBTSxPQUFPLHdDQUFzQyxHQUFHLEFBQUUsQ0FBQztBQUN6RCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN6RDtBQUNELFdBQU8sUUFBUSxDQUFDO0dBQ2pCOztBQUVELFFBQU0sRUFBRTtBQUNOLGdCQUFZLEVBQUU7QUFDWixXQUFLLEVBQUUscUJBQXFCO0FBQzVCLGtCQUFZLEVBQUUsS0FBSztBQUNuQixpQkFBVyxFQUNULHNFQUFzRTtBQUN4RSxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLElBQUk7QUFDYixXQUFLLEVBQUUsQ0FBQztLQUNUO0FBQ0Qsa0NBQThCLEVBQUU7QUFDOUIsV0FBSyxFQUFFLGdDQUFnQztBQUN2QyxpQkFBVyxFQUNULCtIQUErSDtBQUNqSSxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLENBQUM7QUFDVixXQUFLLEVBQUUsQ0FBQztLQUNUO0FBQ0Qsc0NBQWtDLEVBQUU7QUFDbEMsV0FBSyxFQUFFLGdEQUFnRDtBQUN2RCxpQkFBVyxFQUNULDhWQUE4VjtB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b3VyY2VzQ29udGVudCI6WyIvKiBAZmxvdyAqL1xuXG5jb25zdCBDb25maWcgPSB7XG4gIGdldEpzb24oa2V5OiBzdHJpbmcsIF9kZWZhdWx0OiBPYmplY3QgPSB7fSkge1xuICAgIGNvbnN0IHZhbHVlID0gYXRvbS5jb25maWcuZ2V0KGBIeWRyb2dlbi4ke2tleX1gKTtcbiAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gXCJzdHJpbmdcIikgcmV0dXJuIF9kZWZhdWx0O1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSBgWW91ciBIeWRyb2dlbiBjb25maWcgaXMgYnJva2VuOiAke2tleX1gO1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKG1lc3NhZ2UsIHsgZGV0YWlsOiBlcnJvciB9KTtcbiAgICB9XG4gICAgcmV0dXJuIF9kZWZhdWx0O1xuICB9LFxuXG4gIHNjaGVtYToge1xuICAgIGF1dG9jb21wbGV0ZToge1xuICAgICAgdGl0bGU6IFwiRW5hYmxlIEF1dG9jb21wbGV0ZVwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIHVzZSBhdXRvY29tcGxldGUgb3B0aW9ucyBwcm92aWRlZCBieSB0aGUgY3VycmVudCBrZXJuZWwuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBvcmRlcjogMCxcbiAgICB9LFxuICAgIGF1dG9jb21wbGV0ZVN1Z2dlc3Rpb25Qcmlvcml0eToge1xuICAgICAgdGl0bGU6IFwiQXV0b2NvbXBsZSBTdWdnZXN0aW9uIFByaW9yaXR5XCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJTcGVjaWZ5IHRoZSBzb3J0IG9yZGVyIG9mIEh5ZHJvZ2VuJ3MgYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zLiBOb3RlIHRoZSBkZWZhdWx0IHByb3ZpZGVycyBsaWtlIHNuaXBwZXRzIGhhdmUgcHJpb3JpdHkgb2YgYDFgLlwiLFxuICAgICAgdHlwZTogXCJpbnRlZ2VyXCIsXG4gICAgICBkZWZhdWx0OiAzLFxuICAgICAgb3JkZXI6IDEsXG4gICAgfSxcbiAgICBzaG93SW5zcGVjdG9yUmVzdWx0c0luQXV0b2NvbXBsZXRlOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgQXV0b2NvbXBsZXRlIGRlc2NyaXB0aW9uIChFeHBlcmltZW50YWwpXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJJZiBlbmFibGVkLCBIeWRyb2dlbiB3aWxsIHRyeSB0byBzaG93IFt0aGUgcmVzdWx0cyBmcm9tIGtlcm5lbCBpbnNwZWN0aW9uXShodHRwczovL250ZXJhY3QuZ2l0Ym9va3MuaW8vaHlkcm9nZW4vZG9jcy9Vc2FnZS9HZXR0aW5nU3RhcnRlZC5odG1sI2h5ZHJvZ2VuLXRvZ2dsZS1pbnNwZWN0b3IpIGluIGVhY2ggYXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb24ncyBkZXNjcmlwdGlvbi4g4pqgIE1heSBzbG93IGRvd24gdGhlIGF1dG9jb21wbGV0aW9uIHBlcmZvcm1hbmNlLiAoKipOb3RlKio6IEV2ZW4gaWYgeW91IGRpc2FibGUgdGhpcywgeW91IHdvdWxkIHN0aWxsIGdldCBhdXRvY29tcGxldGUgc3VnZ2VzdGlvbnMuKVwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiAyLFxuICAgIH0sXG4gICAgaW1wb3J0Tm90ZWJvb2tVUkk6IHtcbiAgICAgIHRpdGxlOiBcIkVuYWJsZSBOb3RlYm9vayBBdXRvLWltcG9ydFwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiSWYgZW5hYmxlZCwgb3BlbmluZyBhIGZpbGUgd2l0aCBleHRlbnNpb24gYC5pcHluYmAgd2lsbCBbaW1wb3J0IHRoZSBub3RlYm9va10oaHR0cHM6Ly9udGVyYWN0LmdpdGJvb2tzLmlvL2h5ZHJvZ2VuL2RvY3MvVXNhZ2UvTm90ZWJvb2tGaWxlcy5odG1sI25vdGVib29rLWltcG9ydCkgZmlsZSdzIHNvdXJjZSBpbnRvIGEgbmV3IHRhYi4gSWYgZGlzYWJsZWQsIG9yIGlmIHRoZSBIeWRyb2dlbiBwYWNrYWdlIGlzIG5vdCBhY3RpdmF0ZWQsIHRoZSByYXcgZmlsZSB3aWxsIG9wZW4gaW4gQXRvbSBhcyBub3JtYWwuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBvcmRlcjogMyxcbiAgICB9LFxuICAgIGltcG9ydE5vdGVib29rUmVzdWx0czoge1xuICAgICAgdGl0bGU6IFwiRW5hYmxlIEltcG9ydCBvZiBOb3RlYm9vayBSZXN1bHRzXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJJZiBlbmFibGVkLCBhbnl0aW1lIHlvdSBpbXBvcnQgYSBub3RlYm9vaywgdGhlIHNhdmVkIHJlc3VsdHMgYXJlIGFsc28gcmVuZGVyZWQgaW5saW5lLiBJZiBkaXNhYmxlZCwgeW91IGNhbiBzdGlsbCBpbXBvcnQgbm90ZWJvb2tzIGFzIG5vcm1hbC5cIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIG9yZGVyOiA0LFxuICAgIH0sXG4gICAgc3RhdHVzQmFyRGlzYWJsZToge1xuICAgICAgdGl0bGU6IFwiRGlzYWJsZSB0aGUgSHlkcm9nZW4gc3RhdHVzIGJhclwiLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiSWYgZW5hYmxlZCwgbm8ga2VybmVsIGluZm9ybWF0aW9uIHdpbGwgYmUgcHJvdmlkZWQgaW4gQXRvbSdzIHN0YXR1cyBiYXIuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgb3JkZXI6IDUsXG4gICAgfSxcbiAgICBzdGF0dXNCYXJLZXJuZWxJbmZvOiB7XG4gICAgICB0aXRsZTogXCJEZXRhaWxlZCBrZXJuZWwgaW5mb3JtYXRpb24gaW4gdGhlIEh5ZHJvZ2VuIHN0YXR1cyBiYXJcIixcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIG1vcmUgZGV0YWlsZWQga2VybmVsIGluZm9ybWF0aW9uIChleGVjdXRpb24gY291bnQsIGV4ZWN1dGlvbiB0aW1lIGlmIGF2YWlsYWJsZSkgd2lsbCBiZSBzaG93biBpbiB0aGUgSHlkcm9nZW4gc3RhdHVzIGJhci4gVGhpcyByZXF1aXJlcyB0aGUgYWJvdmUgKipEaXNhYmxlIHRoZSBIeWRyb2dlbiBzdGF0dXMgYmFyKiogc2V0dGluZyB0byBiZSBgZmFsc2VgIHRvIHdvcmsuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBvcmRlcjogNixcbiAgICB9LFxuICAgIGRlYnVnOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgRGVidWcgTWVzc2FnZXNcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogXCJJZiBlbmFibGVkLCBsb2cgZGVidWcgbWVzc2FnZXMgb250byB0aGUgZGV2IGNvbnNvbGUuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgb3JkZXI6IDcsXG4gICAgfSxcbiAgICBhdXRvU2Nyb2xsOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgQXV0b3Njcm9sbFwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIEh5ZHJvZ2VuIHdpbGwgYXV0b21hdGljYWxseSBzY3JvbGwgdG8gdGhlIGJvdHRvbSBvZiB0aGUgcmVzdWx0IHZpZXcuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBvcmRlcjogOCxcbiAgICB9LFxuICAgIGNlbnRlck9uTW92ZURvd246IHtcbiAgICAgIHRpdGxlOiBcIkNlbnRlciBvbiBNb3ZlIERvd25cIixcbiAgICAgIGluY2x1ZGVUaXRsZTogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIHJ1bm5pbmcgY2VudGVyLWFuZC1tb3ZlLWRvd24gd2lsbCBjZW50ZXIgdGhlIHNjcmVlbiBvbiB0aGUgbmV3IGxpbmVcIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogOSxcbiAgICB9LFxuICAgIHdyYXBPdXRwdXQ6IHtcbiAgICAgIHRpdGxlOiBcIkVuYWJsZSBTb2Z0IFdyYXAgZm9yIE91dHB1dFwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIHlvdXIgb3V0cHV0IGNvZGUgZnJvbSBIeWRyb2dlbiB3aWxsIGJyZWFrIGxvbmcgdGV4dCBhbmQgaXRlbXMuXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgb3JkZXI6IDEwLFxuICAgIH0sXG4gICAgb3V0cHV0QXJlYURlZmF1bHQ6IHtcbiAgICAgIHRpdGxlOiBcIlZpZXcgb3V0cHV0IGluIHRoZSBkb2NrIGJ5IGRlZmF1bHRcIixcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICBcIklmIGVuYWJsZWQsIG91dHB1dCB3aWxsIGJlIGRpc3BsYXllZCBpbiB0aGUgZG9jayBieSBkZWZhdWx0IHJhdGhlciB0aGFuIGlubGluZVwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiAxMSxcbiAgICB9LFxuICAgIG91dHB1dEFyZWFEb2NrOiB7XG4gICAgICB0aXRsZTogXCJMZWF2ZSBvdXRwdXQgZG9jayBvcGVuXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJEbyBub3QgY2xvc2UgZG9jayB3aGVuIHN3aXRjaGluZyB0byBhbiBlZGl0b3Igd2l0aG91dCBhIHJ1bm5pbmcga2VybmVsXCIsXG4gICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgb3JkZXI6IDEyLFxuICAgIH0sXG4gICAgb3V0cHV0QXJlYUZvbnRTaXplOiB7XG4gICAgICB0aXRsZTogXCJPdXRwdXQgYXJlYSBmb250c2l6ZVwiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkNoYW5nZSB0aGUgZm9udHNpemUgb2YgdGhlIE91dHB1dCBhcmVhLlwiLFxuICAgICAgdHlwZTogXCJpbnRlZ2VyXCIsXG4gICAgICBtaW5pbXVtOiAwLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICAgIG9yZGVyOiAxMyxcbiAgICB9LFxuICAgIGdsb2JhbE1vZGU6IHtcbiAgICAgIHRpdGxlOiBcIkVuYWJsZSBHbG9iYWwgS2VybmVsXCIsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJJZiBlbmFibGVkLCBhbGwgZmlsZXMgb2YgdGhlIHNhbWUgZ3JhbW1hciB3aWxsIHNoYXJlIGEgc2luZ2xlIGdsb2JhbCBrZXJuZWwgKHJlcXVpcmVzIEF0b20gcmVzdGFydClcIixcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBvcmRlcjogMTQsXG4gICAgfSxcbiAgICBrZXJuZWxOb3RpZmljYXRpb25zOiB7XG4gICAgICB0aXRsZTogXCJFbmFibGUgS2VybmVsIE5vdGlmaWNhdGlvbnNcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgXCJOb3RpZnkgaWYga2VybmVscyB3cml0ZXMgdG8gc3Rkb3V0LiBCeSBkZWZhdWx0LCBrZXJuZWwgbm90aWZpY2F0aW9ucyBhcmUgb25seSBkaXNwbGF5ZWQgaW4gdGhlIGRldmVsb3BlciBjb25zb2xlLlwiLFxuICAgICAgdHlwZTogXCJib29sZWFuXCIsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiAxNSxcbiAgICB9LFxuICAgIHN0YXJ0RGlyOiB7XG4gICAgICB0aXRsZTogXCJEaXJlY3RvcnkgdG8gc3RhcnQga2VybmVsIGluXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246IFwiUmVzdGFydCB0aGUga2VybmVsIGZvciBjaGFuZ2VzIHRvIHRha2UgZWZmZWN0LlwiLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGVudW06IFtcbiAgICAgICAge1xuICAgICAgICAgIHZhbHVlOiBcImZpcnN0UHJvamVjdERpclwiLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBmaXJzdCBzdGFydGVkIHByb2plY3QncyBkaXJlY3RvcnkgKGRlZmF1bHQpXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogXCJwcm9qZWN0RGlyT2ZGaWxlXCIsXG4gICAgICAgICAgZGVzY3JpcHRpb246IFwiVGhlIHByb2plY3QgZGlyZWN0b3J5IHJlbGF0aXZlIHRvIHRoZSBmaWxlXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB2YWx1ZTogXCJkaXJPZkZpbGVcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJDdXJyZW50IGRpcmVjdG9yeSBvZiB0aGUgZmlsZVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGRlZmF1bHQ6IFwiZmlyc3RQcm9qZWN0RGlyXCIsXG4gICAgICBvcmRlcjogMTYsXG4gICAgfSxcbiAgICBsYW5ndWFnZU1hcHBpbmdzOiB7XG4gICAgICB0aXRsZTogXCJMYW5ndWFnZSBNYXBwaW5nc1wiLFxuICAgICAgaW5jbHVkZVRpdGxlOiBmYWxzZSxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnQ3VzdG9tIEF0b20gZ3JhbW1hcnMgYW5kIHNvbWUga2VybmVscyB1c2Ugbm9uLXN0YW5kYXJkIGxhbmd1YWdlIG5hbWVzLiBUaGF0IGxlYXZlcyBIeWRyb2dlbiB1bmFibGUgdG8gZmlndXJlIG91dCB3aGF0IGtlcm5lbCB0byBzdGFydCBmb3IgeW91ciBjb2RlLiBUaGlzIGZpZWxkIHNob3VsZCBiZSBhIHZhbGlkIEpTT04gbWFwcGluZyBmcm9tIGEga2VybmVsIGxhbmd1YWdlIG5hbWUgdG8gQXRvbVxcJ3MgZ3JhbW1hciBuYW1lIGBgYCB7IFwia2VybmVsIG5hbWVcIjogXCJncmFtbWFyIG5hbWVcIiB9IGBgYC4gRm9yIGV4YW1wbGUgYGBgIHsgXCJzY2FsYTIxMVwiOiBcInNjYWxhXCIsIFwiamF2YXNjcmlwdFwiOiBcImJhYmVsIGVzNiBqYXZhc2NyaXB0XCIsIFwicHl0aG9uXCI6IFwibWFnaWNweXRob25cIiB9IGBgYC4nLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6ICd7IFwicHl0aG9uXCI6IFwibWFnaWNweXRob25cIiB9JyxcbiAgICAgIG9yZGVyOiAxNyxcbiAgICB9LFxuICAgIHN0YXJ0dXBDb2RlOiB7XG4gICAgICB0aXRsZTogXCJTdGFydHVwIENvZGVcIixcbiAgICAgIGluY2x1ZGVUaXRsZTogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1RoaXMgY29kZSB3aWxsIGJlIGV4ZWN1dGVkIG9uIGtlcm5lbCBzdGFydHVwLiBGb3JtYXQ6IGB7XCJrZXJuZWxcIjogXCJ5b3VyIGNvZGUgXFxcXG5tb3JlIGNvZGVcIn1gLiBFeGFtcGxlOiBge1wiUHl0aG9uIDJcIjogXCIlbWF0cGxvdGxpYiBpbmxpbmVcIn1gJyxcbiAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OiBcInt9XCIsXG4gICAgICBvcmRlcjogMTgsXG4gICAgfSxcbiAgICBnYXRld2F5czoge1xuICAgICAgdGl0bGU6IFwiS2VybmVsIEdhdGV3YXlzXCIsXG4gICAgICBpbmNsdWRlVGl0bGU6IGZhbHNlLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdIeWRyb2dlbiBjYW4gY29ubmVjdCB0byByZW1vdGUgbm90ZWJvb2sgc2VydmVycyBhbmQga2VybmVsIGdhdGV3YXlzLiBFYWNoIGdhdGV3YXkgbmVlZHMgYXQgbWluaW11bSBhIG5hbWUgYW5kIGEgdmFsdWUgZm9yIG9wdGlvbnMuYmFzZVVybC4gVGhlIG9wdGlvbnMgYXJlIHBhc3NlZCBkaXJlY3RseSB0byB0aGUgYGp1cHl0ZXItanMtc2VydmljZXNgIG5wbSBwYWNrYWdlLCB3aGljaCBpbmNsdWRlcyBkb2N1bWVudGF0aW9uIGZvciBhZGRpdGlvbmFsIGZpZWxkcy4gRXhhbXBsZSB2YWx1ZTogYGBgIFt7IFwibmFtZVwiOiBcIlJlbW90ZSBub3RlYm9va1wiLCBcIm9wdGlvbnNcIjogeyBcImJhc2VVcmxcIjogXCJodHRwOi8vbXlzaXRlLmNvbTo4ODg4XCIgfSB9XSBgYGAnLFxuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgIGRlZmF1bHQ6IFwiW11cIixcbiAgICAgIG9yZGVyOiAxOSxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGRlZmF1bHQgQ29uZmlnO1xuIl19