<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #docked>
            <ext-toolbar docked="top">
                <ext-button ref="periodButton" stretchMenu="true" @ready="_periodButtonReady"/>
                <ext-spacer/>
                <ext-button :hidden="!showMaximizeButton" iconCls="fa-solid fa-expand" :tooltip="l10n(`Maximize charts`)" @tap="_showChartsDialog"/>
                <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
            </ext-toolbar>
        </template>

        <template #dataPanel>
            <ext-container defaults='{"height":300}' layput="vbox" scrollable="true">
                <ext-amcharts5 ref="cpuUsageChart" :createChart="_createCpuUsedChart" :setChartData="_setChartData"/>

                <ext-amcharts5 ref="memryUsedChart" :createChart="_createRamUsedChart" :setChartData="_setChartData"/>

                <ext-amcharts5 ref="memryRssChart" :createChart="_createRssUsedChart" :setChartData="_setChartData"/>

                <ext-amcharts5 ref="hddUsedChart" :createChart="_createHddUsedChart" :setChartData="_setChartData"/>
            </ext-container>
        </template>
    </CardsPanel>
</template>

<script>
import "#src/components/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import CardsPanel from "#src/components/cards.panel";

const PERIODS = {
    "1 hour": {
        "text": l10n( "Past hour" ),
        "timeUnit": "minute",
    },
    "7 days": {
        "text": l10n( "Past 7 days" ),
        "timeUnit": "hour",
    },
    "30 days": {
        "text": l10n( "Past 30 days" ),
        "timeUnit": "hour",
    },
};

export default {
    "components": { CardsPanel },

    "props": {
        "record": {
            "type": Object,
            "default": null,
        },
        "period": {
            "type": String,
            "required": true,
        },
        "showMaximizeButton": {
            "type": Boolean,
            "default": true,
        },
    },

    "watch": {
        record ( newValue, OldValue ) {
            if ( newValue !== OldValue ) this.refresh();
        },
    },

    "methods": {

        // public
        async refresh () {
            if ( !this.record ) {
                this.$refs.cardsPanel.showNoDataPanel();

                return;
            }

            if ( !this._period ) return;
            if ( !this.$refs.cardsPanel.isRendered ) return;

            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "development/monitoring/instances/get-instance-stats", this.record.id, this._period );

            this.$refs.cardsPanel.unmask();

            if ( !res.ok ) {
                this.$refs.cardsPanel.setResult( res );
            }
            else if ( !res.data?.length ) {
                this.$refs.cardsPanel.showNoDataPanel();
            }
            else {
                this.$refs.cardsPanel.setResult( res );

                this.$refs.cpuUsageChart.ext.setData( res.data );
                this.$refs.memryUsedChart.ext.setData( res.data );
                this.$refs.memryRssChart.ext.setData( res.data );
                this.$refs.hddUsedChart.ext.setData( res.data );
            }
        },

        // protected
        _periodButtonReady ( e ) {
            const cmp = e.detail.cmp;

            this._period = this.period;

            const menu = [];

            for ( const [ value, { text } ] of Object.entries( PERIODS ) ) {
                menu.push( {
                    "xtype": "menuradioitem",
                    value,
                    text,
                    "group": "period",
                    "checked": value === this._period,
                    "handler": this._setPeriod.bind( this ),
                } );
            }

            cmp.setMenu( menu );

            cmp.setText( l10n( "Period" ) + ": " + PERIODS[ this._period ].text );

            this.refresh();
        },

        _setPeriod ( menuItem ) {
            const button = this.$refs.periodButton.ext;

            button.getMenu().hide();

            if ( this._period === menuItem.getValue() ) return;

            this._period = menuItem.getValue();

            button.setText( l10n( "Period" ) + ": " + PERIODS[ this._period ].text );

            this.refresh();
        },

        _createCpuUsedChart ( cmp ) {
            const root = cmp.root,
                am5 = cmp.am5;

            // chart
            const chart = root.container.children.push( am5xy.XYChart.new( root, {
                "layout": root.verticalLayout,
                "panX": true,
                "pinchZoomX": true,
                "wheelX": "panX",
                "wheelY": "none",
            } ) );

            // title
            chart.children.unshift( am5.Label.new( root, {
                "text": l10n( "CPU usage" ),
                "fontSize": 12,
                "x": am5.percent( 50 ),
                "centerX": am5.percent( 50 ),
            } ) );

            // x axis
            const xAxis = chart.xAxes.push( am5xy.DateAxis.new( root, {
                "maxDeviation": 0,
                "baseInterval": {
                    "timeUnit": PERIODS[ this._period ].timeUnit,
                    "count": 1,
                },
                "renderer": am5xy.AxisRendererX.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
            } ) );

            // y axis 1
            const yAxis2 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "min": 0,
                "max": 1,
                "renderer": am5xy.AxisRendererY.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "percent", "maximumFractionDigits": 0 },
                "numberFormat": { "style": "percent", "maximumFractionDigits": 0 },
            } ) );

            // data processor
            const dateProcessor = am5.DataProcessor.new( root, {
                "dateFields": [ "date" ],
                "dateFormat": "i",
            } );

            // serie 1
            const series1 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "CPU used" ),
                xAxis,
                "yAxis": yAxis2,
                "valueXField": "date",
                "valueYField": "cpu_used",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "CPU used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#00ff00" ),
                "fill": am5.color( "#00ff00" ),
                "connect": false,
            } ) );

            // data processor
            series1.data.processor = dateProcessor;

            // serie tooltip label formatters
            series1.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "percent" },
                } )
            );

            // fill settings
            series1.fills.template.setAll( {
                "fillOpacity": 0.3,
                "visible": true,
            } );

            // cursor
            chart.set(
                "cursor",
                am5xy.XYCursor.new( root, {
                    "behavior": "zoomX",
                } )
            );

            // scroll bar
            chart.set(
                "scrollbarX",
                am5.Scrollbar.new( root, {
                    "orientation": "horizontal",
                } )
            );

            // legend
            const legend = chart.children.push( am5.Legend.new( root, {
                "centerX": am5.p50,
                "x": am5.p50,
            } ) );

            legend.data.setAll( chart.series.values );
        },

        _createRamUsedChart ( cmp ) {
            const root = cmp.root,
                am5 = cmp.am5;

            // chart
            const chart = root.container.children.push( am5xy.XYChart.new( root, {
                "layout": root.verticalLayout,
                "panX": true,
                "pinchZoomX": true,
                "wheelX": "panX",
                "wheelY": "none",
            } ) );

            // title
            chart.children.unshift( am5.Label.new( root, {
                "text": l10n( "RAM usage" ),
                "fontSize": 12,
                "x": am5.percent( 50 ),
                "centerX": am5.percent( 50 ),
            } ) );

            // x axis
            const xAxis = chart.xAxes.push( am5xy.DateAxis.new( root, {
                "maxDeviation": 0,
                "baseInterval": {
                    "timeUnit": PERIODS[ this._period ].timeUnit,
                    "count": 1,
                },
                "renderer": am5xy.AxisRendererX.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
            } ) );

            // y axis 1
            const yAxis1 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "renderer": am5xy.AxisRendererY.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "unit", "unit": "megabyte" },
                "numberFormat": { "style": "unit", "unit": "megabyte" },
            } ) );

            // y axis 2
            const yAxis2 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "min": 0,
                "max": 1,
                "renderer": am5xy.AxisRendererY.new( root, {
                    "opposite": true,
                } ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "percent", "maximumFractionDigits": 0 },
                "numberFormat": { "style": "percent", "maximumFractionDigits": 0 },
            } ) );

            // data processor
            const dateProcessor = am5.DataProcessor.new( root, {
                "dateFields": [ "date" ],
                "dateFormat": "i",
            } );

            // serie 1
            const series1 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "RAM used (MB)" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "ram_used",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "RAM used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#00ff00" ),
                "fill": am5.color( "#00ff00" ),
                "connect": false,
            } ) );

            // data processor
            series1.data.processor = dateProcessor;

            // serie tooltip label formatters
            series1.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "unit", "unit": "megabyte" },
                } )
            );

            // fill settings
            series1.fills.template.setAll( {
                "fillOpacity": 0.3,
                "visible": true,
            } );

            // serie 2
            const series2 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "RAM used (%)" ),
                xAxis,
                "yAxis": yAxis2,
                "valueXField": "date",
                "valueYField": "ram_used_percent",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "RAM used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#ff0000" ),
                "connect": true,
            } ) );

            // data processor
            series2.data.processor = dateProcessor;

            // serie tooltip label formatters
            series2.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "percent" },
                } )
            );

            // stroke settings
            series2.strokes.template.setAll( {
                "strokeWidth": 3,
            } );

            // cursor
            chart.set(
                "cursor",
                am5xy.XYCursor.new( root, {
                    "behavior": "zoomX",
                } )
            );

            // scroll bar
            chart.set(
                "scrollbarX",
                am5.Scrollbar.new( root, {
                    "orientation": "horizontal",
                } )
            );

            // legend
            const legend = chart.children.push( am5.Legend.new( root, {
                "centerX": am5.p50,
                "x": am5.p50,
            } ) );

            legend.data.setAll( chart.series.values );
        },

        _createRssUsedChart ( cmp ) {
            const root = cmp.root,
                am5 = cmp.am5;

            // chart
            const chart = root.container.children.push( am5xy.XYChart.new( root, {
                "layout": root.verticalLayout,
                "panX": true,
                "pinchZoomX": true,
                "wheelX": "panX",
                "wheelY": "none",
            } ) );

            // title
            chart.children.unshift( am5.Label.new( root, {
                "text": l10n( "RSS usage" ),
                "fontSize": 12,
                "x": am5.percent( 50 ),
                "centerX": am5.percent( 50 ),
            } ) );

            // x axis
            const xAxis = chart.xAxes.push( am5xy.DateAxis.new( root, {
                "maxDeviation": 0,
                "baseInterval": {
                    "timeUnit": PERIODS[ this._period ].timeUnit,
                    "count": 1,
                },
                "renderer": am5xy.AxisRendererX.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
            } ) );

            // y axis 1
            const yAxis1 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "renderer": am5xy.AxisRendererY.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "unit", "unit": "megabyte" },
                "numberFormat": { "style": "unit", "unit": "megabyte" },
            } ) );

            // y axis 2
            const yAxis2 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "min": 0,
                "max": 1,
                "renderer": am5xy.AxisRendererY.new( root, {
                    "opposite": true,
                } ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "percent", "maximumFractionDigits": 0 },
                "numberFormat": { "style": "percent", "maximumFractionDigits": 0 },
            } ) );

            // data processor
            const dateProcessor = am5.DataProcessor.new( root, {
                "dateFields": [ "date" ],
                "dateFormat": "i",
            } );

            // serie 1
            const series1 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "RSS used (MB)" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "rss_used",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "RSS used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#00ff00" ),
                "fill": am5.color( "#00ff00" ),
                "connect": false,
            } ) );

            // data processor
            series1.data.processor = dateProcessor;

            // serie tooltip label formatters
            series1.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "unit", "unit": "megabyte" },
                } )
            );

            // fill settings
            series1.fills.template.setAll( {
                "fillOpacity": 0.3,
                "visible": true,
            } );

            // serie 2
            const series2 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "RSS used (%)" ),
                xAxis,
                "yAxis": yAxis2,
                "valueXField": "date",
                "valueYField": "rss_used_percent",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "RSS used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#ff0000" ),
                "connect": true,
            } ) );

            // data processor
            series2.data.processor = dateProcessor;

            // serie tooltip label formatters
            series2.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "percent" },
                } )
            );

            // stroke settings
            series2.strokes.template.setAll( {
                "strokeWidth": 3,
            } );

            // cursor
            chart.set(
                "cursor",
                am5xy.XYCursor.new( root, {
                    "behavior": "zoomX",
                } )
            );

            // scroll bar
            chart.set(
                "scrollbarX",
                am5.Scrollbar.new( root, {
                    "orientation": "horizontal",
                } )
            );

            // legend
            const legend = chart.children.push( am5.Legend.new( root, {
                "centerX": am5.p50,
                "x": am5.p50,
            } ) );

            legend.data.setAll( chart.series.values );
        },

        _createHddUsedChart ( cmp ) {
            const root = cmp.root,
                am5 = cmp.am5;

            // chart
            const chart = root.container.children.push( am5xy.XYChart.new( root, {
                "layout": root.verticalLayout,
                "panX": true,
                "pinchZoomX": true,
                "wheelX": "panX",
                "wheelY": "none",
            } ) );

            // title
            chart.children.unshift( am5.Label.new( root, {
                "text": l10n( "HDD usage" ),
                "fontSize": 12,
                "x": am5.percent( 50 ),
                "centerX": am5.percent( 50 ),
            } ) );

            // x axis
            const xAxis = chart.xAxes.push( am5xy.DateAxis.new( root, {
                "maxDeviation": 0,
                "baseInterval": {
                    "timeUnit": PERIODS[ this._period ].timeUnit,
                    "count": 1,
                },
                "renderer": am5xy.AxisRendererX.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
            } ) );

            // y axis 1
            const yAxis1 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "renderer": am5xy.AxisRendererY.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "unit", "unit": "megabyte" },
                "numberFormat": { "style": "unit", "unit": "megabyte" },
            } ) );

            // y axis 2
            const yAxis2 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "min": 0,
                "max": 1,
                "renderer": am5xy.AxisRendererY.new( root, {
                    "opposite": true,
                } ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": { "style": "percent", "maximumFractionDigits": 0 },
                "numberFormat": { "style": "percent", "maximumFractionDigits": 0 },
            } ) );

            // data processor
            const dateProcessor = am5.DataProcessor.new( root, {
                "dateFields": [ "date" ],
                "dateFormat": "i",
            } );

            // serie 1
            const series1 = chart.series.push( am5xy.SmoothedXLineSeries.new( root, {
                "name": l10n( "HDD used (MB)" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "hdd_used",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "HDD used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#00ff00" ),
                "fill": am5.color( "#00ff00" ),
                "connect": true,
            } ) );

            // data processor
            series1.data.processor = dateProcessor;

            // serie tooltip label formatters
            series1.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "unit", "unit": "megabyte" },
                } )
            );

            // fill settings
            series1.fills.template.setAll( {
                "fillOpacity": 0.3,
                "visible": true,
            } );

            // serie 2
            const series2 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "HDD used (%)" ),
                xAxis,
                "yAxis": yAxis2,
                "valueXField": "date",
                "valueYField": "hdd_used_percent",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "HDD used" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#ff0000" ),
                "connect": true,
            } ) );

            // data processor
            series2.data.processor = dateProcessor;

            // serie tooltip label formatters
            series2.get( "tooltip" ).label.set(
                "numberFormatter",
                am5.NumberFormatter.new( root, {
                    "numberFormat": { "style": "percent" },
                } )
            );

            // stroke settings
            series2.strokes.template.setAll( {
                "strokeWidth": 3,
            } );

            // cursor
            chart.set(
                "cursor",
                am5xy.XYCursor.new( root, {
                    "behavior": "zoomX",
                } )
            );

            // scroll bar
            chart.set(
                "scrollbarX",
                am5.Scrollbar.new( root, {
                    "orientation": "horizontal",
                } )
            );

            // legend
            const legend = chart.children.push( am5.Legend.new( root, {
                "centerX": am5.p50,
                "x": am5.p50,
            } ) );

            legend.data.setAll( chart.series.values );
        },

        _setChartData ( chart, data ) {
            const xAxis = chart.root.container.children.values[ 0 ].xAxes.values[ 0 ];

            if ( xAxis.get( "baseInterval" ).timeUnit !== PERIODS[ this._period ].timeUnit ) {
                xAxis.get( "baseInterval" ).timeUnit = PERIODS[ this._period ].timeUnit;
            }

            return data;
        },

        async _showChartsDialog () {
            if ( !this.record ) return;

            const cmp = await this.$mount( import( "./charts.dialog" ), {
                "props": {
                    "record": this.record,
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
