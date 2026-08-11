<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #dataPanel>
            <ext-lockedgrid ref="grid" itemConfig='{"viewModel":true}' multicolumnSort="true" @ready="_ready">
                <ext-toolbar docked="top">
                    <ext-searchfield :placeholder="l10n(`Search for methods by name`)" width="200" @change="_search"/>
                    <ext-spacer width="20"/>
                    <ext-button ref="periodButton" @ready="_periodButtonReady"/>
                    <ext-spacer/>
                    <ext-togglefield :label="l10n(`Auto refresh`)" labelAlign="right" @change="autoRefreshChange"/>
                    <ext-button ref="refreshButton" iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>

                <!-- <ext-column dataIndex="id" flex="1" locked="left" minWidth="290" :text="l10n( `Method name` )"/> -->

                <!-- <ext-column align="right" dataIndex="calls_text" sorter='{"property":"calls"}' :text="l10n( `Calls` )" width="140"/> -->

                <!-- <ext-column align="right" dataIndex="duration_per_call_text" sorter='{"property":"duration_per_call"}' :text="l10n( `Duration / call (ms)` )" width="140"/> -->

                <!-- <ext-column align="right" dataIndex="duration_text" sorter='{"property":"duration_share"}' :text="l10n( `Duration (%)` )" width="140"/> -->

                <!-- <ext-column align="right" dataIndex="exceptions_text" sorter='{"property":"exceptions"}' :text="l10n( `Exceptions` )" width="140"/> -->

                <!-- <ext-column align="right" dataIndex="exceptions_per_call_text" sorter='{"property":"exceptions_per_call"}' :text="l10n( `Exceptions / call (%)` )" width="140"/> -->

                <!-- <ext-column locked="right" width="80" @ready="_actionColReady"/> -->
            </ext-lockedgrid>

            <ext-panel collapsed="true" collapsible="right" docked="right" headerPosition="left" layout="fit" minWidth="600" resizable='{"edges":"west","snap":200,"split":true}' :title="l10n(`Latest charts`)">
                <CharstPanel ref="chartsPanel" period="1 hour" :record="selectedRecord"/>
            </ext-panel>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import ChartsDialog from "./charts.dialog";
import CharstPanel from "./charts.panel";
import ExceptionsDialog from "./exceptions.dialog";
import MethodModel from "./models/method";

const DEFAULT_AUTOREFRESH_INTERVAL = 60_000;

const periods = [ 1, 3, 7, 14, 30 ],
    defaultPeriod = 3;

export default {
    "components": { CardsPanel, CharstPanel },

    data () {
        return {
            "selectedRecord": null,
        };
    },

    created () {
        this.store = new Ext.data.Store( {
            "model": MethodModel,
            "autoLoad": false,
            "pageSize": null,
            "remoteSort": false,
            "remoteFilter": false,
            "sorters": [
                {
                    "property": "calls",
                    "direction": "DESC",
                },
            ],
        } );
    },

    unmounted () {
        this._stopAutoRefresh();
    },

    "methods": {

        // public
        async refresh () {
            const cardsPanel = this.$refs.cardsPanel;

            cardsPanel.mask();

            this._stopAutoRefresh();

            const res = await this.$api.call( "development/monitoring/methods/get-methods", { "period": this.period } );

            this._startAutoRefresh();

            cardsPanel.setResult( res );

            if ( res.ok ) this.store.loadRawData( res.data );
        },

        async showChartsDialog ( record, button ) {
            record ??= button.up( "gridrow" )?.getRecord();

            if ( !record ) return;

            const cmp = await this.$mount( ChartsDialog, {
                "props": {
                    record,
                },
            } );

            cmp.ext.show();
        },

        async showExceptions ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            const cmp = await this.$mount( ExceptionsDialog, {
                "props": {
                    record,
                },
            } );

            cmp.ext.show();
        },

        // protected
        _ready ( e ) {
            const cmp = e.detail.cmp;

            // cmp.setColumnMenu( null );

            cmp.getRegion( "left" ).getGrid().setSelectable( {
                "mode": "single",
            } );

            cmp.getRegion( "left" )
                .getGrid()
                .on( "select", ( grid, selection ) => ( this.selectedRecord = selection ) )
                .on( "childdoubletap", ( grid, location ) => this._onChildDoubleTap( location ) );

            cmp.setStore( this.store );

            cmp.setColumns( [
                {
                    "dataIndex": "method_display_name",
                    "flex": 1,
                    "minWidth": 290,
                    "text": l10n( "Method name" ),
                    "locked": "left",
                    "sorter": { "property": "method_name" },
                    "cell": { "encodeHtml": false, "height": 60 },
                },
                {
                    "align": "right",
                    "dataIndex": "calls_text",
                    "sorter": { "property": "calls" },
                    "text": l10n( "Calls" ),
                    "width": 140,
                    "cell": { "height": 60 },
                },
                {
                    "align": "right",
                    "dataIndex": "duration_per_call_text",
                    "sorter": { "property": "duration_per_call" },
                    "text": l10n( "Duration / call (ms)" ),
                    "width": 140,
                },
                {
                    "align": "right",
                    "dataIndex": "duration_text",
                    "sorter": { "property": "duration_share" },
                    "text": l10n( "Duration (%)" ),
                    "width": 140,
                },
                {
                    "align": "right",
                    "dataIndex": "exceptions_text",
                    "sorter": { "property": "exceptions" },
                    "text": l10n( "Exceptions" ),
                    "width": 140,
                },
                {
                    "align": "right",
                    "dataIndex": "exceptions_per_call_text",
                    "sorter": { "property": "exceptions_per_call" },
                    "text": l10n( "Exceptions / call (%)" ),
                    "width": 140,
                },
                {
                    "width": 80,
                    "locked": "left",
                    "listeners": {
                        "added": cmp => this._actionColReady( { "detail": { cmp } } ),
                    },
                },
            ] );
        },

        _periodButtonReady ( e ) {
            const cmp = e.detail.cmp;

            const menu = [];

            this.period = defaultPeriod;

            for ( const period of periods ) {
                const text = l10n( msgid`${ period } day`, msgid`${ period } days`, period );

                if ( period === defaultPeriod ) cmp.setText( l10n( "Period" ) + ": " + text );

                menu.push( {
                    "xtype": "menuradioitem",
                    "value": period,
                    text,
                    "group": "period",
                    "checked": period === defaultPeriod,
                    "handler": this._setPeriod.bind( this ),
                } );
            }

            cmp.setMenu( menu );
        },

        _actionColReady ( e ) {
            var cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "end", "align": "center" },
                    "items": [
                        {
                            "xtype": "button",
                            "iconCls": "fa-solid fa-chart-line",
                            "tooltip": l10n( "Open charts" ),
                            "handler": this.showChartsDialog.bind( this, null ),
                        },
                        {
                            "xtype": "button",
                            "iconCls": "fa-solid fa-triangle-exclamation",
                            "tooltip": l10n( "Exceptions log" ),
                            "handler": this.showExceptions.bind( this ),
                        },
                    ],
                },
            } );
        },

        _search ( e ) {
            const value = e.detail.newValue.trim();

            if ( value !== "" ) {
                this.store.addFilter( {
                    "property": "method_name",
                    "operator": "like",
                    value,
                } );
            }
            else {
                this.store.removeFilter( "method_name" );
            }
        },

        autoRefreshChange ( e ) {
            const val = e.detail.newValue;

            if ( val ) {
                this.autoRefreshEnabled = true;

                this._startAutoRefresh();
            }
            else {
                this.autoRefreshEnabled = false;

                this._stopAutoRefresh();
            }
        },

        _startAutoRefresh () {
            this._stopAutoRefresh();

            if ( !this.autoRefreshEnabled ) return;

            this.autoRefreshInterval = setInterval( () => {
                this.refresh();

                this.$refs.latestPanel.refresh();
            }, DEFAULT_AUTOREFRESH_INTERVAL );
        },

        _stopAutoRefresh () {
            clearInterval( this.autoRefreshInterval );

            this.autoRefreshInterval = null;
        },

        _setPeriod ( menuItem ) {
            const period = menuItem.getValue();

            if ( this.period === period ) return;

            this.period = period;

            this.$refs.periodButton.ext.setText( l10n( "Period" ) + ": " + menuItem.getText() );

            this.refresh();
        },

        _onChildDoubleTap ( location ) {
            this.showChartsDialog( location.record );
        },
    },
};
</script>
