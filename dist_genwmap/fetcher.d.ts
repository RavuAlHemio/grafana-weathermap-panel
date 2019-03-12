import { MetricValueMap } from "./svg-weathermap/weathermap";
export declare function fetchMetrics(baseUrl: URL, metrics: PrometheusMetric[], lookback_interval: string): Promise<MetricValueMap>;
export interface PrometheusMetric {
    expr: string;
    legendFormat: string;
}
