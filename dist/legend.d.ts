import { Gradient } from './gradients';
export declare function placeLegend(settings: LegendSettings, gradient: Gradient, container: SVGElement): void;
export interface LegendSettings {
    type: '' | 'hn' | 'ha' | 'hb' | 'vn' | 'vl' | 'vr';
    x: number;
    y: number;
    length: number;
    width: number;
}
