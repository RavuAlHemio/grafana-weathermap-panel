"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function midpoint(point1, point2) {
    return {
        x: (point1.x + point2.x) / 2.0,
        y: (point1.y + point2.y) / 2.0
    };
}
exports.midpoint = midpoint;
function halveCubicBezier(point1, control1, control2, point2) {
    if (control1 === null) {
        if (control2 === null) {
            var straightMidpoint = midpoint(point1, point2);
            return [point1, point1, straightMidpoint, straightMidpoint, straightMidpoint, point2, point2];
        }
        control1 = point1;
    }
    if (control2 === null) {
        control2 = point2;
    }
    var m1 = midpoint(point1, control1);
    var m2 = midpoint(control1, control2);
    var m3 = midpoint(control2, point2);
    var q1 = midpoint(m1, m2);
    var q2 = midpoint(m2, m3);
    var o = midpoint(q1, q2);
    return [point1, m1, q1, o, q2, m3, point2];
}
exports.halveCubicBezier = halveCubicBezier;
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
exports.polarToCartesian = polarToCartesian;
function normalizeAngle(angleRadians) {
    while (angleRadians <= -Math.PI) {
        angleRadians += 2 * Math.PI;
    }
    while (angleRadians > Math.PI) {
        angleRadians -= 2 * Math.PI;
    }
    return angleRadians;
}
exports.normalizeAngle = normalizeAngle;
function unitVector(vector) {
    var euclidNorm = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
    return {
        x: vector.x / euclidNorm,
        y: vector.y / euclidNorm
    };
}
exports.unitVector = unitVector;
function deg2rad(angleDegrees) {
    return angleDegrees * Math.PI / 180;
}
exports.deg2rad = deg2rad;
function rad2deg(angleRadians) {
    return angleRadians * 180 / Math.PI;
}
exports.rad2deg = rad2deg;
//# sourceMappingURL=geometry.js.map