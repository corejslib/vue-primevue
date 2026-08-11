<template>
    <CardsPanel ref="cards" :store="store" @refresh="refresh">
        <template #docked>
            <ext-toolbar docked="top">
                <ext-spacer/>
                <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
            </ext-toolbar>
        </template>

        <template #dataPanel>
            <ext-grid layout="fit" multicolumnSort="true" :store="store">
                <ext-column dataIndex="module" :text="l10n(`Module`)" width="150"/>

                <ext-column dataIndex="name" :text="l10n(`Name`)" width="150"/>

                <ext-column dataIndex="last_start" :text="l10n(`Last start`)" width="150" @ready="_dateColReady"/>

                <ext-column dataIndex="next_start" :text="l10n(`Next start`)" width="150" @ready="_dateColReady"/>

                <ext-column dataIndex="status_text" flex="1" sorter='{"property":"error"}' :text="l10n(`Status`)"/>
            </ext-grid>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import TaskModel from "./models/task";

export default {
    "components": { CardsPanel },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": TaskModel,
            "autoLoad": false,
            "pageSize": null,
            "remoteSort": false,
            "remoteFilter": false,
        } );
    },

    "methods": {
        async refresh () {
            this.$refs.cards.mask();

            this.store.reload();

            this.$refs.cards.unmask();
        },

        _dateColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setRenderer( value => {
                if ( value ) {
                    return this.$app.locale.formatDate( value, "dateStyle:short,timeStyle:short" );
                }
                else {
                    return "-";
                }
            } );
        },
    },
};
</script>
