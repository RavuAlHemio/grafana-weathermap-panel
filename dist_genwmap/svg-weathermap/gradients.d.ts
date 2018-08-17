export declare function gradientColorForValue(gradient: Gradient, colorType: keyof GradientStop, value: number): string;
export interface GradientStop {
    position: number;
    strokeColor: string;
    fillColor: string;
    showLegendLabel: boolean;
}
export interface Gradient {
    type: "steps" | "linear";
    stops: GradientStop[];
}
