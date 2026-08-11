<template>
    <CardsPanel ref="cardsPanel" :store="store" @refresh="refresh">
        <template #dataPanel>
            <ext-grid columnMenu="false" columnResize="false" hideHeaders="true" itemConfig='{"viewModel":true}' layout="fit" selectable="false" sortable="false" :store="store">
                <ext-column cell='{"encodeHtml":false}' dataIndex="title" flex="1"/>

                <ext-column align="center" width="60" @ready="_subscribedColReady"/>
            </ext-grid>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import Model from "./models/notification-type";

export default {
    "components": { CardsPanel },

    "props": {
        "aclId": {
            "type": Number,
            "default": null,
        },
    },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": Model,
            "autoLoad": false,
            "pageSize": null,
            "remoteFilter": false,
            "filters": [
                {
                    "property": "editable",
                    "opertor": "=",
                    "value": true,
                },
            ],
        } );
    },

    "methods": {
        _subscribedColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "start" },
                    "items": [
                        {
                            "xtype": "togglefield",
                            "bind": {
                                "hidden": "{!record.enabled}",
                                "disabled": "{!record.editable}",
                                "value": "{record.subscribed}",
                            },
                            "listeners": { "change": this.toggleSubscribed.bind( this ) },
                        },
                    ],
                },
            } );
        },

        async refresh () {
            if ( this._refreshing ) return;
            this._refreshing = true;

            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "account/notifications/get-user-notifications-profile", {
                "acl_id": this.aclId || null,
            } );

            if ( res.ok ) {
                this.store.loadRawData();
                this.store.loadRawData( res.data.notifications );
            }
            else {
                this.$refs.cardsPanel.setResult( res );
            }

            this._refreshing = false;
        },

        async toggleSubscribed ( button, newValue, oldValue ) {
            const record = button.up( "gridrow" ).getRecord(),
                currentValue = record.get( "subscribed" );

            if ( newValue === currentValue ) return;

            button.disable();

            const res = await this.$api.call( "account/notifications/set-user-notification-subscribed", {
                "acl_id": this.aclId || null,
                "notification": record.id,
                "subscribed": newValue,
            } );

            if ( !res.ok ) {
                record.set( "subscribed", currentValue );
                button.setValue( currentValue );

                this.$toast( res );
            }
            else {
                for ( const channel of Object.values( record.get( "channels" ) ) ) {
                    if ( channel.editable ) channel.subscribed = newValue;
                }

                // re-calculate
                record.set( "subscribed", null );
            }

            button.enable();
        },

        onChannelUpdate ( notification, channel, subscribed ) {
            const record = this.store.getById( notification );

            if ( !record ) return;

            record.get( "channels" )[ channel ].subscribed = subscribed;

            // re-calculate
            record.set( "subscribed", null );
        },
    },
};
</script>
