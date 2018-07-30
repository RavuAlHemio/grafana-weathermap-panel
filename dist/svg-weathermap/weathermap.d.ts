import { Gradient } from './gradients';
import { LegendSettings } from './legend';
export declare function renderWeathermapInto(container: Element, config: WeathermapConfig, linkResolver?: (ObjectLinkSettings: any) => string | null): void;
interface WeathermapNode {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    metricName: string | null;
    linkParams: string;
}
interface WeathermapEdge {
    node1: string;
    node2: string;
    bendDirection: number;
    bendMagnitude: number;
    metricName: string;
    metric2Name: string | null;
    linkParams: string;
}
interface LinkSettings {
    node: ObjectLinkSettings;
    edge: ObjectLinkSettings;
}
export interface ObjectLinkSettings {
    type: 'none' | 'dashboard' | 'absolute';
    dashboard: string | null;
    dashUri: string | null;
    absoluteUri: string | null;
}
export interface WeathermapConfig {
    weathermapEdges: WeathermapEdge[];
    weathermapNodes: WeathermapNode[];
    canvasSize: {
        width: number;
        height: number;
    };
    textOffsets: {
        left: number;
        bottom: number;
    };
    showNumbers: boolean;
    valueName: 'max' | 'min' | 'avg' | 'current' | 'total';
    nullPointMode: 'connected' | 'null' | 'null as zero';
    strokeWidth: number;
    gradient: Gradient;
    legend: LegendSettings;
    link: LinkSettings;
    noValueDashArray: string;
    unmeasuredDashArray: string;
}
export {};
