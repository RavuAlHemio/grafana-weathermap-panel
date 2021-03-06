import { Gradient, GradientStop } from "./gradients";
import { SVGElementCreator, setRectangleDimensions } from "./weathermap";

const legendLength: number = 100;
const legendWidth: number = 5;
// (let the container apply any transformations)

export function placeLegend(
    svgMake: SVGElementCreator, settings: LegendSettings, container: Element, defs: SVGDefsElement, gradient: Gradient,
    weathermapID?: string|null
): void {
    let transform: string = "";

    if (settings.type === "") {
        // no legend
        return;
    }

    // draw stroke-color legend
    let strokeLegendContainer: SVGGElement = svgMake.g();
    container.appendChild(strokeLegendContainer);
    strokeLegendContainer.setAttribute("class", "stroke-legend");
    if (settings.type[0] === "h") {
        transform =
            `translate(${settings.x} ${settings.y})`
            + ` scale(${settings.length/legendLength} ${settings.width/legendWidth})`
        ;
    } else if (settings.type[0] === "v") {
        transform =
            `translate(${settings.x} ${settings.y + settings.length})`
            + ` rotate(-90)`
            + ` scale(${settings.length/legendLength} ${settings.width/legendWidth})`
        ;
    }
    strokeLegendContainer.setAttribute("transform", transform);
    drawLegend(svgMake, gradient, "strokeColor", strokeLegendContainer, defs, weathermapID);

    // draw fill-color legend
    let fillLegendContainer: SVGGElement = svgMake.g();
    container.appendChild(fillLegendContainer);
    strokeLegendContainer.setAttribute("class", "fill-legend");
    if (settings.type[0] === "h") {
        transform =
            `translate(${settings.x} ${settings.y + settings.width})`
            + ` scale(${settings.length/legendLength} ${settings.width/legendWidth})`
        ;
    } else if (settings.type[0] === "v") {
        transform =
            `translate(${settings.x + settings.width} ${settings.y + settings.length})`
            + ` rotate(-90)`
            + ` scale(${settings.length/legendLength} ${settings.width/legendWidth})`
        ;
    }
    fillLegendContainer.setAttribute("transform", transform);
    drawLegend(svgMake, gradient, "fillColor", fillLegendContainer, defs, weathermapID);

    // draw legend labels
    placeLabels(svgMake, settings, gradient, container);
}

function drawLegend(
    svgMake: SVGElementCreator, gradient: Gradient, colorType: keyof GradientStop, container: SVGElement,
    defs: SVGDefsElement, weathermapID?: string|null
): void {
    if (gradient.type === "linear") {
        let legendGradientName: string = `WeathermapLegendGradient-${colorType}`;
        if (weathermapID != null) {
            legendGradientName = `${legendGradientName}-${weathermapID}`;
        }

        let svgGrad: SVGLinearGradientElement = svgMake.linearGradient();
        defs.appendChild(svgGrad);
        svgGrad.setAttribute("id", legendGradientName);

        for (let stop of gradient.stops) {
            let svgStop: SVGStopElement = svgMake.stop();
            svgGrad.appendChild(svgStop);
            svgStop.setAttribute("offset", `${stop.position}%`);
            svgStop.setAttribute("stop-color", `${stop[colorType]}`);
        }

        let svgRect: SVGRectElement = svgMake.rect();
        container.appendChild(svgRect);
        setRectangleDimensions(svgRect, 0, 0, legendLength, legendWidth);
        svgRect.setAttribute("style", `fill:url(#${legendGradientName})`);
    } else if (gradient.type === "steps") {
        for (let i: number = 1; i < gradient.stops.length; ++i) {
            let rect: SVGRectElement = svgMake.rect();
            container.appendChild(rect);

            setRectangleDimensions(rect,
                gradient.stops[i-1].position,
                0,
                gradient.stops[i].position - gradient.stops[i-1].position,
                legendWidth
            );
            rect.setAttribute("style", `fill:${gradient.stops[i-1][colorType]}`);
        }
        let rect: SVGRectElement = svgMake.rect();
        container.appendChild(rect);
        setRectangleDimensions(rect,
            gradient.stops[gradient.stops.length-1].position,
            0,
            100 - gradient.stops[gradient.stops.length-1].position,
            legendWidth
        );
        rect.setAttribute("style", `fill:${gradient.stops[gradient.stops.length-1][colorType]}`);
    }
}

function placeLabels(svgMake: SVGElementCreator, settings: LegendSettings, gradient: Gradient, container: Element): void {
    if (settings.type === "" || settings.type[1] === "n") {
        // no labels
        return;
    }

    for (let stop of gradient.stops) {
        if (!stop.showLegendLabel) {
            continue;
        }

        let xCoord: number = settings.x;
        let yCoord: number = settings.y;
        let dy: number = 0.0;
        let textAnchor: "start"|"middle"|"end" = "start";

        if (settings.type[0] === "h") {
            // horizontal scale
            xCoord += stop.position * settings.length / legendLength;

            textAnchor = "middle";
            if (settings.type === "hb") {
                yCoord += 2 * settings.width;
                dy = 1.0;
            }
        } else if (settings.type[0] === "v") {
            // vertical scale
            yCoord += settings.length - (stop.position * settings.length / legendLength);
            dy = 0.4;

            if (settings.type === "vl") {
                textAnchor = "end";
            } else if (settings.type === "vr") {
                textAnchor = "start";
                xCoord += 2 * settings.width;
            }
        }

        let label: SVGTextElement = svgMake.text();
        container.appendChild(label);
        label.setAttribute("class", "legend-label");
        label.setAttribute("x", `${xCoord}`);
        label.setAttribute("y", `${yCoord}`);
        label.setAttribute("dy", `${dy}em`);
        label.setAttribute("style", `text-anchor:${textAnchor}`);
        label.textContent = `${stop.position}`;
    }
}

export interface LegendSettings {
    type: ""|"hn"|"ha"|"hb"|"vn"|"vl"|"vr";
    x: number;
    y: number;
    length: number;
    width: number;
}
