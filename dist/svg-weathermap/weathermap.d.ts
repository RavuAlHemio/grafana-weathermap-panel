import { Gradient } from './gradients';
import { LegendSettings } from './legend';
export declare function renderWeathermapInto(elementCreator: SVGElementCreatorDOM, container: Node, config: WeathermapConfig, currentValues: MetricValueMap, linkResolver?: (ObjectLinkSettings: any) => string | null, addViewBox?: boolean): SVGSVGElement;
export declare function setRectangleDimensions(element: SVGRectElement, x: number | string, y: number | string, width: number | string, height: number | string): void;
export declare class WeathermapRendererState {
    make: SVGElementCreator;
    config: WeathermapConfig;
    sortedGradient: Gradient;
    currentValues: MetricValueMap;
    nodeLabelToNode: LabelToNodeMap;
    nodeLinkUriBase: string | null;
    edgeLinkUriBase: string | null;
    svg: SVGSVGElement | null;
    defs: SVGDefsElement | null;
    edgeGroup: SVGGElement | null;
    nodeGroup: SVGGElement | null;
    labelGroup: SVGGElement | null;
    legendGroup: SVGGElement | null;
    styleMap: NameToStyleMap;
    constructor(domCreator: SVGElementCreatorDOM, config: WeathermapConfig, sortedGradient: Gradient, currentValues: MetricValueMap);
}
export declare class SVGElementCreator {
    maker: SVGElementCreatorDOM;
    constructor(maker: SVGElementCreatorDOM);
    a(): SVGAElement;
    defs(): SVGDefsElement;
    g(): SVGGElement;
    linearGradient(): SVGLinearGradientElement;
    path(): SVGPathElement;
    rect(): SVGRectElement;
    stop(): SVGStopElement;
    svg(): SVGSVGElement;
    text(): SVGTextElement;
    title(): SVGTitleElement;
}
export interface SVGElementCreatorDOM {
    createElementNS(namespaceURI: string, qualifiedName: string): Element;
}
interface PositionableTextElement {
    label: string;
    x: number;
    y: number;
}
interface WeathermapNode extends PositionableTextElement {
    width: number;
    height: number;
    metricName?: string | null;
    linkParams?: string;
}
interface WeathermapEdge {
    node1: string;
    node2: string;
    bendDirection?: number;
    bendMagnitude?: number;
    metricName?: string;
    metric2Name?: string | null;
    linkParams?: string;
    styleName?: string;
}
interface WeathermapLabel extends PositionableTextElement {
}
interface WeathermapStyle {
    name: string;
    strokeWidthArray?: string;
    dashArray?: string;
}
interface LinkSettings {
    node: ObjectLinkSettings;
    edge: ObjectLinkSettings;
}
export interface StringMapping<V> {
    [key: string]: V;
}
export declare type LabelToNodeMap = StringMapping<WeathermapNode>;
export declare type MetricValueMap = StringMapping<number>;
export declare type NameToStyleMap = StringMapping<WeathermapStyle>;
export interface ObjectLinkSettings {
    type: 'none' | 'dashboard' | 'absolute';
    dashboard: string | null;
    dashUri: string | null;
    absoluteUri: string | null;
}
export interface WeathermapConfig {
    weathermapEdges: WeathermapEdge[];
    weathermapNodes: WeathermapNode[];
    weathermapLabels: WeathermapLabel[];
    weathermapStyles: WeathermapStyle[];
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
