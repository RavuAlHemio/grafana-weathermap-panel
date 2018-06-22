///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import { MetricsPanelCtrl } from 'app/plugins/sdk';
import { editorPath } from './properties';
import _ from 'lodash';

const panelDefaults = {
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
    }
};

export class WeathermapCtrl extends MetricsPanelCtrl {
    static templateUrl: string;
    currentValues: object;

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
        // always take the freshest value
        let finalValues = {};
        for (let series of dataList) {
            let dataPointCount = series.datapoints.length;
            let value = series.datapoints[dataPointCount - 1][0];
            finalValues[series.target] = value;
        }
        this.currentValues = finalValues;

        this.render();
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

    link(scope, elems, attrs, ctrl) {
        this.events.on('render', () => this.renderThat(elems[0], ctrl));
    }

    renderThat(topElem: HTMLElement, ctrl) {
        const svgNamespace = "http://www.w3.org/2000/svg";

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

            rect.setAttribute('x', node.x);
            rect.setAttribute('y', node.y);
            rect.setAttribute('width', node.width);
            rect.setAttribute('height', node.height);
            rect.style.strokeWidth = "1px";
            rect.style.stroke = "gray";

            let text: SVGTextElement = document.createElementNS(svgNamespace, 'text');
            nodeGroup.appendChild(text);

            text.setAttribute('x', `${(+node.x) + (+ctrl.panel.textOffsets.left)}`);
            text.setAttribute('y', `${(+node.y) + (+node.height) - ctrl.panel.textOffsets.bottom}`);
            text.textContent = node.label;

            if (!node.metricName) {
                rect.style.fill = "white";
            } else if (node.metricName in this.currentValues) {
                // color node by metric
                let currentValue = this.currentValues[node.metricName];
                rect.style.fill = WeathermapCtrl.colorForValue(currentValue);
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

                let backLine: SVGLineElement = document.createElementNS(svgNamespace, 'line');
                edgeGroup.appendChild(backLine);
                backLine.setAttribute('x1', `${midx}`);
                backLine.setAttribute('y1', `${midy}`);
                backLine.setAttribute('x2', `${n2cx}`);
                backLine.setAttribute('y2', `${n2cy}`);

                if (edge.metricName in this.currentValues) {
                    let currentValue = this.currentValues[edge.metricName];
                    thereLine.style.stroke = WeathermapCtrl.colorForValue(currentValue);
                }
                if (edge.metric2Name in this.currentValues) {
                    let currentValue = this.currentValues[edge.metric2Name];
                    backLine.style.stroke = WeathermapCtrl.colorForValue(currentValue);
                }
            } else {
                let edgeLine: SVGLineElement = document.createElementNS(svgNamespace, 'line');
                edgeGroup.appendChild(edgeLine);
                edgeLine.setAttribute('x1', `${n1cx}`);
                edgeLine.setAttribute('y1', `${n1cy}`);
                edgeLine.setAttribute('x2', `${n2cx}`);
                edgeLine.setAttribute('y2', `${n2cy}`);

                if (edge.metricName in this.currentValues) {
                    let currentValue = this.currentValues[edge.metricName];
                    edgeLine.style.stroke = WeathermapCtrl.colorForValue(currentValue);
                }
            }
        }
    }

    static colorForValue(value: number): string {
        // FIXME: make this configurable
        let r = 0.0, g = 0.0, b = 0.0;
        if (value <= 5.0) {
            r = 0.55;
            g = 0.0;
            b = 1.0;
        } else if (value <= 10.0) {
            r = WeathermapCtrl.interpolate(value, 5.0, 10.0, 0.55, 0.00);
            g = WeathermapCtrl.interpolate(value, 5.0, 10.0, 0.00, 0.00);
            b = WeathermapCtrl.interpolate(value, 5.0, 10.0, 1.00, 1.00);
        } else if (value <= 15.0) {
            r = WeathermapCtrl.interpolate(value, 10.0, 15.0, 0.00, 0.00);
            g = WeathermapCtrl.interpolate(value, 10.0, 15.0, 0.00, 0.50);
            b = WeathermapCtrl.interpolate(value, 10.0, 15.0, 1.00, 1.00);
        } else if (value <= 25.0) {
            r = WeathermapCtrl.interpolate(value, 15.0, 25.0, 0.00, 0.00);
            g = WeathermapCtrl.interpolate(value, 15.0, 25.0, 0.50, 1.00);
            b = WeathermapCtrl.interpolate(value, 15.0, 25.0, 1.00, 0.00);
        } else if (value <= 50.0) {
            r = WeathermapCtrl.interpolate(value, 25.0, 50.0, 0.00, 1.00);
            g = WeathermapCtrl.interpolate(value, 25.0, 50.0, 1.00, 1.00);
            b = WeathermapCtrl.interpolate(value, 25.0, 50.0, 0.00, 0.00);
        } else if (value <= 75.0) {
            r = WeathermapCtrl.interpolate(value, 50.0, 75.0, 1.00, 1.00);
            g = WeathermapCtrl.interpolate(value, 50.0, 75.0, 1.00, 0.50);
            b = WeathermapCtrl.interpolate(value, 50.0, 75.0, 0.00, 0.00);
        } else if (value <= 100.0) {
            r = WeathermapCtrl.interpolate(value, 75.0, 100.0, 1.00, 1.00);
            g = WeathermapCtrl.interpolate(value, 75.0, 100.0, 0.50, 0.00);
            b = WeathermapCtrl.interpolate(value, 75.0, 100.0, 0.00, 0.00);
        } else {
            r = 1.0;
            g = 0.0;
            b = 0.0;
        }

        return `rgb(${Math.floor(r*255)}, ${Math.floor(g*255)}, ${Math.floor(b*255)})`;
    }

    static interpolate(value: number, sourceMin: number, sourceMax: number, targetMin: number, targetMax: number): number {
        if (targetMin == targetMax) {
            return targetMin;
        }

        if (value < sourceMin) {
            value = sourceMin;
        }
        if (value > sourceMax) {
            value = sourceMax;
        }

        let terp = (value - sourceMin) / (sourceMax - sourceMin);
        return targetMin + terp * (targetMax - targetMin);
    }
}

WeathermapCtrl.templateUrl = 'module.html';
