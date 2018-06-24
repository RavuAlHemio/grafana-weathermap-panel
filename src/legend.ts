import { Gradient, GradientStop } from './gradients';
import { svgNamespace } from './properties';

const legendLength = 100;
const legendWidth = 5;
// (let the container apply any transformations)

export function placeLegend(settings: LegendSettings, gradient: Gradient, container: SVGElement) {
    let transform = '';

    if (settings.type == '') {
        // no legend
        return;
    }

    // draw stroke-color legend
    let strokeLegendContainer: SVGGElement = document.createElementNS(svgNamespace, 'g');
    container.appendChild(strokeLegendContainer);
    strokeLegendContainer.classList.add('stroke-legend');
    if (settings.type[0] == 'h') {
        transform = `translate(${settings.x} ${settings.y}) scale(${settings.length/legendLength} ${settings.width/legendWidth})`;
    } else if (settings.type[0] == 'v') {
        transform = `translate(${settings.x} ${settings.y + settings.length}) rotate(-90) scale(${settings.length/legendLength} ${settings.width/legendWidth})`;
    }
    strokeLegendContainer.setAttribute('transform', transform);
    drawLegend(gradient, 'strokeColor', strokeLegendContainer);

    // draw fill-color legend
    let fillLegendContainer: SVGGElement = document.createElementNS(svgNamespace, 'g');
    container.appendChild(fillLegendContainer);
    fillLegendContainer.classList.add('fill-legend');
    if (settings.type[0] == 'h') {
        transform = `translate(${settings.x} ${settings.y + settings.width}) scale(${settings.length/legendLength} ${settings.width/legendWidth})`;
    } else if (settings.type[0] == 'v') {
        transform = `translate(${settings.x + settings.width} ${settings.y + settings.length}) rotate(-90) scale(${settings.length/legendLength} ${settings.width/legendWidth})`;
    }
    fillLegendContainer.setAttribute('transform', transform);
    drawLegend(gradient, 'fillColor', fillLegendContainer);

    // draw legend labels
    placeLabels(settings, gradient, container);
}

function drawLegend(gradient: Gradient, colorType: keyof GradientStop, container: SVGElement): void {
    if (gradient.type == 'linear') {
        let legendGradientName = `WeathermapLegendGradient-${colorType}`;

        let svgGrad = document.createElementNS(svgNamespace, "linearGradient");
        container.appendChild(svgGrad);
        svgGrad.id = legendGradientName;
        
        for (let stop of gradient.stops) {
            let svgStop = document.createElementNS(svgNamespace, "stop");
            svgGrad.appendChild(svgStop);
            svgStop.setAttribute('offset', `${stop.position}%`);
            svgStop.setAttribute('stop-color', `${stop[colorType]}`);
        }

        let svgRect = document.createElementNS(svgNamespace, "rect");
        container.appendChild(svgRect);
        svgRect.setAttribute('x', '0');
        svgRect.setAttribute('y', '0');
        svgRect.setAttribute('width', `${legendLength}`);
        svgRect.setAttribute('height', `${legendWidth}`);
        svgRect.style.fill = `url(#${legendGradientName})`;
    } else if (gradient.type == 'steps') {
        for (let i = 1; i < gradient.stops.length; ++i) {
            let rect = document.createElementNS(svgNamespace, "rect");
            container.appendChild(rect);
            rect.setAttribute('x', `${gradient.stops[i-1].position}`);
            rect.setAttribute('y', '0');
            rect.setAttribute('width', `${gradient.stops[i].position - gradient.stops[i-1].position}`);
            rect.setAttribute('height', `${legendWidth}`);
            rect.style.fill = `${gradient.stops[i-1][colorType]}`;
        }
        let rect = document.createElementNS(svgNamespace, "rect");
        container.appendChild(rect);
        rect.setAttribute('x', `${gradient.stops[gradient.stops.length-1].position}`);
        rect.setAttribute('y', '0');
        rect.setAttribute('width', `${100 - gradient.stops[gradient.stops.length-1].position}`);
        rect.setAttribute('height', `${legendWidth}`);
        rect.style.fill = `${gradient.stops[gradient.stops.length-1][colorType]}`;
    }
}

function placeLabels(settings: LegendSettings, gradient: Gradient, container: SVGElement) {
    if (settings.type == '' || settings.type[1] == 'n') {
        // no labels
        return;
    }

    for (let stop of gradient.stops) {
        let xCoord = settings.x;
        let yCoord = settings.y;
        let dy = 0.0;
        let textAnchor = 'start';

        if (settings.type[0] == 'h') {
            // horizontal scale
            xCoord += stop.position * settings.length / legendLength;

            textAnchor = 'middle';
            if (settings.type == 'hb') {
                yCoord += 2 * settings.width;
                dy = 1.0;
            }
        } else if (settings.type[0] == 'v') {
            // vertical scale
            yCoord += settings.length - (stop.position * settings.length / legendLength);
            dy = 0.4;

            if (settings.type == 'vl') {
                textAnchor = 'end';
            } else if (settings.type == 'vr') {
                textAnchor = 'start';
                xCoord += 2 * settings.width;
            }
        }

        let label = document.createElementNS(svgNamespace, 'text');
        container.appendChild(label);
        label.classList.add('legend-label');
        label.setAttribute('x', `${xCoord}`);
        label.setAttribute('y', `${yCoord}`);
        label.setAttribute('dy', `${dy}em`);
        label.style.textAnchor = textAnchor;
        label.textContent = `${stop.position}`;
    }
}

export interface LegendSettings {
    type: ''|'hn'|'ha'|'hb'|'vn'|'vl'|'vr';
    x: number;
    y: number;
    length: number;
    width: number;
}
