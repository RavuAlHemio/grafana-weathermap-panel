///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { editorPath, svgNamespace, xlinkNamespace } from './properties';
import { deg2rad, halveCubicBezier, midpoint, normalizeAngle, Point2D, polarToCartesian, rad2deg } from './geometry';
import { colorForValue, Gradient } from './gradients';
import { placeLegend, LegendSettings } from './legend';
import _ from 'lodash';
import TimeSeries from 'app/core/time_series2';

const panelDefaults: PanelSettings = {
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

    panel: PanelSettings;

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
        // sort gradient stops
        let sortedStops = this.panel.gradient.stops
            .slice()
            .sort((l, r) => l.position - r.position);
        let sortedGradient = {
            type: this.panel.gradient.type,
            stops: sortedStops
        };

        // find weathermap div
        let elem = topElem.querySelector('div.weathermap');

        // filicide
        while (elem.lastChild) {
            elem.removeChild(elem.lastChild);
        }

        // add SVG
        let svg = document.createElementNS(svgNamespace, 'svg');
        svg.style.width = `${this.panel.canvasSize.width}px`;
        svg.style.height = `${this.panel.canvasSize.height}px`;
        elem.appendChild(svg);

        let legendGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
        legendGroup.classList.add('legend');
        svg.appendChild(legendGroup);

        let edgeGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
        edgeGroup.classList.add('edges');
        svg.appendChild(edgeGroup);

        let nodeGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
        nodeGroup.classList.add('nodes');
        svg.appendChild(nodeGroup);

        // resolve links
        let nodeLinkUriBase: string|null = WeathermapCtrl.resolveLink(this.panel.link.node);
        let edgeLinkUriBase: string|null = WeathermapCtrl.resolveLink(this.panel.link.edge);

        // place nodes
        let nodeLabelToNode = {};
        for (let node of this.panel.weathermapNodes) {
            nodeLabelToNode[node.label] = node;

            let singleNodeGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
            WeathermapCtrl.maybeWrapIntoLink(nodeGroup, singleNodeGroup, nodeLinkUriBase, node.linkParams);

            let rect: SVGRectElement = document.createElementNS(svgNamespace, 'rect');
            singleNodeGroup.appendChild(rect);

            rect.setAttribute('x', `${node.x}`);
            rect.setAttribute('y', `${node.y}`);
            rect.setAttribute('width', `${node.width}`);
            rect.setAttribute('height', `${node.height}`);
            rect.style.strokeWidth = "1px";
            rect.style.stroke = "gray";

            let text: SVGTextElement = document.createElementNS(svgNamespace, 'text');
            singleNodeGroup.appendChild(text);

            text.setAttribute('x', `${(+node.x) + (+ctrl.panel.textOffsets.left)}`);
            text.setAttribute('y', `${(+node.y) + (+node.height) - ctrl.panel.textOffsets.bottom}`);
            if (ctrl.panel.showNumbers) {
                let value = (node.metricName in this.currentValues) ? this.currentValues[node.metricName] : '?';
                text.textContent = `${node.label} (${value})`;
            } else {
                text.textContent = node.label;
            }

            if (!node.metricName) {
                rect.style.fill = "silver";
                rect.style.strokeDasharray = this.panel.unmeasuredDashArray;
            } else if (node.metricName in this.currentValues) {
                // color node by metric
                let currentValue = this.currentValues[node.metricName];
                rect.style.fill = colorForValue(sortedGradient, 'fillColor', currentValue);
            } else {
                // no data
                text.style.fill = "white";
                rect.style.fill = "black";
                rect.style.strokeDasharray = this.panel.noValueDashArray;
            }
        }

        // place edges
        for (let edge of this.panel.weathermapEdges) {
            let node1 = nodeLabelToNode[edge.node1];
            let node2 = nodeLabelToNode[edge.node2];
            if (!node1 || !node2) {
                // TODO: output error
                continue;
            }

            let singleEdgeGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
            WeathermapCtrl.maybeWrapIntoLink(edgeGroup, singleEdgeGroup, edgeLinkUriBase, edge.linkParams);

            let n1Center: Point2D = {
                x: (+node1.x) + ((+node1.width) / 2),
                y: (+node1.y) + ((+node1.height) / 2)
            };
            let n2Center: Point2D = {
                x: (+node2.x) + ((+node2.width) / 2),
                y: (+node2.y) + ((+node2.height) / 2)
            };

            // calculate bend (control points)
            let control1: Point2D|null = null;
            let control2: Point2D|null = null;
            if (edge.bendDirection && edge.bendMagnitude) {
                // warning: screen coordinates (flipped Y axis)!
                let n1N2Angle = Math.atan2(n1Center.y - n2Center.y, n2Center.x - n1Center.x);
                let n2N1Angle = Math.atan2(n2Center.y - n1Center.y, n1Center.x - n2Center.x);

                let n1N2BendAngle = normalizeAngle(n1N2Angle + deg2rad(edge.bendDirection));
                let n2N1BendAngle = normalizeAngle(n2N1Angle - deg2rad(edge.bendDirection));

                let control1Offset: Point2D = polarToCartesian(n1N2BendAngle, edge.bendMagnitude);
                let control2Offset: Point2D = polarToCartesian(n2N1BendAngle, edge.bendMagnitude);

                control1 = {
                    x: (+n1Center.x) + control1Offset.x,
                    y: (+n1Center.y) - control1Offset.y
                };
                control2 = {
                    x: (+n2Center.x) + control2Offset.x,
                    y: (+n2Center.y) - control2Offset.y
                };
            }

            if (edge.metric2Name) {
                // two metrics are twice the fun
                let [_point1, point1COut, point2CIn, point2, point2COut, point3CIn, _point2] = halveCubicBezier(n1Center, control1, control2, n2Center);

                let therePath: SVGPathElement = document.createElementNS(svgNamespace, 'path');
                singleEdgeGroup.appendChild(therePath);
                therePath.setAttribute('d',
                    `M ${n1Center.x},${n1Center.y} ` +
                    `C ${point1COut.x},${point1COut.y},${point2CIn.x},${point2CIn.y},${point2.x},${point2.y}`
                );
                therePath.style.strokeWidth = `${this.panel.strokeWidth}`;
                therePath.style.fill = 'none';

                let thereTitle: SVGTitleElement = document.createElementNS(svgNamespace, 'title');
                therePath.appendChild(thereTitle);
                thereTitle.textContent = `${edge.node1} \u2192 ${edge.node2}`;

                let backPath: SVGPathElement = document.createElementNS(svgNamespace, 'path');
                singleEdgeGroup.appendChild(backPath);
                backPath.setAttribute('d',
                    `M ${point2.x},${point2.y} ` +
                    `C ${point2COut.x},${point2COut.y},${point3CIn.x},${point3CIn.y},${n2Center.x},${n2Center.y}`
                );
                backPath.style.strokeWidth = `${this.panel.strokeWidth}`;
                backPath.style.fill = 'none';

                let backTitle: SVGTitleElement = document.createElementNS(svgNamespace, 'title');
                backPath.appendChild(backTitle);
                backTitle.textContent = `${edge.node2} \u2192 ${edge.node1}`;

                if (edge.metricName in this.currentValues) {
                    let currentValue = this.currentValues[edge.metricName];
                    therePath.style.stroke = colorForValue(sortedGradient, 'strokeColor', currentValue);
                } else {
                    therePath.style.stroke = 'black';
                    therePath.style.strokeDasharray = this.panel.noValueDashArray;
                }
                if (edge.metric2Name in this.currentValues) {
                    let currentValue = this.currentValues[edge.metric2Name];
                    backPath.style.stroke = colorForValue(sortedGradient, 'strokeColor', currentValue);
                } else {
                    backPath.style.stroke = 'black';
                    backPath.style.strokeDasharray = this.panel.noValueDashArray;
                }

                if (ctrl.panel.showNumbers) {
                    let quarterPoint = halveCubicBezier(n1Center, point1COut, point2CIn, point2)[3];
                    let threeQuarterPoint = halveCubicBezier(point2, point2COut, point3CIn, n2Center)[3];

                    let valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                    let text1 = document.createElementNS(svgNamespace, 'text');
                    singleEdgeGroup.appendChild(text1);
                    text1.setAttribute('x', `${quarterPoint.x}`);
                    text1.setAttribute('y', `${quarterPoint.y}`);
                    text1.textContent = valueString;

                    let value2String = (edge.metric2Name in this.currentValues) ? this.currentValues[edge.metric2Name].toFixed(2) : '?';
                    let text2 = document.createElementNS(svgNamespace, 'text');
                    singleEdgeGroup.appendChild(text2);
                    text2.setAttribute('x', `${threeQuarterPoint.x}`);
                    text2.setAttribute('y', `${threeQuarterPoint.y}`);
                    text2.textContent = value2String;
                }
            } else {
                let edgePath: SVGPathElement = document.createElementNS(svgNamespace, 'path');
                singleEdgeGroup.appendChild(edgePath);
                edgePath.setAttribute('d',
                    `M ${n1Center.x},${n1Center.y} ` +
                    `C ${control1.x},${control1.y},${control2.x},${control2.y},${n2Center.x},${n2Center.y}`
                );
                edgePath.style.strokeWidth = `${this.panel.strokeWidth}`;
                edgePath.style.fill = 'none';

                let edgeTitle: SVGTitleElement = document.createElementNS(svgNamespace, 'title');
                edgePath.appendChild(edgeTitle);
                edgeTitle.textContent = `${edge.node2} \u2194 ${edge.node1}`;

                if (edge.metricName in this.currentValues) {
                    let currentValue = this.currentValues[edge.metricName];
                    edgePath.style.stroke = colorForValue(sortedGradient, 'strokeColor', currentValue);
                } else {
                    edgePath.style.stroke = 'black';
                    edgePath.style.strokeDasharray = this.panel.noValueDashArray;
                }

                if (ctrl.panel.showNumbers) {
                    let midpoint = halveCubicBezier(n1Center, control1, control2, n2Center)[3];
                    let valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                    let text = document.createElementNS(svgNamespace, 'text');
                    singleEdgeGroup.appendChild(text);
                    text.setAttribute('x', `${midpoint.x}`);
                    text.setAttribute('y', `${midpoint.y}`);
                    text.textContent = valueString;
                }
            }
        }

        // legend
        placeLegend(this.panel.legend, sortedGradient, legendGroup);
    }

    static resolveLink(objLink: ObjectLinkSettings): string|null {
        if (objLink.type == 'absolute' && objLink.absoluteUri) {
            return objLink.absoluteUri;
        } else if (objLink.type == 'dashboard' && objLink.dashUri) {
            let url = new URL(window.location.href);
            let params = [];

            let fromParam = url.searchParams.get('from');
            if (fromParam) {
                params.push(`from=${escape(fromParam)}`);
            }

            let toParam = url.searchParams.get('to');
            if (toParam) {
                params.push(`to=${escape(toParam)}`);
            }

            let paramSuffix = '';
            if (params.length > 0) {
                paramSuffix = '?' + params.join('&');
            }
            return `/dashboard/${objLink.dashUri}${paramSuffix}`;
        }
        return null;
    }

    static maybeWrapIntoLink(upperGroup: SVGGElement, singleObjectGroup: SVGGElement, linkUriBase: string|null, objLinkParams: string|null): void {
        if (linkUriBase) {
            let objLinkUri = linkUriBase;
            if (objLinkParams) {
                objLinkUri += (objLinkUri.indexOf('?') === -1)
                    ? '?'
                    : '&';
                
                objLinkUri += objLinkParams;
            }

            let aElement: SVGAElement = document.createElementNS(svgNamespace, 'a');
            upperGroup.appendChild(aElement);
            aElement.setAttributeNS(xlinkNamespace, 'href', objLinkUri);

            aElement.appendChild(singleObjectGroup);
        } else {
            upperGroup.appendChild(singleObjectGroup);
        }
    }
}


interface WeathermapNode {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    metricName: string|null;
    linkParams: string;
}

interface WeathermapEdge {
    node1: string;
    node2: string;
    bendDirection: number;
    bendMagnitude: number;
    metricName: string;
    metric2Name: string|null;
    linkParams: string;
}

interface LinkSettings {
    node: ObjectLinkSettings;
    edge: ObjectLinkSettings;
}

interface ObjectLinkSettings {
    type: 'none'|'dashboard'|'absolute';
    dashboard: string|null;
    dashUri: string|null;
    absoluteUri: string|null;
}

interface PanelSettings {
    weathermapEdges: WeathermapEdge[];
    weathermapNodes: WeathermapNode[];
    canvasSize: { width: number; height: number; };
    textOffsets: { left: number; bottom: number; };
    showNumbers: boolean;
    valueName: 'max'|'min'|'avg'|'current'|'total';
    nullPointMode: 'connected'|'null'|'null as zero';
    strokeWidth: number;
    gradient: Gradient;
    legend: LegendSettings;
    link: LinkSettings;
    noValueDashArray: string;
    unmeasuredDashArray: string;
}

WeathermapCtrl.templateUrl = 'module.html';
