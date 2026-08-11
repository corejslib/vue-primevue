<template>
    <CardsPanel ref="cards" :store="store" @refresh="refresh">
        <template #docked>
            <ext-toolbar docked="top">
                <slot name="user">
                    <ext-container :hidden="!!userRecord" :html="l10n(`Your sessions`)"/>

                    <ext-container :hidden="!userRecord" layout='{"align":"center","pack":"center","type":"hbox"}'>
                        <ext-avatar :src="userRecord?.get(`avatar_url`)"/>
                        <ext-spacer width="10"/>
                        <ext-container :html="userRecord?.get(`email`)"/>
                    </ext-container>
                </slot>
                <ext-spacer/>
                <ext-button iconCls="fa-regular fa-trash-can" :text="l10n(`Delete all sessions`)" ui="decline" @tap="_signOutAllSessions"/>
                <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
            </ext-toolbar>
        </template>

        <template #dataPanel>
            <ext-grid itemConfig='{"viewModel":true}' layout="fit" multicolumnSort="true" plugins='{"gridviewoptions":true}' :store="store">
                <ext-column cell='{"encodeHtml":false}' dataIndex="device_text" flex="1" sorter='{"property":"device_vendor"}' :text="l10n(`Device`)"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="os_text" flex="1" sorter='{"property":"os_name"}' :text="l10n(`Platform`)"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="browser_text" flex="1" sorter='{"property":"browser_name"}' :text="l10n(`Browser`)"/>

                <ext-column dataIndex="remote_address" :text="l10n(`IP address`)" width="130"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="geoip_name_text" sorter='{"property":"geoip_name"}' :text="l10n(`Location`)" width="130"/>

                <ext-column cell='{"encodeHtml":false}' dataIndex="last_activity_text" sorter='{"property":"last_activity"}' :text="l10n(`Last activity`)" width="150"/>

                <ext-column dataIndex="created" formatter="date()" :text="l10n(`Creation date`)" width="150"/>

                <ext-column width="80" @ready="_actionColReady"/>
            </ext-grid>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import SessionModel from "./models/session";

export default {
    "components": { CardsPanel },

    "props": {
        "userRecord": {
            "type": Object,
            "default": null,
        },
    },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": SessionModel,
            "autoLoad": false,
            "pageSize": null,
            "remoteSort": false,
            "remoteFilter": false,
        } );
    },

    "methods": {
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
                            "iconCls": "fa-regular fa-copy",
                            "tooltip": l10n( "Copy IP address" ),
                            "handler": this._copyRemoteAddress.bind( this ),
                        },
                        {
                            "xtype": "button",
                            "iconCls": "fa-solid fa-check",
                            "tooltip": l10n( "Current session" ),
                            "bind": { "hidden": "{!record.current_session}" },
                        },
                        {
                            "xtype": "button",
                            "iconCls": "fa-regular fa-trash-can",
                            "tooltip": l10n( "Delete session" ),
                            "handler": this._signOutSession.bind( this ),
                            "bind": { "hidden": "{record.current_session}" },
                            "ui": "decline",
                        },
                    ],
                },
            } );
        },

        async _signOutSession ( button ) {
            const record = button.lookupViewModel().get( "record" );

            button.disable();

            const res = await this._signOutSessionRequest( record.id );

            button.enable();

            if ( res.ok ) {
                this.$toast( l10n( "Session was deleted" ) );

                this.store.remove( record );
            }
            else {
                this.$toast( res );
            }
        },

        async _signOutAllSessions ( e ) {
            const button = e.detail.sender;

            button.disable();

            const res = await this._signOutAllSessionsRequest();

            button.enable();

            if ( !res.ok ) {
                this.$toast( res );
            }
            else {
                this.$toast( l10n( "Sessions were deleted" ) );

                this.refresh();
            }
        },

        async refresh () {
            this.$refs.cards.mask();

            const res = await this._loadSessions();

            this.$refs.cards.unmask();

            if ( !res.ok ) {
                this.$refs.cards.setResult( res );

                this.$toast( res );
            }
            else {
                this.store.loadRawData( res.data );
            }
        },

        async _loadSessions () {
            return this.$api.call( "account/get-sessions" );
        },

        async _signOutSessionRequest ( sessionId ) {
            return this.$api.call( "account/sign-out-session", sessionId );
        },

        async _signOutAllSessionsRequest () {
            return this.$api.call( "account/sign-out-all-sessions" );
        },

        _copyRemoteAddress ( button ) {
            const record = button.lookupViewModel().get( "record" );

            this.$utils.copyToClipboard( record.get( "remote_address" ) );

            this.$toast( l10n( "IP address copied" ) );
        },
    },
};
</script>
