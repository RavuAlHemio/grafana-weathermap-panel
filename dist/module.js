define(["app/plugins/sdk","lodash","app/core/time_series2"],(function(e,t,r){return i={},n.m=a=[function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.SVGElementCreator=t.WeathermapRendererState=void 0,t.renderWeathermapInto=function(e,t,r,n,h,c){void 0===c&&(c=!1);var f=r.gradient.stops.slice().sort((function(e,t){return e.position-t.position})),m={type:r.gradient.type,stops:f},g=new d(e,r,m,n);return function(e,t,r){void 0===r&&(r=!1),e.svg=e.make.svg(),p(e.svg,{width:e.config.canvasSize.width+"px",height:e.config.canvasSize.height+"px"}),r&&e.svg.setAttribute("viewBox","0 0 "+e.config.canvasSize.width+" "+e.config.canvasSize.height),t.appendChild(e.svg),e.defs=e.make.defs(),e.svg.appendChild(e.defs),e.legendGroup=e.make.g(),e.legendGroup.setAttribute("class","legend"),e.svg.appendChild(e.legendGroup),e.edgeGroup=e.make.g(),e.edgeGroup.setAttribute("class","edges"),e.svg.appendChild(e.edgeGroup),e.nodeGroup=e.make.g(),e.nodeGroup.setAttribute("class","nodes"),e.svg.appendChild(e.nodeGroup),e.labelGroup=e.make.g(),e.labelGroup.setAttribute("class","labels"),e.svg.appendChild(e.labelGroup)}(g,t,c),null!=h&&(g.nodeLinkUriBase=h(r.link.node),g.edgeLinkUriBase=h(r.link.edge)),function(e){for(var t=0,r=e.config.weathermapNodes;t<r.length;t++){var n=r[t];e.nodeLabelToNode[n.label]=n;var a=e.make.g();l(e.make,e.nodeGroup,a,e.nodeLinkUriBase,n.linkParams);var o=e.make.rect();a.appendChild(o),u(o,n.x,n.y,n.width,n.height),p(o,{stroke:"gray","stroke-width":"1px"});var s=e.make.text();if(a.appendChild(s),s.setAttribute("x",""+(+n.x+ +e.config.textOffsets.left)),s.setAttribute("y",""+(+n.y+ +n.height-e.config.textOffsets.bottom)),e.config.showNumbers&&null!=n.metricName){var d=n.metricName in e.currentValues?""+e.currentValues[n.metricName]:"?";s.textContent=n.label+" ("+d+")"}else s.textContent=n.label;var h=null;if(n.metricName?n.metricName in e.currentValues?(h=e.currentValues[n.metricName],p(o,{fill:(0,i.gradientColorForValue)(e.sortedGradient,"fillColor",h)})):(p(s,{fill:"white"}),p(o,{fill:"black","stroke-dasharray":e.config.noValueDashArray})):p(o,{fill:"silver","stroke-dasharray":e.config.unmeasuredDashArray}),null!==h){var c=e.make.title();a.insertBefore(c,c.firstChild),c.textContent=n.label+" ("+h.toFixed(2)+")"}}}(g),function(e){for(var t=0,r=e.config.weathermapEdges;t<r.length;t++){var n=r[t],i=e.nodeLabelToNode[n.node1],o=e.nodeLabelToNode[n.node2];if(i&&o){var u=e.make.g();l(e.make,e.edgeGroup,u,e.edgeLinkUriBase,n.linkParams);var p={x:+i.x+i.width/2,y:+i.y+i.height/2},d={x:+o.x+o.width/2,y:+o.y+o.height/2},h=null,c=null;if(n.bendDirection&&n.bendMagnitude){var f=Math.atan2(p.y-d.y,d.x-p.x),m=Math.atan2(d.y-p.y,p.x-d.x),g=(0,a.normalizeAngle)(f+(0,a.deg2rad)(n.bendDirection)),v=(0,a.normalizeAngle)(m-(0,a.deg2rad)(n.bendDirection)),y=(0,a.polarToCartesian)(g,n.bendMagnitude),b=(0,a.polarToCartesian)(v,n.bendMagnitude);h={x:+p.x+y.x,y:p.y-y.y},c={x:+d.x+b.x,y:d.y-b.y}}if(n.metric2Name){var x=(0,a.halveCubicBezier)(p,h,c,d),k=x[1],w=x[2],C=x[3],N=x[4],A=x[5];s(e,u,p,k,w,C,n.metricName,n.styleName,n.node1+" → "+n.node2),s(e,u,C,N,A,d,n.metric2Name,n.styleName,n.node2+" → "+n.node1)}else s(e,u,p,h,c,d,n.metricName,n.styleName,n.node1+" ↔ "+n.node2)}}}(g),function(e){for(var t=0,r=e.config.weathermapLabels;t<r.length;t++){var n=r[t],a=e.make.g();e.labelGroup.appendChild(a);var i=e.make.text();a.appendChild(i),i.setAttribute("x",""+ +n.x),i.setAttribute("y",""+ +n.y),i.textContent=n.label}}(g),(0,o.placeLegend)(g.make,r.legend,g.legendGroup,g.defs,m,""+r.id),g.svg},t.setRectangleDimensions=u;var n=r(5),a=r(6),i=r(7),o=r(8);function s(e,t,r,n,o,s,l,u,d){var h=[e.config.strokeWidth],c=function(e,t){return t&&e.styleMap[t]||null}(e,u);c&&c.strokeWidthArray&&(h=c.strokeWidthArray.split(/[ ,]+/).map((function(e){return Number.parseFloat(e)}))),h.length%2!=1&&h.push.apply(h,h);var f={x:0,y:0};if(1<h.length){var m={x:r.x-s.x,y:r.y-s.y},g={x:m.y,y:-m.x};f=(0,a.unitVector)(g)}var v=e.make.g();t.appendChild(v),p(v,{fill:"none"});var y=null;if(null!=l&&l in e.currentValues?(y=e.currentValues[l],p(v,{stroke:(0,i.gradientColorForValue)(e.sortedGradient,"strokeColor",y)}),function(e,t,r){if(r){var n={};r.dashArray&&(n["stroke-dasharray"]=r.dashArray),p(t,n)}}(0,v,c)):p(v,{stroke:"black","stroke-dasharray":e.config.noValueDashArray}),d){var b=e.make.title();v.appendChild(b),b.textContent=null===y?d:d+" ("+y.toFixed(2)+")"}for(var x=-h.reduce((function(e,t){return e+t}),0)/2,k=!0,w=0,C=h;w<C.length;w++){var N=C[w];if(k=!k)x+=N;else{var A=f.x*(x+N/2),S=f.y*(x+N/2),P=r.x+A,M=r.y+S,E=null==n?null:{x:n.x+A,y:n.y+S},G=null==o?null:{x:o.x+A,y:o.y+S},_=s.x+A,L=s.y+S,O=e.make.path();v.appendChild(O),null==E||null==G?O.setAttribute("d","M "+P+","+M+" L "+_+","+L):O.setAttribute("d","M "+P+","+M+" C "+E.x+","+E.y+","+G.x+","+G.y+","+_+","+L),p(O,{"stroke-width":""+N}),x+=N}}if(e.config.showNumbers){var V=(0,a.halveCubicBezier)(r,n,o,s)[3],j=null!=l&&l in e.currentValues?e.currentValues[l].toFixed(2):"?",U=e.make.text();t.appendChild(U),U.setAttribute("x",""+V.x),U.setAttribute("y",""+V.y),U.textContent=j}}function l(e,t,r,a,i){if(null!=a){var o=a;null!=i&&(o+=-1===o.indexOf("?")?"?":"&",o+=i);var s=e.a();t.appendChild(s),s.setAttributeNS(n.xlinkNamespace,"href",o),s.appendChild(r)}else t.appendChild(r)}function u(e,t,r,n,a){e.setAttribute("x",""+t),e.setAttribute("y",""+r),e.setAttribute("width",""+n),e.setAttribute("height",""+a)}function p(e,t){var r={};if(e.hasAttribute("style")){var n=e.getAttribute("style");if(null!=n)for(var a=0,i=n.split(";");a<i.length;a++){var o=i[a],s=o.indexOf(":");if(-1!==s){var l=o.substr(0,s),u=o.substr(s+1);r[l]=u}}}for(var l in t)t.hasOwnProperty(l)&&(null===t[l]?delete r[l]:r[l]=t[l]);var p=[];for(var l in r)r.hasOwnProperty(l)&&p.push(l+":"+r[l]);var d=p.join(";");e.setAttribute("style",d)}var d=function(e,t,r,n){if(this.make=new h(e),this.config=t,this.sortedGradient=r,this.currentValues=n,this.nodeLabelToNode={},this.nodeLinkUriBase=null,this.edgeLinkUriBase=null,this.svg=null,this.defs=null,this.edgeGroup=null,this.nodeGroup=null,this.labelGroup=null,this.legendGroup=null,this.styleMap={},t.weathermapStyles)for(var a=0,i=t.weathermapStyles;a<i.length;a++){var o=i[a];this.styleMap[o.name]=o}};t.WeathermapRendererState=d;var h=(c.prototype.a=function(){return this.maker.createElementNS(n.svgNamespace,"a")},c.prototype.defs=function(){return this.maker.createElementNS(n.svgNamespace,"defs")},c.prototype.g=function(){return this.maker.createElementNS(n.svgNamespace,"g")},c.prototype.linearGradient=function(){return this.maker.createElementNS(n.svgNamespace,"linearGradient")},c.prototype.path=function(){return this.maker.createElementNS(n.svgNamespace,"path")},c.prototype.rect=function(){return this.maker.createElementNS(n.svgNamespace,"rect")},c.prototype.stop=function(){return this.maker.createElementNS(n.svgNamespace,"stop")},c.prototype.svg=function(){return this.maker.createElementNS(n.svgNamespace,"svg")},c.prototype.text=function(){return this.maker.createElementNS(n.svgNamespace,"text")},c.prototype.title=function(){return this.maker.createElementNS(n.svgNamespace,"title")},c);function c(e){this.maker=e}t.SVGElementCreator=h},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.PanelCtrl=void 0;var n=r(2);t.PanelCtrl=n.WeathermapCtrl},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.WeathermapCtrl=void 0;var n=r(3),a=r(4),i=r(0),o=l(r(9)),s=l(r(10));function l(e){return e&&e.__esModule?e:{default:e}}var u,p,d={weathermapNodes:[],weathermapEdges:[],weathermapLabels:[],weathermapStyles:[],canvasSize:{width:800,height:600},textOffsets:{left:5,bottom:5},showNumbers:!(u=function(e,t){return(u=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])})(e,t)}),valueName:"max",nullPointMode:"connected",strokeWidth:1,gradient:{type:"steps",stops:[]},legend:{type:"",x:0,y:0,length:100,width:5},link:{node:{type:"none",absoluteUri:null,dashboard:null,dashUri:null},edge:{type:"none",absoluteUri:null,dashboard:null,dashUri:null}},noValueDashArray:"4 4",unmeasuredDashArray:"4 2"},h=(function(e,t){function r(){this.constructor=e}u(e,t),e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)}(c,p=n.MetricsPanelCtrl),c.$inject=["$scope","$injector","backendSrv"],c.prototype.onInitEditMode=function(){this.addEditorTab("Options",a.editorPath,2),this.addEditorTab("Nodes",a.nodeEditorPath,3),this.addEditorTab("Edges",a.edgeEditorPath,4),this.addEditorTab("Labels",a.labelEditorPath,5),this.addEditorTab("Styles",a.styleEditorPath,6)},c.prototype.onDataReceived=function(e){this.currentSeries=e.map(this.seriesHandler.bind(this)),this.currentValues=this.parseSeries(this.currentSeries),this.render()},c.prototype.seriesHandler=function(e){var t=new s.default({datapoints:e.datapoints,alias:e.target});return t.getFlotPairs(this.panel.nullPointMode),t},c.prototype.parseSeries=function(e){for(var t={},r=0,n=e;r<n.length;r++){var a=n[r];t[a.alias]=a.stats[this.panel.valueName]}return t},c.prototype.onDataSnapshotLoad=function(e){this.onDataReceived(e)},c.prototype.addWeathermapNode=function(e){this.panel.weathermapNodes.push(e||{})},c.prototype.removeWeathermapNode=function(e){this.panel.weathermapNodes=o.default.without(this.panel.weathermapNodes,e),this.refresh()},c.prototype.addWeathermapEdge=function(e){this.panel.weathermapEdges.push(e||{})},c.prototype.removeWeathermapEdge=function(e){this.panel.weathermapEdges=o.default.without(this.panel.weathermapEdges,e),this.refresh()},c.prototype.addWeathermapLabel=function(e){this.panel.weathermapLabels.push(e||{})},c.prototype.removeWeathermapLabel=function(e){this.panel.weathermapLabels=o.default.without(this.panel.weathermapLabels,e),this.refresh()},c.prototype.addWeathermapStyle=function(e){this.panel.weathermapStyles.push(e||{})},c.prototype.removeWeathermapStyle=function(e){this.panel.weathermapStyles=o.default.without(this.panel.weathermapStyles,e),this.refresh()},c.prototype.addGradientStop=function(e){this.panel.gradient.stops.push(e||{})},c.prototype.onGradientStopStrokeColorChange=function(e){var t=this;return function(r){t.panel.gradient.stops[e].strokeColor=r,t.refresh()}},c.prototype.onGradientStopFillColorChange=function(e){var t=this;return function(r){t.panel.gradient.stops[e].fillColor=r,t.refresh()}},c.prototype.removeGradientStop=function(e){this.panel.gradient.stops=o.default.without(this.panel.gradient.stops,e),this.refresh()},c.prototype.dashboardChanged=function(e){this.backendSrv.search({query:e.dashboard}).then((function(t){var r=o.default.find(t,{title:e.dashboard});r&&(e.dashUri=r.uri)}))},c.prototype.link=function(e,t,r,n){var a=this;this.events.on("render",(function(){return a.renderThat(t[0],n)}))},c.prototype.renderThat=function(e,t){var r=e.querySelector("div.weathermap");if(null!==r){for(;r.lastChild;)r.removeChild(r.lastChild);(0,i.renderWeathermapInto)(document,r,this.panel,this.currentValues,c.resolveLink)}},c.resolveLink=function(e){if("absolute"===e.type&&e.absoluteUri)return e.absoluteUri;if("dashboard"===e.type&&e.dashUri){var t=function(e){for(var t=new URL(window.location.href).search;t.startsWith("?");)t=t.substr(1);var r={};if(0<t.length)for(var n=0,a=t.split("&");n<a.length;n++){var i=a[n].match(/^([^=]*)(?:=(.*))?$/);if(null!==i){var o=i[1],s=i[2];void 0!==o&&void 0!==s&&(r[decodeURIComponent(o)]=decodeURIComponent(s))}}return r}(),r=[];t.from&&r.push("from="+encodeURIComponent(t.from)),t.to&&r.push("to="+encodeURIComponent(t.to));var n="";return 0<r.length&&(n="?"+r.join("&")),"/dashboard/"+e.dashUri+n}return null},c);function c(e,t,r){var n=p.call(this,e,t)||this;return n.backendSrv=r,o.default.defaultsDeep(n.panel,d),n.currentValues={},n.events.on("init-edit-mode",n.onInitEditMode.bind(n)),n.events.on("data-received",n.onDataReceived.bind(n)),n.events.on("data-snapshot-load",n.onDataSnapshotLoad.bind(n)),n.searchDashboards=function(e,t){r.search({query:e}).then((function(e){var r=o.default.map(e,(function(e){return e.title}));t(r)}))},n}(t.WeathermapCtrl=h).templateUrl="partials/module.html"},function(t,r){t.exports=e},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=t.pluginName="ravualhemio-weathermap-panel";t.editorPath="public/plugins/"+n+"/partials/editor.html",t.nodeEditorPath="public/plugins/"+n+"/partials/nodeEditor.html",t.edgeEditorPath="public/plugins/"+n+"/partials/edgeEditor.html",t.labelEditorPath="public/plugins/"+n+"/partials/labelEditor.html",t.styleEditorPath="public/plugins/"+n+"/partials/styleEditor.html"},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.svgNamespace="http://www.w3.org/2000/svg",t.xlinkNamespace="http://www.w3.org/1999/xlink"},function(e,t,r){"use strict";function n(e,t){return{x:(e.x+t.x)/2,y:(e.y+t.y)/2}}Object.defineProperty(t,"__esModule",{value:!0}),t.midpoint=n,t.halveCubicBezier=function(e,t,r,a){if(null===t){if(null===r){var i=n(e,a);return[e,e,i,i,i,a,a]}t=e}null===r&&(r=a);var o=n(e,t),s=n(t,r),l=n(r,a),u=n(o,s),p=n(s,l);return[e,o,u,n(u,p),p,l,a]},t.polarToCartesian=function(e,t){return null===e&&(e=0),null===t&&(t=0),{x:t*Math.cos(e),y:t*Math.sin(e)}},t.normalizeAngle=function(e){for(;e<=-Math.PI;)e+=2*Math.PI;for(;e>Math.PI;)e-=2*Math.PI;return e},t.unitVector=function(e){var t=Math.sqrt(e.x*e.x+e.y*e.y);return{x:e.x/t,y:e.y/t}},t.deg2rad=function(e){return e*Math.PI/180},t.rad2deg=function(e){return 180*e/Math.PI}},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.gradientColorForValue=function(e,t,r){return"linear"===e.type?function(e,t,r){if(0===e.length)return n;var i=e[e.length-1],o=0,s=0,l=0;if(r<e[0].position)return""+e[0][t];if(r>=i.position)return""+i[t];for(var u=!1,p=0;p<e.length-1;++p)if(r>=e[p].position&&r<e[p+1].position){var d=e[p].position,h=Number.parseInt((""+e[p][t]).substr(1,2),16),c=Number.parseInt((""+e[p][t]).substr(3,2),16),f=Number.parseInt((""+e[p][t]).substr(5,2),16),m=e[p+1].position,g=Number.parseInt((""+e[p+1][t]).substr(1,2),16),v=Number.parseInt((""+e[p+1][t]).substr(3,2),16),y=Number.parseInt((""+e[p+1][t]).substr(5,2),16);o=a(r,d,m,h,g),s=a(r,d,m,c,v),l=a(r,d,m,f,y),u=!0;break}return u?"rgb("+Math.floor(o)+", "+Math.floor(s)+", "+Math.floor(l)+")":n}(e.stops,t,r):"steps"===e.type?function(e,t,r){if(0===e.length)return n;var a=e[e.length-1];if(r<e[0].position)return""+e[0][t];if(r>=a.position)return""+a[t];for(var i=0;i<e.length-1;++i)if(r>=e[i].position&&r<e[i+1].position)return""+e[i][t];return n}(e.stops,t,r):n};var n="pink";function a(e,t,r,n,a){return n===a?n:(e<t&&(e=t),r<e&&(e=r),n+(e-t)/(r-t)*(a-n))}},function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.placeLegend=function(e,t,r,n,s,l){var u="";if(""!==t.type){var p=e.g();r.appendChild(p),p.setAttribute("class","stroke-legend"),"h"===t.type[0]?u="translate("+t.x+" "+t.y+") scale("+t.length/a+" "+t.width/i+")":"v"===t.type[0]&&(u="translate("+t.x+" "+(t.y+t.length)+") rotate(-90) scale("+t.length/a+" "+t.width/i+")"),p.setAttribute("transform",u),o(e,s,"strokeColor",p,n,l);var d=e.g();r.appendChild(d),p.setAttribute("class","fill-legend"),"h"===t.type[0]?u="translate("+t.x+" "+(t.y+t.width)+") scale("+t.length/a+" "+t.width/i+")":"v"===t.type[0]&&(u="translate("+(t.x+t.width)+" "+(t.y+t.length)+") rotate(-90) scale("+t.length/a+" "+t.width/i+")"),d.setAttribute("transform",u),o(e,s,"fillColor",d,n,l),function(e,t,r,n){if(""!==t.type&&"n"!==t.type[1])for(var i=0,o=r.stops;i<o.length;i++){var s=o[i];if(s.showLegendLabel){var l=t.x,u=t.y,p=0,d="start";"h"===t.type[0]?(l+=s.position*t.length/a,d="middle","hb"===t.type&&(u+=2*t.width,p=1)):"v"===t.type[0]&&(u+=t.length-s.position*t.length/a,p=.4,"vl"===t.type?d="end":"vr"===t.type&&(d="start",l+=2*t.width));var h=e.text();n.appendChild(h),h.setAttribute("class","legend-label"),h.setAttribute("x",""+l),h.setAttribute("y",""+u),h.setAttribute("dy",p+"em"),h.setAttribute("style","text-anchor:"+d),h.textContent=""+s.position}}}(e,t,s,r)}};var n=r(0),a=100,i=5;function o(e,t,r,o,s,l){if("linear"===t.type){var u="WeathermapLegendGradient-"+r;null!=l&&(u=u+"-"+l);var p=e.linearGradient();s.appendChild(p),p.setAttribute("id",u);for(var d=0,h=t.stops;d<h.length;d++){var c=h[d],f=e.stop();p.appendChild(f),f.setAttribute("offset",c.position+"%"),f.setAttribute("stop-color",""+c[r])}var m=e.rect();o.appendChild(m),(0,n.setRectangleDimensions)(m,0,0,a,i),m.setAttribute("style","fill:url(#"+u+")")}else if("steps"===t.type){for(var g=1;g<t.stops.length;++g){var v=e.rect();o.appendChild(v),(0,n.setRectangleDimensions)(v,t.stops[g-1].position,0,t.stops[g].position-t.stops[g-1].position,i),v.setAttribute("style","fill:"+t.stops[g-1][r])}var y=e.rect();o.appendChild(y),(0,n.setRectangleDimensions)(y,t.stops[t.stops.length-1].position,0,100-t.stops[t.stops.length-1].position,i),y.setAttribute("style","fill:"+t.stops[t.stops.length-1][r])}}},function(e,r){e.exports=t},function(e,t){e.exports=r}],n.c=i,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var a in e)n.d(r,a,function(t){return e[t]}.bind(null,a));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1);function n(e){if(i[e])return i[e].exports;var t=i[e]={i:e,l:!1,exports:{}};return a[e].call(t.exports,t,t.exports,n),t.l=!0,t.exports}var a,i}));
//# sourceMappingURL=module.js.map