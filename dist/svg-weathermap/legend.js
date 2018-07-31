System.register(["./weathermap"], function (exports_1, context_1) {
    "use strict";
    var weathermap_1, legendLength, legendWidth;
    var __moduleName = context_1 && context_1.id;
    function placeLegend(svgMake, settings, container, defs, gradient) {
        var transform = '';
        if (settings.type == '') {
            return;
        }
        var strokeLegendContainer = svgMake.g();
        container.appendChild(strokeLegendContainer);
        strokeLegendContainer.setAttribute('class', 'stroke-legend');
        if (settings.type[0] == 'h') {
            transform = "translate(" + settings.x + " " + settings.y + ") scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        else if (settings.type[0] == 'v') {
            transform = "translate(" + settings.x + " " + (settings.y + settings.length) + ") rotate(-90) scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        strokeLegendContainer.setAttribute('transform', transform);
        drawLegend(svgMake, gradient, 'strokeColor', strokeLegendContainer, defs);
        var fillLegendContainer = svgMake.g();
        container.appendChild(fillLegendContainer);
        strokeLegendContainer.setAttribute('class', 'fill-legend');
        if (settings.type[0] == 'h') {
            transform = "translate(" + settings.x + " " + (settings.y + settings.width) + ") scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        else if (settings.type[0] == 'v') {
            transform = "translate(" + (settings.x + settings.width) + " " + (settings.y + settings.length) + ") rotate(-90) scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        fillLegendContainer.setAttribute('transform', transform);
        drawLegend(svgMake, gradient, 'fillColor', fillLegendContainer, defs);
        placeLabels(svgMake, settings, gradient, container);
    }
    exports_1("placeLegend", placeLegend);
    function drawLegend(svgMake, gradient, colorType, container, defs) {
        if (gradient.type == 'linear') {
            var legendGradientName = "WeathermapLegendGradient-" + colorType;
            var svgGrad = svgMake.linearGradient();
            defs.appendChild(svgGrad);
            svgGrad.setAttribute('id', legendGradientName);
            for (var _i = 0, _a = gradient.stops; _i < _a.length; _i++) {
                var stop_1 = _a[_i];
                var svgStop = svgMake.stop();
                svgGrad.appendChild(svgStop);
                svgStop.setAttribute('offset', stop_1.position + "%");
                svgStop.setAttribute('stop-color', "" + stop_1[colorType]);
            }
            var svgRect = svgMake.rect();
            container.appendChild(svgRect);
            weathermap_1.setRectangleDimensions(svgRect, 0, 0, legendLength, legendWidth);
            svgRect.setAttribute('style', "fill:url(#" + legendGradientName + ")");
        }
        else if (gradient.type == 'steps') {
            for (var i = 1; i < gradient.stops.length; ++i) {
                var rect_1 = svgMake.rect();
                container.appendChild(rect_1);
                weathermap_1.setRectangleDimensions(rect_1, gradient.stops[i - 1].position, 0, gradient.stops[i].position - gradient.stops[i - 1].position, legendWidth);
                rect_1.setAttribute('style', "fill:" + gradient.stops[i - 1][colorType]);
            }
            var rect = svgMake.rect();
            container.appendChild(rect);
            weathermap_1.setRectangleDimensions(rect, gradient.stops[gradient.stops.length - 1].position, 0, 100 - gradient.stops[gradient.stops.length - 1].position, legendWidth);
            rect.setAttribute('style', "fill:" + gradient.stops[gradient.stops.length - 1][colorType]);
        }
    }
    function placeLabels(svgMake, settings, gradient, container) {
        if (settings.type == '' || settings.type[1] == 'n') {
            return;
        }
        for (var _i = 0, _a = gradient.stops; _i < _a.length; _i++) {
            var stop_2 = _a[_i];
            var xCoord = settings.x;
            var yCoord = settings.y;
            var dy = 0.0;
            var textAnchor = 'start';
            if (settings.type[0] == 'h') {
                xCoord += stop_2.position * settings.length / legendLength;
                textAnchor = 'middle';
                if (settings.type == 'hb') {
                    yCoord += 2 * settings.width;
                    dy = 1.0;
                }
            }
            else if (settings.type[0] == 'v') {
                yCoord += settings.length - (stop_2.position * settings.length / legendLength);
                dy = 0.4;
                if (settings.type == 'vl') {
                    textAnchor = 'end';
                }
                else if (settings.type == 'vr') {
                    textAnchor = 'start';
                    xCoord += 2 * settings.width;
                }
            }
            var label = svgMake.text();
            container.appendChild(label);
            label.setAttribute('class', 'legend-label');
            label.setAttribute('x', "" + xCoord);
            label.setAttribute('y', "" + yCoord);
            label.setAttribute('dy', dy + "em");
            label.setAttribute('style', "text-anchor:" + textAnchor);
            label.textContent = "" + stop_2.position;
        }
    }
    return {
        setters: [
            function (weathermap_1_1) {
                weathermap_1 = weathermap_1_1;
            }
        ],
        execute: function () {
            legendLength = 100;
            legendWidth = 5;
        }
    };
});
//# sourceMappingURL=legend.js.map