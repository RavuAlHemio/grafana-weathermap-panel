///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { editorPath, svgNamespace } from './properties';
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
    }
};

export class WeathermapCtrl extends MetricsPanelCtrl {
    static templateUrl: string;
    currentValues: {[key: string]: number;};
    currentSeries: object;

    panel: PanelSettings;

    constructor($scope, $injector) {
        super($scope, $injector);
        _.defaultsDeep(this.panel, panelDefaults);

        this.currentValues = {};

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('data-received', this.onDataReceived.bind(this));
        this.events.on('data-snapshot-load', this.onDataSnapshotLoad.bind(this));
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

    addWeathermapNode(node?) {
        this.panel.weathermapNodes.push(node || {});
    }
    removeWeathermapNode(node) {
        this.panel.weathermapNodes = _.without(this.panel.weathermapNodes, node);
        this.refresh();
    }

    addWeathermapEdge(edge?) {
        this.panel.weathermapEdges.push(edge || {});
    }
    removeWeathermapEdge(edge) {
        this.panel.weathermapEdges = _.without(this.panel.weathermapEdges, edge);
        this.refresh();
    }

    addGradientStop(stop?) {
        this.panel.gradient.stops.push(stop || {});
    }
    onGradientStopStrokeColorChange(stopIndex) {
        return (color: string) => {
            this.panel.gradient.stops[stopIndex].strokeColor = color;
            this.refresh();
        };
    }
    onGradientStopFillColorChange(stopIndex) {
        return (color: string) => {
            this.panel.gradient.stops[stopIndex].fillColor = color;
            this.refresh();
        };
    }
    removeGradientStop(stop) {
        this.panel.gradient.stops = _.without(this.panel.gradient.stops, stop);
        this.refresh();
    }

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

        let legendGroup = document.createElementNS(svgNamespace, 'g');
        legendGroup.classList.add('legend');
        svg.appendChild(legendGroup);

        let edgeGroup = document.createElementNS(svgNamespace, 'g');
        edgeGroup.classList.add('edges');
        svg.appendChild(edgeGroup);

        let nodeGroup = document.createElementNS(svgNamespace, 'g');
        nodeGroup.classList.add('nodes');
        svg.appendChild(nodeGroup);

        // place nodes
        let nodeLabelToNode = {};
        for (let node of this.panel.weathermapNodes) {
            nodeLabelToNode[node.label] = node;

            let rect: SVGRectElement = document.createElementNS(svgNamespace, 'rect');
            nodeGroup.appendChild(rect);

            rect.setAttribute('x', `${node.x}`);
            rect.setAttribute('y', `${node.y}`);
            rect.setAttribute('width', `${node.width}`);
            rect.setAttribute('height', `${node.height}`);
            rect.style.strokeWidth = "1px";
            rect.style.stroke = "gray";

            let text: SVGTextElement = document.createElementNS(svgNamespace, 'text');
            nodeGroup.appendChild(text);

            text.setAttribute('x', `${(+node.x) + (+ctrl.panel.textOffsets.left)}`);
            text.setAttribute('y', `${(+node.y) + (+node.height) - ctrl.panel.textOffsets.bottom}`);
            if (ctrl.panel.showNumbers) {
                let value = (node.metricName in this.currentValues) ? this.currentValues[node.metricName] : '?';
                text.textContent = `${node.label} (${value})`;
            } else {
                text.textContent = node.label;
            }

            if (!node.metricName) {
                rect.style.fill = "white";
            } else if (node.metricName in this.currentValues) {
                // color node by metric
                let currentValue = this.currentValues[node.metricName];
                rect.style.fill = colorForValue(sortedGradient, 'fillColor', currentValue);
            } else {
                // no data
                rect.style.fill = "black";
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

            let n1cx = (+node1.x) + ((+node1.width) / 2);
            let n1cy = (+node1.y) + ((+node1.height) / 2);
            let n2cx = (+node2.x) + ((+node2.width) / 2);
            let n2cy = (+node2.y) + ((+node2.height) / 2);

            if (edge.metric2Name) {
                // two metrics are twice the fun
                let midx = (n1cx + n2cx) / 2;
                let midy = (n1cy + n2cy) / 2;

                let thereLine: SVGLineElement = document.createElementNS(svgNamespace, 'line');
                edgeGroup.appendChild(thereLine);
                thereLine.setAttribute('x1', `${n1cx}`);
                thereLine.setAttribute('y1', `${n1cy}`);
                thereLine.setAttribute('x2', `${midx}`);
                thereLine.setAttribute('y2', `${midy}`);
                thereLine.style.strokeWidth = `${this.panel.strokeWidth}`;

                let backLine: SVGLineElement = document.createElementNS(svgNamespace, 'line');
                edgeGroup.appendChild(backLine);
                backLine.setAttribute('x1', `${midx}`);
                backLine.setAttribute('y1', `${midy}`);
                backLine.setAttribute('x2', `${n2cx}`);
                backLine.setAttribute('y2', `${n2cy}`);
                backLine.style.strokeWidth = `${this.panel.strokeWidth}`;

                if (edge.metricName in this.currentValues) {
                    let currentValue = this.currentValues[edge.metricName];
                    thereLine.style.stroke = colorForValue(sortedGradient, 'strokeColor', currentValue);
                }
                if (edge.metric2Name in this.currentValues) {
                    let currentValue = this.currentValues[edge.metric2Name];
                    backLine.style.stroke = colorForValue(sortedGradient, 'strokeColor', currentValue);
                }

                if (ctrl.panel.showNumbers) {
                    let quax = (n1cx + midx) / 2;
                    let quay = (n1cy + midy) / 2;
                    let tqax = (midx + n2cx) / 2;
                    let tqay = (midy + n2cy) / 2;

                    let valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                    let text1 = document.createElementNS(svgNamespace, 'text');
                    edgeGroup.appendChild(text1);
                    text1.setAttribute('x', `${quax}`);
                    text1.setAttribute('y', `${quay}`);
                    text1.textContent = valueString;

                    let value2String = (edge.metric2Name in this.currentValues) ? this.currentValues[edge.metric2Name].toFixed(2) : '?';
                    let text2 = document.createElementNS(svgNamespace, 'text');
                    edgeGroup.appendChild(text2);
                    text2.setAttribute('x', `${tqax}`);
                    text2.setAttribute('y', `${tqay}`);
                    text2.textContent = value2String;
                }
            } else {
                let edgeLine: SVGLineElement = document.createElementNS(svgNamespace, 'line');
                edgeGroup.appendChild(edgeLine);
                edgeLine.setAttribute('x1', `${n1cx}`);
                edgeLine.setAttribute('y1', `${n1cy}`);
                edgeLine.setAttribute('x2', `${n2cx}`);
                edgeLine.setAttribute('y2', `${n2cy}`);
                edgeLine.style.strokeWidth = `${this.panel.strokeWidth}`;

                if (edge.metricName in this.currentValues) {
                    let currentValue = this.currentValues[edge.metricName];
                    edgeLine.style.stroke = colorForValue(sortedGradient, 'strokeColor', currentValue);
                }

                if (ctrl.panel.showNumbers) {
                    let midx = (n1cx + n2cx) / 2;
                    let midy = (n1cy + n2cy) / 2;
                    let valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                    let text = document.createElementNS(svgNamespace, 'text');
                    edgeGroup.appendChild(text);
                    text.setAttribute('x', `${midx}`);
                    text.setAttribute('y', `${midy}`);
                    text.textContent = valueString;
                }
            }
        }

        // legend
        placeLegend(this.panel.legend, sortedGradient, legendGroup);
    }
}


interface WeathermapNode {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    metricName: string|null;
}

interface WeathermapEdge {
    node1: string;
    node2: string;
    metricName: string;
    metric2Name: string|null;
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
}

WeathermapCtrl.templateUrl = 'module.html';
