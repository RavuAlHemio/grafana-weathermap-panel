import { svgNamespace } from './svg-weathermap/constants';
import { WeathermapConfig, renderWeathermapInto } from './svg-weathermap/weathermap';
import { DOMImplementation, XMLSerializer } from 'xmldom';
import { PrometheusMetric, fetchMetrics } from './fetcher';
import fs = require('fs');

export async function main(): Promise<void> {
    let configString = await readFileAsync('genwmap.json');
    let config = JSON.parse(configString);

    let weathermap: WeathermapConfig = config.weathermap;
    let metrics: PrometheusMetric[] = config.weathermap.targets;
    let dataSources: { [index: string]: string; } = config.dataSources;
    let lookbackInterval: string = config.lookbackInterval;
    let styleDefinition: string|null = config.styleDefinition;

    let metricValues = await fetchMetrics(new URL(dataSources[config.weathermap.datasource]), metrics, lookbackInterval);

    let impl = new DOMImplementation();
    let doc = impl.createDocument(null, null, null);

    const nullLinkResolver = null;
    const addViewBox = true;
    let svg: SVGSVGElement = renderWeathermapInto(doc, doc, weathermap, metricValues, nullLinkResolver, addViewBox);
    if (styleDefinition) {
        let svgStyle: SVGStyleElement = doc.createElementNS(svgNamespace, 'style');
        svg.insertBefore(svgStyle, svg.firstElementChild);
        svgStyle.setAttribute('type', 'text/css');
        svgStyle.textContent = styleDefinition;
    }

    let outputter = new XMLSerializer();
    let outputString = outputter.serializeToString(doc);
    await writeFileAsync('weathermap.svg', outputString, {});
}

function readFileAsync(path: string): Promise<string> {
    return new Promise<string>(function (resolve, reject) {
        fs.readFile(path, { encoding: 'utf8' }, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function writeFileAsync(path: string, data: string, options: {}): Promise<void> {
    return new Promise<void>(function (resolve, reject) {
        fs.writeFile(path, data, options, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
