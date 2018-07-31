///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { editorPath, nodeEditorPath, edgeEditorPath } from './properties';
import { renderWeathermapInto, WeathermapConfig, ObjectLinkSettings } from './svg-weathermap/weathermap';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series2';

const panelDefaults: WeathermapConfig = {
    // data
    weathermapNodes: [],
    weathermapEdges: [],
    canvasSize: {
        width: 800,
        height: 600
    },
    textOffsets: {
        left: 5,
        bottom: 5
    },
    showNumbers: false,
    valueName: 'max',
    nullPointMode: 'connected',
    strokeWidth: 1,
    gradient: {
        type: 'steps',
        stops: []
    },
    legend: {
        type: '',
        x: 0,
        y: 0,
        length: 100,
        width: 5
    },
    link: {
        node: {
            type: 'none',
            absoluteUri: null,
            dashboard: null,
            dashUri: null
        },
        edge: {
            type: 'none',
            absoluteUri: null,
            dashboard: null,
            dashUri: null
        }
    },
    noValueDashArray: '4 4',
    unmeasuredDashArray: '4 2'
};

export class WeathermapCtrl extends MetricsPanelCtrl {
    static templateUrl: string;
    currentValues: {[key: string]: number;};
    currentSeries: object;

    panel: WeathermapConfig;

    searchDashboards: (queryStr: string, callback: (matches: string[]) => any) => void;

    /** @ngInject **/
    constructor($scope, $injector, private backendSrv) {
        super($scope, $injector);
        _.defaultsDeep(this.panel, panelDefaults);

        this.currentValues = {};

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));

        this.searchDashboards = function (queryStr: string, callback: (matches: string[]) => any): void {
            backendSrv.search({query: queryStr}).then(hits => {
                let dashboards = _.map(hits, dash => dash.title);
                callback(dashboards);
            });
        };
    }

    onInitEditMode() {
        this.addEditorTab('Options', editorPath, 2);
        this.addEditorTab('Nodes', nodeEditorPath, 3);
        this.addEditorTab('Edges', edgeEditorPath, 4);
    }

    onDataReceived(dataList) {
        this.currentSeries = dataList.map(this.seriesHandler.bind(this));
        this.currentValues = this.parseSeries(this.currentSeries);

        this.render();
    }

    seriesHandler(seriesData) {
        let series = new TimeSeries({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });
        series.getFlotPairs(this.panel.nullPointMode);
        return series;
    }

    parseSeries(series) {
        let targetToValue = {};
        for (let ser of series) {
            targetToValue[ser.alias] = ser.stats[this.panel.valueName];
        }
        return targetToValue;
    }

    onDataSnapshotLoad(snapshotData) {
        this.onDataReceived(snapshotData);
    }

    addWeathermapNode(node?): void {
        this.panel.weathermapNodes.push(node || {});
    }
    removeWeathermapNode(node): void {
        this.panel.weathermapNodes = _.without(this.panel.weathermapNodes, node);
        this.refresh();
    }

    addWeathermapEdge(edge?): void {
        this.panel.weathermapEdges.push(edge || {});
    }
    removeWeathermapEdge(edge): void {
        this.panel.weathermapEdges = _.without(this.panel.weathermapEdges, edge);
        this.refresh();
    }

    addGradientStop(stop?): void {
        this.panel.gradient.stops.push(stop || {});
    }
    onGradientStopStrokeColorChange(stopIndex): (color: string) => void {
        return (color: string) => {
            this.panel.gradient.stops[stopIndex].strokeColor = color;
            this.refresh();
        };
    }
    onGradientStopFillColorChange(stopIndex): (color: string) => void {
        return (color: string) => {
            this.panel.gradient.stops[stopIndex].fillColor = color;
            this.refresh();
        };
    }
    removeGradientStop(stop): void {
        this.panel.gradient.stops = _.without(this.panel.gradient.stops, stop);
        this.refresh();
    }

    dashboardChanged(link: ObjectLinkSettings): void {
        this.backendSrv.search({query: link.dashboard}).then((hits) => {
            let dashboard = _.find(hits, {title: link.dashboard});
            if (dashboard) {
                link.dashUri = dashboard.uri;
            }
        });
    };

    link(scope, elems, attrs, ctrl) {
        this.events.on('render', () => this.renderThat(elems[0], ctrl));
    }

    renderThat(topElem: HTMLElement, ctrl) {
        // find weathermap div
        let elem = topElem.querySelector('div.weathermap');

        // filicide
        while (elem.lastChild) {
            elem.removeChild(elem.lastChild);
        }

        // do it
        renderWeathermapInto(document, elem, this.panel, this.currentValues, WeathermapCtrl.resolveLink);
    }

    static resolveLink(objLink: ObjectLinkSettings): string|null {
        if (objLink.type == 'absolute' && objLink.absoluteUri) {
            return objLink.absoluteUri;
        } else if (objLink.type == 'dashboard' && objLink.dashUri) {
            let url = new URL(window.location.href);
            let oldParams = getSearchParams(url);
            let params = [];

            if (oldParams['from']) {
                params.push(`from=${encodeURIComponent(oldParams['from'])}`);
            }

            if (oldParams['to']) {
                params.push(`to=${encodeURIComponent(oldParams['to'])}`);
            }

            let paramSuffix = '';
            if (params.length > 0) {
                paramSuffix = '?' + params.join('&');
            }
            return `/dashboard/${objLink.dashUri}${paramSuffix}`;
        }
        return null;
    }
}

WeathermapCtrl.templateUrl = 'module.html';

function getSearchParams(url: URL): object {
    let search = url.search;
    while (search.startsWith('?')) {
        search = search.substr(1);
    }

    let params = {};
    if (search.length > 0) {
        let pairs = search.split('&');
        for (let pair of pairs) {
            let keyValueMatch = pair.match(/^([^=]*)(?:=(.*))?$/);
            let key = keyValueMatch[1];
            let value = keyValueMatch[2];
            if (key !== undefined && value !== undefined) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        }
    }

    return params;
}
