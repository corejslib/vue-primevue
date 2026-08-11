<template>
    <ext-panel ref="cardsPanel" layout='{"animation":"slide","type":"card"}' @ready="_ready">
        <ext-panel ref="botListPanel" layout="fit">
            <CardsPanel ref="cards" :store="store" @refresh="refresh">
                <template #docked>
                    <ext-toolbar docked="top">
                        <ext-searchfield :placeholder="l10n(`Search bots`)" width="200" @change="_search"/>
                        <ext-spacer/>
                        <CreateBotButton @botCreate="_onBotCreate"/>
                        <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                    </ext-toolbar>
                </template>

                <template #noDataPanel>
                    <ext-panel layout='{"align":"center","pack":"center","type":"vbox"}'>
                        <ext-container :html="l10n(`No bots found`)"/>
                        <CreateBotButton ui="action"/>
                    </ext-panel>
                </template>

                <template #dataPanel>
                    <ext-grid itemConfig='{"viewModel":true}' layout="fit" multicolumnSort="true" plugins='["gridviewoptions", "autopaging"]' :store="store" @childdoubletap="_onChildDoubleTap">
                        <ext-avatarcolumn/>

                        <ext-column dataIndex="name" flex="1" :text="l10n(`Name`)"/>

                        <ext-column align="right" dataIndex="total_subscribed_users_text" sorter='{"property":"total_subscribed_users"}' :text="l10n(`Subscribed users`)" width="200"/>

                        <ext-column align="right" dataIndex="total_unsubscribed_users_text" sorter='{"property":"total_unsubscribed_users"}' :text="l10n(`Unsubscribed users`)" width="200"/>

                        <ext-column dataIndex="status_text" flex="1" sorter='{"property":"started"}' :text="l10n(`Status`)"/>

                        <ext-column width="150" @ready="_actionColReady"/>
                    </ext-grid>
                </template>
            </CardsPanel>
        </ext-panel>

        <ext-panel ref="botPanel" layout="fit">
            <ext-toolbar docked="top">
                <ext-button iconCls="fa-solid fa-arrow-left" text="Back to the bots list" @tap="_showBotsList"/>
                <ext-spacer width="10"/>
                <ext-avatar :src="botAvatar"/>
                <ext-spacer width="10"/>
                <ext-container :html="botName"/>
            </ext-toolbar>
        </ext-panel>
    </ext-panel>
</template>

<script>
import "@/telegram-components";
import Events from "#core/events";
import CardsPanel from "#src/components/cards.panel";
import BotDialog from "#src/components/telegram/bot/dialog";
import TelegramBotModel from "#src/components/telegram/bot/models/bot";
import telegramComponents from "#src/components/telegram/components";
import CreateBotButton from "./create-bot.button";

export default {
    "components": { CardsPanel, CreateBotButton },

    "props": {
        "openBotInDialog": {
            "type": Boolean,
            "default": true,
        },
    },

    data () {
        return {
            "botAvatar": null,
            "botName": null,
        };
    },

    created () {
        this._events = new Events().link( telegramComponents );

        this.store = Ext.create( "Ext.data.Store", {
            "model": TelegramBotModel,
            "autoLoad": false,
            "pageSize": 50,
            "filters": { "property": "deleted", "operator": "=", "value": false },
            "proxy": {
                "api": {
                    "read": this._getStoreApiMethod(),
                },
            },
        } );
    },

    mounted () {
        this._events.on( "botDelete", this._onBotDelete.bind( this ) );
    },

    unlounted () {
        this._events.offAll();
    },

    "methods": {

        // public
        async refresh () {
            this.store.loadPage( 1 );
        },

        // protected
        _getStoreApiMethod () {
            return "telegram/bots/get-bots-list";
        },

        _ready ( e ) {
            this._showBotsList();
        },

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

                            // "iconCls": "fa-solid fa-users",
                            "text": l10n( "Open bot" ),
                            "handler": this._openBot.bind( this ),
                            "ui": "action",
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

        _onBotCreate () {
            this.refresh();
        },

        _showBotsList () {
            this.$refs.cardsPanel.ext.setActiveItem( 0 );

            this.$refs.botListPanel.ext.unmask();

            this._closeBot();
        },

        async _openBot ( button ) {
            const record = button.up( "gridrow" ).getRecord();

            this._openedBotId = record.id;

            if ( this.openBotInDialog ) {
                this._showBotDialog( record );
            }
            else {
                this._showBotPanel( record );
            }
        },

        async _showBotDialog ( record ) {
            const cmp = await this.$mount( BotDialog, {
                "props": {
                    "telegramBotRecord": record,
                },
            } );

            this._openedBotDialog = cmp;

            cmp.ext.show();
        },

        async _showBotPanel ( record ) {
            this.$refs.botListPanel.ext.mask();

            const panel = telegramComponents.get( record.get( "type" ) ).panel;

            this._closeBot();

            this.botAvatar = record.get( "avatar_url" );
            this.botName = record.get( "name" );

            const cmp = await this.$mount( panel, {
                "el": this.$refs.botPanel,
                "props": {
                    "telegramBotId": record.id,
                },
            } );

            this._openedBotPanel = cmp;

            this.$refs.cardsPanel.ext.setActiveItem( 1 );
        },

        _closeBot () {
            if ( this._openedBotDialog ) {
                this._openedBotDialog.ext.close();

                this._openedBotDialog = null;
            }
            else if ( this._openedBotPanel ) {
                this._openedBotPanel.$unmount();

                this._openedBotPanel = null;
            }

            this._openedBotId = null;
        },

        _onBotDelete ( telegramBotId ) {
            this.refresh();

            if ( this._openedBotId === telegramBotId ) {
                this._showBotsList();
            }
        },

        _onChildDoubleTap ( e ) {
            if ( this.openBotInDialog ) {
                this._showBotDialog( e.detail.location.record );
            }
            else {
                this._showBotPanel( e.detail.record );
            }
        },
    },
};
</script>
