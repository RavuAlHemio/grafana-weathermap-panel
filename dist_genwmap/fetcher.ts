import { MetricValueMap } from './svg-weathermap/weathermap';
import http = require('http');

export async function fetchMetrics(baseUrl: URL, metrics: PrometheusMetric[], lookback_interval: string): Promise<MetricValueMap> {
    // query
    let agent = new http.Agent();

    let metricValueMap = {};

    for (let metric of metrics) {
        let metricQueryEscaped = encodeURIComponent(metric.expr.replace('$lookback_interval', lookback_interval));
        let metricUrl = new URL(`api/v1/query?query=${metricQueryEscaped}`, baseUrl);

        let [response, body] = await httpGetAsync(
            metricUrl.protocol, metricUrl.hostname, +metricUrl.port, metricUrl.pathname + metricUrl.search, agent
        );
        let metricData = JSON.parse(body);

        for (let result of metricData.data.result) {
            let labels = result.metric;
            let value = result.value[1];

            let key = interpolateLabels(metric.legendFormat, labels);
            metricValueMap[key] = value;
        }

        response.destroy();
    }

    agent.destroy();

    return metricValueMap;
}

function interpolateLabels(template: string, labels: object): string {
    let output = template;
    for (;;) {
        let nextBracesIndex = output.indexOf('{{');
        if (nextBracesIndex == -1) {
            return output;
        }

        let endBracesIndex = output.indexOf('}}', nextBracesIndex);
        if (endBracesIndex == -1) {
            return output;
        }

        let variableName = output.substr(nextBracesIndex + 2, endBracesIndex - nextBracesIndex - 2);
        let variableValue = variableName in labels
            ? labels[variableName]
            : '';

        output = output.substr(0, nextBracesIndex) + variableValue + output.substr(endBracesIndex + 2);
    }
}

function httpGetAsync(
    protocol: string, hostname: string, port: number, path: string, agent: http.Agent
): Promise<[http.IncomingMessage, string]> {
    return new Promise<[http.IncomingMessage, string]>(function (resolve, reject) {
        let options = {
            protocol: protocol,
            hostname: hostname,
            port: port,
            path: path,
            agent: agent
        };
        let req = http.request(options, function (res) {
            let body = '';
            res.on('data', function (chunk) {
                body += chunk;
            });
            res.on('end', function () {
                resolve([res, body]);
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
        req.end();
    });
}

export interface PrometheusMetric {
    expr: string;
    legendFormat: string;
}
