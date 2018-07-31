import { svgNamespace, xlinkNamespace } from './constants';
import { deg2rad, halveCubicBezier, normalizeAngle, Point2D, polarToCartesian } from './geometry';
import { Gradient, gradientColorForValue } from './gradients';
import { LegendSettings, placeLegend } from './legend';

export function renderWeathermapInto(
    elementCreator: SVGElementCreatorDOM, container: Node, config: WeathermapConfig, currentValues: MetricValueMap,
    linkResolver?: (ObjectLinkSettings) => string|null
): void {
    // sort gradient stops
    let sortedStops = config.gradient.stops
        .slice()
        .sort((l, r) => l.position - r.position);
    let sortedGradient: Gradient = {
        type: config.gradient.type,
        stops: sortedStops
    };

    let state = new WeathermapRendererState(elementCreator, config, sortedGradient, currentValues);

    initializeSVG(state, container);

    // resolve links
    if (linkResolver) {
        state.nodeLinkUriBase = linkResolver(config.link.node);
        state.edgeLinkUriBase = linkResolver(config.link.edge);
    }

    // emplacement
    placeNodes(state);
    placeEdges(state);
    placeLegend(state.make, config.legend, state.legendGroup, state.defs, sortedGradient);
}

function initializeSVG(state: WeathermapRendererState, container: Node): void {
    // add SVG
    let svg: SVGSVGElement = state.make.svg();
    modifyStyle(svg, {
        'width': state.config.canvasSize.width,
        'height': state.config.canvasSize.height,
    });
    container.appendChild(svg);

    state.defs = state.make.defs();
    svg.appendChild(state.defs);

    state.legendGroup = state.make.g();
    state.legendGroup.setAttribute('class', 'legend');
    svg.appendChild(state.legendGroup);

    state.edgeGroup = state.make.g();
    state.edgeGroup.setAttribute('class', 'edges');
    svg.appendChild(state.edgeGroup);

    state.nodeGroup = state.make.g();
    state.nodeGroup.setAttribute('class', 'nodes');
    svg.appendChild(state.nodeGroup);
}

function placeNodes(state: WeathermapRendererState): void {
    for (let node of state.config.weathermapNodes) {
        state.nodeLabelToNode[node.label] = node;

        let singleNodeGroup: SVGGElement = state.make.g();
        maybeWrapIntoLink(state.make, state.nodeGroup, singleNodeGroup, state.nodeLinkUriBase, node.linkParams);

        let rect: SVGRectElement = state.make.rect();
        singleNodeGroup.appendChild(rect);

        setRectangleDimensions(rect, node.x, node.y, node.width, node.height);
        modifyStyle(rect, {
            'stroke': 'gray',
            'stroke-width': '1px',
        });

        let text: SVGTextElement = state.make.text();
        singleNodeGroup.appendChild(text);

        text.setAttribute('x', `${(+node.x) + (+state.config.textOffsets.left)}`);
        text.setAttribute('y', `${(+node.y) + (+node.height) - state.config.textOffsets.bottom}`);
        if (state.config.showNumbers) {
            let value = (node.metricName in state.currentValues)
                ? state.currentValues[node.metricName]
                : '?'
            ;
            text.textContent = `${node.label} (${value})`;
        } else {
            text.textContent = node.label;
        }

        if (!node.metricName) {
            modifyStyle(rect, {
                'fill': 'silver',
                'stroke-dasharray': state.config.unmeasuredDashArray,
            });
        } else if (node.metricName in state.currentValues) {
            // color node by metric
            let currentValue = state.currentValues[node.metricName];
            modifyStyle(rect, {
                'fill': gradientColorForValue(state.sortedGradient, 'fillColor', currentValue),
            });
        } else {
            // no data
            modifyStyle(text, {
                'fill': 'white',
            });
            modifyStyle(rect, {
                'fill': 'black',
                'stroke-dasharray': state.config.noValueDashArray,
            });
        }
    }
}

function placeEdges(state: WeathermapRendererState): void {
    // place edges
    for (let edge of state.config.weathermapEdges) {
        let node1 = state.nodeLabelToNode[edge.node1];
        let node2 = state.nodeLabelToNode[edge.node2];
        if (!node1 || !node2) {
            // TODO: output error
            continue;
        }

        let singleEdgeGroup: SVGGElement = state.make.g();
        maybeWrapIntoLink(state.make, state.edgeGroup, singleEdgeGroup, state.edgeLinkUriBase, edge.linkParams);

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

            let therePath: SVGPathElement = state.make.path();
            singleEdgeGroup.appendChild(therePath);
            therePath.setAttribute('d',
                `M ${n1Center.x},${n1Center.y} ` +
                `C ${point1COut.x},${point1COut.y},${point2CIn.x},${point2CIn.y},${point2.x},${point2.y}`
            );
            modifyStyle(therePath, {
                'stroke-width': state.config.strokeWidth,
                'fill': 'none',
            });

            let thereTitle: SVGTitleElement = state.make.title();
            therePath.appendChild(thereTitle);
            thereTitle.textContent = `${edge.node1} \u2192 ${edge.node2}`;

            let backPath: SVGPathElement = state.make.path();
            singleEdgeGroup.appendChild(backPath);
            backPath.setAttribute('d',
                `M ${point2.x},${point2.y} ` +
                `C ${point2COut.x},${point2COut.y},${point3CIn.x},${point3CIn.y},${n2Center.x},${n2Center.y}`
            );
            modifyStyle(backPath, {
                'stroke-width': state.config.strokeWidth,
                'fill': 'none',
            });

            let backTitle: SVGTitleElement = state.make.title();
            backPath.appendChild(backTitle);
            backTitle.textContent = `${edge.node2} \u2192 ${edge.node1}`;

            if (edge.metricName in state.currentValues) {
                let currentValue = state.currentValues[edge.metricName];
                modifyStyle(therePath, {
                    'stroke': gradientColorForValue(state.sortedGradient, 'strokeColor', currentValue),
                });
            } else {
                modifyStyle(therePath, {
                    'stroke': 'black',
                    'stroke-dasharray': state.config.noValueDashArray,
                });
            }
            if (edge.metric2Name in state.currentValues) {
                let currentValue = state.currentValues[edge.metric2Name];
                modifyStyle(backPath, {
                    'stroke': gradientColorForValue(state.sortedGradient, 'strokeColor', currentValue),
                });
            } else {
                modifyStyle(backPath, {
                    'stroke': 'black',
                    'stroke-dasharray': state.config.noValueDashArray,
                });
            }

            if (state.config.showNumbers) {
                let quarterPoint = halveCubicBezier(n1Center, point1COut, point2CIn, point2)[3];
                let threeQuarterPoint = halveCubicBezier(point2, point2COut, point3CIn, n2Center)[3];

                let valueString = (edge.metricName in state.currentValues)
                    ? state.currentValues[edge.metricName].toFixed(2)
                    : '?'
                ;
                let text1 = state.make.text();
                singleEdgeGroup.appendChild(text1);
                text1.setAttribute('x', `${quarterPoint.x}`);
                text1.setAttribute('y', `${quarterPoint.y}`);
                text1.textContent = valueString;

                let value2String = (edge.metric2Name in state.currentValues)
                    ? state.currentValues[edge.metric2Name].toFixed(2)
                    : '?'
                ;
                let text2 = state.make.text();
                singleEdgeGroup.appendChild(text2);
                text2.setAttribute('x', `${threeQuarterPoint.x}`);
                text2.setAttribute('y', `${threeQuarterPoint.y}`);
                text2.textContent = value2String;
            }
        } else {
            let edgePath: SVGPathElement = state.make.path();
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
            modifyStyle(edgePath, {
                'stroke-width': state.config.strokeWidth,
                'fill': 'none',
            });

            let edgeTitle: SVGTitleElement = state.make.title();
            edgePath.appendChild(edgeTitle);
            edgeTitle.textContent = `${edge.node2} \u2194 ${edge.node1}`;

            if (edge.metricName in state.currentValues) {
                let currentValue = state.currentValues[edge.metricName];
                modifyStyle(edgePath, {
                    'stroke': gradientColorForValue(state.sortedGradient, 'strokeColor', currentValue),
                });
            } else {
                modifyStyle(edgePath, {
                    'stroke': 'black',
                    'stroke-dasharray': state.config.noValueDashArray,
                });
            }

            if (state.config.showNumbers) {
                let midpoint = halveCubicBezier(n1Center, control1, control2, n2Center)[3];
                let valueString = (edge.metricName in state.currentValues)
                    ? state.currentValues[edge.metricName].toFixed(2)
                    : '?'
                ;
                let text = state.make.text();
                singleEdgeGroup.appendChild(text);
                text.setAttribute('x', `${midpoint.x}`);
                text.setAttribute('y', `${midpoint.y}`);
                text.textContent = valueString;
            }
        }
    }
}

function maybeWrapIntoLink(
    svgMake: SVGElementCreator, upperGroup: SVGGElement, singleObjectGroup: SVGGElement, linkUriBase: string|null,
    objLinkParams: string|null
): void {
    if (linkUriBase) {
        let objLinkUri = linkUriBase;
        if (objLinkParams) {
            objLinkUri += (objLinkUri.indexOf('?') === -1)
                ? '?'
                : '&';
            
            objLinkUri += objLinkParams;
        }

        let aElement: SVGAElement = svgMake.a();
        upperGroup.appendChild(aElement);
        aElement.setAttributeNS(xlinkNamespace, 'href', objLinkUri);

        aElement.appendChild(singleObjectGroup);
    } else {
        upperGroup.appendChild(singleObjectGroup);
    }
}

export function setRectangleDimensions(
    element: SVGRectElement, x: number|string, y: number|string, width: number|string, height: number|string
): void {
    element.setAttribute('x', `${x}`);
    element.setAttribute('y', `${y}`);
    element.setAttribute('width', `${width}`);
    element.setAttribute('height', `${height}`);
}

function modifyStyle(element: Element, newValues: object) {
    // parse style
    let assembledStyle = {};
    if (element.hasAttribute('style')) {
        for (let chunk of element.getAttribute('style').split(';')) {
            let index = chunk.indexOf(':');
            if (index == -1) {
                continue;
            }
            let key = chunk.substr(0, index);
            let value = chunk.substr(index + 1);
            assembledStyle[key] = value;
        }
    }

    for (let key in newValues) {
        if (newValues.hasOwnProperty(key)) {
            if (newValues[key] === null) {
                delete assembledStyle[key];
            } else {
                assembledStyle[key] = newValues[key];
            }
        }
    }

    let keyValuePairs = [];
    for (let key in assembledStyle) {
        if (assembledStyle.hasOwnProperty(key)) {
            keyValuePairs.push(`${key}:${assembledStyle[key]}`);
        }
    }

    let keyValueString = keyValuePairs.join(';');
    element.setAttribute('style', keyValueString);
}


export class WeathermapRendererState {
    make: SVGElementCreator;
    config: WeathermapConfig;
    sortedGradient: Gradient;
    currentValues: MetricValueMap;
    nodeLabelToNode: LabelToNodeMap;
    nodeLinkUriBase: string|null;
    edgeLinkUriBase: string|null;
    defs: SVGDefsElement|null;
    edgeGroup: SVGGElement|null;
    nodeGroup: SVGGElement|null;
    legendGroup: SVGGElement|null;

    constructor(
        domCreator: SVGElementCreatorDOM, config: WeathermapConfig, sortedGradient: Gradient, currentValues: MetricValueMap
    ) {
        this.make = new SVGElementCreator(domCreator);
        this.config = config;
        this.sortedGradient = sortedGradient;
        this.currentValues = currentValues;
        this.nodeLabelToNode = {};
        this.nodeLinkUriBase = null;
        this.edgeLinkUriBase = null;
        this.defs = null;
        this.edgeGroup = null;
        this.nodeGroup = null;
        this.legendGroup = null;
    }
}

export class SVGElementCreator {
    maker: SVGElementCreatorDOM;

    constructor(maker: SVGElementCreatorDOM) { this.maker = maker; }

    a() { return <SVGAElement>this.maker.createElementNS(svgNamespace, 'a'); }
    defs() { return <SVGDefsElement>this.maker.createElementNS(svgNamespace, 'defs'); }
    g() { return <SVGGElement>this.maker.createElementNS(svgNamespace, 'g'); }
    linearGradient() { return <SVGLinearGradientElement>this.maker.createElementNS(svgNamespace, 'linearGradient'); }
    path() { return <SVGPathElement>this.maker.createElementNS(svgNamespace, 'path'); }
    rect() { return <SVGRectElement>this.maker.createElementNS(svgNamespace, 'rect'); }
    stop() { return <SVGStopElement>this.maker.createElementNS(svgNamespace, 'stop'); }
    svg() { return <SVGSVGElement>this.maker.createElementNS(svgNamespace, 'svg'); }
    text() { return <SVGTextElement>this.maker.createElementNS(svgNamespace, 'text'); }
    title() { return <SVGTitleElement>this.maker.createElementNS(svgNamespace, 'title'); }
}

export interface SVGElementCreatorDOM {
    createElementNS(namespaceURI: string, qualifiedName: string): Element;
}

interface WeathermapNode {
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    metricName?: string|null;
    linkParams?: string;
}

interface WeathermapEdge {
    node1: string;
    node2: string;
    bendDirection?: number;
    bendMagnitude?: number;
    metricName?: string;
    metric2Name?: string|null;
    linkParams?: string;
}

interface LinkSettings {
    node: ObjectLinkSettings;
    edge: ObjectLinkSettings;
}

export interface LabelToNodeMap {
    [nodeLabel: string]: WeathermapNode;
}

export interface MetricValueMap {
    [metricName: string]: number;
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
