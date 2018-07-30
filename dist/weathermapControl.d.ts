/// <reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />
import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { WeathermapConfig, ObjectLinkSettings } from './svg-weathermap/weathermap';
export declare class WeathermapCtrl extends MetricsPanelCtrl {
    private backendSrv;
    static templateUrl: string;
    currentValues: {
        [key: string]: number;
    };
    currentSeries: object;
    panel: WeathermapConfig;
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
    static getSearchParams(url: URL): object;
}
