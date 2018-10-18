export function midpoint(point1: Point2D, point2: Point2D): Point2D {
    return {
        x: (point1.x + point2.x)/2.0,
        y: (point1.y + point2.y)/2.0
    };
}

export function halveCubicBezier(point1: Point2D, control1: Point2D|null, control2: Point2D|null, point2: Point2D): [Point2D, Point2D, Point2D, Point2D, Point2D, Point2D, Point2D] {    
    if (control1 === null) {
        if (control2 === null) {
            // naïveté!
            let straightMidpoint = this.midpoint(point1, point2);
            return [point1, point1, straightMidpoint, straightMidpoint, straightMidpoint, point2, point2];
        }

        control1 = point1;
    }
    if (control2 === null) {
        control2 = point2;
    }

    let m1 = this.midpoint(point1, control1);
    let m2 = this.midpoint(control1, control2);
    let m3 = this.midpoint(control2, point2);

    let q1 = this.midpoint(m1, m2);
    let q2 = this.midpoint(m2, m3);

    let o = this.midpoint(q1, q2);

    return [point1, m1, q1, o, q2, m3, point2];
}

export function polarToCartesian(angleRadians: number|null, length: number|null): Point2D {
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

export function normalizeAngle(angleRadians: number): number {
    while (angleRadians <= -Math.PI) {
        angleRadians += 2 * Math.PI;
    }
    while (angleRadians > Math.PI) {
        angleRadians -= 2 * Math.PI;
    }
    return angleRadians;
}

export function unitVector(vector: Point2D) {
    let euclidNorm = Math.sqrt(vector.x*vector.x + vector.y*vector.y);
    return {
        x: vector.x / euclidNorm,
        y: vector.y / euclidNorm
    };
}

export function deg2rad(angleDegrees: number): number {
    return angleDegrees * Math.PI / 180;
}

export function rad2deg(angleRadians: number): number {
    return angleRadians * 180 / Math.PI;
}

export interface Point2D {
    x: number;
    y: number;
}
