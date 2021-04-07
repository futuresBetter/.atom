Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _atom = require("atom");

var InputView = (function () {
  function InputView(_ref, onConfirmed) {
    var _this = this;

    var prompt = _ref.prompt;
    var defaultText = _ref.defaultText;
    var allowCancel = _ref.allowCancel;
    var password = _ref.password;

    _classCallCheck(this, InputView);

    this.onConfirmed = onConfirmed;

    this.element = document.createElement("div");
    this.element.classList.add("hydrogen", "input-view");
    if (password) this.element.classList.add("password");

    var label = document.createElement("div");
    label.classList.add("label", "icon", "icon-arrow-right");
    label.textContent = prompt || "Kernel requires input";

    this.miniEditor = new _atom.TextEditor({ mini: true });
    if (defaultText) this.miniEditor.setText(defaultText);

    this.element.appendChild(label);
    this.element.appendChild(this.miniEditor.element);

    if (allowCancel) {
      atom.commands.add(this.element, {
        "core:confirm": function coreConfirm() {
          return _this.confirm();
        },
        "core:cancel": function coreCancel() {
          return _this.close();
        }
      });
      this.miniEditor.element.addEventListener("blur", function () {
        if (document.hasFocus()) _this.close();
      });
    } else {
      atom.commands.add(this.element, {
        "core:confirm": function coreConfirm() {
          return _this.confirm();
        }
      });
    }
  }

  _createClass(InputView, [{
    key: "confirm",
    value: function confirm() {
      var text = this.miniEditor.getText();
      if (this.onConfirmed) this.onConfirmed(text);
      this.close();
    }
  }, {
    key: "close",
    value: function close() {
      if (this.panel) this.panel.destroy();
      this.panel = null;
      this.element.remove();
      if (this.previouslyFocusedElement) this.previouslyFocusedElement.focus();
    }
  }, {
    key: "attach",
    value: function attach() {
      this.previouslyFocusedElement = document.activeElement;
      this.panel = atom.workspace.addModalPanel({ item: this.element });
      this.miniEditor.element.focus();
      this.miniEditor.scrollToCursorPosition();
    }
  }]);

  return InputView;
})();

exports["default"] = InputView;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9pbnB1dC12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUUyQixNQUFNOztJQVVaLFNBQVM7QUFNakIsV0FOUSxTQUFTLENBTzFCLElBQW9ELEVBQ3BELFdBQWUsRUFDZjs7O1FBRkUsTUFBTSxHQUFSLElBQW9ELENBQWxELE1BQU07UUFBRSxXQUFXLEdBQXJCLElBQW9ELENBQTFDLFdBQVc7UUFBRSxXQUFXLEdBQWxDLElBQW9ELENBQTdCLFdBQVc7UUFBRSxRQUFRLEdBQTVDLElBQW9ELENBQWhCLFFBQVE7OzBCQVAzQixTQUFTOztBQVUxQixRQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQzs7QUFFL0IsUUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzdDLFFBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDckQsUUFBSSxRQUFRLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDOztBQUVyRCxRQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLFNBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUN6RCxTQUFLLENBQUMsV0FBVyxHQUFHLE1BQU0sSUFBSSx1QkFBdUIsQ0FBQzs7QUFFdEQsUUFBSSxDQUFDLFVBQVUsR0FBRyxxQkFBZSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2pELFFBQUksV0FBVyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUV0RCxRQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNoQyxRQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVsRCxRQUFJLFdBQVcsRUFBRTtBQUNmLFVBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7QUFDOUIsc0JBQWMsRUFBRTtpQkFBTSxNQUFLLE9BQU8sRUFBRTtTQUFBO0FBQ3BDLHFCQUFhLEVBQUU7aUJBQU0sTUFBSyxLQUFLLEVBQUU7U0FBQTtPQUNsQyxDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsWUFBTTtBQUNyRCxZQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFLLEtBQUssRUFBRSxDQUFDO09BQ3ZDLENBQUMsQ0FBQztLQUNKLE1BQU07QUFDTCxVQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQzlCLHNCQUFjLEVBQUU7aUJBQU0sTUFBSyxPQUFPLEVBQUU7U0FBQTtPQUNyQyxDQUFDLENBQUM7S0FDSjtHQUNGOztlQXZDa0IsU0FBUzs7V0F5Q3JCLG1CQUFHO0FBQ1IsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QyxVQUFJLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3QyxVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDZDs7O1dBRUksaUJBQUc7QUFDTixVQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQyxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixVQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3RCLFVBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUMxRTs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLENBQUMsd0JBQXdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztBQUN2RCxVQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQ2xFLFVBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxVQUFVLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztLQUMxQzs7O1NBM0RrQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiIvVXNlcnMvZGN4aW1hYy8uYXRvbS9wYWNrYWdlcy9IeWRyb2dlbi9saWIvaW5wdXQtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG5cbmltcG9ydCB7IFRleHRFZGl0b3IgfSBmcm9tIFwiYXRvbVwiO1xuXG50eXBlIG9wdHMgPSB7XG4gIHByb21wdDogc3RyaW5nLFxuICBkZWZhdWx0VGV4dD86IHN0cmluZyxcbiAgYWxsb3dDYW5jZWw/OiBib29sZWFuLFxuICBwYXNzd29yZD86IGJvb2xlYW4sXG59O1xudHlwZSBjYiA9IChzOiBzdHJpbmcpID0+IHZvaWQ7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0VmlldyB7XG4gIG9uQ29uZmlybWVkOiBjYjtcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIG1pbmlFZGl0b3I6IGF0b20kVGV4dEVkaXRvcjtcbiAgcGFuZWw6ID9hdG9tJFBhbmVsO1xuICBwcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQ6ID9IVE1MRWxlbWVudDtcbiAgY29uc3RydWN0b3IoXG4gICAgeyBwcm9tcHQsIGRlZmF1bHRUZXh0LCBhbGxvd0NhbmNlbCwgcGFzc3dvcmQgfTogb3B0cyxcbiAgICBvbkNvbmZpcm1lZDogY2JcbiAgKSB7XG4gICAgdGhpcy5vbkNvbmZpcm1lZCA9IG9uQ29uZmlybWVkO1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChcImh5ZHJvZ2VuXCIsIFwiaW5wdXQtdmlld1wiKTtcbiAgICBpZiAocGFzc3dvcmQpIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwicGFzc3dvcmRcIik7XG5cbiAgICBjb25zdCBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbGFiZWwuY2xhc3NMaXN0LmFkZChcImxhYmVsXCIsIFwiaWNvblwiLCBcImljb24tYXJyb3ctcmlnaHRcIik7XG4gICAgbGFiZWwudGV4dENvbnRlbnQgPSBwcm9tcHQgfHwgXCJLZXJuZWwgcmVxdWlyZXMgaW5wdXRcIjtcblxuICAgIHRoaXMubWluaUVkaXRvciA9IG5ldyBUZXh0RWRpdG9yKHsgbWluaTogdHJ1ZSB9KTtcbiAgICBpZiAoZGVmYXVsdFRleHQpIHRoaXMubWluaUVkaXRvci5zZXRUZXh0KGRlZmF1bHRUZXh0KTtcblxuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMubWluaUVkaXRvci5lbGVtZW50KTtcblxuICAgIGlmIChhbGxvd0NhbmNlbCkge1xuICAgICAgYXRvbS5jb21tYW5kcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgIFwiY29yZTpjb25maXJtXCI6ICgpID0+IHRoaXMuY29uZmlybSgpLFxuICAgICAgICBcImNvcmU6Y2FuY2VsXCI6ICgpID0+IHRoaXMuY2xvc2UoKSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5taW5pRWRpdG9yLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImJsdXJcIiwgKCkgPT4ge1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGFzRm9jdXMoKSkgdGhpcy5jbG9zZSgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCwge1xuICAgICAgICBcImNvcmU6Y29uZmlybVwiOiAoKSA9PiB0aGlzLmNvbmZpcm0oKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpcm0oKSB7XG4gICAgY29uc3QgdGV4dCA9IHRoaXMubWluaUVkaXRvci5nZXRUZXh0KCk7XG4gICAgaWYgKHRoaXMub25Db25maXJtZWQpIHRoaXMub25Db25maXJtZWQodGV4dCk7XG4gICAgdGhpcy5jbG9zZSgpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgaWYgKHRoaXMucGFuZWwpIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMucGFuZWwgPSBudWxsO1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKTtcbiAgICBpZiAodGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQpIHRoaXMucHJldmlvdXNseUZvY3VzZWRFbGVtZW50LmZvY3VzKCk7XG4gIH1cblxuICBhdHRhY2goKSB7XG4gICAgdGhpcy5wcmV2aW91c2x5Rm9jdXNlZEVsZW1lbnQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAgIHRoaXMucGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKHsgaXRlbTogdGhpcy5lbGVtZW50IH0pO1xuICAgIHRoaXMubWluaUVkaXRvci5lbGVtZW50LmZvY3VzKCk7XG4gICAgdGhpcy5taW5pRWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oKTtcbiAgfVxufVxuIl19