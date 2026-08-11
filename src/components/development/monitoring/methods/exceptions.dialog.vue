<template>
    <ext-dialog height="90%" layout="fit" scrollable="true" :title="title" viewModel="true" width="90%">
        <CardsPanel ref="cardsPanel" :store="store" @refresh="refresh">
            <template #docked>
                <ext-toolbar docked="top">
                    <ext-button :disabled="!canDelete" iconCls="fa-regular fa-trash-can" :text="l10n(`Clear log`)" @tap="_clearLog"/>
                    <ext-spacer/>
                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>
            </template>

            <template #dataPanel>
                <ext-grid ref="grid" layout="fit" multicolumnSort="true" @ready="gridReady">
                    <ext-column dataIndex="date" formatter='date("dateStyle:short,timeStyle:short")' :text="l10n(`Started`)" width="150"/>

                    <ext-column align="right" dataIndex="duration" sortable="false" :text="l10n(`Duration (ms)`)" width="150"/>

                    <ext-column align="center" dataIndex="status" sortable="false" :text="l10n(`Status`)" width="100"/>

                    <ext-column dataIndex="status_text" flex="1" sortable="false" :text="l10n(`Status text`)"/>
                </ext-grid>
            </template>
        </CardsPanel>
    </ext-dialog>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import ExceptionModel from "./models/exception";

export default {
    "components": { CardsPanel },

    "props": {
        "record": {
            "type": Object,
            "required": true,
        },
    },

    data () {
        return {
            "canDelete": this.$app.user.permissions.has( "development:delete" ),
        };
    },

    "computed": {
        title () {
            return l10n( msgid`Exceptions log for the method: ${ this.record.get( "method_name" ) }` );
        },
    },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": ExceptionModel,
            "autoLoad": false,
            "pageSize": 50,
            "filters": [
                {
                    "property": "monitoring_method_id",
                    "operator": "=",
                    "value": this.record.id,
                },
            ],
        } );
    },

    "methods": {
        gridReady ( e ) {
            var grid = ( this.grid = e.detail.cmp );

            grid.setPlugins( [ "autopaging", "gridviewoptions" ] );

            // grid.setColumnMenu( null );

            this.grid.setStore( this.store );
        },

        async refresh () {
            this.store.loadPage( 1 );
        },

        async _clearLog () {
            const res = await this.$api.call( "development/monitoring/methods/clear-method-exceptions", this.record.id );

            if ( res.ok ) {
                this.store.removeAll();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
