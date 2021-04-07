Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Adapted from https://github.com/nteract/nteract/blob/master/packages/transform-plotly/src/index.tsx
 * Copyright (c) 2016 - present, nteract contributors
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @NOTE: This `PlotlyTransform` component could be used exactly same as the original `PlotlyTransform` component of @nteract/transform-plotly,
 *        except that this file adds the ability to download a plot from an electron context.
 */

var _lodash = require("lodash");

var _react = require("react");

var React = _interopRequireWildcard(_react);

var PlotlyTransform = (function (_React$Component) {
  _inherits(PlotlyTransform, _React$Component);

  _createClass(PlotlyTransform, null, [{
    key: "defaultProps",
    value: {
      data: "",
      mediaType: "application/vnd.plotly.v1+json"
    },
    enumerable: true
  }]);

  function PlotlyTransform(props) {
    var _this = this;

    _classCallCheck(this, PlotlyTransform);

    _get(Object.getPrototypeOf(PlotlyTransform.prototype), "constructor", this).call(this, props);

    this.plotDivRef = function (plotDiv) {
      _this.plotDiv = plotDiv;
    };

    this.getFigure = function () {
      var figure = _this.props.data;
      if (typeof figure === "string") {
        return JSON.parse(figure);
      }

      // The Plotly API *mutates* the figure to include a UID, which means
      // they won't take our frozen objects
      if (Object.isFrozen(figure)) {
        return (0, _lodash.cloneDeep)(figure);
      }

      var _figure$data = figure.data;
      var data = _figure$data === undefined ? {} : _figure$data;
      var _figure$layout = figure.layout;
      var layout = _figure$layout === undefined ? {} : _figure$layout;

      return { data: data, layout: layout };
    };

    this.downloadImage = function (gd) {
      _this.Plotly.toImage(gd).then(function (dataUrl) {
        var electron = require("electron");
        electron.remote.getCurrentWebContents().downloadURL(dataUrl);
      });
    };

    this.downloadImage = this.downloadImage.bind(this);
  }

  _createClass(PlotlyTransform, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      // Handle case of either string to be `JSON.parse`d or pure object
      var figure = this.getFigure();
      this.Plotly = require("@nteract/plotly");
      this.Plotly.newPlot(this.plotDiv, figure.data, figure.layout, {
        modeBarButtonsToRemove: ["toImage"],
        modeBarButtonsToAdd: [{
          name: "Download plot as a png",
          icon: this.Plotly.Icons.camera,
          click: this.downloadImage
        }]
      });
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps) {
      return this.props.data !== nextProps.data;
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      var figure = this.getFigure();
      if (!this.plotDiv) {
        return;
      }
      var plotDiv = this.plotDiv;
      plotDiv.data = figure.data;
      plotDiv.layout = figure.layout;
      this.Plotly.redraw(plotDiv);
    }
  }, {
    key: "render",
    value: function render() {
      var _getFigure = this.getFigure();

      var layout = _getFigure.layout;

      var style = {};
      if (layout && layout.height && !layout.autosize) {
        style.height = layout.height;
      }
      return React.createElement("div", { ref: this.plotDivRef, style: style });
    }
  }]);

  return PlotlyTransform;
})(React.Component);

exports.PlotlyTransform = PlotlyTransform;
exports["default"] = PlotlyTransform;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3Bsb3RseS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFhMEIsUUFBUTs7cUJBQ1gsT0FBTzs7SUFBbEIsS0FBSzs7SUEwQkosZUFBZTtZQUFmLGVBQWU7O2VBQWYsZUFBZTs7V0FDSjtBQUNwQixVQUFJLEVBQUUsRUFBRTtBQUNSLGVBQVMsRUFBRSxnQ0FBZ0M7S0FDNUM7Ozs7QUFhVSxXQWpCQSxlQUFlLENBaUJkLEtBQVksRUFBRTs7OzBCQWpCZixlQUFlOztBQWtCeEIsK0JBbEJTLGVBQWUsNkNBa0JsQixLQUFLLEVBQUU7O1NBbUNmLFVBQVUsR0FBRyxVQUFDLE9BQU8sRUFBa0M7QUFDckQsWUFBSyxPQUFPLEdBQUcsT0FBTyxDQUFDO0tBQ3hCOztTQUVELFNBQVMsR0FBRyxZQUFjO0FBQ3hCLFVBQU0sTUFBTSxHQUFHLE1BQUssS0FBSyxDQUFDLElBQUksQ0FBQztBQUMvQixVQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtBQUM5QixlQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7T0FDM0I7Ozs7QUFJRCxVQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7QUFDM0IsZUFBTyx1QkFBVSxNQUFNLENBQUMsQ0FBQztPQUMxQjs7eUJBRWtDLE1BQU0sQ0FBakMsSUFBSTtVQUFKLElBQUksZ0NBQUcsRUFBRTsyQkFBa0IsTUFBTSxDQUF0QixNQUFNO1VBQU4sTUFBTSxrQ0FBRyxFQUFFOztBQUU5QixhQUFPLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFFLENBQUM7S0FDekI7O1NBRUQsYUFBYSxHQUFHLFVBQUMsRUFBRSxFQUFVO0FBQzNCLFlBQUssTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxPQUFPLEVBQUU7QUFDOUMsWUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3JDLGdCQUFRLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQzlELENBQUMsQ0FBQztLQUNKOztBQTVEQyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ3BEOztlQXBCVSxlQUFlOztXQXNCVCw2QkFBUzs7QUFFeEIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2hDLFVBQUksQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDekMsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDNUQsOEJBQXNCLEVBQUUsQ0FBQyxTQUFTLENBQUM7QUFDbkMsMkJBQW1CLEVBQUUsQ0FDbkI7QUFDRSxjQUFJLEVBQUUsd0JBQXdCO0FBQzlCLGNBQUksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNO0FBQzlCLGVBQUssRUFBRSxJQUFJLENBQUMsYUFBYTtTQUMxQixDQUNGO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVvQiwrQkFBQyxTQUFnQixFQUFXO0FBQy9DLGFBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQztLQUMzQzs7O1dBRWlCLDhCQUFHO0FBQ25CLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztBQUNoQyxVQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNqQixlQUFPO09BQ1I7QUFDRCxVQUFNLE9BQTBCLEdBQUksSUFBSSxDQUFDLE9BQU8sQUFBTSxDQUFDO0FBQ3ZELGFBQU8sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztBQUMzQixhQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDL0IsVUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDN0I7OztXQThCSyxrQkFBRzt1QkFDWSxJQUFJLENBQUMsU0FBUyxFQUFFOztVQUEzQixNQUFNLGNBQU4sTUFBTTs7QUFDZCxVQUFNLEtBQWEsR0FBRyxFQUFFLENBQUM7QUFDekIsVUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUU7QUFDL0MsYUFBSyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO09BQzlCO0FBQ0QsYUFBTyw2QkFBSyxHQUFHLEVBQUUsSUFBSSxDQUFDLFVBQVUsQUFBQyxFQUFDLEtBQUssRUFBRSxLQUFLLEFBQUMsR0FBRyxDQUFDO0tBQ3BEOzs7U0F4RlUsZUFBZTtHQUFTLEtBQUssQ0FBQyxTQUFTOzs7cUJBMkZyQyxlQUFlIiwiZmlsZSI6Ii9Vc2Vycy9kY3hpbWFjLy5hdG9tL3BhY2thZ2VzL0h5ZHJvZ2VuL2xpYi9jb21wb25lbnRzL3Jlc3VsdC12aWV3L3Bsb3RseS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qIEBmbG93ICovXG4vKipcbiAqIEFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vbnRlcmFjdC9udGVyYWN0L2Jsb2IvbWFzdGVyL3BhY2thZ2VzL3RyYW5zZm9ybS1wbG90bHkvc3JjL2luZGV4LnRzeFxuICogQ29weXJpZ2h0IChjKSAyMDE2IC0gcHJlc2VudCwgbnRlcmFjdCBjb250cmlidXRvcnNcbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqXG4gKiBATk9URTogVGhpcyBgUGxvdGx5VHJhbnNmb3JtYCBjb21wb25lbnQgY291bGQgYmUgdXNlZCBleGFjdGx5IHNhbWUgYXMgdGhlIG9yaWdpbmFsIGBQbG90bHlUcmFuc2Zvcm1gIGNvbXBvbmVudCBvZiBAbnRlcmFjdC90cmFuc2Zvcm0tcGxvdGx5LFxuICogICAgICAgIGV4Y2VwdCB0aGF0IHRoaXMgZmlsZSBhZGRzIHRoZSBhYmlsaXR5IHRvIGRvd25sb2FkIGEgcGxvdCBmcm9tIGFuIGVsZWN0cm9uIGNvbnRleHQuXG4gKi9cblxuaW1wb3J0IHsgY2xvbmVEZWVwIH0gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5cbmludGVyZmFjZSBQcm9wcyB7XG4gIGRhdGE6IHN0cmluZyB8IE9iamVjdDtcbiAgbWVkaWFUeXBlOiBcImFwcGxpY2F0aW9uL3ZuZC5wbG90bHkudjEranNvblwiO1xufVxuXG50eXBlIE9iamVjdFR5cGUgPSBPYmplY3Q7XG5cbmludGVyZmFjZSBGaWd1cmVMYXlvdXQgZXh0ZW5kcyBPYmplY3RUeXBlIHtcbiAgaGVpZ2h0Pzogc3RyaW5nO1xuICBhdXRvc2l6ZT86IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBGaWd1cmUgZXh0ZW5kcyBPYmplY3RUeXBlIHtcbiAgZGF0YTogT2JqZWN0O1xuICBsYXlvdXQ6IEZpZ3VyZUxheW91dDtcbn1cblxuZGVjbGFyZSBjbGFzcyBQbG90bHlIVE1MRWxlbWVudCBleHRlbmRzIEhUTUxEaXZFbGVtZW50IHtcbiAgZGF0YTogT2JqZWN0O1xuICBsYXlvdXQ6IE9iamVjdDtcbiAgbmV3UGxvdDogKCkgPT4gdm9pZDtcbiAgcmVkcmF3OiAoKSA9PiB2b2lkO1xufVxuXG5leHBvcnQgY2xhc3MgUGxvdGx5VHJhbnNmb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50PFByb3BzPiB7XG4gIHN0YXRpYyBkZWZhdWx0UHJvcHMgPSB7XG4gICAgZGF0YTogXCJcIixcbiAgICBtZWRpYVR5cGU6IFwiYXBwbGljYXRpb24vdm5kLnBsb3RseS52MStqc29uXCIsXG4gIH07XG5cbiAgcGxvdERpdjogSFRNTERpdkVsZW1lbnQgfCBudWxsO1xuICBQbG90bHk6IHtcbiAgICBuZXdQbG90OiAoXG4gICAgICBkaXY6IEhUTUxEaXZFbGVtZW50IHwgbnVsbCB8IHZvaWQsXG4gICAgICBkYXRhOiBPYmplY3QsXG4gICAgICBsYXlvdXQ6IEZpZ3VyZUxheW91dFxuICAgICkgPT4gdm9pZCxcbiAgICByZWRyYXc6IChkaXY/OiBQbG90bHlIVE1MRWxlbWVudCkgPT4gdm9pZCxcbiAgICB0b0ltYWdlOiAoZ2Q6IGFueSkgPT4gUHJvbWlzZTxzdHJpbmc+LFxuICB9O1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLmRvd25sb2FkSW1hZ2UgPSB0aGlzLmRvd25sb2FkSW1hZ2UuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCk6IHZvaWQge1xuICAgIC8vIEhhbmRsZSBjYXNlIG9mIGVpdGhlciBzdHJpbmcgdG8gYmUgYEpTT04ucGFyc2VgZCBvciBwdXJlIG9iamVjdFxuICAgIGNvbnN0IGZpZ3VyZSA9IHRoaXMuZ2V0RmlndXJlKCk7XG4gICAgdGhpcy5QbG90bHkgPSByZXF1aXJlKFwiQG50ZXJhY3QvcGxvdGx5XCIpO1xuICAgIHRoaXMuUGxvdGx5Lm5ld1Bsb3QodGhpcy5wbG90RGl2LCBmaWd1cmUuZGF0YSwgZmlndXJlLmxheW91dCwge1xuICAgICAgbW9kZUJhckJ1dHRvbnNUb1JlbW92ZTogW1widG9JbWFnZVwiXSxcbiAgICAgIG1vZGVCYXJCdXR0b25zVG9BZGQ6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IFwiRG93bmxvYWQgcGxvdCBhcyBhIHBuZ1wiLFxuICAgICAgICAgIGljb246IHRoaXMuUGxvdGx5Lkljb25zLmNhbWVyYSxcbiAgICAgICAgICBjbGljazogdGhpcy5kb3dubG9hZEltYWdlLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgfVxuXG4gIHNob3VsZENvbXBvbmVudFVwZGF0ZShuZXh0UHJvcHM6IFByb3BzKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucHJvcHMuZGF0YSAhPT0gbmV4dFByb3BzLmRhdGE7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgY29uc3QgZmlndXJlID0gdGhpcy5nZXRGaWd1cmUoKTtcbiAgICBpZiAoIXRoaXMucGxvdERpdikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwbG90RGl2OiBQbG90bHlIVE1MRWxlbWVudCA9ICh0aGlzLnBsb3REaXY6IGFueSk7XG4gICAgcGxvdERpdi5kYXRhID0gZmlndXJlLmRhdGE7XG4gICAgcGxvdERpdi5sYXlvdXQgPSBmaWd1cmUubGF5b3V0O1xuICAgIHRoaXMuUGxvdGx5LnJlZHJhdyhwbG90RGl2KTtcbiAgfVxuXG4gIHBsb3REaXZSZWYgPSAocGxvdERpdjogSFRNTERpdkVsZW1lbnQgfCBudWxsKTogdm9pZCA9PiB7XG4gICAgdGhpcy5wbG90RGl2ID0gcGxvdERpdjtcbiAgfTtcblxuICBnZXRGaWd1cmUgPSAoKTogRmlndXJlID0+IHtcbiAgICBjb25zdCBmaWd1cmUgPSB0aGlzLnByb3BzLmRhdGE7XG4gICAgaWYgKHR5cGVvZiBmaWd1cmUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKGZpZ3VyZSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIFBsb3RseSBBUEkgKm11dGF0ZXMqIHRoZSBmaWd1cmUgdG8gaW5jbHVkZSBhIFVJRCwgd2hpY2ggbWVhbnNcbiAgICAvLyB0aGV5IHdvbid0IHRha2Ugb3VyIGZyb3plbiBvYmplY3RzXG4gICAgaWYgKE9iamVjdC5pc0Zyb3plbihmaWd1cmUpKSB7XG4gICAgICByZXR1cm4gY2xvbmVEZWVwKGZpZ3VyZSk7XG4gICAgfVxuXG4gICAgY29uc3QgeyBkYXRhID0ge30sIGxheW91dCA9IHt9IH0gPSBmaWd1cmU7XG5cbiAgICByZXR1cm4geyBkYXRhLCBsYXlvdXQgfTtcbiAgfTtcblxuICBkb3dubG9hZEltYWdlID0gKGdkOiBhbnkpID0+IHtcbiAgICB0aGlzLlBsb3RseS50b0ltYWdlKGdkKS50aGVuKGZ1bmN0aW9uIChkYXRhVXJsKSB7XG4gICAgICBjb25zdCBlbGVjdHJvbiA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKTtcbiAgICAgIGVsZWN0cm9uLnJlbW90ZS5nZXRDdXJyZW50V2ViQ29udGVudHMoKS5kb3dubG9hZFVSTChkYXRhVXJsKTtcbiAgICB9KTtcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBsYXlvdXQgfSA9IHRoaXMuZ2V0RmlndXJlKCk7XG4gICAgY29uc3Qgc3R5bGU6IE9iamVjdCA9IHt9O1xuICAgIGlmIChsYXlvdXQgJiYgbGF5b3V0LmhlaWdodCAmJiAhbGF5b3V0LmF1dG9zaXplKSB7XG4gICAgICBzdHlsZS5oZWlnaHQgPSBsYXlvdXQuaGVpZ2h0O1xuICAgIH1cbiAgICByZXR1cm4gPGRpdiByZWY9e3RoaXMucGxvdERpdlJlZn0gc3R5bGU9e3N0eWxlfSAvPjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbG90bHlUcmFuc2Zvcm07XG4iXX0=