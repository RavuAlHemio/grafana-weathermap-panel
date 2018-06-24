/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { Gradient } from './gradients';
import { LegendSettings } from './legend';
export declare class WeathermapCtrl extends MetricsPanelCtrl {
    static templateUrl: string;
    currentValues: {
        [key: string]: number;
    };
    currentSeries: object;
    panel: PanelSettings;
    constructor($scope: any, $injector: any);
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
    link(scope: any, elems: any, attrs: any, ctrl: any): void;
    renderThat(topElem: HTMLElement, ctrl: any): void;
}
interface WeathermapNode {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    metricName: string | null;
}
interface WeathermapEdge {
    node1: string;
    node2: string;
    metricName: string;
    metric2Name: string | null;
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
}
export {};
