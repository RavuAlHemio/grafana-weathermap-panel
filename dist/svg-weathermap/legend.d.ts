import { Gradient } from './gradients';
import { SVGElementCreator } from './weathermap';
export declare function placeLegend(svgMake: SVGElementCreator, settings: LegendSettings, container: Element, defs: SVGDefsElement, gradient: Gradient, weathermapID?: string | null): void;
export interface LegendSettings {
    type: '' | 'hn' | 'ha' | 'hb' | 'vn' | 'vl' | 'vr';
    x: number;
    y: number;
    length: number;
    width: number;
}
