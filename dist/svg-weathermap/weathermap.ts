import { svgNamespace, xlinkNamespace } from "./constants";
import { deg2rad, halveCubicBezier, normalizeAngle, Point2D, polarToCartesian, unitVector } from "./geometry";
import { Gradient, GradientStop, gradientColorForValue } from "./gradients";
import { LegendSettings, placeLegend } from "./legend";

export function renderWeathermapInto(
    elementCreator: SVGElementCreatorDOM, container: Node, config: WeathermapConfig, currentValues: MetricValueMap,
    linkResolver: ((linkSettings: ObjectLinkSettings) => string|null)|null|undefined, addViewBox: boolean = false
): SVGSVGElement {
    // sort gradient stops
    let sortedStops: GradientStop[] = config.gradient.stops
        .slice()
        .sort((l, r) => l.position - r.position);
    let sortedGradient: Gradient = {
        type: config.gradient.type,
        stops: sortedStops
    };

    let state = new WeathermapRendererState(elementCreator, config, sortedGradient, currentValues);

    initializeSVG(state, container, addViewBox);

    // resolve links
    if (linkResolver != null) {
        state.nodeLinkUriBase = linkResolver(config.link.node);
        state.edgeLinkUriBase = linkResolver(config.link.edge);
    }

    // emplacement
    placeNodes(state);
    placeEdges(state);
    placeLabels(state);
    placeLegend(state.make, config.legend, state.legendGroup!, state.defs!, sortedGradient, `${config.id}`);

    return state.svg!;
}

function initializeSVG(state: WeathermapRendererState, container: Node, addViewBox: boolean = false): void {
    // add SVG
    state.svg = state.make.svg();
    modifyStyle(state.svg, {
        "width": `${state.config.canvasSize.width}px`,
        "height": `${state.config.canvasSize.height}px`,
    });
    if (addViewBox) {
        state.svg.setAttribute("viewBox", `0 0 ${state.config.canvasSize.width} ${state.config.canvasSize.height}`);
    }
    container.appendChild(state.svg);

    state.defs = state.make.defs();
    state.svg.appendChild(state.defs);

    state.legendGroup = state.make.g();
    state.legendGroup.setAttribute("class", "legend");
    state.svg.appendChild(state.legendGroup);

    state.edgeGroup = state.make.g();
    state.edgeGroup.setAttribute("class", "edges");
    state.svg.appendChild(state.edgeGroup);

    state.nodeGroup = state.make.g();
    state.nodeGroup.setAttribute("class", "nodes");
    state.svg.appendChild(state.nodeGroup);

    state.labelGroup = state.make.g();
    state.labelGroup.setAttribute("class", "labels");
    state.svg.appendChild(state.labelGroup);
}

function placeNodes(state: WeathermapRendererState): void {
    for (let node of state.config.weathermapNodes) {
        state.nodeLabelToNode[node.label] = node;

        let singleNodeGroup: SVGGElement = state.make.g();
        maybeWrapIntoLink(state.make, state.nodeGroup!, singleNodeGroup, state.nodeLinkUriBase, node.linkParams);

        let rect: SVGRectElement = state.make.rect();
        singleNodeGroup.appendChild(rect);

        setRectangleDimensions(rect, node.x, node.y, node.width, node.height);
        modifyStyle(rect, {
            "stroke": "gray",
            "stroke-width": "1px",
        });

        let text: SVGTextElement = state.make.text();
        singleNodeGroup.appendChild(text);

        text.setAttribute("x", `${(+node.x) + (+state.config.textOffsets.left)}`);
        text.setAttribute("y", `${(+node.y) + (+node.height) - state.config.textOffsets.bottom}`);
        if (state.config.showNumbers && node.metricName != null) {
            let value: string = (node.metricName in state.currentValues)
                ? `${state.currentValues[node.metricName]}`
                : "?"
            ;
            text.textContent = `${node.label} (${value})`;
        } else {
            text.textContent = node.label;
        }

        if (!node.metricName) {
            modifyStyle(rect, {
                "fill": "silver",
                "stroke-dasharray": state.config.unmeasuredDashArray,
            });
        } else if (node.metricName in state.currentValues) {
            // color node by metric
            let currentValue: number = state.currentValues[node.metricName];
            modifyStyle(rect, {
                "fill": gradientColorForValue(state.sortedGradient, "fillColor", currentValue),
            });
        } else {
            // no data
            modifyStyle(text, {
                "fill": "white",
            });
            modifyStyle(rect, {
                "fill": "black",
                "stroke-dasharray": state.config.noValueDashArray,
            });
        }
    }
}

function placeEdges(state: WeathermapRendererState): void {
    // place edges
    for (let edge of state.config.weathermapEdges) {
        let node1: WeathermapNode = state.nodeLabelToNode[edge.node1];
        let node2: WeathermapNode = state.nodeLabelToNode[edge.node2];
        if (!node1 || !node2) {
            // TODO: output error
            continue;
        }

        let singleEdgeGroup: SVGGElement = state.make.g();
        maybeWrapIntoLink(state.make, state.edgeGroup!, singleEdgeGroup, state.edgeLinkUriBase, edge.linkParams);

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
            let n1N2Angle: number = Math.atan2(n1Center.y - n2Center.y, n2Center.x - n1Center.x);
            let n2N1Angle: number = Math.atan2(n2Center.y - n1Center.y, n1Center.x - n2Center.x);

            let n1N2BendAngle: number = normalizeAngle(n1N2Angle + deg2rad(edge.bendDirection));
            let n2N1BendAngle: number = normalizeAngle(n2N1Angle - deg2rad(edge.bendDirection));

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
            let
                [_point1, point1COut, point2CIn, point2, point2COut, point3CIn, _point2]
            =
                halveCubicBezier(n1Center, control1, control2, n2Center)
            ;

            makeAndPlaceEdge(
                state, singleEdgeGroup,
                n1Center, point1COut, point2CIn, point2,
                edge.metricName, edge.styleName,
                `${edge.node1} \u2192 ${edge.node2}`
            );

            makeAndPlaceEdge(
                state, singleEdgeGroup,
                point2, point2COut, point3CIn, n2Center,
                edge.metric2Name, edge.styleName,
                `${edge.node2} \u2192 ${edge.node1}`
            );
        } else {
            makeAndPlaceEdge(
                state, singleEdgeGroup,
                n1Center, control1, control2, n2Center,
                edge.metricName, edge.styleName,
                `${edge.node1} \u2194 ${edge.node2}`
            );
        }
    }
}

function placeLabels(state: WeathermapRendererState): void {
    for (let label of state.config.weathermapLabels) {
        let singleLabelGroup: SVGGElement = state.make.g();
        state.labelGroup!.appendChild(singleLabelGroup);

        let text: SVGTextElement = state.make.text();
        singleLabelGroup.appendChild(text);

        text.setAttribute("x", `${+label.x}`);
        text.setAttribute("y", `${+label.y}`);
        text.textContent = label.label;
    }
}

function makeAndPlaceEdge(
    state: WeathermapRendererState, singleEdgeGroup: SVGGElement, start: Point2D, control1: Point2D|null,
    control2: Point2D|null, end: Point2D, metricName: string|null|undefined, edgeStyleName: string|null|undefined,
    title: string|null|undefined
): void {
    let strokeWidths: number[] = [state.config.strokeWidth];
    let edgeStyle: WeathermapStyle|null = getWeathermapStyle(state, edgeStyleName);
    if (edgeStyle && edgeStyle.strokeWidthArray) {
        let pieces: string[] = edgeStyle.strokeWidthArray.split(/[ ,]+/);
        strokeWidths = pieces.map(p => Number.parseFloat(p));
    }

    if (strokeWidths.length % 2 !== 1) {
        // like stroke-dasharray, double the elements
        strokeWidths.push(...strokeWidths);
    }

    let offsetUnitVector: Point2D = {x: 0, y: 0};
    if (strokeWidths.length > 1) {
        // calculate an actual offset vector

        // get the direction
        let direction: Point2D = {
            x: start.x - end.x,
            y: start.y - end.y
        };

        // rotate 90°; that's the offset vector
        let offsetVector: Point2D = {
            x: direction.y,
            y: -direction.x
        };

        // calculate unit vector
        offsetUnitVector = unitVector(offsetVector);
    }

    let multistrokeGroup: SVGGElement = state.make.g();
    singleEdgeGroup.appendChild(multistrokeGroup);
    modifyStyle(multistrokeGroup, {
        "fill": "none",
    });

    if (title) {
        let titleElem: SVGTitleElement = state.make.title();
        multistrokeGroup.appendChild(titleElem);
        titleElem.textContent = title;
    }

    if (metricName != null && metricName in state.currentValues) {
        let currentValue: number = state.currentValues[metricName];
        modifyStyle(multistrokeGroup, {
            "stroke": gradientColorForValue(state.sortedGradient, "strokeColor", currentValue)
        });
        modifyApplyingWeathermapStyle(state, multistrokeGroup, edgeStyle);
    } else {
        modifyStyle(multistrokeGroup, {
            "stroke": "black",
            "stroke-dasharray": state.config.noValueDashArray
        });
    }

    let totalStrokeWidth: number = strokeWidths.reduce((acc, cur) => acc + cur, 0);
    let currentOffset: number = -totalStrokeWidth/2.0;
    let isSpacing: boolean = true;
    for (let strokeWidth of strokeWidths) {
        isSpacing = !isSpacing;
        if (isSpacing) {
            currentOffset += strokeWidth;
            continue;
        }

        // calculate offset
        let xOffset: number = offsetUnitVector.x * (currentOffset + strokeWidth/2.0);
        let yOffset: number = offsetUnitVector.y * (currentOffset + strokeWidth/2.0);

        let strokeStart: Point2D = {
            x: start.x + xOffset,
            y: start.y + yOffset,
        };
        let strokeControl1: Point2D|null = (control1 == null) ? null : {
            x: control1.x + xOffset,
            y: control1.y + yOffset,
        };
        let strokeControl2: Point2D|null = (control2 == null) ? null : {
            x: control2.x + xOffset,
            y: control2.y + yOffset,
        };
        let strokeEnd: Point2D = {
            x: end.x + xOffset,
            y: end.y + yOffset,
        };

        // make the path
        let path: SVGPathElement = state.make.path();
        multistrokeGroup.appendChild(path);
        if (strokeControl1 == null || strokeControl2 == null) {
            path.setAttribute("d",
                `M ${strokeStart.x},${strokeStart.y} ` +
                `L ${strokeEnd.x},${strokeEnd.y}`
            );
        } else {
            path.setAttribute("d",
                `M ${strokeStart.x},${strokeStart.y} ` +
                `C ${strokeControl1.x},${strokeControl1.y},${strokeControl2.x},${strokeControl2.y},${strokeEnd.x},${strokeEnd.y}`
            );
        }

        // apply the specific stroke width
        modifyStyle(path, {
            "stroke-width": `${strokeWidth}`,
        });

        currentOffset += strokeWidth;
    }

    if (state.config.showNumbers) {
        let midpoint: Point2D = halveCubicBezier(start, control1, control2, end)[3];
        let valueString: string = (metricName != null && metricName in state.currentValues)
            ? state.currentValues[metricName].toFixed(2)
            : "?"
        ;
        let text: SVGTextElement = state.make.text();
        singleEdgeGroup.appendChild(text);
        text.setAttribute("x", `${midpoint.x}`);
        text.setAttribute("y", `${midpoint.y}`);
        text.textContent = valueString;
    }
}

function maybeWrapIntoLink(
    svgMake: SVGElementCreator, upperGroup: SVGGElement, singleObjectGroup: SVGGElement,
    linkUriBase: string|null|undefined, objLinkParams: string|null|undefined
): void {
    if (linkUriBase != null) {
        let objLinkUri: string = linkUriBase;
        if (objLinkParams != null) {
            objLinkUri += (objLinkUri.indexOf("?") === -1)
                ? "?"
                : "&";

            objLinkUri += objLinkParams;
        }

        let aElement: SVGAElement = svgMake.a();
        upperGroup.appendChild(aElement);
        aElement.setAttributeNS(xlinkNamespace, "href", objLinkUri);

        aElement.appendChild(singleObjectGroup);
    } else {
        upperGroup.appendChild(singleObjectGroup);
    }
}

export function setRectangleDimensions(
    element: SVGRectElement, x: number|string, y: number|string, width: number|string, height: number|string
): void {
    element.setAttribute("x", `${x}`);
    element.setAttribute("y", `${y}`);
    element.setAttribute("width", `${width}`);
    element.setAttribute("height", `${height}`);
}

function modifyStyle(element: Element, newValues: object): void {
    // parse style
    let assembledStyle: StringMapping<string> = {};
    if (element.hasAttribute("style")) {
        let styleVal: string|null = element.getAttribute("style");
        if (styleVal != null) {
            for (let chunk of styleVal.split(";")) {
                let index: number = chunk.indexOf(":");
                if (index === -1) {
                    continue;
                }
                let key: string = chunk.substr(0, index);
                let value: string = chunk.substr(index + 1);
                assembledStyle[key] = value;
            }
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

    let keyValuePairs: string[] = [];
    for (let key in assembledStyle) {
        if (assembledStyle.hasOwnProperty(key)) {
            keyValuePairs.push(`${key}:${assembledStyle[key]}`);
        }
    }

    let keyValueString: string = keyValuePairs.join(";");
    element.setAttribute("style", keyValueString);
}

function getWeathermapStyle(
    state: WeathermapRendererState, styleName: string|null|undefined
): WeathermapStyle|null {
    if (!styleName) {
        return null;
    }

    let style: WeathermapStyle|undefined = state.styleMap[styleName];
    if (!style) {
        return null;
    }
    return style;
}

function modifyApplyingWeathermapStyle(
    state: WeathermapRendererState, element: Element, style: WeathermapStyle|null
): void {
    if (!style) {
        return;
    }

    let styleProps: StringMapping<string> = {};
    if (style.dashArray) {
        styleProps["stroke-dasharray"] = style.dashArray;
    }
    // style.strokeWidthArray is handled beforehand

    modifyStyle(element, styleProps);
}


export class WeathermapRendererState {
    make: SVGElementCreator;
    config: WeathermapConfig;
    sortedGradient: Gradient;
    currentValues: MetricValueMap;
    nodeLabelToNode: LabelToNodeMap;
    nodeLinkUriBase: string|null;
    edgeLinkUriBase: string|null;
    svg: SVGSVGElement|null;
    defs: SVGDefsElement|null;
    edgeGroup: SVGGElement|null;
    nodeGroup: SVGGElement|null;
    labelGroup: SVGGElement|null;
    legendGroup: SVGGElement|null;
    styleMap: NameToStyleMap;

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
        this.svg = null;
        this.defs = null;
        this.edgeGroup = null;
        this.nodeGroup = null;
        this.labelGroup = null;
        this.legendGroup = null;

        this.styleMap = {};
        if (config.weathermapStyles) {
            for (let style of config.weathermapStyles) {
                this.styleMap[style.name] = style;
            }
        }
    }
}

export class SVGElementCreator {
    maker: SVGElementCreatorDOM;

    constructor(maker: SVGElementCreatorDOM) { this.maker = maker; }

    a() { return <SVGAElement>this.maker.createElementNS(svgNamespace, "a"); }
    defs() { return <SVGDefsElement>this.maker.createElementNS(svgNamespace, "defs"); }
    g() { return <SVGGElement>this.maker.createElementNS(svgNamespace, "g"); }
    linearGradient() { return <SVGLinearGradientElement>this.maker.createElementNS(svgNamespace, "linearGradient"); }
    path() { return <SVGPathElement>this.maker.createElementNS(svgNamespace, "path"); }
    rect() { return <SVGRectElement>this.maker.createElementNS(svgNamespace, "rect"); }
    stop() { return <SVGStopElement>this.maker.createElementNS(svgNamespace, "stop"); }
    svg() { return <SVGSVGElement>this.maker.createElementNS(svgNamespace, "svg"); }
    text() { return <SVGTextElement>this.maker.createElementNS(svgNamespace, "text"); }
    title() { return <SVGTitleElement>this.maker.createElementNS(svgNamespace, "title"); }
}

export interface SVGElementCreatorDOM {
    createElementNS(namespaceURI: string, qualifiedName: string): Element;
}

interface PositionableTextElement {
    label: string;
    x: number;
    y: number;
}

export interface WeathermapNode extends PositionableTextElement {
    width: number;
    height: number;
    metricName?: string|null;
    linkParams?: string;
}

export interface WeathermapEdge {
    node1: string;
    node2: string;
    bendDirection?: number;
    bendMagnitude?: number;
    metricName?: string;
    metric2Name?: string|null;
    linkParams?: string;
    styleName?: string;
}

export interface WeathermapLabel extends PositionableTextElement {
}

export interface WeathermapStyle {
    name: string;
    strokeWidthArray?: string;
    dashArray?: string;
}

interface LinkSettings {
    node: ObjectLinkSettings;
    edge: ObjectLinkSettings;
}

export interface StringMapping<V> {
    [key: string]: V;
}

export type LabelToNodeMap = StringMapping<WeathermapNode>;
export type MetricValueMap = StringMapping<number>;
export type NameToStyleMap = StringMapping<WeathermapStyle>;

export interface ObjectLinkSettings {
    type: "none"|"dashboard"|"absolute";
    dashboard: string|null;
    dashUri: string|null;
    absoluteUri: string|null;
}

export interface WeathermapDefaultConfig {
    weathermapEdges: WeathermapEdge[];
    weathermapNodes: WeathermapNode[];
    weathermapLabels: WeathermapLabel[];
    weathermapStyles: WeathermapStyle[];
    canvasSize: { width: number; height: number; };
    textOffsets: { left: number; bottom: number; };
    showNumbers: boolean;
    valueName: "max"|"min"|"avg"|"current"|"total";
    nullPointMode: "connected"|"null"|"null as zero";
    strokeWidth: number;
    gradient: Gradient;
    legend: LegendSettings;
    link: LinkSettings;
    noValueDashArray: string;
    unmeasuredDashArray: string;
}

export interface WeathermapConfig extends WeathermapDefaultConfig {
    id: number;
}
