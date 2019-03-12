const emergencyColor: string = "pink";

export function gradientColorForValue(gradient: Gradient, colorType: keyof GradientStop, value: number): string {
    if (gradient.type === "linear") {
        return linearColorForValue(gradient.stops, colorType, value);
    } else if (gradient.type === "steps") {
        return stepColorForValue(gradient.stops, colorType, value);
    }
    return emergencyColor;
}

function linearColorForValue(stops: GradientStop[], colorType: keyof GradientStop, value: number): string {
    if (stops.length === 0) {
        return emergencyColor;
    }

    let lastStop: GradientStop = stops[stops.length-1];
    let r: number = 0.0, g: number = 0.0, b: number = 0.0;
    if (value < stops[0].position) {
        return `${stops[0][colorType]}`;
    } else if (value >= lastStop.position) {
        return `${lastStop[colorType]}`;
    } else {
        let foundMatch: boolean = false;
        for (let i: number = 0; i < stops.length-1; ++i) {
            if (value >= stops[i].position && value < stops[i+1].position) {
                // found!

                let posFrom: number = stops[i].position;
                let rFrom: number = Number.parseInt(`${stops[i][colorType]}`.substr(1, 2), 16);
                let gFrom: number = Number.parseInt(`${stops[i][colorType]}`.substr(3, 2), 16);
                let bFrom: number = Number.parseInt(`${stops[i][colorType]}`.substr(5, 2), 16);

                let posTo: number = stops[i+1].position;
                let rTo: number = Number.parseInt(`${stops[i+1][colorType]}`.substr(1, 2), 16);
                let gTo: number = Number.parseInt(`${stops[i+1][colorType]}`.substr(3, 2), 16);
                let bTo: number = Number.parseInt(`${stops[i+1][colorType]}`.substr(5, 2), 16);

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

    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
}

function stepColorForValue(stops: GradientStop[], colorType: keyof GradientStop, value: number): string {
    if (stops.length === 0) {
        return emergencyColor;
    }

    let lastStop: GradientStop = stops[stops.length-1];
    if (value < stops[0].position) {
        return `${stops[0][colorType]}`;
    } else if (value >= lastStop.position) {
        return `${lastStop[colorType]}`;
    } else {
        for (let i: number = 0; i < stops.length-1; ++i) {
            if (value >= stops[i].position && value < stops[i+1].position) {
                return `${stops[i][colorType]}`;
            }
        }
    }

    return emergencyColor;
}

function lerp(value: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number): number {
    if (targetMin === targetMax) {
        return targetMin;
    }

    if (value < sourceMin) {
        value = sourceMin;
    }
    if (value > sourceMax) {
        value = sourceMax;
    }

    let terp: number = (value - sourceMin) / (sourceMax - sourceMin);
    return targetMin + terp * (targetMax - targetMin);
}


export interface GradientStop {
    position: number;
    strokeColor: string;
    fillColor: string;
    showLegendLabel: boolean;
}

export interface Gradient {
    type: "steps"|"linear";
    stops: GradientStop[];
}
