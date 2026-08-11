<template>
    <CardsPanel ref="cardsPanel" :store="store" @refresh="refresh">
        <template #docked>
            <ext-toolbar docked="top">
                <!-- set all as done                         -->
                <ext-button align="right" :disabled="!hasNotifications" iconCls="fa-solid fa-arrow-right" :text="l10n(`Move all to inbox`)" @tap="moveAllToInbox"/>

                <!-- delete all -->
                <ext-button align="right" :disabled="!hasNotifications" iconCls="fa-regular fa-trash-can" :text="l10n(`Delete all`)" @tap="deleteAll"/>
            </ext-toolbar>
        </template>

        <template #dataPanel>
            <ext-grid hideHeaders="true" itemConfig='{"viewModel":true}' layout="fit" plugins='["autopaging"]' :store="store" variableHeights="true">
                <!-- XXX margin is required to prevent horizontal scrolling -->
                <ext-column flex="1" margin="0 7 0 0" @ready="_colReady"/>
            </ext-grid>
        </template>
    </CardsPanel>
</template>

<script>
import "./assets/style.css";
import CardsPanel from "#src/components/cards.panel";
import NotificationModel from "#src/components/notifications/models/notification";

export default {
    "components": { CardsPanel },

    "computed": {
        hasNotifications () {
            return !!this.$app.notifications.totalDone;
        },
    },

    created () {
        this.store = this.$app.notifications.getDoneStore( NotificationModel );
    },

    "methods": {
        _colReady ( e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": "vbox",
                    "padding": "0 5 20 10",
                    "items": [

                        // subject
                        {
                            "xtype": "container",
                            "layout": { "type": "hbox", "align": "center" },
                            "items": [
                                {
                                    "xtype": "container",
                                    "cls": "notification-subject",
                                    "bind": "{record.subject}",
                                },

                                { "xtype": "spacer" },

                                {
                                    "xtype": "container",
                                    "bind": `<i class="fa-regular fa-clock"></i> {record.relative_time}`,
                                },
                                {
                                    "xtype": "button",
                                    "iconCls": "fa-solid fa-arrow-right",
                                    "tooltip": l10n( "Move to inbox" ),
                                    "handler": this._moveToInbox.bind( this ),
                                },
                                {
                                    "xtype": "button",
                                    "iconCls": "fa-regular fa-trash-can",
                                    "tooltip": l10n( "Delete" ),
                                    "handler": this._delete.bind( this ),
                                },
                            ],
                        },

                        // body
                        {
                            "xtype": "container",
                            "cls": "notification-body",
                            "padding": "0 0 0 5",
                            "bind": "{record.body}",
                        },
                    ],
                },
            } );
        },

        refresh ( e ) {
            if ( !this.$refs.cardsPanel.isRendered ) return;

            this.$refs.cardsPanel.mask();

            this.store.loadPage( 1 );
        },

        async moveAllToInbox () {
            await this.$app.notifications.updateNotifications( { "done": false } );
        },

        async deleteAll () {
            await this.$app.notifications.deleteNotification( { "done": true } );
        },

        async _moveToInbox ( button ) {
            const record = button.lookupViewModel().get( "record" );

            button.disable();

            await this.$app.notifications.updateNotifications( { "id": record.id, "done": false } );

            button.enable();
        },

        async _delete ( button ) {
            const record = button.lookupViewModel().get( "record" );

            button.disable();

            await this.$app.notifications.deleteNotification( { "id": record.id } );

            button.enable();
        },
    },
};
</script>
