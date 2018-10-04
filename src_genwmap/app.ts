import { svgNamespace } from './svg-weathermap/constants';
import { WeathermapConfig, renderWeathermapInto } from './svg-weathermap/weathermap';
import { DOMImplementation, XMLSerializer } from 'xmldom';
import { PrometheusMetric, fetchMetrics } from './fetcher';
import fs = require('fs');

let options = {
    configFile: 'genwmap.json',
    outputFile: 'weathermap.svg'
};

function printUsage(): void {
    console.error("Usage: genwmap [-c CONFIG.json] [-o OUTPUT.svg]");
}

function processOptions(): boolean {
    let awaiting: string|null = null;

    for (let i = 2; i < process.argv.length; ++i) {
        let arg = process.argv[i];

        if (awaiting === null) {
            if (arg == "-c" || arg == "-o") {
                awaiting = arg;
            } else {
                console.error(`Unknown option '${arg}'`);
                printUsage();
                return false;
            }
        } else {
            if (awaiting == "-c") {
                options.configFile = arg;
            } else if (awaiting == "-o") {
                options.outputFile = arg;
            }
            awaiting = null;
        }
    }

    if (awaiting !== null) {
        console.error(`No value specified for option '${awaiting}'`);
        printUsage();
        return false;
    }

    return true;
}

export async function main(): Promise<void> {
    if (!processOptions()) {
        process.exitCode = 1;
        return;
    }

    let configString = await readFileAsync(options.configFile);
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
    await writeFileAsync(options.outputFile, outputString, {});
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
