import { MetricsPanelCtrl } from 'grafana/app/plugins/sdk';
import { editorPath, nodeEditorPath, edgeEditorPath, labelEditorPath, styleEditorPath } from "./properties";
import {
    renderWeathermapInto,
    WeathermapConfig,
    WeathermapDefaultConfig,
    WeathermapNode,
    WeathermapEdge,
    WeathermapLabel,
    WeathermapStyle,
    ObjectLinkSettings,
    StringMapping
} from "./svg-weathermap/weathermap";
import {
    GradientStop
} from "./svg-weathermap/gradients";
import _ from "lodash";
import TimeSeries from "grafana/app/core/time_series2";

const panelDefaults: WeathermapDefaultConfig = {
    // data
    weathermapNodes: [],
    weathermapEdges: [],
    weathermapLabels: [],
    weathermapStyles: [],
    canvasSize: {
        width: 800,
        height: 600
    },
    textOffsets: {
        left: 5,
        bottom: 5
    },
    showNumbers: false,
    valueName: "max",
    nullPointMode: "connected",
    strokeWidth: 1,
    gradient: {
        type: "steps",
        stops: []
    },
    legend: {
        type: "",
        x: 0,
        y: 0,
        length: 100,
        width: 5
    },
    link: {
        node: {
            type: "none",
            absoluteUri: null,
            dashboard: null,
            dashUri: null
        },
        edge: {
            type: "none",
            absoluteUri: null,
            dashboard: null,
            dashUri: null
        }
    },
    noValueDashArray: "4 4",
    unmeasuredDashArray: "4 2",
};

export class WeathermapCtrl extends MetricsPanelCtrl {
    static templateUrl: string;
    currentValues: {[key: string]: number;};
    currentSeries: object;

    panel: WeathermapConfig;

    searchDashboards: (queryStr: string, callback: (matches: string[]) => any) => void;

    /** @ngInject **/
    constructor($scope: any, $injector: any, private backendSrv: any) {
        super($scope, $injector);
        _.defaultsDeep(this.panel, panelDefaults);

        this.currentValues = {};

        this.events.on("init-edit-mode", this.onInitEditMode.bind(this));
        this.events.on("data-received", this.onDataReceived.bind(this));
        this.events.on("data-snapshot-load", this.onDataSnapshotLoad.bind(this));

        this.searchDashboards = function (queryStr: string, callback: (matches: string[]) => any): void {
            backendSrv.search({query: queryStr}).then(hits => {
                let dashboards: any[] = _.map(hits, dash => dash.title);
                callback(dashboards);
            });
        };
    }

    onInitEditMode(): void {
        this.addEditorTab("Options", editorPath, 2);
        this.addEditorTab("Nodes", nodeEditorPath, 3);
        this.addEditorTab("Edges", edgeEditorPath, 4);
        this.addEditorTab("Labels", labelEditorPath, 5);
        this.addEditorTab("Styles", styleEditorPath, 6);
    }

    onDataReceived(dataList: any): void {
        this.currentSeries = dataList.map(this.seriesHandler.bind(this));
        this.currentValues = this.parseSeries(this.currentSeries);

        this.render();
    }

    seriesHandler(seriesData: any): TimeSeries {
        let series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });
        series.getFlotPairs(this.panel.nullPointMode);
        return series;
    }

    parseSeries(series: any): StringMapping<number> {
        let targetToValue: StringMapping<number> = {};
        for (let ser of series) {
            targetToValue[ser.alias] = ser.stats[this.panel.valueName];
        }
        return targetToValue;
    }

    onDataSnapshotLoad(snapshotData: any): void {
        this.onDataReceived(snapshotData);
    }

    addWeathermapNode(node?: WeathermapNode): void {
        this.panel.weathermapNodes.push(node || <WeathermapNode>{});
    }
    removeWeathermapNode(node: WeathermapNode): void {
        this.panel.weathermapNodes = _.without(this.panel.weathermapNodes, node);
        this.refresh();
    }

    addWeathermapEdge(edge?: WeathermapEdge): void {
        this.panel.weathermapEdges.push(edge || <WeathermapEdge>{});
    }
    removeWeathermapEdge(edge: WeathermapEdge): void {
        this.panel.weathermapEdges = _.without(this.panel.weathermapEdges, edge);
        this.refresh();
    }

    addWeathermapLabel(label?: WeathermapLabel): void {
        this.panel.weathermapLabels.push(label || <WeathermapLabel>{});
    }
    removeWeathermapLabel(label: WeathermapLabel): void {
        this.panel.weathermapLabels = _.without(this.panel.weathermapLabels, label);
        this.refresh();
    }

    addWeathermapStyle(style?: WeathermapStyle): void {
        this.panel.weathermapStyles.push(style || <WeathermapStyle>{});
    }
    removeWeathermapStyle(style: WeathermapStyle): void {
        this.panel.weathermapStyles = _.without(this.panel.weathermapStyles, style);
        this.refresh();
    }

    addGradientStop(stop?: GradientStop): void {
        this.panel.gradient.stops.push(stop || <GradientStop>{});
    }
    onGradientStopStrokeColorChange(stopIndex: number): (color: string) => void {
        return (color: string) => {
            this.panel.gradient.stops[stopIndex].strokeColor = color;
            this.refresh();
        };
    }
    onGradientStopFillColorChange(stopIndex: number): (color: string) => void {
        return (color: string) => {
            this.panel.gradient.stops[stopIndex].fillColor = color;
            this.refresh();
        };
    }
    removeGradientStop(stop: GradientStop): void {
        this.panel.gradient.stops = _.without(this.panel.gradient.stops, stop);
        this.refresh();
    }

    dashboardChanged(link: ObjectLinkSettings): void {
        this.backendSrv.search({query: link.dashboard}).then((hits) => {
            let dashboard: any = _.find(hits, {title: link.dashboard});
            if (dashboard) {
                link.dashUri = dashboard.url;
            }
        });
    }

    link(_scope: any, elems: HTMLElement[], _attrs: any, ctrl: any): void {
        this.events.on("render", () => this.renderThat(elems[0], ctrl));
    }

    renderThat(topElem: HTMLElement, _ctrl: any): void {
        // find weathermap div
        let elem: Element|null = topElem.querySelector("div.weathermap");
        if (elem === null) {
            // oh well
            return;
        }

        // filicide
        while (elem.lastChild) {
            elem.removeChild(elem.lastChild);
        }

        // do it
        renderWeathermapInto(document, elem, this.panel, this.currentValues, WeathermapCtrl.resolveLink);
    }

    static resolveLink(objLink: ObjectLinkSettings): string|null {
        if (objLink.type === "absolute" && objLink.absoluteUri) {
            return objLink.absoluteUri;
        } else if (objLink.type === "dashboard" && objLink.dashUri) {
            let url = new URL(window.location.href);
            let oldParams: StringMapping<string> = getSearchParams(url);
            let params: string[] = [];

            if (oldParams.from) {
                params.push(`from=${encodeURIComponent(oldParams.from)}`);
            }

            if (oldParams.to) {
                params.push(`to=${encodeURIComponent(oldParams.to)}`);
            }

            let paramSuffix: string = "";
            if (params.length > 0) {
                paramSuffix = "?" + params.join("&");
            }
            return `${objLink.dashUri}${paramSuffix}`;
        }
        return null;
    }
}

WeathermapCtrl.templateUrl = "partials/module.html";

function getSearchParams(url: URL): StringMapping<string> {
    let search: string = url.search;
    while (search.startsWith("?")) {
        search = search.substr(1);
    }

    let params: StringMapping<string> = {};
    if (search.length > 0) {
        let pairs: string[] = search.split("&");
        for (let pair of pairs) {
            let keyValueMatch: RegExpMatchArray|null = pair.match(/^([^=]*)(?:=(.*))?$/);
            if (keyValueMatch === null) {
                continue;
            }

            let key: string = keyValueMatch[1];
            let value: string = keyValueMatch[2];
            if (key !== undefined && value !== undefined) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        }
    }

    return params;
}
