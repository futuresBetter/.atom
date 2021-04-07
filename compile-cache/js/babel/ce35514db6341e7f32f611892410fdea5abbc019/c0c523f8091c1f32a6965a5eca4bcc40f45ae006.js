Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

'use babel';

exports['default'] = {
  config: {
    expandedWidth: {
      title: 'Focused Pane Width',
      description: 'Sets the Percentage between 0 and 100 of how much the focused pane will grow',
      type: 'integer',
      'default': 94,
      minimum: 1,
      maximum: 100
    },
    focusDelay: {
      title: 'Delay (in Follow Mode)',
      description: "If you're in follow mode, this delay (in ms) will be applied before the focused pane will grow",
      type: 'integer',
      'default': 0,
      minimum: 0
    },
    followLocations: {
      title: 'Follow Mode Locations',
      description: 'Specifies the locations within follow mode will be available',
      type: 'object',
      collapsed: true,
      properties: {
        center: {
          title: 'Workspace Center',
          type: 'boolean',
          'default': true
        },
        left: {
          title: 'Left Dock',
          type: 'boolean',
          'default': true
        },
        bottom: {
          title: 'Bottom Dock',
          type: 'boolean',
          'default': true
        },
        right: {
          title: 'Right Dock',
          type: 'boolean',
          'default': true
        }
      }
    },
    followModeByDefault: {
      title: 'Activate Follow Mode on start',
      description: 'Follow Mode will be enabled when you start Atom (restart required)',
      type: 'boolean',
      'default': false
    }
  },

  subscriptions: null,
  FollowObserver: null,
  modifiedPanes: [],
  incompatiblePlugins: [],
  isFocused: false,

  activate: function activate(state) {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();

    this.subscriptions.add(atom.packages.onDidActivatePackage(this.checkIncompatibility.bind(this)));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'hey-pane:toggle-focus-of-active-pane': function heyPaneToggleFocusOfActivePane() {
        return _this.toggleFocus();
      },
      'hey-pane:toggle-follow-mode': function heyPaneToggleFollowMode() {
        return _this.toggleFollow();
      }
    }));

    if (atom.config.get('hey-pane.followModeByDefault')) {
      this.toggleFollow();
    }
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
    this.FollowObserver != null && this.FollowObserver.dispose();
  },

  toggleFollow: function toggleFollow() {
    var _this2 = this;

    if (this.FollowObserver != null) {
      this.FollowObserver.dispose();
      this.FollowObserver = null;
      return;
    }

    var targets = atom.config.get('hey-pane.followLocations');
    var targetLocations = [targets.center && 'center', targets.left && 'left', targets.bottom && 'bottom', targets.right && 'right'].filter(Boolean);

    this.FollowObserver = atom.workspace.onDidStopChangingActivePaneItem(function (item) {
      var pane = atom.workspace.paneContainerForItem(item);

      if (!pane) return;
      if (!targetLocations.includes(pane.getLocation())) return;

      _this2.startFollow();
    });
  },

  startFollow: function startFollow() {
    var _this3 = this;

    var delay = atom.config.get('hey-pane.focusDelay');

    // Only use setTimeout if the delay is bigger than 0.
    // I'm not quite sure if this is necessary, but waiting for the next tick
    // COULD MAYBE change behavior for existing users, so
    // ... better safe than sorry.
    if (delay > 0) {
      clearTimeout(this.focusTimeout);
      this.focusTimeout = setTimeout(function () {
        _this3.undoFocus();
        _this3.doFocus();
      }, delay);
    } else {
      this.undoFocus();
      this.doFocus();
    }
  },

  toggleFocus: function toggleFocus() {
    if (this.isFocused) this.undoFocus();else this.doFocus();
  },

  doFocus: function doFocus() {
    var _this4 = this;

    this.isFocused = true;
    var activePane = atom.workspace.getActivePane();

    // For custom styling possibilities.
    // Check if element is available for API < 1.17.
    activePane.element && activePane.element.classList.add('hey-pane-focus');

    var expandedWidth = atom.config.get('hey-pane.expandedWidth') / 100;
    var collapsedWidth = 1 - expandedWidth;
    var paneRoot = atom.workspace.getCenter().paneContainer.getRoot();

    // Recursive set expanded-/collapsedWidth on Panes or PaneAxes.
    // PaneAxes are nested into each other. There is a single parent axis.
    // We go from a pane all the way down until we're at the parent axis.
    var resursiveSet = function resursiveSet(pane) {
      // Only do something, if the pane is a child of an axis.
      // A pane has no axis, if there are no split windows.
      if (pane.getParent().constructor.name === 'PaneAxis') {
        // Expand the pane...
        _this4.savePaneState(pane).setFlexScale(expandedWidth);

        // ...and collapse all its siblings.
        pane.getParent().children.filter(function (el) {
          return el !== pane;
        }) // bcuz only siblings
        .forEach(function (sibling) {
          _this4.savePaneState(sibling).setFlexScale(collapsedWidth);
        });

        // Do the same with the adjacent panes, until we're on the root axis.
        if (pane.getParent() !== paneRoot) {
          resursiveSet(pane.getParent());
        }
      }
    };

    // shoot da lazr
    resursiveSet(activePane);
  },

  undoFocus: function undoFocus() {
    this.isFocused = false;
    this.restorePanes();
    this.emptyPaneStates();
  },

  // Saves the pane and its flexScale for later restoring.
  // IDs would be nicer, but I couldn't find a way to search a pane or axis by
  // its ID.
  // Note: `pane` can be an instanceof Pane or PaneAxis.
  //   I treat them basically as the same.
  savePaneState: function savePaneState(pane) {
    this.modifiedPanes.push({ pane: pane, flexScale: pane.flexScale });
    return pane;
  },

  restorePanes: function restorePanes() {
    this.modifiedPanes.forEach(function (_ref) {
      var pane = _ref.pane;
      var flexScale = _ref.flexScale;

      if (!pane.isAlive()) return; // pane is dead: loop continue
      pane.element && pane.element.classList.remove('hey-pane-focus');
      pane.setFlexScale(flexScale);
    });
  },

  emptyPaneStates: function emptyPaneStates() {
    this.modifiedPanes = [];
  },

  checkIncompatibility: function checkIncompatibility(plugin) {
    if (this.incompatiblePlugins.includes(plugin.name)) {
      atom.notifications.addError('Incompatible Package Detected', {
        dismissable: true,
        detail: 'hey-pane does not work when package "' + plugin.name + '" is activated.'
      });
    }
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL2hleS1wYW5lL2xpYi9oZXktcGFuZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVvQyxNQUFNOztBQUYxQyxXQUFXLENBQUE7O3FCQUlJO0FBQ2IsUUFBTSxFQUFFO0FBQ04saUJBQWEsRUFBRTtBQUNiLFdBQUssRUFBRSxvQkFBb0I7QUFDM0IsaUJBQVcsRUFDVCw4RUFBOEU7QUFDaEYsVUFBSSxFQUFFLFNBQVM7QUFDZixpQkFBUyxFQUFFO0FBQ1gsYUFBTyxFQUFFLENBQUM7QUFDVixhQUFPLEVBQUUsR0FBRztLQUNiO0FBQ0QsY0FBVSxFQUFFO0FBQ1YsV0FBSyxFQUFFLHdCQUF3QjtBQUMvQixpQkFBVyxFQUNULGdHQUFnRztBQUNsRyxVQUFJLEVBQUUsU0FBUztBQUNmLGlCQUFTLENBQUM7QUFDVixhQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0QsbUJBQWUsRUFBRTtBQUNmLFdBQUssRUFBRSx1QkFBdUI7QUFDOUIsaUJBQVcsRUFDVCw4REFBOEQ7QUFDaEUsVUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLEVBQUUsSUFBSTtBQUNmLGdCQUFVLEVBQUU7QUFDVixjQUFNLEVBQUU7QUFDTixlQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLGNBQUksRUFBRSxTQUFTO0FBQ2YscUJBQVMsSUFBSTtTQUNkO0FBQ0QsWUFBSSxFQUFFO0FBQ0osZUFBSyxFQUFFLFdBQVc7QUFDbEIsY0FBSSxFQUFFLFNBQVM7QUFDZixxQkFBUyxJQUFJO1NBQ2Q7QUFDRCxjQUFNLEVBQUU7QUFDTixlQUFLLEVBQUUsYUFBYTtBQUNwQixjQUFJLEVBQUUsU0FBUztBQUNmLHFCQUFTLElBQUk7U0FDZDtBQUNELGFBQUssRUFBRTtBQUNMLGVBQUssRUFBRSxZQUFZO0FBQ25CLGNBQUksRUFBRSxTQUFTO0FBQ2YscUJBQVMsSUFBSTtTQUNkO09BQ0Y7S0FDRjtBQUNELHVCQUFtQixFQUFFO0FBQ25CLFdBQUssRUFBRSwr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RSxDQUFBO0dBQ3hCOztBQUVELHNCQUFvQixFQUFBLDhCQUFDLE1BQU0sRUFBRTtBQUMzQixRQUFJLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ2xELFVBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLCtCQUErQixFQUFFO0FBQzNELG1CQUFXLEVBQUUsSUFBSTtBQUNqQixjQUFNLDRDQUNKLE1BQU0sQ0FBQyxJQUFJLG9CQUNJO09BQ2xCLENBQUMsQ0FBQTtLQUNIO0dBQ0Y7Q0FDRiIsImZpbGUiOiIvVXNlcnMvZGN4aW1hYy8uYXRvbS9wYWNrYWdlcy9oZXktcGFuZS9saWIvaGV5LXBhbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJ1xuXG5pbXBvcnQgeyBDb21wb3NpdGVEaXNwb3NhYmxlIH0gZnJvbSAnYXRvbSdcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjb25maWc6IHtcbiAgICBleHBhbmRlZFdpZHRoOiB7XG4gICAgICB0aXRsZTogJ0ZvY3VzZWQgUGFuZSBXaWR0aCcsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1NldHMgdGhlIFBlcmNlbnRhZ2UgYmV0d2VlbiAwIGFuZCAxMDAgb2YgaG93IG11Y2ggdGhlIGZvY3VzZWQgcGFuZSB3aWxsIGdyb3cnLFxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogOTQsXG4gICAgICBtaW5pbXVtOiAxLFxuICAgICAgbWF4aW11bTogMTAwXG4gICAgfSxcbiAgICBmb2N1c0RlbGF5OiB7XG4gICAgICB0aXRsZTogJ0RlbGF5IChpbiBGb2xsb3cgTW9kZSknLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiSWYgeW91J3JlIGluIGZvbGxvdyBtb2RlLCB0aGlzIGRlbGF5IChpbiBtcykgd2lsbCBiZSBhcHBsaWVkIGJlZm9yZSB0aGUgZm9jdXNlZCBwYW5lIHdpbGwgZ3Jvd1wiLFxuICAgICAgdHlwZTogJ2ludGVnZXInLFxuICAgICAgZGVmYXVsdDogMCxcbiAgICAgIG1pbmltdW06IDBcbiAgICB9LFxuICAgIGZvbGxvd0xvY2F0aW9uczoge1xuICAgICAgdGl0bGU6ICdGb2xsb3cgTW9kZSBMb2NhdGlvbnMnLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdTcGVjaWZpZXMgdGhlIGxvY2F0aW9ucyB3aXRoaW4gZm9sbG93IG1vZGUgd2lsbCBiZSBhdmFpbGFibGUnLFxuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGNlbnRlcjoge1xuICAgICAgICAgIHRpdGxlOiAnV29ya3NwYWNlIENlbnRlcicsXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgbGVmdDoge1xuICAgICAgICAgIHRpdGxlOiAnTGVmdCBEb2NrJyxcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBib3R0b206IHtcbiAgICAgICAgICB0aXRsZTogJ0JvdHRvbSBEb2NrJyxcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICByaWdodDoge1xuICAgICAgICAgIHRpdGxlOiAnUmlnaHQgRG9jaycsXG4gICAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgZm9sbG93TW9kZUJ5RGVmYXVsdDoge1xuICAgICAgdGl0bGU6ICdBY3RpdmF0ZSBGb2xsb3cgTW9kZSBvbiBzdGFydCcsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ0ZvbGxvdyBNb2RlIHdpbGwgYmUgZW5hYmxlZCB3aGVuIHlvdSBzdGFydCBBdG9tIChyZXN0YXJ0IHJlcXVpcmVkKScsXG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIH1cbiAgfSxcblxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuICBGb2xsb3dPYnNlcnZlcjogbnVsbCxcbiAgbW9kaWZpZWRQYW5lczogW10sXG4gIGluY29tcGF0aWJsZVBsdWdpbnM6IFtdLFxuICBpc0ZvY3VzZWQ6IGZhbHNlLFxuXG4gIGFjdGl2YXRlKHN0YXRlKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZVBhY2thZ2UodGhpcy5jaGVja0luY29tcGF0aWJpbGl0eS5iaW5kKHRoaXMpKVxuICAgIClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdoZXktcGFuZTp0b2dnbGUtZm9jdXMtb2YtYWN0aXZlLXBhbmUnOiAoKSA9PiB0aGlzLnRvZ2dsZUZvY3VzKCksXG4gICAgICAgICdoZXktcGFuZTp0b2dnbGUtZm9sbG93LW1vZGUnOiAoKSA9PiB0aGlzLnRvZ2dsZUZvbGxvdygpXG4gICAgICB9KVxuICAgIClcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2hleS1wYW5lLmZvbGxvd01vZGVCeURlZmF1bHQnKSkge1xuICAgICAgdGhpcy50b2dnbGVGb2xsb3coKVxuICAgIH1cbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICB0aGlzLkZvbGxvd09ic2VydmVyICE9IG51bGwgJiYgdGhpcy5Gb2xsb3dPYnNlcnZlci5kaXNwb3NlKClcbiAgfSxcblxuICB0b2dnbGVGb2xsb3coKSB7XG4gICAgaWYgKHRoaXMuRm9sbG93T2JzZXJ2ZXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5Gb2xsb3dPYnNlcnZlci5kaXNwb3NlKClcbiAgICAgIHRoaXMuRm9sbG93T2JzZXJ2ZXIgPSBudWxsXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCB0YXJnZXRzID0gYXRvbS5jb25maWcuZ2V0KCdoZXktcGFuZS5mb2xsb3dMb2NhdGlvbnMnKVxuICAgIGNvbnN0IHRhcmdldExvY2F0aW9ucyA9IFtcbiAgICAgIHRhcmdldHMuY2VudGVyICYmICdjZW50ZXInLFxuICAgICAgdGFyZ2V0cy5sZWZ0ICYmICdsZWZ0JyxcbiAgICAgIHRhcmdldHMuYm90dG9tICYmICdib3R0b20nLFxuICAgICAgdGFyZ2V0cy5yaWdodCAmJiAncmlnaHQnXG4gICAgXS5maWx0ZXIoQm9vbGVhbilcblxuICAgIHRoaXMuRm9sbG93T2JzZXJ2ZXIgPSBhdG9tLndvcmtzcGFjZS5vbkRpZFN0b3BDaGFuZ2luZ0FjdGl2ZVBhbmVJdGVtKFxuICAgICAgaXRlbSA9PiB7XG4gICAgICAgIGNvbnN0IHBhbmUgPSBhdG9tLndvcmtzcGFjZS5wYW5lQ29udGFpbmVyRm9ySXRlbShpdGVtKVxuXG4gICAgICAgIGlmICghcGFuZSkgcmV0dXJuXG4gICAgICAgIGlmICghdGFyZ2V0TG9jYXRpb25zLmluY2x1ZGVzKHBhbmUuZ2V0TG9jYXRpb24oKSkpIHJldHVyblxuXG4gICAgICAgIHRoaXMuc3RhcnRGb2xsb3coKVxuICAgICAgfVxuICAgIClcbiAgfSxcblxuICBzdGFydEZvbGxvdygpIHtcbiAgICBjb25zdCBkZWxheSA9IGF0b20uY29uZmlnLmdldCgnaGV5LXBhbmUuZm9jdXNEZWxheScpXG5cbiAgICAvLyBPbmx5IHVzZSBzZXRUaW1lb3V0IGlmIHRoZSBkZWxheSBpcyBiaWdnZXIgdGhhbiAwLlxuICAgIC8vIEknbSBub3QgcXVpdGUgc3VyZSBpZiB0aGlzIGlzIG5lY2Vzc2FyeSwgYnV0IHdhaXRpbmcgZm9yIHRoZSBuZXh0IHRpY2tcbiAgICAvLyBDT1VMRCBNQVlCRSBjaGFuZ2UgYmVoYXZpb3IgZm9yIGV4aXN0aW5nIHVzZXJzLCBzb1xuICAgIC8vIC4uLiBiZXR0ZXIgc2FmZSB0aGFuIHNvcnJ5LlxuICAgIGlmIChkZWxheSA+IDApIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLmZvY3VzVGltZW91dClcbiAgICAgIHRoaXMuZm9jdXNUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMudW5kb0ZvY3VzKClcbiAgICAgICAgdGhpcy5kb0ZvY3VzKClcbiAgICAgIH0sIGRlbGF5KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVuZG9Gb2N1cygpXG4gICAgICB0aGlzLmRvRm9jdXMoKVxuICAgIH1cbiAgfSxcblxuICB0b2dnbGVGb2N1cygpIHtcbiAgICBpZiAodGhpcy5pc0ZvY3VzZWQpIHRoaXMudW5kb0ZvY3VzKClcbiAgICBlbHNlIHRoaXMuZG9Gb2N1cygpXG4gIH0sXG5cbiAgZG9Gb2N1cygpIHtcbiAgICB0aGlzLmlzRm9jdXNlZCA9IHRydWVcbiAgICBjb25zdCBhY3RpdmVQYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpXG5cbiAgICAvLyBGb3IgY3VzdG9tIHN0eWxpbmcgcG9zc2liaWxpdGllcy5cbiAgICAvLyBDaGVjayBpZiBlbGVtZW50IGlzIGF2YWlsYWJsZSBmb3IgQVBJIDwgMS4xNy5cbiAgICBhY3RpdmVQYW5lLmVsZW1lbnQgJiYgYWN0aXZlUGFuZS5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2hleS1wYW5lLWZvY3VzJylcblxuICAgIGNvbnN0IGV4cGFuZGVkV2lkdGggPSBhdG9tLmNvbmZpZy5nZXQoJ2hleS1wYW5lLmV4cGFuZGVkV2lkdGgnKSAvIDEwMFxuICAgIGNvbnN0IGNvbGxhcHNlZFdpZHRoID0gMSAtIGV4cGFuZGVkV2lkdGhcbiAgICBjb25zdCBwYW5lUm9vdCA9IGF0b20ud29ya3NwYWNlLmdldENlbnRlcigpLnBhbmVDb250YWluZXIuZ2V0Um9vdCgpXG5cbiAgICAvLyBSZWN1cnNpdmUgc2V0IGV4cGFuZGVkLS9jb2xsYXBzZWRXaWR0aCBvbiBQYW5lcyBvciBQYW5lQXhlcy5cbiAgICAvLyBQYW5lQXhlcyBhcmUgbmVzdGVkIGludG8gZWFjaCBvdGhlci4gVGhlcmUgaXMgYSBzaW5nbGUgcGFyZW50IGF4aXMuXG4gICAgLy8gV2UgZ28gZnJvbSBhIHBhbmUgYWxsIHRoZSB3YXkgZG93biB1bnRpbCB3ZSdyZSBhdCB0aGUgcGFyZW50IGF4aXMuXG4gICAgY29uc3QgcmVzdXJzaXZlU2V0ID0gcGFuZSA9PiB7XG4gICAgICAvLyBPbmx5IGRvIHNvbWV0aGluZywgaWYgdGhlIHBhbmUgaXMgYSBjaGlsZCBvZiBhbiBheGlzLlxuICAgICAgLy8gQSBwYW5lIGhhcyBubyBheGlzLCBpZiB0aGVyZSBhcmUgbm8gc3BsaXQgd2luZG93cy5cbiAgICAgIGlmIChwYW5lLmdldFBhcmVudCgpLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdQYW5lQXhpcycpIHtcbiAgICAgICAgLy8gRXhwYW5kIHRoZSBwYW5lLi4uXG4gICAgICAgIHRoaXMuc2F2ZVBhbmVTdGF0ZShwYW5lKS5zZXRGbGV4U2NhbGUoZXhwYW5kZWRXaWR0aClcblxuICAgICAgICAvLyAuLi5hbmQgY29sbGFwc2UgYWxsIGl0cyBzaWJsaW5ncy5cbiAgICAgICAgcGFuZVxuICAgICAgICAgIC5nZXRQYXJlbnQoKVxuICAgICAgICAgIC5jaGlsZHJlbi5maWx0ZXIoZWwgPT4gZWwgIT09IHBhbmUpIC8vIGJjdXogb25seSBzaWJsaW5nc1xuICAgICAgICAgIC5mb3JFYWNoKHNpYmxpbmcgPT4ge1xuICAgICAgICAgICAgdGhpcy5zYXZlUGFuZVN0YXRlKHNpYmxpbmcpLnNldEZsZXhTY2FsZShjb2xsYXBzZWRXaWR0aClcbiAgICAgICAgICB9KVxuXG4gICAgICAgIC8vIERvIHRoZSBzYW1lIHdpdGggdGhlIGFkamFjZW50IHBhbmVzLCB1bnRpbCB3ZSdyZSBvbiB0aGUgcm9vdCBheGlzLlxuICAgICAgICBpZiAocGFuZS5nZXRQYXJlbnQoKSAhPT0gcGFuZVJvb3QpIHtcbiAgICAgICAgICByZXN1cnNpdmVTZXQocGFuZS5nZXRQYXJlbnQoKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHNob290IGRhIGxhenJcbiAgICByZXN1cnNpdmVTZXQoYWN0aXZlUGFuZSlcbiAgfSxcblxuICB1bmRvRm9jdXMoKSB7XG4gICAgdGhpcy5pc0ZvY3VzZWQgPSBmYWxzZVxuICAgIHRoaXMucmVzdG9yZVBhbmVzKClcbiAgICB0aGlzLmVtcHR5UGFuZVN0YXRlcygpXG4gIH0sXG5cbiAgLy8gU2F2ZXMgdGhlIHBhbmUgYW5kIGl0cyBmbGV4U2NhbGUgZm9yIGxhdGVyIHJlc3RvcmluZy5cbiAgLy8gSURzIHdvdWxkIGJlIG5pY2VyLCBidXQgSSBjb3VsZG4ndCBmaW5kIGEgd2F5IHRvIHNlYXJjaCBhIHBhbmUgb3IgYXhpcyBieVxuICAvLyBpdHMgSUQuXG4gIC8vIE5vdGU6IGBwYW5lYCBjYW4gYmUgYW4gaW5zdGFuY2VvZiBQYW5lIG9yIFBhbmVBeGlzLlxuICAvLyAgIEkgdHJlYXQgdGhlbSBiYXNpY2FsbHkgYXMgdGhlIHNhbWUuXG4gIHNhdmVQYW5lU3RhdGUocGFuZSkge1xuICAgIHRoaXMubW9kaWZpZWRQYW5lcy5wdXNoKHsgcGFuZSwgZmxleFNjYWxlOiBwYW5lLmZsZXhTY2FsZSB9KVxuICAgIHJldHVybiBwYW5lXG4gIH0sXG5cbiAgcmVzdG9yZVBhbmVzKCkge1xuICAgIHRoaXMubW9kaWZpZWRQYW5lcy5mb3JFYWNoKCh7IHBhbmUsIGZsZXhTY2FsZSB9KSA9PiB7XG4gICAgICBpZiAoIXBhbmUuaXNBbGl2ZSgpKSByZXR1cm4gLy8gcGFuZSBpcyBkZWFkOiBsb29wIGNvbnRpbnVlXG4gICAgICBwYW5lLmVsZW1lbnQgJiYgcGFuZS5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2hleS1wYW5lLWZvY3VzJylcbiAgICAgIHBhbmUuc2V0RmxleFNjYWxlKGZsZXhTY2FsZSlcbiAgICB9KVxuICB9LFxuXG4gIGVtcHR5UGFuZVN0YXRlcygpIHtcbiAgICB0aGlzLm1vZGlmaWVkUGFuZXMgPSBbXVxuICB9LFxuXG4gIGNoZWNrSW5jb21wYXRpYmlsaXR5KHBsdWdpbikge1xuICAgIGlmICh0aGlzLmluY29tcGF0aWJsZVBsdWdpbnMuaW5jbHVkZXMocGx1Z2luLm5hbWUpKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ0luY29tcGF0aWJsZSBQYWNrYWdlIERldGVjdGVkJywge1xuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZSxcbiAgICAgICAgZGV0YWlsOiBgaGV5LXBhbmUgZG9lcyBub3Qgd29yayB3aGVuIHBhY2thZ2UgXCIke1xuICAgICAgICAgIHBsdWdpbi5uYW1lXG4gICAgICAgIH1cIiBpcyBhY3RpdmF0ZWQuYFxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cbiJdfQ==