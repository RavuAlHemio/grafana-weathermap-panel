"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("app/plugins/sdk");
var properties_1 = require("./properties");
var weathermap_1 = require("./svg-weathermap/weathermap");
var lodash_1 = require("lodash");
var time_series2_1 = require("app/core/time_series2");
var panelDefaults = {
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
    unmeasuredDashArray: '4 2',
};
var WeathermapCtrl = (function (_super) {
    __extends(WeathermapCtrl, _super);
    function WeathermapCtrl($scope, $injector, backendSrv) {
        var _this = _super.call(this, $scope, $injector) || this;
        _this.backendSrv = backendSrv;
        lodash_1.default.defaultsDeep(_this.panel, panelDefaults);
        _this.currentValues = {};
        _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
        _this.events.on('data-received', _this.onDataReceived.bind(_this));
        _this.events.on('data-snapshot-load', _this.onDataSnapshotLoad.bind(_this));
        _this.searchDashboards = function (queryStr, callback) {
            backendSrv.search({ query: queryStr }).then(function (hits) {
                var dashboards = lodash_1.default.map(hits, function (dash) { return dash.title; });
                callback(dashboards);
            });
        };
        return _this;
    }
    WeathermapCtrl.prototype.onInitEditMode = function () {
        this.addEditorTab('Options', properties_1.editorPath, 2);
        this.addEditorTab('Nodes', properties_1.nodeEditorPath, 3);
        this.addEditorTab('Edges', properties_1.edgeEditorPath, 4);
        this.addEditorTab('Labels', properties_1.labelEditorPath, 5);
        this.addEditorTab('Styles', properties_1.styleEditorPath, 6);
    };
    WeathermapCtrl.prototype.onDataReceived = function (dataList) {
        this.currentSeries = dataList.map(this.seriesHandler.bind(this));
        this.currentValues = this.parseSeries(this.currentSeries);
        this.render();
    };
    WeathermapCtrl.prototype.seriesHandler = function (seriesData) {
        var series = new time_series2_1.default({
            datapoints: seriesData.datapoints,
            alias: seriesData.target
        });
        series.getFlotPairs(this.panel.nullPointMode);
        return series;
    };
    WeathermapCtrl.prototype.parseSeries = function (series) {
        var targetToValue = {};
        for (var _i = 0, series_1 = series; _i < series_1.length; _i++) {
            var ser = series_1[_i];
            targetToValue[ser.alias] = ser.stats[this.panel.valueName];
        }
        return targetToValue;
    };
    WeathermapCtrl.prototype.onDataSnapshotLoad = function (snapshotData) {
        this.onDataReceived(snapshotData);
    };
    WeathermapCtrl.prototype.addWeathermapNode = function (node) {
        this.panel.weathermapNodes.push(node || {});
    };
    WeathermapCtrl.prototype.removeWeathermapNode = function (node) {
        this.panel.weathermapNodes = lodash_1.default.without(this.panel.weathermapNodes, node);
        this.refresh();
    };
    WeathermapCtrl.prototype.addWeathermapEdge = function (edge) {
        this.panel.weathermapEdges.push(edge || {});
    };
    WeathermapCtrl.prototype.removeWeathermapEdge = function (edge) {
        this.panel.weathermapEdges = lodash_1.default.without(this.panel.weathermapEdges, edge);
        this.refresh();
    };
    WeathermapCtrl.prototype.addWeathermapLabel = function (label) {
        this.panel.weathermapLabels.push(label || {});
    };
    WeathermapCtrl.prototype.removeWeathermapLabel = function (label) {
        this.panel.weathermapLabels = lodash_1.default.without(this.panel.weathermapLabels, label);
        this.refresh();
    };
    WeathermapCtrl.prototype.addWeathermapStyle = function (style) {
        this.panel.weathermapStyles.push(style || {});
    };
    WeathermapCtrl.prototype.removeWeathermapStyle = function (style) {
        this.panel.weathermapStyles = lodash_1.default.without(this.panel.weathermapStyles, style);
        this.refresh();
    };
    WeathermapCtrl.prototype.addGradientStop = function (stop) {
        this.panel.gradient.stops.push(stop || {});
    };
    WeathermapCtrl.prototype.onGradientStopStrokeColorChange = function (stopIndex) {
        var _this = this;
        return function (color) {
            _this.panel.gradient.stops[stopIndex].strokeColor = color;
            _this.refresh();
        };
    };
    WeathermapCtrl.prototype.onGradientStopFillColorChange = function (stopIndex) {
        var _this = this;
        return function (color) {
            _this.panel.gradient.stops[stopIndex].fillColor = color;
            _this.refresh();
        };
    };
    WeathermapCtrl.prototype.removeGradientStop = function (stop) {
        this.panel.gradient.stops = lodash_1.default.without(this.panel.gradient.stops, stop);
        this.refresh();
    };
    WeathermapCtrl.prototype.dashboardChanged = function (link) {
        this.backendSrv.search({ query: link.dashboard }).then(function (hits) {
            var dashboard = lodash_1.default.find(hits, { title: link.dashboard });
            if (dashboard) {
                link.dashUri = dashboard.uri;
            }
        });
    };
    ;
    WeathermapCtrl.prototype.link = function (scope, elems, attrs, ctrl) {
        var _this = this;
        this.events.on('render', function () { return _this.renderThat(elems[0], ctrl); });
    };
    WeathermapCtrl.prototype.renderThat = function (topElem, ctrl) {
        var elem = topElem.querySelector('div.weathermap');
        while (elem.lastChild) {
            elem.removeChild(elem.lastChild);
        }
        weathermap_1.renderWeathermapInto(document, elem, this.panel, this.currentValues, WeathermapCtrl.resolveLink);
    };
    WeathermapCtrl.resolveLink = function (objLink) {
        if (objLink.type == 'absolute' && objLink.absoluteUri) {
            return objLink.absoluteUri;
        }
        else if (objLink.type == 'dashboard' && objLink.dashUri) {
            var url = new URL(window.location.href);
            var oldParams = getSearchParams(url);
            var params = [];
            if (oldParams['from']) {
                params.push("from=" + encodeURIComponent(oldParams['from']));
            }
            if (oldParams['to']) {
                params.push("to=" + encodeURIComponent(oldParams['to']));
            }
            var paramSuffix = '';
            if (params.length > 0) {
                paramSuffix = '?' + params.join('&');
            }
            return "/dashboard/" + objLink.dashUri + paramSuffix;
        }
        return null;
    };
    return WeathermapCtrl;
}(sdk_1.MetricsPanelCtrl));
exports.WeathermapCtrl = WeathermapCtrl;
WeathermapCtrl.templateUrl = 'module.html';
function getSearchParams(url) {
    var search = url.search;
    while (search.startsWith('?')) {
        search = search.substr(1);
    }
    var params = {};
    if (search.length > 0) {
        var pairs = search.split('&');
        for (var _i = 0, pairs_1 = pairs; _i < pairs_1.length; _i++) {
            var pair = pairs_1[_i];
            var keyValueMatch = pair.match(/^([^=]*)(?:=(.*))?$/);
            var key = keyValueMatch[1];
            var value = keyValueMatch[2];
            if (key !== undefined && value !== undefined) {
                params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
        }
    }
    return params;
}
//# sourceMappingURL=weathermapControl.js.map