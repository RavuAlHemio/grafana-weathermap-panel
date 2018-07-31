System.register(["./constants", "./geometry", "./gradients", "./legend"], function (exports_1, context_1) {
    "use strict";
    var constants_1, geometry_1, gradients_1, legend_1, WeathermapRendererState, SVGElementCreator;
    var __moduleName = context_1 && context_1.id;
    function renderWeathermapInto(elementCreator, container, config, currentValues, linkResolver) {
        var sortedStops = config.gradient.stops
            .slice()
            .sort(function (l, r) { return l.position - r.position; });
        var sortedGradient = {
            type: config.gradient.type,
            stops: sortedStops
        };
        var state = new WeathermapRendererState(elementCreator, config, sortedGradient, currentValues);
        initializeSVG(state, container);
        if (linkResolver) {
            state.nodeLinkUriBase = linkResolver(config.link.node);
            state.edgeLinkUriBase = linkResolver(config.link.edge);
        }
        placeNodes(state);
        placeEdges(state);
        legend_1.placeLegend(state.make, config.legend, state.legendGroup, state.defs, sortedGradient);
    }
    exports_1("renderWeathermapInto", renderWeathermapInto);
    function initializeSVG(state, container) {
        var svg = state.make.svg();
        modifyStyle(svg, {
            'width': state.config.canvasSize.width,
            'height': state.config.canvasSize.height,
        });
        container.appendChild(svg);
        state.defs = state.make.defs();
        svg.appendChild(state.defs);
        state.legendGroup = state.make.g();
        state.legendGroup.setAttribute('class', 'legend');
        svg.appendChild(state.legendGroup);
        state.edgeGroup = state.make.g();
        state.edgeGroup.setAttribute('class', 'edges');
        svg.appendChild(state.edgeGroup);
        state.nodeGroup = state.make.g();
        state.nodeGroup.setAttribute('class', 'nodes');
        svg.appendChild(state.nodeGroup);
    }
    function placeNodes(state) {
        for (var _i = 0, _a = state.config.weathermapNodes; _i < _a.length; _i++) {
            var node = _a[_i];
            state.nodeLabelToNode[node.label] = node;
            var singleNodeGroup = state.make.g();
            maybeWrapIntoLink(state.make, state.nodeGroup, singleNodeGroup, state.nodeLinkUriBase, node.linkParams);
            var rect = state.make.rect();
            singleNodeGroup.appendChild(rect);
            setRectangleDimensions(rect, node.x, node.y, node.width, node.height);
            modifyStyle(rect, {
                'stroke': 'gray',
                'stroke-width': '1px',
            });
            var text = state.make.text();
            singleNodeGroup.appendChild(text);
            text.setAttribute('x', "" + ((+node.x) + (+state.config.textOffsets.left)));
            text.setAttribute('y', "" + ((+node.y) + (+node.height) - state.config.textOffsets.bottom));
            if (state.config.showNumbers) {
                var value = (node.metricName in state.currentValues)
                    ? state.currentValues[node.metricName]
                    : '?';
                text.textContent = node.label + " (" + value + ")";
            }
            else {
                text.textContent = node.label;
            }
            if (!node.metricName) {
                modifyStyle(rect, {
                    'fill': 'silver',
                    'stroke-dasharray': state.config.unmeasuredDashArray,
                });
            }
            else if (node.metricName in state.currentValues) {
                var currentValue = state.currentValues[node.metricName];
                modifyStyle(rect, {
                    'fill': gradients_1.gradientColorForValue(state.sortedGradient, 'fillColor', currentValue),
                });
            }
            else {
                modifyStyle(text, {
                    'fill': 'white',
                });
                modifyStyle(rect, {
                    'fill': 'black',
                    'stroke-dasharray': state.config.noValueDashArray,
                });
            }
        }
    }
    function placeEdges(state) {
        for (var _i = 0, _a = state.config.weathermapEdges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var node1 = state.nodeLabelToNode[edge.node1];
            var node2 = state.nodeLabelToNode[edge.node2];
            if (!node1 || !node2) {
                continue;
            }
            var singleEdgeGroup = state.make.g();
            maybeWrapIntoLink(state.make, state.edgeGroup, singleEdgeGroup, state.edgeLinkUriBase, edge.linkParams);
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
                var _b = geometry_1.halveCubicBezier(n1Center, control1, control2, n2Center), _point1 = _b[0], point1COut = _b[1], point2CIn = _b[2], point2 = _b[3], point2COut = _b[4], point3CIn = _b[5], _point2 = _b[6];
                var therePath = state.make.path();
                singleEdgeGroup.appendChild(therePath);
                therePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                    ("C " + point1COut.x + "," + point1COut.y + "," + point2CIn.x + "," + point2CIn.y + "," + point2.x + "," + point2.y));
                modifyStyle(therePath, {
                    'stroke-width': state.config.strokeWidth,
                    'fill': 'none',
                });
                var thereTitle = state.make.title();
                therePath.appendChild(thereTitle);
                thereTitle.textContent = edge.node1 + " \u2192 " + edge.node2;
                var backPath = state.make.path();
                singleEdgeGroup.appendChild(backPath);
                backPath.setAttribute('d', "M " + point2.x + "," + point2.y + " " +
                    ("C " + point2COut.x + "," + point2COut.y + "," + point3CIn.x + "," + point3CIn.y + "," + n2Center.x + "," + n2Center.y));
                modifyStyle(backPath, {
                    'stroke-width': state.config.strokeWidth,
                    'fill': 'none',
                });
                var backTitle = state.make.title();
                backPath.appendChild(backTitle);
                backTitle.textContent = edge.node2 + " \u2192 " + edge.node1;
                if (edge.metricName in state.currentValues) {
                    var currentValue = state.currentValues[edge.metricName];
                    modifyStyle(therePath, {
                        'stroke': gradients_1.gradientColorForValue(state.sortedGradient, 'strokeColor', currentValue),
                    });
                }
                else {
                    modifyStyle(therePath, {
                        'stroke': 'black',
                        'stroke-dasharray': state.config.noValueDashArray,
                    });
                }
                if (edge.metric2Name in state.currentValues) {
                    var currentValue = state.currentValues[edge.metric2Name];
                    modifyStyle(backPath, {
                        'stroke': gradients_1.gradientColorForValue(state.sortedGradient, 'strokeColor', currentValue),
                    });
                }
                else {
                    modifyStyle(backPath, {
                        'stroke': 'black',
                        'stroke-dasharray': state.config.noValueDashArray,
                    });
                }
                if (state.config.showNumbers) {
                    var quarterPoint = geometry_1.halveCubicBezier(n1Center, point1COut, point2CIn, point2)[3];
                    var threeQuarterPoint = geometry_1.halveCubicBezier(point2, point2COut, point3CIn, n2Center)[3];
                    var valueString = (edge.metricName in state.currentValues)
                        ? state.currentValues[edge.metricName].toFixed(2)
                        : '?';
                    var text1 = state.make.text();
                    singleEdgeGroup.appendChild(text1);
                    text1.setAttribute('x', "" + quarterPoint.x);
                    text1.setAttribute('y', "" + quarterPoint.y);
                    text1.textContent = valueString;
                    var value2String = (edge.metric2Name in state.currentValues)
                        ? state.currentValues[edge.metric2Name].toFixed(2)
                        : '?';
                    var text2 = state.make.text();
                    singleEdgeGroup.appendChild(text2);
                    text2.setAttribute('x', "" + threeQuarterPoint.x);
                    text2.setAttribute('y', "" + threeQuarterPoint.y);
                    text2.textContent = value2String;
                }
            }
            else {
                var edgePath = state.make.path();
                singleEdgeGroup.appendChild(edgePath);
                if (control1 !== null && control2 !== null) {
                    edgePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                        ("C " + control1.x + "," + control1.y + "," + control2.x + "," + control2.y + "," + n2Center.x + "," + n2Center.y));
                }
                else {
                    edgePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                        ("L " + n2Center.x + "," + n2Center.y));
                }
                modifyStyle(edgePath, {
                    'stroke-width': state.config.strokeWidth,
                    'fill': 'none',
                });
                var edgeTitle = state.make.title();
                edgePath.appendChild(edgeTitle);
                edgeTitle.textContent = edge.node2 + " \u2194 " + edge.node1;
                if (edge.metricName in state.currentValues) {
                    var currentValue = state.currentValues[edge.metricName];
                    modifyStyle(edgePath, {
                        'stroke': gradients_1.gradientColorForValue(state.sortedGradient, 'strokeColor', currentValue),
                    });
                }
                else {
                    modifyStyle(edgePath, {
                        'stroke': 'black',
                        'stroke-dasharray': state.config.noValueDashArray,
                    });
                }
                if (state.config.showNumbers) {
                    var midpoint = geometry_1.halveCubicBezier(n1Center, control1, control2, n2Center)[3];
                    var valueString = (edge.metricName in state.currentValues)
                        ? state.currentValues[edge.metricName].toFixed(2)
                        : '?';
                    var text = state.make.text();
                    singleEdgeGroup.appendChild(text);
                    text.setAttribute('x', "" + midpoint.x);
                    text.setAttribute('y', "" + midpoint.y);
                    text.textContent = valueString;
                }
            }
        }
    }
    function maybeWrapIntoLink(svgMake, upperGroup, singleObjectGroup, linkUriBase, objLinkParams) {
        if (linkUriBase) {
            var objLinkUri = linkUriBase;
            if (objLinkParams) {
                objLinkUri += (objLinkUri.indexOf('?') === -1)
                    ? '?'
                    : '&';
                objLinkUri += objLinkParams;
            }
            var aElement = svgMake.a();
            upperGroup.appendChild(aElement);
            aElement.setAttributeNS(constants_1.xlinkNamespace, 'href', objLinkUri);
            aElement.appendChild(singleObjectGroup);
        }
        else {
            upperGroup.appendChild(singleObjectGroup);
        }
    }
    function setRectangleDimensions(element, x, y, width, height) {
        element.setAttribute('x', "" + x);
        element.setAttribute('y', "" + y);
        element.setAttribute('width', "" + width);
        element.setAttribute('height', "" + height);
    }
    exports_1("setRectangleDimensions", setRectangleDimensions);
    function modifyStyle(element, newValues) {
        var assembledStyle = {};
        if (element.hasAttribute('style')) {
            for (var _i = 0, _a = element.getAttribute('style').split(';'); _i < _a.length; _i++) {
                var chunk = _a[_i];
                var index = chunk.indexOf(':');
                if (index == -1) {
                    continue;
                }
                var key = chunk.substr(0, index);
                var value = chunk.substr(index + 1);
                assembledStyle[key] = value;
            }
        }
        for (var key in newValues) {
            if (newValues.hasOwnProperty(key)) {
                if (newValues[key] === null) {
                    delete assembledStyle[key];
                }
                else {
                    assembledStyle[key] = newValues[key];
                }
            }
        }
        var keyValuePairs = [];
        for (var key in assembledStyle) {
            if (assembledStyle.hasOwnProperty(key)) {
                keyValuePairs.push(key + ":" + assembledStyle[key]);
            }
        }
        var keyValueString = keyValuePairs.join(';');
        element.setAttribute('style', keyValueString);
    }
    return {
        setters: [
            function (constants_1_1) {
                constants_1 = constants_1_1;
            },
            function (geometry_1_1) {
                geometry_1 = geometry_1_1;
            },
            function (gradients_1_1) {
                gradients_1 = gradients_1_1;
            },
            function (legend_1_1) {
                legend_1 = legend_1_1;
            }
        ],
        execute: function () {
            WeathermapRendererState = (function () {
                function WeathermapRendererState(domCreator, config, sortedGradient, currentValues) {
                    this.make = new SVGElementCreator(domCreator);
                    this.config = config;
                    this.sortedGradient = sortedGradient;
                    this.currentValues = currentValues;
                    this.nodeLabelToNode = {};
                    this.nodeLinkUriBase = null;
                    this.edgeLinkUriBase = null;
                    this.defs = null;
                    this.edgeGroup = null;
                    this.nodeGroup = null;
                    this.legendGroup = null;
                }
                return WeathermapRendererState;
            }());
            exports_1("WeathermapRendererState", WeathermapRendererState);
            SVGElementCreator = (function () {
                function SVGElementCreator(maker) {
                    this.maker = maker;
                }
                SVGElementCreator.prototype.a = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'a'); };
                SVGElementCreator.prototype.defs = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'defs'); };
                SVGElementCreator.prototype.g = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'g'); };
                SVGElementCreator.prototype.linearGradient = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'linearGradient'); };
                SVGElementCreator.prototype.path = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'path'); };
                SVGElementCreator.prototype.rect = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'rect'); };
                SVGElementCreator.prototype.stop = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'stop'); };
                SVGElementCreator.prototype.svg = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'svg'); };
                SVGElementCreator.prototype.text = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'text'); };
                SVGElementCreator.prototype.title = function () { return this.maker.createElementNS(constants_1.svgNamespace, 'title'); };
                return SVGElementCreator;
            }());
            exports_1("SVGElementCreator", SVGElementCreator);
        }
    };
});
//# sourceMappingURL=weathermap.js.map