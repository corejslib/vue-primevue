<template>
    <ext-panel ref="panel" layout="fit" viewModel="true">
        <CardsPanel ref="cardsPanel" :store="store" @refresh="refresh">
            <template #docked>
                <ext-toolbar docked="top">
                    <ext-searchfield :placeholder="l10n(`Search links`)" width="150" @change="_search"/>

                    <ext-spacer/>

                    <ext-button bind='{"hidden":"{!telegramBotRecord.can_create_link}"}' iconCls="fa-solid fa-plus" :text="l10n(`Create link`)" @tap="_showCreateLinkDialog"/>

                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>
            </template>

            <template #noDataPanel>
                <ext-panel layout='{"align":"center","pack":"center","type":"vbox"}'>
                    <ext-container :html="l10n(`No links found`)"/>
                    <ext-button bind='{"hidden":"{!telegramBotRecord.can_create_link}"}' iconCls="fa-solid fa-plus" :text="l10n(`Create link`)" ui="action" @tap="_showCreateLinkDialog"/>
                </ext-panel>
            </template>

            <template #dataPanel>
                <ext-grid itemConfig='{"viewModel":true}' layout="fit" multicolumnSort="true" plugins='["gridviewoptions", "autopaging"]' :store="store" @childdoubletap="_onChildDoubleTap">
                    <ext-column dataIndex="name" flex="1" :text="l10n(`Name`)"/>

                    <ext-column align="right" dataIndex="total_subscribed_users_text" sorter='{"property":"total_subscribed_users"}' :text="l10n(`Subscribed users`)" width="150"/>

                    <ext-column align="right" dataIndex="total_unsubscribed_users_text" sorter='{"property":"total_unsubscribed_users"}' :text="l10n(`Unsubscribed users`)" width="150"/>

                    <ext-column dataIndex="last_user_created_text" sorter='{"property":"last_user_created"}' :text="l10n(`Last user creation date`)" width="150"/>

                    <ext-column dataIndex="created_text" sorter='{"property":"created"}' :text="l10n(`Creation date`)" width="150"/>

                    <ext-column width="250" @ready="_actionColReady"/>
                </ext-grid>
            </template>
        </CardsPanel>
    </ext-panel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import TelegramBotModel from "../models/bot.js";
import CreateLinkDialog from "./create.dialog";
import LinkDialog from "./details.dialog";
import TelegramBotLinkModel from "./models/link";

export default {
    "components": { CardsPanel },

    "props": {
        "telegramBotId": {
            "type": Number,
            "required": true,
        },
    },

    created () {
        this.store = Ext.create( "Ext.data.Store", {
            "model": TelegramBotLinkModel,
            "autoLoad": false,
            "pageSize": 50,
            "filters": {
                "property": "telegram_bot_id",
                "operator": "=",
                "value": this.telegramBotId,
            },
        } );
    },

    "methods": {

        // public
        async refresh () {
            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "telegram/bots/get-bot", this.telegramBotId );

            if ( !res.ok ) {
                this.$refs.cardsPanel.setResult( res );
            }
            else {
                const telegramBotRecord = new TelegramBotModel( res.data );

                this.$refs.panel.ext.getViewModel().set( "telegramBotRecord", telegramBotRecord );

                this.store.loadPage( 1 );
            }
        },

        // protected
        _actionColReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "end", "align": "center" },
                    "items": [
                        {
                            "xtype": "button",
                            "iconCls": "fa-regular fa-copy",
                            "text": l10n( "Copy link" ),
                            "handler": this._copyLink.bind( this ),
                        },
                        {
                            "xtype": "button",
                            "iconCls": "fa-regular fa-eye",
                            "tooltip": l10n( "View link" ),
                            "handler": this._viewLinkClick.bind( this ),
                        },
                    ],
                },
            } );
        },

        _search ( e ) {
            var val = e.detail.newValue.trim();

            if ( val !== "" ) {
                this.store.addFilter( {
                    "property": "name",
                    "operator": "like",
                    "value": val,
                } );
            }
            else {
                this.store.removeFilter( "name" );
            }
        },

        _copyLink ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            this.$utils.copyToClipboard( record.get( "link" ) );

            this.$toast( l10n( "Link copied to the clipboard" ) );
        },

        async _showCreateLinkDialog () {
            const cmp = await this.$mount( CreateLinkDialog, {
                "props": {
                    "telegramBotId": this.telegramBotId,
                    "onCreate": this.refresh.bind( this ),
                },
            } );

            cmp.ext.show();
        },

        async _viewLinkClick ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            return this._showLinkDialog( record );
        },

        async _onChildDoubleTap ( e ) {
            return this._showLinkDialog( e.detail.location.record );
        },

        async _showLinkDialog ( record ) {
            const cmp = await this.$mount( LinkDialog, {
                "props": {
                    "telegramBotRecord": this.$refs.panel.ext.getViewModel().get( "telegramBotRecord" ),
                    "telegramBotLinkRecord": record,
                    "onLinkDelete": this.refresh.bind( this ),
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
