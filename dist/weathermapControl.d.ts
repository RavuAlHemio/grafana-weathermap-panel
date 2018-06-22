/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
export declare class WeathermapCtrl extends MetricsPanelCtrl {
    static templateUrl: string;
    currentValues: object;
    currentSeries: object;
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
    link(scope: any, elems: any, attrs: any, ctrl: any): void;
    renderThat(topElem: HTMLElement, ctrl: any): void;
    static colorForValue(value: number): string;
    static interpolate(value: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number): number;
}
