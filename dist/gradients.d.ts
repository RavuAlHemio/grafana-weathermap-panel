export declare function colorForValue(gradient: Gradient, colorType: keyof GradientStop, value: number): string;
export interface GradientStop {
    position: number;
    strokeColor: string;
    fillColor: string;
}
export interface Gradient {
    type: "steps" | "linear";
    stops: GradientStop[];
}
