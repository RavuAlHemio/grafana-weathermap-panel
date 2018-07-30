import { svgNamespace, xlinkNamespace } from './constants';
import { deg2rad, halveCubicBezier, normalizeAngle, Point2D, polarToCartesian } from './geometry';
import { Gradient, gradientColorForValue } from './gradients';
import { LegendSettings, placeLegend } from './legend';

export function renderWeathermapInto(
    container: Element, config: WeathermapConfig, linkResolver?: (ObjectLinkSettings) => string|null
): void {
    // sort gradient stops
    let sortedStops = config.gradient.stops
        .slice()
        .sort((l, r) => l.position - r.position);
    let sortedGradient: Gradient = {
        type: config.gradient.type,
        stops: sortedStops
    };

    // add SVG
    let svg: SVGSVGElement = document.createElementNS(svgNamespace, 'svg');
    svg.style.width = `${config.canvasSize.width}px`;
    svg.style.height = `${config.canvasSize.height}px`;
    container.appendChild(svg);

    let defs = document.createElementNS(svgNamespace, 'defs');
    svg.appendChild(defs);

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
    let edgeLinkUriBase: string|null;
    let nodeLinkUriBase: string|null;
    if (linkResolver) {
        nodeLinkUriBase = linkResolver(config.link.node);
        edgeLinkUriBase = linkResolver(config.link.edge);
    }

    // emplacement
    let nodeLabelToNode = placeNodes(config, nodeGroup, nodeLinkUriBase, sortedGradient);
    placeEdges(config, edgeGroup, edgeLinkUriBase, sortedGradient, nodeLabelToNode);
    placeLegend(config.legend, sortedGradient, legendGroup, defs);
}

function placeNodes(
    config: WeathermapConfig, nodeGroup: SVGGElement, nodeLinkUriBase: string|null, sortedGradient: Gradient
): object {
    let nodeLabelToNode = {};
    for (let node of config.weathermapNodes) {
        nodeLabelToNode[node.label] = node;

        let singleNodeGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
        maybeWrapIntoLink(nodeGroup, singleNodeGroup, nodeLinkUriBase, node.linkParams);

        let rect: SVGRectElement = document.createElementNS(svgNamespace, 'rect');
        singleNodeGroup.appendChild(rect);

        setRectangleDimensions(rect, node.x, node.y, node.width, node.height);
        rect.style.strokeWidth = "1px";
        rect.style.stroke = "gray";

        let text: SVGTextElement = document.createElementNS(svgNamespace, 'text');
        singleNodeGroup.appendChild(text);

        text.setAttribute('x', `${(+node.x) + (+config.textOffsets.left)}`);
        text.setAttribute('y', `${(+node.y) + (+node.height) - config.textOffsets.bottom}`);
        if (config.showNumbers) {
            let value = (node.metricName in this.currentValues) ? this.currentValues[node.metricName] : '?';
            text.textContent = `${node.label} (${value})`;
        } else {
            text.textContent = node.label;
        }

        if (!node.metricName) {
            rect.style.fill = "silver";
            rect.style.strokeDasharray = config.unmeasuredDashArray;
        } else if (node.metricName in this.currentValues) {
            // color node by metric
            let currentValue = this.currentValues[node.metricName];
            rect.style.fill = gradientColorForValue(sortedGradient, 'fillColor', currentValue);
        } else {
            // no data
            text.style.fill = "white";
            rect.style.fill = "black";
            rect.style.strokeDasharray = config.noValueDashArray;
        }
    }

    return nodeLabelToNode;
}

function placeEdges(
    config: WeathermapConfig, edgeGroup: SVGGElement, edgeLinkUriBase: string|null, sortedGradient: Gradient,
    nodeLabelToNode: object
): void {
    // place edges
    for (let edge of config.weathermapEdges) {
        let node1 = nodeLabelToNode[edge.node1];
        let node2 = nodeLabelToNode[edge.node2];
        if (!node1 || !node2) {
            // TODO: output error
            continue;
        }

        let singleEdgeGroup: SVGGElement = document.createElementNS(svgNamespace, 'g');
        maybeWrapIntoLink(edgeGroup, singleEdgeGroup, edgeLinkUriBase, edge.linkParams);

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
            therePath.style.strokeWidth = `${config.strokeWidth}`;
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
            backPath.style.strokeWidth = `${config.strokeWidth}`;
            backPath.style.fill = 'none';

            let backTitle: SVGTitleElement = document.createElementNS(svgNamespace, 'title');
            backPath.appendChild(backTitle);
            backTitle.textContent = `${edge.node2} \u2192 ${edge.node1}`;

            if (edge.metricName in this.currentValues) {
                let currentValue = this.currentValues[edge.metricName];
                therePath.style.stroke = gradientColorForValue(sortedGradient, 'strokeColor', currentValue);
            } else {
                therePath.style.stroke = 'black';
                therePath.style.strokeDasharray = config.noValueDashArray;
            }
            if (edge.metric2Name in this.currentValues) {
                let currentValue = this.currentValues[edge.metric2Name];
                backPath.style.stroke = gradientColorForValue(sortedGradient, 'strokeColor', currentValue);
            } else {
                backPath.style.stroke = 'black';
                backPath.style.strokeDasharray = config.noValueDashArray;
            }

            if (config.showNumbers) {
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
            if (control1 !== null && control2 !== null) {
                edgePath.setAttribute('d',
                    `M ${n1Center.x},${n1Center.y} ` +
                    `C ${control1.x},${control1.y},${control2.x},${control2.y},${n2Center.x},${n2Center.y}`
                );
            } else {
                edgePath.setAttribute('d',
                    `M ${n1Center.x},${n1Center.y} ` +
                    `L ${n2Center.x},${n2Center.y}`
                );
            }
            edgePath.style.strokeWidth = `${config.strokeWidth}`;
            edgePath.style.fill = 'none';

            let edgeTitle: SVGTitleElement = document.createElementNS(svgNamespace, 'title');
            edgePath.appendChild(edgeTitle);
            edgeTitle.textContent = `${edge.node2} \u2194 ${edge.node1}`;

            if (edge.metricName in this.currentValues) {
                let currentValue = this.currentValues[edge.metricName];
                edgePath.style.stroke = gradientColorForValue(sortedGradient, 'strokeColor', currentValue);
            } else {
                edgePath.style.stroke = 'black';
                edgePath.style.strokeDasharray = config.noValueDashArray;
            }

            if (config.showNumbers) {
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
}

function maybeWrapIntoLink(upperGroup: SVGGElement, singleObjectGroup: SVGGElement, linkUriBase: string|null, objLinkParams: string|null): void {
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

function setRectangleDimensions(
    element: SVGRectElement, x: number|string, y: number|string, width: number|string, height: number|string
): void {
    element.setAttribute('x', `${x}`);
    element.setAttribute('y', `${y}`);
    element.setAttribute('width', `${width}`);
    element.setAttribute('height', `${height}`);
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

export interface ObjectLinkSettings {
    type: 'none'|'dashboard'|'absolute';
    dashboard: string|null;
    dashUri: string|null;
    absoluteUri: string|null;
}

export interface WeathermapConfig {
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
