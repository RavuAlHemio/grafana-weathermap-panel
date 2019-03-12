"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
function fetchMetrics(baseUrl, metrics, lookback_interval) {
    return __awaiter(this, void 0, void 0, function () {
        var agent, metricValueMap, _i, metrics_1, metric, metricQueryEscaped, metricUrl, _a, response, body, metricData, _b, _c, result, labels, value, key;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    agent = new http.Agent();
                    metricValueMap = {};
                    _i = 0, metrics_1 = metrics;
                    _d.label = 1;
                case 1:
                    if (!(_i < metrics_1.length)) return [3, 4];
                    metric = metrics_1[_i];
                    metricQueryEscaped = encodeURIComponent(metric.expr.replace("$lookback_interval", lookback_interval));
                    metricUrl = new URL("api/v1/query?query=" + metricQueryEscaped, baseUrl);
                    return [4, httpGetAsync(metricUrl.protocol, metricUrl.hostname, +metricUrl.port, metricUrl.pathname + metricUrl.search, agent)];
                case 2:
                    _a = _d.sent(), response = _a[0], body = _a[1];
                    metricData = JSON.parse(body);
                    for (_b = 0, _c = metricData.data.result; _b < _c.length; _b++) {
                        result = _c[_b];
                        labels = result.metric;
                        value = result.value[1];
                        key = interpolateLabels(metric.legendFormat, labels);
                        metricValueMap[key] = value;
                    }
                    response.destroy();
                    _d.label = 3;
                case 3:
                    _i++;
                    return [3, 1];
                case 4:
                    agent.destroy();
                    return [2, metricValueMap];
            }
        });
    });
}
exports.fetchMetrics = fetchMetrics;
function interpolateLabels(template, labels) {
    var output = template;
    for (;;) {
        var nextBracesIndex = output.indexOf("{{");
        if (nextBracesIndex === -1) {
            return output;
        }
        var endBracesIndex = output.indexOf("}}", nextBracesIndex);
        if (endBracesIndex === -1) {
            return output;
        }
        var variableName = output.substr(nextBracesIndex + 2, endBracesIndex - nextBracesIndex - 2);
        var variableValue = variableName in labels
            ? labels[variableName]
            : "";
        output = output.substr(0, nextBracesIndex) + variableValue + output.substr(endBracesIndex + 2);
    }
}
function httpGetAsync(protocol, hostname, port, path, agent) {
    return new Promise(function (resolve, reject) {
        var options = {
            protocol: protocol,
            hostname: hostname,
            port: port,
            path: path,
            agent: agent
        };
        var req = http.request(options, function (res) {
            var body = "";
            res.on("data", function (chunk) {
                body += chunk;
            });
            res.on("end", function () {
                resolve([res, body]);
            });
        });
        req.on("error", function (err) {
            reject(err);
        });
        req.end();
    });
}
//# sourceMappingURL=fetcher.js.map