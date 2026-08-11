<template>
    <ext-panel ref="panel" layout="fit">
        <CardsPanel ref="cardsPanel" :store="store" @refresh="refresh">
            <template #docked>
                <ext-toolbar docked="top">
                    <ext-searchfield :placeholder="l10n(`Search users`)" width="150" @change="_search"/>

                    <ext-spacer/>

                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>
            </template>

            <template #dataPanel>
                <ext-grid itemConfig='{"viewModel":true}' layout="fit" multicolumnSort="true" plugins='["gridviewoptions", "autopaging"]' :store="store" @childdoubletap="_onChildDoubleTap">
                    <ext-avatarcolumn/>

                    <ext-column dataIndex="username" flex="1" :text="l10n(`Username`)"/>

                    <ext-column dataIndex="full_name" flex="1" sorter='{"property":"first_name"}' :text="l10n(`Name`)"/>

                    <ext-column dataIndex="phone_text" flex="1" sorter='{"property":"phone"}' :text="l10n(`Phone`)"/>

                    <ext-column width="250" @ready="_actionColReady"/>
                </ext-grid>
            </template>
        </CardsPanel>

        <!-- details panel -->
    </ext-panel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import TelegramBotModel from "../models/bot.js";
import DetailsDialog from "./details.dialog";
import TelegramBotUserModel from "./models/user";

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
            "model": TelegramBotUserModel,
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
                this._telegramBotRecord = new TelegramBotModel( res.data );

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
                            "iconCls": "fa-regular fa-eye",
                            "text": l10n( "View user" ),
                            "handler": this._viewUserClick.bind( this ),
                        },
                    ],
                },
            } );
        },

        _search ( e ) {
            var val = e.detail.newValue.trim();

            if ( val !== "" ) {
                this.store.addFilter( {
                    "property": "search",
                    "operator": "like",
                    "value": val,
                } );
            }
            else {
                this.store.removeFilter( "search" );
            }
        },

        async _onChildDoubleTap ( e ) {
            return this._showDetailsDialog( e.detail.location.record );
        },

        async _viewUserClick ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            return this._showDetailsDialog( record );
        },

        async _showDetailsDialog ( record ) {
            const cmp = await this.$mount( DetailsDialog, {
                "props": {
                    "telegramBotRecord": this._telegramBotRecord,
                    "telegramBotUserRecord": record,
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
