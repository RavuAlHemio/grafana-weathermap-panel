import { MetricsPanelCtrl } from "app/plugins/sdk";
import { WeathermapConfig, WeathermapNode, WeathermapEdge, WeathermapLabel, WeathermapStyle, ObjectLinkSettings, StringMapping } from "./svg-weathermap/weathermap";
import { GradientStop } from "./svg-weathermap/gradients";
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
    seriesHandler(seriesData: any): void;
    parseSeries(series: any): StringMapping<number>;
    onDataSnapshotLoad(snapshotData: any): void;
    addWeathermapNode(node?: WeathermapNode): void;
    removeWeathermapNode(node: WeathermapNode): void;
    addWeathermapEdge(edge?: WeathermapEdge): void;
    removeWeathermapEdge(edge: WeathermapEdge): void;
    addWeathermapLabel(label?: WeathermapLabel): void;
    removeWeathermapLabel(label: WeathermapLabel): void;
    addWeathermapStyle(style?: WeathermapStyle): void;
    removeWeathermapStyle(style: WeathermapStyle): void;
    addGradientStop(stop?: GradientStop): void;
    onGradientStopStrokeColorChange(stopIndex: number): (color: string) => void;
    onGradientStopFillColorChange(stopIndex: number): (color: string) => void;
    removeGradientStop(stop: GradientStop): void;
    dashboardChanged(link: ObjectLinkSettings): void;
    link(_scope: any, elems: HTMLElement[], _attrs: any, ctrl: any): void;
    renderThat(topElem: HTMLElement, _ctrl: any): void;
    static resolveLink(objLink: ObjectLinkSettings): string | null;
}
