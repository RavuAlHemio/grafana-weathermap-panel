System.register([], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function midpoint(point1, point2) {
        return {
            x: (point1.x + point2.x) / 2.0,
            y: (point1.y + point2.y) / 2.0
        };
    }
    exports_1("midpoint", midpoint);
    function halveCubicBezier(point1, control1, control2, point2) {
        if (control1 === null) {
            if (control2 === null) {
                var straightMidpoint = this.midpoint(point1, point2);
                return [point1, point1, straightMidpoint, straightMidpoint, straightMidpoint, point2, point2];
            }
            control1 = point1;
        }
        if (control2 === null) {
            control2 = point2;
        }
        var m1 = this.midpoint(point1, control1);
        var m2 = this.midpoint(control1, control2);
        var m3 = this.midpoint(control2, point2);
        var q1 = this.midpoint(m1, m2);
        var q2 = this.midpoint(m2, m3);
        var o = this.midpoint(q1, q2);
        return [point1, m1, q1, o, q2, m3, point2];
    }
    exports_1("halveCubicBezier", halveCubicBezier);
    function polarToCartesian(angleRadians, length) {
        if (angleRadians === null) {
            angleRadians = 0;
        }
        if (length === null) {
            length = 0;
        }
        return {
            x: length * Math.cos(angleRadians),
            y: length * Math.sin(angleRadians)
        };
    }
    exports_1("polarToCartesian", polarToCartesian);
    function normalizeAngle(angleRadians) {
        while (angleRadians <= -Math.PI) {
            angleRadians += 2 * Math.PI;
        }
        while (angleRadians > Math.PI) {
            angleRadians -= 2 * Math.PI;
        }
        return angleRadians;
    }
    exports_1("normalizeAngle", normalizeAngle);
    function deg2rad(angleDegrees) {
        return angleDegrees * Math.PI / 180;
    }
    exports_1("deg2rad", deg2rad);
    return {
        setters: [],
        execute: function () {
        }
    };
});
//# sourceMappingURL=geometry.js.map