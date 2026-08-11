<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #dataPanel>
            <ext-panel ref="dataPanel" layout="vbox" scrollable="true">
                <ext-toolbar docked="top">
                    <ext-button ref="periodButton" stretchMenu="true" @ready="_periodButtonReady"/>
                    <ext-spacer/>
                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>

                <ext-amcharts5 ref="totalSubscribedUsersChart" :createChart="_createTotalSubscribedUsersChart" height="300" :setChartData="_setChartData"/>

                <ext-amcharts5 ref="subscriptionsChart" :createChart="_createSubscriptionsChart" height="300" :setChartData="_setChartData"/>
            </ext-panel>
        </template>
    </CardsPanel>
</template>

<script>
import "#src/components/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import CardsPanel from "#src/components/cards.panel";

const PERIODS = {
    "7 days": {
        "text": l10n( "Past 7 days" ),
        "timeUnit": "hour",
    },
    "3 months": {
        "text": l10n( "Past 3 months" ),
        "timeUnit": "day",
    },
    "1 year": {
        "text": l10n( "Past 12 months" ),
        "timeUnit": "day",
    },
};

export default {
    "components": { CardsPanel },

    "props": {
        "telegramBotRecord": {
            "type": Object,
            "default": null,
        },
        "telegramBotLinkRecord": {
            "type": Object,
            "default": null,
        },
        "period": {
            "type": String,
            "default": "7 days",
        },
    },

    "methods": {

        // public
        async refresh () {
            if ( !this._period ) return;
            if ( !this.$refs.cardsPanel.isRendered ) return;

            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "telegram/bots/links/get-link-stats", this.telegramBotRecord.id, this.telegramBotLinkRecord.id, this._period );

            if ( !res.ok ) {
                this.$refs.cardsPanel.setResult( res );
            }
            else if ( !res.data?.length ) {
                this.$refs.cardsPanel.showNoDataPanel();
            }
            else {
                this.$refs.cardsPanel.setResult( res );

                this.$refs.totalSubscribedUsersChart.ext.setData( res.data );
                this.$refs.subscriptionsChart.ext.setData( res.data );
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
                    "checked": value === this.period,
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

        _createTotalSubscribedUsersChart ( cmp ) {
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
                "text": l10n( "Total subscribed users" ),
                "fontSize": 12,
                "x": am5.percent( 50 ),
                "centerX": am5.percent( 50 ),
            } ) );

            // x axis
            const xAxis = chart.xAxes.push( am5xy.DateAxis.new( root, {
                "maxDeviation": 0,
                "baseInterval": {
                    "timeUnit": "day",
                    "count": 1,
                },
                "renderer": am5xy.AxisRendererX.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
            } ) );

            // y axis 1
            const yAxis1 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "renderer": am5xy.AxisRendererY.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": {},
                "numberFormat": {},
            } ) );

            // data processor
            const dateProcessor = am5.DataProcessor.new( root, {
                "dateFields": [ "date" ],
                "dateFormat": "i",
            } );

            // serie 1
            const series1 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "Total subscribed users" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "total_subscribed_users",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "Subscribed users" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#00ff00" ),
                "fill": am5.color( "#00ff00" ),
                "connect": true,
            } ) );

            // data processor
            series1.data.processor = dateProcessor;

            // fill settings
            series1.fills.template.setAll( {
                "fillOpacity": 0.3,
                "visible": true,
            } );

            // serie 2
            const series2 = chart.series.push( am5xy.StepLineSeries.new( root, {
                "name": l10n( "Total unsubscribed users" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "total_unsubscribed_users",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "Unsubscribed users" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#ff0000" ),
                "fill": am5.color( "#ff0000" ),
                "connect": true,
            } ) );

            // data processor
            series2.data.processor = dateProcessor;

            // fill settings
            series2.fills.template.setAll( {
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

        _createSubscriptionsChart ( cmp ) {
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
                "text": l10n( "Subscribed users" ),
                "fontSize": 12,
                "x": am5.percent( 50 ),
                "centerX": am5.percent( 50 ),
            } ) );

            // x axis
            const xAxis = chart.xAxes.push( am5xy.DateAxis.new( root, {
                "maxDeviation": 0,
                "baseInterval": {
                    "timeUnit": "day",
                    "count": 1,
                },
                "renderer": am5xy.AxisRendererX.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
            } ) );

            // y axis 1
            const yAxis1 = chart.yAxes.push( am5xy.ValueAxis.new( root, {
                "renderer": am5xy.AxisRendererY.new( root, {} ),
                "tooltip": am5.Tooltip.new( root, {} ),
                "tooltipNumberFormat": {},
                "numberFormat": {},
            } ) );

            // data processor
            const dateProcessor = am5.DataProcessor.new( root, {
                "dateFields": [ "date" ],
                "dateFormat": "i",
            } );

            // serie 1
            const series1 = chart.series.push( am5xy.ColumnSeries.new( root, {
                "name": l10n( "Subscribed users" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "total_subscribed_users_delta",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "Subscribed users" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#00ff00" ),
                "fill": am5.color( "#00ff00" ),
                "connect": false,
            } ) );

            // data processor
            series1.data.processor = dateProcessor;

            // fill settings
            // series1.fills.template.setAll( {
            //     "fillOpacity": 0.3,
            //     "visible": true,
            // } );

            // serie 2
            const series2 = chart.series.push( am5xy.ColumnSeries.new( root, {
                "name": l10n( "Unsubscribed users" ),
                xAxis,
                "yAxis": yAxis1,
                "valueXField": "date",
                "valueYField": "total_unsubscribed_users_delta",
                "tooltip": am5.Tooltip.new( root, {
                    "labelText": l10n( "Unsubscribed users" ) + ": {valueY.formatNumber()}",
                } ),
                "stroke": am5.color( "#ff0000" ),
                "fill": am5.color( "#ff0000" ),
                "connect": false,
            } ) );

            // // data processor
            series2.data.processor = dateProcessor;

            // fill settings
            // series2.fills.template.setAll( {
            //     "fillOpacity": 0.3,
            //     "visible": true,
            // } );

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
    },
};
</script>
