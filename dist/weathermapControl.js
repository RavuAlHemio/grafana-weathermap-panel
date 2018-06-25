System.register(["app/plugins/sdk", "./properties", "./geometry", "./gradients", "./legend", "lodash", "app/core/time_series2"], function (exports_1, context_1) {
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
    var sdk_1, properties_1, geometry_1, gradients_1, legend_1, lodash_1, time_series2_1, panelDefaults, WeathermapCtrl;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (sdk_1_1) {
                sdk_1 = sdk_1_1;
            },
            function (properties_1_1) {
                properties_1 = properties_1_1;
            },
            function (geometry_1_1) {
                geometry_1 = geometry_1_1;
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
                },
                noValueDashArray: '4 4',
                unmeasuredDashArray: '4 2'
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
                            rect.style.fill = "silver";
                            rect.style.strokeDasharray = this.panel.unmeasuredDashArray;
                        }
                        else if (node.metricName in this.currentValues) {
                            var currentValue = this.currentValues[node.metricName];
                            rect.style.fill = gradients_1.colorForValue(sortedGradient, 'fillColor', currentValue);
                        }
                        else {
                            text.style.fill = "white";
                            rect.style.fill = "black";
                            rect.style.strokeDasharray = this.panel.noValueDashArray;
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
                        var n1Center = {
                            x: (+node1.x) + ((+node1.width) / 2),
                            y: (+node1.y) + ((+node1.height) / 2)
                        };
                        var n2Center = {
                            x: (+node2.x) + ((+node2.width) / 2),
                            y: (+node2.y) + ((+node2.height) / 2)
                        };
                        var control1 = null;
                        var control2 = null;
                        if (edge.bendDirection && edge.bendMagnitude) {
                            var n1N2Angle = Math.atan2(n1Center.y - n2Center.y, n2Center.x - n1Center.x);
                            var n2N1Angle = Math.atan2(n2Center.y - n1Center.y, n1Center.x - n2Center.x);
                            var n1N2BendAngle = geometry_1.normalizeAngle(n1N2Angle + geometry_1.deg2rad(edge.bendDirection));
                            var n2N1BendAngle = geometry_1.normalizeAngle(n2N1Angle - geometry_1.deg2rad(edge.bendDirection));
                            var control1Offset = geometry_1.polarToCartesian(n1N2BendAngle, edge.bendMagnitude);
                            var control2Offset = geometry_1.polarToCartesian(n2N1BendAngle, edge.bendMagnitude);
                            control1 = {
                                x: (+n1Center.x) + control1Offset.x,
                                y: (+n1Center.y) - control1Offset.y
                            };
                            control2 = {
                                x: (+n2Center.x) + control2Offset.x,
                                y: (+n2Center.y) - control2Offset.y
                            };
                        }
                        if (edge.metric2Name) {
                            var _d = geometry_1.halveCubicBezier(n1Center, control1, control2, n2Center), _point1 = _d[0], point1COut = _d[1], point2CIn = _d[2], point2 = _d[3], point2COut = _d[4], point3CIn = _d[5], _point2 = _d[6];
                            var therePath = document.createElementNS(properties_1.svgNamespace, 'path');
                            singleEdgeGroup.appendChild(therePath);
                            therePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                                ("C " + point1COut.x + "," + point1COut.y + "," + point2CIn.x + "," + point2CIn.y + "," + point2.x + "," + point2.y));
                            therePath.style.strokeWidth = "" + this.panel.strokeWidth;
                            therePath.style.fill = 'none';
                            var thereTitle = document.createElementNS(properties_1.svgNamespace, 'title');
                            therePath.appendChild(thereTitle);
                            thereTitle.textContent = edge.node1 + " \u2192 " + edge.node2;
                            var backPath = document.createElementNS(properties_1.svgNamespace, 'path');
                            singleEdgeGroup.appendChild(backPath);
                            backPath.setAttribute('d', "M " + point2.x + "," + point2.y + " " +
                                ("C " + point2COut.x + "," + point2COut.y + "," + point3CIn.x + "," + point3CIn.y + "," + n2Center.x + "," + n2Center.y));
                            backPath.style.strokeWidth = "" + this.panel.strokeWidth;
                            backPath.style.fill = 'none';
                            var backTitle = document.createElementNS(properties_1.svgNamespace, 'title');
                            backPath.appendChild(backTitle);
                            backTitle.textContent = edge.node2 + " \u2192 " + edge.node1;
                            if (edge.metricName in this.currentValues) {
                                var currentValue = this.currentValues[edge.metricName];
                                therePath.style.stroke = gradients_1.colorForValue(sortedGradient, 'strokeColor', currentValue);
                            }
                            else {
                                therePath.style.stroke = 'black';
                                therePath.style.strokeDasharray = this.panel.noValueDashArray;
                            }
                            if (edge.metric2Name in this.currentValues) {
                                var currentValue = this.currentValues[edge.metric2Name];
                                backPath.style.stroke = gradients_1.colorForValue(sortedGradient, 'strokeColor', currentValue);
                            }
                            else {
                                backPath.style.stroke = 'black';
                                backPath.style.strokeDasharray = this.panel.noValueDashArray;
                            }
                            if (ctrl.panel.showNumbers) {
                                var quarterPoint = geometry_1.halveCubicBezier(n1Center, point1COut, point2CIn, point2)[3];
                                var threeQuarterPoint = geometry_1.halveCubicBezier(point2, point2COut, point3CIn, n2Center)[3];
                                var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                                var text1 = document.createElementNS(properties_1.svgNamespace, 'text');
                                singleEdgeGroup.appendChild(text1);
                                text1.setAttribute('x', "" + quarterPoint.x);
                                text1.setAttribute('y', "" + quarterPoint.y);
                                text1.textContent = valueString;
                                var value2String = (edge.metric2Name in this.currentValues) ? this.currentValues[edge.metric2Name].toFixed(2) : '?';
                                var text2 = document.createElementNS(properties_1.svgNamespace, 'text');
                                singleEdgeGroup.appendChild(text2);
                                text2.setAttribute('x', "" + threeQuarterPoint.x);
                                text2.setAttribute('y', "" + threeQuarterPoint.y);
                                text2.textContent = value2String;
                            }
                        }
                        else {
                            var edgePath = document.createElementNS(properties_1.svgNamespace, 'path');
                            singleEdgeGroup.appendChild(edgePath);
                            edgePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                                ("C " + control1.x + "," + control1.y + "," + control2.x + "," + control2.y + "," + n2Center.x + "," + n2Center.y));
                            edgePath.style.strokeWidth = "" + this.panel.strokeWidth;
                            edgePath.style.fill = 'none';
                            var edgeTitle = document.createElementNS(properties_1.svgNamespace, 'title');
                            edgePath.appendChild(edgeTitle);
                            edgeTitle.textContent = edge.node2 + " \u2194 " + edge.node1;
                            if (edge.metricName in this.currentValues) {
                                var currentValue = this.currentValues[edge.metricName];
                                edgePath.style.stroke = gradients_1.colorForValue(sortedGradient, 'strokeColor', currentValue);
                            }
                            else {
                                edgePath.style.stroke = 'black';
                                edgePath.style.strokeDasharray = this.panel.noValueDashArray;
                            }
                            if (ctrl.panel.showNumbers) {
                                var midpoint_1 = geometry_1.halveCubicBezier(n1Center, control1, control2, n2Center)[3];
                                var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                                var text = document.createElementNS(properties_1.svgNamespace, 'text');
                                singleEdgeGroup.appendChild(text);
                                text.setAttribute('x', "" + midpoint_1.x);
                                text.setAttribute('y', "" + midpoint_1.y);
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