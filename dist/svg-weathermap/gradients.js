System.register([], function (exports_1, context_1) {
    "use strict";
    var emergencyColor;
    var __moduleName = context_1 && context_1.id;
    function gradientColorForValue(gradient, colorType, value) {
        if (gradient.type === "linear") {
            return linearColorForValue(gradient.stops, colorType, value);
        }
        else if (gradient.type === "steps") {
            return stepColorForValue(gradient.stops, colorType, value);
        }
        return emergencyColor;
    }
    exports_1("gradientColorForValue", gradientColorForValue);
    function linearColorForValue(stops, colorType, value) {
        if (stops.length === 0) {
            return emergencyColor;
        }
        var lastStop = stops[stops.length - 1];
        var r = 0.0, g = 0.0, b = 0.0;
        if (value < stops[0].position) {
            return "" + stops[0][colorType];
        }
        else if (value >= lastStop.position) {
            return "" + lastStop[colorType];
        }
        else {
            var foundMatch = false;
            for (var i = 0; i < stops.length - 1; ++i) {
                if (value >= stops[i].position && value < stops[i + 1].position) {
                    var posFrom = stops[i].position;
                    var rFrom = Number.parseInt(("" + stops[i][colorType]).substr(1, 2), 16);
                    var gFrom = Number.parseInt(("" + stops[i][colorType]).substr(3, 2), 16);
                    var bFrom = Number.parseInt(("" + stops[i][colorType]).substr(5, 2), 16);
                    var posTo = stops[i + 1].position;
                    var rTo = Number.parseInt(("" + stops[i + 1][colorType]).substr(1, 2), 16);
                    var gTo = Number.parseInt(("" + stops[i + 1][colorType]).substr(3, 2), 16);
                    var bTo = Number.parseInt(("" + stops[i + 1][colorType]).substr(5, 2), 16);
                    r = lerp(value, posFrom, posTo, rFrom, rTo);
                    g = lerp(value, posFrom, posTo, gFrom, gTo);
                    b = lerp(value, posFrom, posTo, bFrom, bTo);
                    foundMatch = true;
                    break;
                }
            }
            if (!foundMatch) {
                return emergencyColor;
            }
        }
        return "rgb(" + Math.floor(r) + ", " + Math.floor(g) + ", " + Math.floor(b) + ")";
    }
    function stepColorForValue(stops, colorType, value) {
        if (stops.length === 0) {
            return emergencyColor;
        }
        var lastStop = stops[stops.length - 1];
        if (value < stops[0].position) {
            return "" + stops[0][colorType];
        }
        else if (value >= lastStop.position) {
            return "" + lastStop[colorType];
        }
        else {
            for (var i = 0; i < stops.length - 1; ++i) {
                if (value >= stops[i].position && value < stops[i + 1].position) {
                    return "" + stops[i][colorType];
                }
            }
        }
        return emergencyColor;
    }
    function lerp(value, sourceMin, sourceMax, targetMin, targetMax) {
        if (targetMin === targetMax) {
            return targetMin;
        }
        if (value < sourceMin) {
            value = sourceMin;
        }
        if (value > sourceMax) {
            value = sourceMax;
        }
        var terp = (value - sourceMin) / (sourceMax - sourceMin);
        return targetMin + terp * (targetMax - targetMin);
    }
    return {
        setters: [],
        execute: function () {
            emergencyColor = "pink";
        }
    };
});
//# sourceMappingURL=gradients.js.map