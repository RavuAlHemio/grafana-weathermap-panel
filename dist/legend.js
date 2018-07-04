System.register(["./properties"], function (exports_1, context_1) {
    "use strict";
    var properties_1, legendLength, legendWidth;
    var __moduleName = context_1 && context_1.id;
    function placeLegend(settings, gradient, container, defs) {
        var transform = '';
        if (settings.type == '') {
            return;
        }
        var strokeLegendContainer = document.createElementNS(properties_1.svgNamespace, 'g');
        container.appendChild(strokeLegendContainer);
        strokeLegendContainer.classList.add('stroke-legend');
        if (settings.type[0] == 'h') {
            transform = "translate(" + settings.x + " " + settings.y + ") scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        else if (settings.type[0] == 'v') {
            transform = "translate(" + settings.x + " " + (settings.y + settings.length) + ") rotate(-90) scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        strokeLegendContainer.setAttribute('transform', transform);
        drawLegend(gradient, 'strokeColor', strokeLegendContainer, defs);
        var fillLegendContainer = document.createElementNS(properties_1.svgNamespace, 'g');
        container.appendChild(fillLegendContainer);
        fillLegendContainer.classList.add('fill-legend');
        if (settings.type[0] == 'h') {
            transform = "translate(" + settings.x + " " + (settings.y + settings.width) + ") scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        else if (settings.type[0] == 'v') {
            transform = "translate(" + (settings.x + settings.width) + " " + (settings.y + settings.length) + ") rotate(-90) scale(" + settings.length / legendLength + " " + settings.width / legendWidth + ")";
        }
        fillLegendContainer.setAttribute('transform', transform);
        drawLegend(gradient, 'fillColor', fillLegendContainer, defs);
        placeLabels(settings, gradient, container);
    }
    exports_1("placeLegend", placeLegend);
    function drawLegend(gradient, colorType, container, defs) {
        if (gradient.type == 'linear') {
            var legendGradientName = "WeathermapLegendGradient-" + colorType;
            var svgGrad = document.createElementNS(properties_1.svgNamespace, "linearGradient");
            defs.appendChild(svgGrad);
            svgGrad.id = legendGradientName;
            for (var _i = 0, _a = gradient.stops; _i < _a.length; _i++) {
                var stop_1 = _a[_i];
                var svgStop = document.createElementNS(properties_1.svgNamespace, "stop");
                svgGrad.appendChild(svgStop);
                svgStop.setAttribute('offset', stop_1.position + "%");
                svgStop.setAttribute('stop-color', "" + stop_1[colorType]);
            }
            var svgRect = document.createElementNS(properties_1.svgNamespace, "rect");
            container.appendChild(svgRect);
            svgRect.setAttribute('x', '0');
            svgRect.setAttribute('y', '0');
            svgRect.setAttribute('width', "" + legendLength);
            svgRect.setAttribute('height', "" + legendWidth);
            svgRect.style.fill = "url(#" + legendGradientName + ")";
        }
        else if (gradient.type == 'steps') {
            for (var i = 1; i < gradient.stops.length; ++i) {
                var rect_1 = document.createElementNS(properties_1.svgNamespace, "rect");
                container.appendChild(rect_1);
                rect_1.setAttribute('x', "" + gradient.stops[i - 1].position);
                rect_1.setAttribute('y', '0');
                rect_1.setAttribute('width', "" + (gradient.stops[i].position - gradient.stops[i - 1].position));
                rect_1.setAttribute('height', "" + legendWidth);
                rect_1.style.fill = "" + gradient.stops[i - 1][colorType];
            }
            var rect = document.createElementNS(properties_1.svgNamespace, "rect");
            container.appendChild(rect);
            rect.setAttribute('x', "" + gradient.stops[gradient.stops.length - 1].position);
            rect.setAttribute('y', '0');
            rect.setAttribute('width', "" + (100 - gradient.stops[gradient.stops.length - 1].position));
            rect.setAttribute('height', "" + legendWidth);
            rect.style.fill = "" + gradient.stops[gradient.stops.length - 1][colorType];
        }
    }
    function placeLabels(settings, gradient, container) {
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
            var label = document.createElementNS(properties_1.svgNamespace, 'text');
            container.appendChild(label);
            label.classList.add('legend-label');
            label.setAttribute('x', "" + xCoord);
            label.setAttribute('y', "" + yCoord);
            label.setAttribute('dy', dy + "em");
            label.style.textAnchor = textAnchor;
            label.textContent = "" + stop_2.position;
        }
    }
    return {
        setters: [
            function (properties_1_1) {
                properties_1 = properties_1_1;
            }
        ],
        execute: function () {
            legendLength = 100;
            legendWidth = 5;
        }
    };
});
//# sourceMappingURL=legend.js.map