System.register(["app/plugins/sdk", "./properties", "./gradients", "./legend", "lodash", "app/core/time_series2"], function (exports_1, context_1) {
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
    var sdk_1, properties_1, gradients_1, legend_1, lodash_1, time_series2_1, panelDefaults, WeathermapCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (properties_1_1) {
                properties_1 = properties_1_1;
            },
            function (gradients_1_1) {
                gradients_1 = gradients_1_1;
            },
            function (legend_1_1) {
                legend_1 = legend_1_1;
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
                nullPointMode: 'connected',
                strokeWidth: 1,
                gradient: {
                    type: 'steps',
                    stops: []
                },
                legend: {
                    type: '',
                    x: 0,
                    y: 0,
                    length: 100,
                    width: 5
                },
                link: {
                    node: {
                        type: 'none',
                        absoluteUri: null,
                        dashboard: null,
                        dashUri: null
                    },
                    edge: {
                        type: 'none',
                        absoluteUri: null,
                        dashboard: null,
                        dashUri: null
                    }
                }
            };
            WeathermapCtrl = (function (_super) {
                __extends(WeathermapCtrl, _super);
                function WeathermapCtrl($scope, $injector, backendSrv) {
                    var _this = _super.call(this, $scope, $injector) || this;
                    _this.backendSrv = backendSrv;
                    lodash_1.default.defaultsDeep(_this.panel, panelDefaults);
                    _this.currentValues = {};
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    _this.events.on('data-snapshot-load', _this.onDataSnapshotLoad.bind(_this));
                    _this.searchDashboards = function (queryStr, callback) {
                        backendSrv.search({ query: queryStr }).then(function (hits) {
                            var dashboards = lodash_1.default.map(hits, function (dash) { return dash.title; });
                            callback(dashboards);
                        });
                    };
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
                WeathermapCtrl.prototype.addGradientStop = function (stop) {
                    this.panel.gradient.stops.push(stop || {});
                };
                WeathermapCtrl.prototype.onGradientStopStrokeColorChange = function (stopIndex) {
                    var _this = this;
                    return function (color) {
                        _this.panel.gradient.stops[stopIndex].strokeColor = color;
                        _this.refresh();
                    };
                };
                WeathermapCtrl.prototype.onGradientStopFillColorChange = function (stopIndex) {
                    var _this = this;
                    return function (color) {
                        _this.panel.gradient.stops[stopIndex].fillColor = color;
                        _this.refresh();
                    };
                };
                WeathermapCtrl.prototype.removeGradientStop = function (stop) {
                    this.panel.gradient.stops = lodash_1.default.without(this.panel.gradient.stops, stop);
                    this.refresh();
                };
                WeathermapCtrl.prototype.dashboardChanged = function (link) {
                    this.backendSrv.search({ query: link.dashboard }).then(function (hits) {
                        var dashboard = lodash_1.default.find(hits, { title: link.dashboard });
                        if (dashboard) {
                            link.dashUri = dashboard.uri;
                        }
                    });
                };
                ;
                WeathermapCtrl.prototype.link = function (scope, elems, attrs, ctrl) {
                    var _this = this;
                    this.events.on('render', function () { return _this.renderThat(elems[0], ctrl); });
                };
                WeathermapCtrl.prototype.renderThat = function (topElem, ctrl) {
                    var sortedStops = this.panel.gradient.stops
                        .slice()
                        .sort(function (l, r) { return l.position - r.position; });
                    var sortedGradient = {
                        type: this.panel.gradient.type,
                        stops: sortedStops
                    };
                    var elem = topElem.querySelector('div.weathermap');
                    while (elem.lastChild) {
                        elem.removeChild(elem.lastChild);
                    }
                    var svg = document.createElementNS(properties_1.svgNamespace, 'svg');
                    svg.style.width = this.panel.canvasSize.width + "px";
                    svg.style.height = this.panel.canvasSize.height + "px";
                    elem.appendChild(svg);
                    var legendGroup = document.createElementNS(properties_1.svgNamespace, 'g');
                    legendGroup.classList.add('legend');
                    svg.appendChild(legendGroup);
                    var edgeGroup = document.createElementNS(properties_1.svgNamespace, 'g');
                    edgeGroup.classList.add('edges');
                    svg.appendChild(edgeGroup);
                    var nodeGroup = document.createElementNS(properties_1.svgNamespace, 'g');
                    nodeGroup.classList.add('nodes');
                    svg.appendChild(nodeGroup);
                    var nodeLinkUriBase = WeathermapCtrl.resolveLink(this.panel.link.node);
                    var edgeLinkUriBase = WeathermapCtrl.resolveLink(this.panel.link.edge);
                    var nodeLabelToNode = {};
                    for (var _i = 0, _a = this.panel.weathermapNodes; _i < _a.length; _i++) {
                        var node = _a[_i];
                        nodeLabelToNode[node.label] = node;
                        var singleNodeGroup = document.createElementNS(properties_1.svgNamespace, 'g');
                        WeathermapCtrl.maybeWrapIntoLink(nodeGroup, singleNodeGroup, nodeLinkUriBase, node.linkParams);
                        var rect = document.createElementNS(properties_1.svgNamespace, 'rect');
                        singleNodeGroup.appendChild(rect);
                        rect.setAttribute('x', "" + node.x);
                        rect.setAttribute('y', "" + node.y);
                        rect.setAttribute('width', "" + node.width);
                        rect.setAttribute('height', "" + node.height);
                        rect.style.strokeWidth = "1px";
                        rect.style.stroke = "gray";
                        var text = document.createElementNS(properties_1.svgNamespace, 'text');
                        singleNodeGroup.appendChild(text);
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
                            rect.style.fill = gradients_1.colorForValue(sortedGradient, 'fillColor', currentValue);
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
                        var singleEdgeGroup = document.createElementNS(properties_1.svgNamespace, 'g');
                        WeathermapCtrl.maybeWrapIntoLink(edgeGroup, singleEdgeGroup, edgeLinkUriBase, edge.linkParams);
                        var n1cx = (+node1.x) + ((+node1.width) / 2);
                        var n1cy = (+node1.y) + ((+node1.height) / 2);
                        var n2cx = (+node2.x) + ((+node2.width) / 2);
                        var n2cy = (+node2.y) + ((+node2.height) / 2);
                        if (edge.metric2Name) {
                            var midx = (n1cx + n2cx) / 2;
                            var midy = (n1cy + n2cy) / 2;
                            var thereLine = document.createElementNS(properties_1.svgNamespace, 'line');
                            singleEdgeGroup.appendChild(thereLine);
                            thereLine.setAttribute('x1', "" + n1cx);
                            thereLine.setAttribute('y1', "" + n1cy);
                            thereLine.setAttribute('x2', "" + midx);
                            thereLine.setAttribute('y2', "" + midy);
                            thereLine.style.strokeWidth = "" + this.panel.strokeWidth;
                            var thereTitle = document.createElementNS(properties_1.svgNamespace, 'title');
                            thereLine.appendChild(thereTitle);
                            thereTitle.textContent = edge.node1 + " \u2192 " + edge.node2;
                            var backLine = document.createElementNS(properties_1.svgNamespace, 'line');
                            singleEdgeGroup.appendChild(backLine);
                            backLine.setAttribute('x1', "" + midx);
                            backLine.setAttribute('y1', "" + midy);
                            backLine.setAttribute('x2', "" + n2cx);
                            backLine.setAttribute('y2', "" + n2cy);
                            backLine.style.strokeWidth = "" + this.panel.strokeWidth;
                            var backTitle = document.createElementNS(properties_1.svgNamespace, 'title');
                            backLine.appendChild(backTitle);
                            backTitle.textContent = edge.node2 + " \u2192 " + edge.node1;
                            if (edge.metricName in this.currentValues) {
                                var currentValue = this.currentValues[edge.metricName];
                                thereLine.style.stroke = gradients_1.colorForValue(sortedGradient, 'strokeColor', currentValue);
                            }
                            if (edge.metric2Name in this.currentValues) {
                                var currentValue = this.currentValues[edge.metric2Name];
                                backLine.style.stroke = gradients_1.colorForValue(sortedGradient, 'strokeColor', currentValue);
                            }
                            if (ctrl.panel.showNumbers) {
                                var quax = (n1cx + midx) / 2;
                                var quay = (n1cy + midy) / 2;
                                var tqax = (midx + n2cx) / 2;
                                var tqay = (midy + n2cy) / 2;
                                var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                                var text1 = document.createElementNS(properties_1.svgNamespace, 'text');
                                singleEdgeGroup.appendChild(text1);
                                text1.setAttribute('x', "" + quax);
                                text1.setAttribute('y', "" + quay);
                                text1.textContent = valueString;
                                var value2String = (edge.metric2Name in this.currentValues) ? this.currentValues[edge.metric2Name].toFixed(2) : '?';
                                var text2 = document.createElementNS(properties_1.svgNamespace, 'text');
                                singleEdgeGroup.appendChild(text2);
                                text2.setAttribute('x', "" + tqax);
                                text2.setAttribute('y', "" + tqay);
                                text2.textContent = value2String;
                            }
                        }
                        else {
                            var edgeLine = document.createElementNS(properties_1.svgNamespace, 'line');
                            singleEdgeGroup.appendChild(edgeLine);
                            edgeLine.setAttribute('x1', "" + n1cx);
                            edgeLine.setAttribute('y1', "" + n1cy);
                            edgeLine.setAttribute('x2', "" + n2cx);
                            edgeLine.setAttribute('y2', "" + n2cy);
                            edgeLine.style.strokeWidth = "" + this.panel.strokeWidth;
                            var edgeTitle = document.createElementNS(properties_1.svgNamespace, 'title');
                            edgeLine.appendChild(edgeTitle);
                            edgeTitle.textContent = edge.node2 + " \u2194 " + edge.node1;
                            if (edge.metricName in this.currentValues) {
                                var currentValue = this.currentValues[edge.metricName];
                                edgeLine.style.stroke = gradients_1.colorForValue(sortedGradient, 'strokeColor', currentValue);
                            }
                            if (ctrl.panel.showNumbers) {
                                var midx = (n1cx + n2cx) / 2;
                                var midy = (n1cy + n2cy) / 2;
                                var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                                var text = document.createElementNS(properties_1.svgNamespace, 'text');
                                singleEdgeGroup.appendChild(text);
                                text.setAttribute('x', "" + midx);
                                text.setAttribute('y', "" + midy);
                                text.textContent = valueString;
                            }
                        }
                    }
                    legend_1.placeLegend(this.panel.legend, sortedGradient, legendGroup);
                };
                WeathermapCtrl.resolveLink = function (objLink) {
                    if (objLink.type == 'absolute' && objLink.absoluteUri) {
                        return objLink.absoluteUri;
                    }
                    else if (objLink.type == 'dashboard' && objLink.dashUri) {
                        return "/dashboard/" + objLink.dashUri;
                    }
                    return null;
                };
                WeathermapCtrl.maybeWrapIntoLink = function (upperGroup, singleObjectGroup, linkUriBase, objLinkParams) {
                    if (linkUriBase) {
                        var objLinkUri = linkUriBase;
                        if (objLinkParams) {
                            objLinkUri += (objLinkUri.indexOf('?') === -1)
                                ? '?'
                                : '&';
                            objLinkUri += objLinkParams;
                        }
                        var aElement = document.createElementNS(properties_1.svgNamespace, 'a');
                        upperGroup.appendChild(aElement);
                        aElement.setAttributeNS(properties_1.xlinkNamespace, 'href', objLinkUri);
                        aElement.appendChild(singleObjectGroup);
                    }
                    else {
                        upperGroup.appendChild(singleObjectGroup);
                    }
                };
                return WeathermapCtrl;
            }(sdk_1.MetricsPanelCtrl));
            exports_1("WeathermapCtrl", WeathermapCtrl);
            WeathermapCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=weathermapControl.js.map