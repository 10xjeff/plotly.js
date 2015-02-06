(function(root, factory){
    if (typeof exports == 'object') {
        // CommonJS
        module.exports = factory(root, require('./plotly'));
    } else {
        // Browser globals
        if (!root.Plotly) { root.Plotly = {}; }
        factory(root, root.Plotly);
    }
}(this, function(exports, Plotly){
    // `exports` is `window`
    // `Plotly` is `window.Plotly`

    'use strict';
    /* jshint camelcase: false */

    // ---Plotly global modules
    /* global Plotly:false */

    // ---external global dependencies
    /* global d3:false */

    var legend = Plotly.Legend = {};
    // -----------------------------------------------------
    // styling functions for traces in legends.
    // same functions for styling traces in the style box
    // -----------------------------------------------------

    legend.layoutAttributes = {
        bgcolor: {type: 'color'},
        bordercolor: {
            type: 'color',
            dflt: '#444'
        },
        borderwidth: {
            type: 'number',
            min: 0,
            dflt: 0
        },
        font:{type: 'font'},
        traceorder: {
            type: 'enumerated',
            values: ['normal', 'reversed']
        },
        x: {
            type: 'number',
            min: -2,
            max: 3,
            dflt: 1.02
        },
        xanchor: {
            type: 'enumerated',
            values: ['auto', 'left', 'center', 'right'],
            dflt: 'left'
        },
        y: {
            type: 'number',
            min: -2,
            max: 3,
            dflt: 1
        },
        yanchor: {
            type: 'enumerated',
            values: ['auto', 'top', 'middle', 'bottom'],
            dflt: 'auto'
        }
    };

    legend.supplyLayoutDefaults = function(layoutIn, layoutOut, fullData){
        var containerIn = layoutIn.legend || {},
            containerOut = layoutOut.legend = {};

        var visibleTraces = 0,
            defaultOrder = 'normal';
        fullData.forEach(function(trace) {
            if(legendGetsTrace(trace)) visibleTraces++;

            if((Plotly.Plots.isBar(trace.type) && layoutOut.barmode==='stack') ||
                    ['tonextx','tonexty'].indexOf(trace.fill)!==-1) {
                defaultOrder = 'reversed';
            }
        });

        function coerce(attr, dflt) {
            return Plotly.Lib.coerce(containerIn, containerOut,
                legend.layoutAttributes, attr, dflt);
        }

        var showLegend = Plotly.Lib.coerce(layoutIn, layoutOut,
            Plotly.Plots.layoutAttributes, 'showlegend', visibleTraces > 1);

        if(showLegend) {
            coerce('bgcolor', layoutOut.paper_bgcolor);
            coerce('bordercolor');
            coerce('borderwidth');
            coerce('font', layoutOut.font);
            coerce('traceorder', defaultOrder);
            coerce('x');
            coerce('xanchor');
            coerce('y');
            coerce('yanchor');
            Plotly.Lib.noneOrBoth(containerIn, containerOut, 'x', 'y');
        }
    };

    legend.lines = function(d){
        var trace = d[0].trace,
            isScatter = Plotly.Plots.isScatterAny(trace.type) && trace.visible,
            showFill = isScatter && trace.fill && trace.fill!=='none',
            showLine = isScatter && Plotly.Scatter.hasLines(trace);

        var fill = d3.select(this).select('.legendfill').selectAll('path')
            .data(showFill ? [d] : []);
        fill.enter().append('path').classed('js-fill',true);
        fill.exit().remove();
        fill.attr('d', 'M5,0h30v6h-30z')
            .call(Plotly.Drawing.fillGroupStyle);

        var line = d3.select(this).select('.legendlines').selectAll('path')
            .data(showLine ? [d] : []);
        line.enter().append('path').classed('js-line',true)
            .attr('d', 'M5,0h30');
        line.exit().remove();
        line.call(Plotly.Drawing.lineGroupStyle);
    };

    legend.points = function(d){
        var d0 = d[0],
            trace = d0.trace,
            marker = trace.marker||{},
            isScatter = Plotly.Plots.isScatterAny(trace.type) && trace.visible,
            showMarkers = isScatter && Plotly.Scatter.hasMarkers(trace),
            showText = isScatter && Plotly.Scatter.hasText(trace),
            showLines = isScatter && Plotly.Scatter.hasLines(trace);

        var dMod, tMod;
        if(isScatter) {
            // constrain text, markers, etc so they'll fit on the legend
            var dEdit = {
                tx: 'Aa',
                mo: Math.max(0.2, (d0.mo+1 || marker.opacity+1 || 2) - 1)
            };
            if(d0.ms) dEdit.ms = 10; // bubble charts:
            if(d0.mlw>5) dEdit.mlw = 5;
            dMod = [Plotly.Lib.minExtend(d0, dEdit)];

            var tEdit = {textfont: {size: 10}};
            if(showMarkers) {
                tEdit.marker = {
                    size: Math.max(Math.min(marker.size, 16), 2),
                    sizeref: 1,
                    sizemode: 'diameter',
                    line: {width: Math.min(marker.line.width, marker.size)}
                };
            }
            if(showLines) {
                tEdit.line = {width: Math.min(trace.line.width, 10)};
            }
            tMod = Plotly.Lib.minExtend(trace, tEdit);
        }

        var ptgroup = d3.select(this).select('g.legendpoints');

        var pts = ptgroup.selectAll('path.scatterpts')
            .data(showMarkers ? dMod : []);
        pts.enter().append('path').classed('scatterpts',true)
            .attr('transform','translate(20,0)');
        pts.exit().remove();
        pts.call(Plotly.Drawing.pointStyle, tMod);

        var txt = ptgroup.selectAll('g.pointtext')
            .data(showText ? dMod : []);
        txt.enter()
            .append('g').classed('pointtext',true)
                .append('text').attr('transform','translate(20,0)');
        txt.exit().remove();
        txt.selectAll('text').call(Plotly.Drawing.textPointStyle,tMod);

    };

    legend.bars = function(d){
        var trace = d[0].trace,
            marker = trace.marker||{},
            markerLine = marker.line||{},
            barpath = d3.select(this).select('g.legendpoints')
                .selectAll('path.legendbar')
                .data(Plotly.Plots.isBar(trace.type) ? [d] : []);
        barpath.enter().append('path').classed('legendbar',true)
            .attr('d','M6,6H-6V-6H6Z')
            .attr('transform','translate(20,0)');
        barpath.exit().remove();
        barpath.each(function(d){
            var w = (d.mlw+1 || markerLine.width+1) - 1,
                p = d3.select(this);
            p.style('stroke-width',w+'px')
                .call(Plotly.Color.fill, d.mc || marker.color);
            if(w) {
                p.call(Plotly.Color.stroke, d.mlc || markerLine.color);
            }
        });
    };

    legend.boxes = function(d){
        var trace = d[0].trace,
            pts = d3.select(this).select('g.legendpoints')
                .selectAll('path.legendbox')
                .data(Plotly.Plots.isBox(trace.type) && trace.visible ? [d] : []);
        pts.enter().append('path').classed('legendbox', true)
            // if we want the median bar, prepend M6,0H-6
            .attr('d', 'M6,6H-6V-6H6Z')
            .attr('transform', 'translate(20,0)');
        pts.exit().remove();
        pts.each(function(d){
            var w = (d.lw+1 || trace.line.width+1) - 1,
                p = d3.select(this);
            p.style('stroke-width', w+'px')
                .call(Plotly.Color.fill, d.fc || trace.fillcolor);
            if(w) {
                p.call(Plotly.Color.stroke, d.lc || trace.line.color);
            }
        });
    };

    legend.style = function(s) {
        s.each(function(d){
            var traceGroup = d3.select(this);

            var fill = traceGroup
                .selectAll('g.legendfill')
                    .data([d]);
            fill.enter().append('g')
                .classed('legendfill',true);

            var line = traceGroup
                .selectAll('g.legendlines')
                    .data([d]);
            line.enter().append('g')
                .classed('legendlines',true);

            var symbol = traceGroup
                .selectAll('g.legendsymbols')
                    .data([d]);
            symbol.enter().append('g')
                .classed('legendsymbols',true);
            symbol.style('opacity', d[0].trace.opacity);

            symbol.selectAll('g.legendpoints')
                .data([d])
              .enter().append('g')
                .classed('legendpoints',true);
        })
        .each(legend.bars)
        .each(legend.boxes)
        .each(legend.lines)
        .each(legend.points);
    };

    legend.texts = function(context, td, d, i, traces){
        var fullLayout = td._fullLayout,
            trace = d[0].trace,
            traceIndex = trace.index,
            name = trace.name;

        var text = d3.select(context).selectAll('text.legendtext')
            .data([0]);
        text.enter().append('text').classed('legendtext', true);
        text.attr({
                x: 40,
                y: 0
            })
            .style('text-anchor', 'start')
            .call(Plotly.Drawing.font, fullLayout.legend.font)
            .text(name)
            .attr({'data-unformatted': name});

        function textLayout(s){
            Plotly.util.convertToTspans(s, function(){
                if(td.firstRender) legend.repositionLegend(td, traces);
            });
            s.selectAll('tspan.line').attr({x: s.attr('x')});
        }

        if(td._context.editable){
            text.call(Plotly.util.makeEditable)
                .call(textLayout)
                .on('edit', function(text){
                    this.attr({'data-unformatted': text});
                    this.text(text)
                        .call(textLayout);
                    if(!this.text()) text = ' \u0020\u0020 ';
                    Plotly.restyle(td, 'name', text, traceIndex);
                });
        }
        else text.call(textLayout);
    };

    // -----------------------------------------------------
    // legend drawing
    // -----------------------------------------------------

    // all types we currently support in legends
    var LEGENDTYPES = ['scatter', 'scatter3d', 'box', 'bar', 'histogram'];

    function legendGetsTrace(trace) {
        return trace.visible &&
            LEGENDTYPES.indexOf(trace.type) !== -1;
    }

    legend.draw = function(td, showlegend) {
        var layout = td.layout,
            fullLayout = td._fullLayout;

        if(!fullLayout._infolayer || !td.calcdata) return;

        if(showlegend!==undefined) layout.showlegend = showlegend;
        legend.supplyLayoutDefaults(layout, fullLayout, td._fullData);
        showlegend = fullLayout.showlegend;

        var opts = fullLayout.legend;

        var ldata = [];
        for(var i = 0; i < td.calcdata.length; i++) {
            var cd0 = td.calcdata[i][0],
                trace = cd0.trace;

            if(legendGetsTrace(trace) && trace.showlegend) {
                ldata.push([cd0]);
            }
        }

        if(opts.traceorder==='reversed') ldata.reverse();

        if(!showlegend || !ldata.length) {
            fullLayout._infolayer.selectAll('.legend').remove();
            Plotly.Plots.autoMargin(td, 'legend');
            return;
        }

        if(typeof td.firstRender === 'undefined') td.firstRender = true;
        else if(td.firstRender) td.firstRender = false;

        var legendsvg = fullLayout._infolayer.selectAll('svg.legend')
            .data([0]);
        legendsvg.enter(0).append('svg')
            .attr('class','legend');

        var bgRect = legendsvg.selectAll('rect.bg')
            .data([0]);
        bgRect.enter(0).append('rect')
            .attr('class','bg');
        bgRect
            .call(Plotly.Color.stroke, opts.bordercolor)
            .call(Plotly.Color.fill, opts.bgcolor)
            .style('stroke-width', opts.borderwidth+'px');

        var traces = legendsvg.selectAll('g.traces')
            .data(ldata);
        traces.enter().append('g').attr('class','traces');
        traces.exit().remove();
        traces.call(legend.style)
            .style('opacity', function(d) {
                return d[0].trace.visible === 'legendonly' ? 0.5 : 1;
            })
            .each(function(d, i) {
                legend.texts(this, td, d, i, traces);

                var traceToggle = d3.select(this).selectAll('rect')
                    .data([0]);
                traceToggle.enter().append('rect')
                    .classed('legendtoggle', true)
                    .style('cursor', 'pointer')
                    .call(Plotly.Color.fill, 'rgba(0,0,0,0)');
                traceToggle.on('click', function() {
                    if(td.dragged) return;

                    var trace = d[0].trace,
                        newVisible = trace.visible === true ?
                            'legendonly' : true;
                    Plotly.restyle(td, 'visible', newVisible, trace.index);
                });
            });

        legend.repositionLegend(td, traces);

        if(td._context.editable) {
            legendsvg.node().onmousedown = function(e) {
                // deal with other UI elements, and allow them
                // to cancel dragging
                if(Plotly.Fx.dragClear(td)) return true;

                var el3=d3.select(this),
                    x0 = +el3.attr('x'),
                    y0 = +el3.attr('y'),
                    xf = null,
                    yf = null;
                td.dragged = false;
                Plotly.Fx.setCursor(el3);

                window.onmousemove = function(e2) {
                    var dx = e2.clientX-e.clientX,
                        dy = e2.clientY-e.clientY,
                        gs = fullLayout._size,
                        lw = +el3.attr('width'),
                        lh = +el3.attr('height'),
                        MINDRAG = Plotly.Fx.MINDRAG;

                    if(Math.abs(dx)<MINDRAG) dx=0;
                    if(Math.abs(dy)<MINDRAG) dy=0;
                    if(dx||dy) td.dragged = true;

                    el3.call(Plotly.Drawing.setPosition, x0+dx, y0+dy);

                    xf = Plotly.Fx.dragAlign(x0+dx, lw, gs.l, gs.l+gs.w,
                        opts.xanchor);
                    yf = Plotly.Fx.dragAlign(y0+dy+lh, -lh, gs.t+gs.h, gs.t,
                        opts.yanchor);

                    var csr = Plotly.Fx.dragCursors(xf, yf,
                        opts.xanchor, opts.yanchor);
                    Plotly.Fx.setCursor(el3, csr);
                    return Plotly.Lib.pauseEvent(e2);
                };
                window.onmouseup = function(e2) {
                    window.onmousemove = null;
                    window.onmouseup = null;
                    Plotly.Fx.setCursor(el3);
                    if(td.dragged && xf!==null && yf!==null) {
                        Plotly.relayout(td, {'legend.x': xf, 'legend.y': yf});
                    }
                    return Plotly.Lib.pauseEvent(e2);
                };
                return Plotly.Lib.pauseEvent(e);
            };
        }
    };

    legend.repositionLegend = function(td, traces){
        var fullLayout = td._fullLayout,
            gs = fullLayout._size,
            opts = fullLayout.legend,
            borderwidth = opts.borderwidth,

            // add the legend elements, keeping track of the
            // legend size (in px) as we go
            legendwidth = 0,
            legendheight = 0;

        traces.each(function(d){
            var trace = d[0].trace,
                g = d3.select(this),
                bg = g.selectAll('.legendtoggle'),
                text = g.selectAll('.legendtext'),
                tspans = g.selectAll('.legendtext>tspan'),
                tHeight = opts.font.size * 1.3,
                tLines = tspans[0].length||1,
                tWidth = text.node() && Plotly.Drawing.bBox(text.node()).width,
                mathjaxGroup = g.select('g[class*=math-group]'),
                textY,
                tHeightFull;

            if(!trace.showlegend) {
                g.remove();
                return;
            }

            if(mathjaxGroup.node()) {
                var mathjaxBB = Plotly.Drawing.bBox(mathjaxGroup.node());
                tHeight = mathjaxBB.height;
                tWidth = mathjaxBB.width;
                mathjaxGroup.attr('transform','translate(0,'+(tHeight/4)+')');
            }
            else {
                // approximation to height offset to center the font
                // to avoid getBoundingClientRect
                textY = tHeight * (0.3 + (1-tLines)/2);
                text.attr('y',textY);
                tspans.attr('y',textY);
            }

            tHeightFull = Math.max(tHeight*tLines, 16)+3;
            g.attr('transform','translate('+borderwidth+',' +
                (5+borderwidth+legendheight+tHeightFull/2)+')');
            bg.attr({x: 0, y: -tHeightFull / 2, height: tHeightFull});

            legendheight += tHeightFull;
            legendwidth = Math.max(legendwidth, tWidth||0);
        });

        traces.selectAll('.legendtoggle')
            .attr('width', (td._context.editable ? 0 : legendwidth) + 40);

        legendwidth += 45+borderwidth*2;
        legendheight += 10+borderwidth*2;

        // now position the legend. for both x,y the positions are recorded as
        // fractions of the plot area (left, bottom = 0,0). Outside the plot
        // area is allowed but position will be clipped to the page.
        // values <1/3 align the low side at that fraction, 1/3-2/3 align the
        // center at that fraction, >2/3 align the right at that fraction

        var lx = gs.l+gs.w*opts.x,
            ly = gs.t+gs.h*(1-opts.y);

        var xanchor = 'left';
        if(opts.xanchor==='right' || (opts.xanchor==='auto' && opts.x>=2/3)) {
            lx -= legendwidth;
            xanchor = 'right';
        }
        else if(opts.xanchor==='center' || (opts.xanchor==='auto' && opts.x>1/3)) {
            lx -= legendwidth/2;
            xanchor = 'center';
        }

        var yanchor = 'top';
        if(opts.yanchor==='bottom' || (opts.yanchor==='auto' && opts.y<=1/3)) {
            ly -= legendheight;
            yanchor = 'bottom';
        }
        else if(opts.yanchor==='middle' || (opts.yanchor==='auto' && opts.y<2/3)) {
            ly -= legendheight/2;
            yanchor = 'middle';
        }

        // make sure we're only getting full pixels
        legendwidth = Math.ceil(legendwidth);
        legendheight = Math.ceil(legendheight);
        lx = Math.round(lx);
        ly = Math.round(ly);

        fullLayout._infolayer.selectAll('svg.legend')
            .call(Plotly.Drawing.setRect, lx, ly, legendwidth, legendheight);
        fullLayout._infolayer.selectAll('svg.legend .bg')
            .call(Plotly.Drawing.setRect, borderwidth/2, borderwidth/2,
                legendwidth-borderwidth, legendheight-borderwidth);

        // lastly check if the margin auto-expand has changed
        Plotly.Plots.autoMargin(td,'legend',{
            x: opts.x,
            y: opts.y,
            l: legendwidth * ({right:1, center:0.5}[xanchor]||0),
            r: legendwidth * ({left:1, center:0.5}[xanchor]||0),
            b: legendheight * ({top:1, middle:0.5}[yanchor]||0),
            t: legendheight * ({bottom:1, middle:0.5}[yanchor]||0)
        });
    };

    return legend;
}));
