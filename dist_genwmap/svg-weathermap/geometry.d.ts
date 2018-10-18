export declare function midpoint(point1: Point2D, point2: Point2D): Point2D;
export declare function halveCubicBezier(point1: Point2D, control1: Point2D | null, control2: Point2D | null, point2: Point2D): [Point2D, Point2D, Point2D, Point2D, Point2D, Point2D, Point2D];
export declare function polarToCartesian(angleRadians: number | null, length: number | null): Point2D;
export declare function normalizeAngle(angleRadians: number): number;
export declare function unitVector(vector: Point2D): {
    x: number;
    y: number;
};
export declare function deg2rad(angleDegrees: number): number;
export declare function rad2deg(angleRadians: number): number;
export interface Point2D {
    x: number;
    y: number;
}
