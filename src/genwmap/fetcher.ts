import { MetricValueMap } from "../svg-weathermap/weathermap";
import * as http from "http";

export async function fetchMetrics(baseUrl: URL, metrics: PrometheusMetric[], lookback_interval: string): Promise<MetricValueMap> {
    // query
    let agent = new http.Agent();

    let metricValueMap = {};

    for (let metric of metrics) {
        let metricQueryEscaped: string = encodeURIComponent(
            metric.expr
                .replace("$lookback_interval", lookback_interval)
                .replace("$__range", lookback_interval)
        );
        let metricUrl = new URL(`api/v1/query?query=${metricQueryEscaped}`, baseUrl);

        let [response, body] = await httpGetAsync(
            metricUrl.protocol, metricUrl.hostname, +metricUrl.port, metricUrl.pathname + metricUrl.search, agent
        );
        let metricData: any = JSON.parse(body);

        for (let result of metricData.data.result) {
            let labels: any = result.metric;
            let value: number = +result.value[1];

            let key: string = interpolateLabels(metric.legendFormat, labels);
            metricValueMap[key] = value;
        }

        response.destroy();
    }

    agent.destroy();

    return metricValueMap;
}

function interpolateLabels(template: string, labels: object): string {
    let output: string = template;
    for (;;) {
        let nextBracesIndex: number = output.indexOf("{{");
        if (nextBracesIndex === -1) {
            return output;
        }

        let endBracesIndex: number = output.indexOf("}}", nextBracesIndex);
        if (endBracesIndex === -1) {
            return output;
        }

        let variableName: string = output.substr(nextBracesIndex + 2, endBracesIndex - nextBracesIndex - 2);
        let variableValue: string = variableName in labels
            ? labels[variableName]
            : "";

        output = output.substr(0, nextBracesIndex) + variableValue + output.substr(endBracesIndex + 2);
    }
}

function httpGetAsync(
    protocol: string, hostname: string, port: number, path: string, agent: http.Agent
): Promise<[http.IncomingMessage, string]> {
    return new Promise<[http.IncomingMessage, string]>((resolve, reject) => {
        let options: object = {
            protocol: protocol,
            hostname: hostname,
            port: port,
            path: path,
            agent: agent
        };
        let req: http.ClientRequest = http.request(options, res => {
            let body: string = "";
            res.on("data", chunk => {
                body += chunk;
            });
            res.on("end", () => {
                resolve([res, body]);
            });
        });
        req.on("error", err => {
            reject(err);
        });
        req.end();
    });
}

export interface PrometheusMetric {
    expr: string;
    legendFormat: string;
}
