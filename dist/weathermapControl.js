System.register(["app/plugins/sdk", "./properties", "lodash", "app/core/time_series2"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var sdk_1, properties_1, lodash_1, time_series2_1, panelDefaults, WeathermapCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (properties_1_1) {
                properties_1 = properties_1_1;
            },
            function (lodash_1_1) {
                lodash_1 = lodash_1_1;
            },
            function (time_series2_1_1) {
                time_series2_1 = time_series2_1_1;
            }
        ],
        execute: function () {
            panelDefaults = {
                weathermapNodes: [],
                weathermapEdges: [],
                canvasSize: {
                    width: 800,
                    height: 600
                },
                textOffsets: {
                    left: 5,
                    bottom: 5
                },
                showNumbers: false,
                valueName: 'max',
                nullPointMode: 'connected'
            };
            WeathermapCtrl = (function (_super) {
                __extends(WeathermapCtrl, _super);
                function WeathermapCtrl($scope, $injector) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    lodash_1.default.defaultsDeep(_this.panel, panelDefaults);
                    _this.currentValues = {};
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataSnapshotLoad.bind(_this));
                    return _this;
                }
                WeathermapCtrl.prototype.onInitEditMode = function () {
                    this.addEditorTab('Options', properties_1.editorPath, 2);
                };
                WeathermapCtrl.prototype.onDataReceived = function (dataList) {
                    this.currentSeries = dataList.map(this.seriesHandler.bind(this));
                    this.currentValues = this.parseSeries(this.currentSeries);
                    this.render();
                };
                WeathermapCtrl.prototype.seriesHandler = function (seriesData) {
                    var series = new time_series2_1.default({
                        datapoints: seriesData.datapoints,
                        alias: seriesData.target
                    });
                    series.getFlotPairs(this.panel.nullPointMode);
                    return series;
                };
                WeathermapCtrl.prototype.parseSeries = function (series) {
                    var targetToValue = {};
                    for (var _i = 0, series_1 = series; _i < series_1.length; _i++) {
                        var ser = series_1[_i];
                        targetToValue[ser.alias] = ser.stats[this.panel.valueName];
                    }
                    return targetToValue;
                };
                WeathermapCtrl.prototype.onDataSnapshotLoad = function (snapshotData) {
                    this.onDataReceived(snapshotData);
                };
                WeathermapCtrl.prototype.addWeathermapNode = function (node) {
                    this.panel.weathermapNodes.push(node || {});
                };
                WeathermapCtrl.prototype.removeWeathermapNode = function (node) {
                    this.panel.weathermapNodes = lodash_1.default.without(this.panel.weathermapNodes, node);
                    this.refresh();
                };
                WeathermapCtrl.prototype.addWeathermapEdge = function (edge) {
                    this.panel.weathermapEdges.push(edge || {});
                };
                WeathermapCtrl.prototype.removeWeathermapEdge = function (edge) {
                    this.panel.weathermapEdges = lodash_1.default.without(this.panel.weathermapEdges, edge);
                    this.refresh();
                };
                WeathermapCtrl.prototype.link = function (scope, elems, attrs, ctrl) {
                    var _this = this;
                    this.events.on('render', function () { return _this.renderThat(elems[0], ctrl); });
                };
                WeathermapCtrl.prototype.renderThat = function (topElem, ctrl) {
                    var svgNamespace = "http://www.w3.org/2000/svg";
                    var elem = topElem.querySelector('div.weathermap');
                    while (elem.lastChild) {
                        elem.removeChild(elem.lastChild);
                    }
                    var svg = document.createElementNS(svgNamespace, 'svg');
                    svg.style.width = this.panel.canvasSize.width + "px";
                    svg.style.height = this.panel.canvasSize.height + "px";
                    elem.appendChild(svg);
                    var edgeGroup = document.createElementNS(svgNamespace, 'g');
                    edgeGroup.classList.add('edges');
                    svg.appendChild(edgeGroup);
                    var nodeGroup = document.createElementNS(svgNamespace, 'g');
                    nodeGroup.classList.add('nodes');
                    svg.appendChild(nodeGroup);
                    var nodeLabelToNode = {};
                    for (var _i = 0, _a = this.panel.weathermapNodes; _i < _a.length; _i++) {
                        var node = _a[_i];
                        nodeLabelToNode[node.label] = node;
                        var rect = document.createElementNS(svgNamespace, 'rect');
                        nodeGroup.appendChild(rect);
                        rect.setAttribute('x', node.x);
                        rect.setAttribute('y', node.y);
                        rect.setAttribute('width', node.width);
                        rect.setAttribute('height', node.height);
                        rect.style.strokeWidth = "1px";
                        rect.style.stroke = "gray";
                        var text = document.createElementNS(svgNamespace, 'text');
                        nodeGroup.appendChild(text);
                        text.setAttribute('x', "" + ((+node.x) + (+ctrl.panel.textOffsets.left)));
                        text.setAttribute('y', "" + ((+node.y) + (+node.height) - ctrl.panel.textOffsets.bottom));
                        if (ctrl.panel.showNumbers) {
                            var value = (node.metricName in this.currentValues) ? this.currentValues[node.metricName] : '?';
                            text.textContent = node.label + " (" + value + ")";
                        }
                        else {
                            text.textContent = node.label;
                        }
                        if (!node.metricName) {
                            rect.style.fill = "white";
                        }
                        else if (node.metricName in this.currentValues) {
                            var currentValue = this.currentValues[node.metricName];
                            rect.style.fill = WeathermapCtrl.colorForValue(currentValue);
                        }
                        else {
                            rect.style.fill = "black";
                        }
                    }
                    for (var _b = 0, _c = this.panel.weathermapEdges; _b < _c.length; _b++) {
                        var edge = _c[_b];
                        var node1 = nodeLabelToNode[edge.node1];
                        var node2 = nodeLabelToNode[edge.node2];
                        if (!node1 || !node2) {
                            continue;
                        }
                        var n1cx = (+node1.x) + ((+node1.width) / 2);
                        var n1cy = (+node1.y) + ((+node1.height) / 2);
                        var n2cx = (+node2.x) + ((+node2.width) / 2);
                        var n2cy = (+node2.y) + ((+node2.height) / 2);
                        if (edge.metric2Name) {
                            var midx = (n1cx + n2cx) / 2;
                            var midy = (n1cy + n2cy) / 2;
                            var thereLine = document.createElementNS(svgNamespace, 'line');
                            edgeGroup.appendChild(thereLine);
                            thereLine.setAttribute('x1', "" + n1cx);
                            thereLine.setAttribute('y1', "" + n1cy);
                            thereLine.setAttribute('x2', "" + midx);
                            thereLine.setAttribute('y2', "" + midy);
                            var backLine = document.createElementNS(svgNamespace, 'line');
                            edgeGroup.appendChild(backLine);
                            backLine.setAttribute('x1', "" + midx);
                            backLine.setAttribute('y1', "" + midy);
                            backLine.setAttribute('x2', "" + n2cx);
                            backLine.setAttribute('y2', "" + n2cy);
                            if (edge.metricName in this.currentValues) {
                                var currentValue = this.currentValues[edge.metricName];
                                thereLine.style.stroke = WeathermapCtrl.colorForValue(currentValue);
                            }
                            if (edge.metric2Name in this.currentValues) {
                                var currentValue = this.currentValues[edge.metric2Name];
                                backLine.style.stroke = WeathermapCtrl.colorForValue(currentValue);
                            }
                            if (ctrl.panel.showNumbers) {
                                var quax = (n1cx + midx) / 2;
                                var quay = (n1cy + midy) / 2;
                                var tqax = (midx + n2cx) / 2;
                                var tqay = (midy + n2cy) / 2;
                                var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                                var text1 = document.createElementNS(svgNamespace, 'text');
                                edgeGroup.appendChild(text1);
                                text1.setAttribute('x', "" + quax);
                                text1.setAttribute('y', "" + quay);
                                text1.textContent = valueString;
                                var value2String = (edge.metric2Name in this.currentValues) ? this.currentValues[edge.metric2Name].toFixed(2) : '?';
                                var text2 = document.createElementNS(svgNamespace, 'text');
                                edgeGroup.appendChild(text2);
                                text2.setAttribute('x', "" + tqax);
                                text2.setAttribute('y', "" + tqay);
                                text2.textContent = value2String;
                            }
                        }
                        else {
                            var edgeLine = document.createElementNS(svgNamespace, 'line');
                            edgeGroup.appendChild(edgeLine);
                            edgeLine.setAttribute('x1', "" + n1cx);
                            edgeLine.setAttribute('y1', "" + n1cy);
                            edgeLine.setAttribute('x2', "" + n2cx);
                            edgeLine.setAttribute('y2', "" + n2cy);
                            if (edge.metricName in this.currentValues) {
                                var currentValue = this.currentValues[edge.metricName];
                                edgeLine.style.stroke = WeathermapCtrl.colorForValue(currentValue);
                            }
                            if (ctrl.panel.showNumbers) {
                                var midx = (n1cx + n2cx) / 2;
                                var midy = (n1cy + n2cy) / 2;
                                var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                                var text = document.createElementNS(svgNamespace, 'text');
                                edgeGroup.appendChild(text);
                                text.setAttribute('x', "" + midx);
                                text.setAttribute('y', "" + midy);
                                text.textContent = valueString;
                            }
                        }
                    }
                };
                WeathermapCtrl.colorForValue = function (value) {
                    var r = 0.0, g = 0.0, b = 0.0;
                    if (value <= 5.0) {
                        r = 0.55;
                        g = 0.0;
                        b = 1.0;
                    }
                    else if (value <= 10.0) {
                        r = WeathermapCtrl.interpolate(value, 5.0, 10.0, 0.55, 0.00);
                        g = WeathermapCtrl.interpolate(value, 5.0, 10.0, 0.00, 0.00);
                        b = WeathermapCtrl.interpolate(value, 5.0, 10.0, 1.00, 1.00);
                    }
                    else if (value <= 15.0) {
                        r = WeathermapCtrl.interpolate(value, 10.0, 15.0, 0.00, 0.00);
                        g = WeathermapCtrl.interpolate(value, 10.0, 15.0, 0.00, 0.50);
                        b = WeathermapCtrl.interpolate(value, 10.0, 15.0, 1.00, 1.00);
                    }
                    else if (value <= 25.0) {
                        r = WeathermapCtrl.interpolate(value, 15.0, 25.0, 0.00, 0.00);
                        g = WeathermapCtrl.interpolate(value, 15.0, 25.0, 0.50, 1.00);
                        b = WeathermapCtrl.interpolate(value, 15.0, 25.0, 1.00, 0.00);
                    }
                    else if (value <= 50.0) {
                        r = WeathermapCtrl.interpolate(value, 25.0, 50.0, 0.00, 1.00);
                        g = WeathermapCtrl.interpolate(value, 25.0, 50.0, 1.00, 1.00);
                        b = WeathermapCtrl.interpolate(value, 25.0, 50.0, 0.00, 0.00);
                    }
                    else if (value <= 75.0) {
                        r = WeathermapCtrl.interpolate(value, 50.0, 75.0, 1.00, 1.00);
                        g = WeathermapCtrl.interpolate(value, 50.0, 75.0, 1.00, 0.50);
                        b = WeathermapCtrl.interpolate(value, 50.0, 75.0, 0.00, 0.00);
                    }
                    else if (value <= 100.0) {
                        r = WeathermapCtrl.interpolate(value, 75.0, 100.0, 1.00, 1.00);
                        g = WeathermapCtrl.interpolate(value, 75.0, 100.0, 0.50, 0.00);
                        b = WeathermapCtrl.interpolate(value, 75.0, 100.0, 0.00, 0.00);
                    }
                    else {
                        r = 1.0;
                        g = 0.0;
                        b = 0.0;
                    }
                    return "rgb(" + Math.floor(r * 255) + ", " + Math.floor(g * 255) + ", " + Math.floor(b * 255) + ")";
                };
                WeathermapCtrl.interpolate = function (value, sourceMin, sourceMax, targetMin, targetMax) {
                    if (targetMin == targetMax) {
                        return targetMin;
                    }
                    if (value < sourceMin) {
                        value = sourceMin;
                    }
                    if (value > sourceMax) {
                        value = sourceMax;
                    }
                    var terp = (value - sourceMin) / (sourceMax - sourceMin);
                    return targetMin + terp * (targetMax - targetMin);
                };
                return WeathermapCtrl;
            }(sdk_1.MetricsPanelCtrl));
            exports_1("WeathermapCtrl", WeathermapCtrl);
            WeathermapCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=weathermapControl.js.map