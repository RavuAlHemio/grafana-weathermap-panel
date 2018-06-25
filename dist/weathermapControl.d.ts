/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { Gradient } from './gradients';
import { LegendSettings } from './legend';
export declare class WeathermapCtrl extends MetricsPanelCtrl {
    private backendSrv;
    static templateUrl: string;
    currentValues: {
        [key: string]: number;
    };
    currentSeries: object;
    panel: PanelSettings;
    searchDashboards: (queryStr: string, callback: (matches: string[]) => any) => void;
    constructor($scope: any, $injector: any, backendSrv: any);
    onInitEditMode(): void;
    onDataReceived(dataList: any): void;
    seriesHandler(seriesData: any): any;
    parseSeries(series: any): {};
    onDataSnapshotLoad(snapshotData: any): void;
    addWeathermapNode(node?: any): void;
    removeWeathermapNode(node: any): void;
    addWeathermapEdge(edge?: any): void;
    removeWeathermapEdge(edge: any): void;
    addGradientStop(stop?: any): void;
    onGradientStopStrokeColorChange(stopIndex: any): (color: string) => void;
    onGradientStopFillColorChange(stopIndex: any): (color: string) => void;
    removeGradientStop(stop: any): void;
    dashboardChanged(link: ObjectLinkSettings): void;
    link(scope: any, elems: any, attrs: any, ctrl: any): void;
    renderThat(topElem: HTMLElement, ctrl: any): void;
    static resolveLink(objLink: ObjectLinkSettings): string | null;
    static maybeWrapIntoLink(upperGroup: SVGGElement, singleObjectGroup: SVGGElement, linkUriBase: string | null, objLinkParams: string | null): void;
}
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
interface ObjectLinkSettings {
    type: 'none' | 'dashboard' | 'absolute';
    dashboard: string | null;
    dashUri: string | null;
    absoluteUri: string | null;
}
interface PanelSettings {
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
