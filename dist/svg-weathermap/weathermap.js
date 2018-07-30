System.register(["./constants", "./geometry", "./gradients", "./legend"], function (exports_1, context_1) {
    "use strict";
    var constants_1, geometry_1, gradients_1, legend_1;
    var __moduleName = context_1 && context_1.id;
    function renderWeathermapInto(container, config, linkResolver) {
        var sortedStops = config.gradient.stops
            .slice()
            .sort(function (l, r) { return l.position - r.position; });
        var sortedGradient = {
            type: config.gradient.type,
            stops: sortedStops
        };
        var svg = document.createElementNS(constants_1.svgNamespace, 'svg');
        svg.style.width = config.canvasSize.width + "px";
        svg.style.height = config.canvasSize.height + "px";
        container.appendChild(svg);
        var defs = document.createElementNS(constants_1.svgNamespace, 'defs');
        svg.appendChild(defs);
        var legendGroup = document.createElementNS(constants_1.svgNamespace, 'g');
        legendGroup.classList.add('legend');
        svg.appendChild(legendGroup);
        var edgeGroup = document.createElementNS(constants_1.svgNamespace, 'g');
        edgeGroup.classList.add('edges');
        svg.appendChild(edgeGroup);
        var nodeGroup = document.createElementNS(constants_1.svgNamespace, 'g');
        nodeGroup.classList.add('nodes');
        svg.appendChild(nodeGroup);
        var edgeLinkUriBase;
        var nodeLinkUriBase;
        if (linkResolver) {
            nodeLinkUriBase = linkResolver(config.link.node);
            edgeLinkUriBase = linkResolver(config.link.edge);
        }
        var nodeLabelToNode = placeNodes(config, nodeGroup, nodeLinkUriBase, sortedGradient);
        placeEdges(config, edgeGroup, edgeLinkUriBase, sortedGradient, nodeLabelToNode);
        legend_1.placeLegend(config.legend, sortedGradient, legendGroup, defs);
    }
    exports_1("renderWeathermapInto", renderWeathermapInto);
    function placeNodes(config, nodeGroup, nodeLinkUriBase, sortedGradient) {
        var nodeLabelToNode = {};
        for (var _i = 0, _a = config.weathermapNodes; _i < _a.length; _i++) {
            var node = _a[_i];
            nodeLabelToNode[node.label] = node;
            var singleNodeGroup = document.createElementNS(constants_1.svgNamespace, 'g');
            maybeWrapIntoLink(nodeGroup, singleNodeGroup, nodeLinkUriBase, node.linkParams);
            var rect = document.createElementNS(constants_1.svgNamespace, 'rect');
            singleNodeGroup.appendChild(rect);
            setRectangleDimensions(rect, node.x, node.y, node.width, node.height);
            rect.style.strokeWidth = "1px";
            rect.style.stroke = "gray";
            var text = document.createElementNS(constants_1.svgNamespace, 'text');
            singleNodeGroup.appendChild(text);
            text.setAttribute('x', "" + ((+node.x) + (+config.textOffsets.left)));
            text.setAttribute('y', "" + ((+node.y) + (+node.height) - config.textOffsets.bottom));
            if (config.showNumbers) {
                var value = (node.metricName in this.currentValues) ? this.currentValues[node.metricName] : '?';
                text.textContent = node.label + " (" + value + ")";
            }
            else {
                text.textContent = node.label;
            }
            if (!node.metricName) {
                rect.style.fill = "silver";
                rect.style.strokeDasharray = config.unmeasuredDashArray;
            }
            else if (node.metricName in this.currentValues) {
                var currentValue = this.currentValues[node.metricName];
                rect.style.fill = gradients_1.gradientColorForValue(sortedGradient, 'fillColor', currentValue);
            }
            else {
                text.style.fill = "white";
                rect.style.fill = "black";
                rect.style.strokeDasharray = config.noValueDashArray;
            }
        }
        return nodeLabelToNode;
    }
    function placeEdges(config, edgeGroup, edgeLinkUriBase, sortedGradient, nodeLabelToNode) {
        for (var _i = 0, _a = config.weathermapEdges; _i < _a.length; _i++) {
            var edge = _a[_i];
            var node1 = nodeLabelToNode[edge.node1];
            var node2 = nodeLabelToNode[edge.node2];
            if (!node1 || !node2) {
                continue;
            }
            var singleEdgeGroup = document.createElementNS(constants_1.svgNamespace, 'g');
            maybeWrapIntoLink(edgeGroup, singleEdgeGroup, edgeLinkUriBase, edge.linkParams);
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
                var therePath = document.createElementNS(constants_1.svgNamespace, 'path');
                singleEdgeGroup.appendChild(therePath);
                therePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                    ("C " + point1COut.x + "," + point1COut.y + "," + point2CIn.x + "," + point2CIn.y + "," + point2.x + "," + point2.y));
                therePath.style.strokeWidth = "" + config.strokeWidth;
                therePath.style.fill = 'none';
                var thereTitle = document.createElementNS(constants_1.svgNamespace, 'title');
                therePath.appendChild(thereTitle);
                thereTitle.textContent = edge.node1 + " \u2192 " + edge.node2;
                var backPath = document.createElementNS(constants_1.svgNamespace, 'path');
                singleEdgeGroup.appendChild(backPath);
                backPath.setAttribute('d', "M " + point2.x + "," + point2.y + " " +
                    ("C " + point2COut.x + "," + point2COut.y + "," + point3CIn.x + "," + point3CIn.y + "," + n2Center.x + "," + n2Center.y));
                backPath.style.strokeWidth = "" + config.strokeWidth;
                backPath.style.fill = 'none';
                var backTitle = document.createElementNS(constants_1.svgNamespace, 'title');
                backPath.appendChild(backTitle);
                backTitle.textContent = edge.node2 + " \u2192 " + edge.node1;
                if (edge.metricName in this.currentValues) {
                    var currentValue = this.currentValues[edge.metricName];
                    therePath.style.stroke = gradients_1.gradientColorForValue(sortedGradient, 'strokeColor', currentValue);
                }
                else {
                    therePath.style.stroke = 'black';
                    therePath.style.strokeDasharray = config.noValueDashArray;
                }
                if (edge.metric2Name in this.currentValues) {
                    var currentValue = this.currentValues[edge.metric2Name];
                    backPath.style.stroke = gradients_1.gradientColorForValue(sortedGradient, 'strokeColor', currentValue);
                }
                else {
                    backPath.style.stroke = 'black';
                    backPath.style.strokeDasharray = config.noValueDashArray;
                }
                if (config.showNumbers) {
                    var quarterPoint = geometry_1.halveCubicBezier(n1Center, point1COut, point2CIn, point2)[3];
                    var threeQuarterPoint = geometry_1.halveCubicBezier(point2, point2COut, point3CIn, n2Center)[3];
                    var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                    var text1 = document.createElementNS(constants_1.svgNamespace, 'text');
                    singleEdgeGroup.appendChild(text1);
                    text1.setAttribute('x', "" + quarterPoint.x);
                    text1.setAttribute('y', "" + quarterPoint.y);
                    text1.textContent = valueString;
                    var value2String = (edge.metric2Name in this.currentValues) ? this.currentValues[edge.metric2Name].toFixed(2) : '?';
                    var text2 = document.createElementNS(constants_1.svgNamespace, 'text');
                    singleEdgeGroup.appendChild(text2);
                    text2.setAttribute('x', "" + threeQuarterPoint.x);
                    text2.setAttribute('y', "" + threeQuarterPoint.y);
                    text2.textContent = value2String;
                }
            }
            else {
                var edgePath = document.createElementNS(constants_1.svgNamespace, 'path');
                singleEdgeGroup.appendChild(edgePath);
                if (control1 !== null && control2 !== null) {
                    edgePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                        ("C " + control1.x + "," + control1.y + "," + control2.x + "," + control2.y + "," + n2Center.x + "," + n2Center.y));
                }
                else {
                    edgePath.setAttribute('d', "M " + n1Center.x + "," + n1Center.y + " " +
                        ("L " + n2Center.x + "," + n2Center.y));
                }
                edgePath.style.strokeWidth = "" + config.strokeWidth;
                edgePath.style.fill = 'none';
                var edgeTitle = document.createElementNS(constants_1.svgNamespace, 'title');
                edgePath.appendChild(edgeTitle);
                edgeTitle.textContent = edge.node2 + " \u2194 " + edge.node1;
                if (edge.metricName in this.currentValues) {
                    var currentValue = this.currentValues[edge.metricName];
                    edgePath.style.stroke = gradients_1.gradientColorForValue(sortedGradient, 'strokeColor', currentValue);
                }
                else {
                    edgePath.style.stroke = 'black';
                    edgePath.style.strokeDasharray = config.noValueDashArray;
                }
                if (config.showNumbers) {
                    var midpoint = geometry_1.halveCubicBezier(n1Center, control1, control2, n2Center)[3];
                    var valueString = (edge.metricName in this.currentValues) ? this.currentValues[edge.metricName].toFixed(2) : '?';
                    var text = document.createElementNS(constants_1.svgNamespace, 'text');
                    singleEdgeGroup.appendChild(text);
                    text.setAttribute('x', "" + midpoint.x);
                    text.setAttribute('y', "" + midpoint.y);
                    text.textContent = valueString;
                }
            }
        }
    }
    function maybeWrapIntoLink(upperGroup, singleObjectGroup, linkUriBase, objLinkParams) {
        if (linkUriBase) {
            var objLinkUri = linkUriBase;
            if (objLinkParams) {
                objLinkUri += (objLinkUri.indexOf('?') === -1)
                    ? '?'
                    : '&';
                objLinkUri += objLinkParams;
            }
            var aElement = document.createElementNS(constants_1.svgNamespace, 'a');
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
        }
    };
});
//# sourceMappingURL=weathermap.js.map