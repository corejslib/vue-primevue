<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #dataPanel>
            <ext-grid ref="grid" itemConfig='{"viewModel":true}' multicolumnSort="true" @childdoubletap="_onChildDoubleTap" @ready="_ready">
                <ext-toolbar docked="top">
                    <ext-searchfield :placeholder="l10n(`Search for instances`)" width="200" @change="_search"/>
                    <ext-spacer width="20"/>
                    <ext-spacer/>
                    <ext-togglefield :label="l10n(`Auto refresh`)" labelAlign="right" @change="autoRefreshChange"/>
                    <ext-button ref="refreshButton" iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>

                <ext-column dataIndex="instance_type" flex="1" :text="l10n(`Instance type`)"/>

                <ext-column dataIndex="ram_total" :text="l10n(`RAM (total)`)" width="120" @ready="_colReady"/>

                <ext-column dataIndex="ram_used_text" sorter='{"property":"ram_used"}' :text="l10n(`RAM (used)`)" width="150"/>

                <ext-column dataIndex="rss_used_text" sorter='{"property":"rss_used"}' :text="l10n(`RSS (used)`)" width="150"/>

                <ext-column dataIndex="hdd_total" :text="l10n(`HDD (total)`)" width="120" @ready="_colReady"/>

                <ext-column dataIndex="hdd_used_text" sorter='{"property":"fsy_used"}' :text="l10n(`HDD (used)`)" width="150"/>

                <ext-column width="40" @ready="_actionColReady"/>
            </ext-grid>

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
import InstanceModel from "./models/instance";

const DEFAULT_AUTOREFRESH_INTERVAL = 60_000;

export default {
    "components": { CardsPanel, CharstPanel },

    data () {
        return {
            "selectedRecord": null,
        };
    },

    created () {
        this.store = new Ext.data.Store( {
            "model": InstanceModel,
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

            const res = await this.$api.call( "development/monitoring/instances/get-instances" );

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

        // protected
        _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.setStore( this.store );

            cmp.on( "select", ( grid, selection ) => ( this.selectedRecord = selection[ 0 ] ) );
        },

        _colReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setRenderer( value => this.$app.locale.formatNumber( value / 1024 ** 3, "style:unit,unit:gigabyte" ) );
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
                    ],
                },
            } );
        },

        _search ( e ) {
            const value = e.detail.newValue.trim();

            if ( value !== "" ) {
                this.store.addFilter( {
                    "property": "instance_type",
                    "operator": "like",
                    value,
                } );
            }
            else {
                this.store.removeFilter( "instance_type" );
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

                this.$refs.chartsPanel.refresh();
            }, DEFAULT_AUTOREFRESH_INTERVAL );
        },

        _stopAutoRefresh () {
            clearInterval( this.autoRefreshInterval );

            this.autoRefreshInterval = null;
        },

        _onChildDoubleTap ( e ) {
            this.showChartsDialog( e.detail.location.record );
        },
    },
};
</script>
