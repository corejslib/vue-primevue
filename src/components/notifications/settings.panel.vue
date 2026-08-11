<template>
    <ext-panel defaults='{"padding":"0 0 30 0"}' layout="vbox">
        <!-- push notifications -->
        <OptionContainer :description="l10n(`Receive push notifications on this device`)" :hidden="pusHidden" :label="l10n(`Push notifications`)" labelWidth="260">
            <template #option>
                <PushNotificationsButton :hideLabel="true"/>
            </template>
        </OptionContainer>

        <!-- telegram -->
        <OptionContainer :description="l10n(`To use Support bot you need to link your Telegram account`)" :hidden="!telegramSupported" label="Telegram" labelWidth="260">
            <template #option>
                <ext-container>
                    <!-- link -->
                    <ext-container :hidden="telegramLinked">
                        <ext-button :text="l10n(`Link Telegram`)" ui="action" @tap="_openTelegramBot"/>
                    </ext-container>

                    <!-- open -->
                    <ext-container :hidden="!telegramLinked" layout='{"align":"start","type":"vbox"}'>
                        <ext-container layout='{"type":"hbox"}'>
                            <ext-avatar :src="linkedTelegramAvatarUrl"/>
                            <ext-spacer width="10"/>
                            <ext-displayfield :value="linkedTelegramUsername"/>
                        </ext-container>
                        <ext-container layour="hbox">
                            <ext-button :text="l10n(`Open bot`)" @tap="_openTelegramBot"/>
                        </ext-container>
                    </ext-container>
                </ext-container>
            </template>
        </OptionContainer>

        <!-- notification types -->
        <CardsPanel ref="cardsPanel" flex="1" :hidden="notificationTypesHidden" @refresh="refresh">
            <template #dataPanel>
                <ext-grid columnMenu="false" columnResize="false" itemConfig='{"viewModel":true}' layout="fit" selectable="false" sortable="false" :store="store">
                    <!-- type -->
                    <ext-column cell='{"encodeHtml":false}' dataIndex="title" :text="l10n(`Notifications`)" width="220"/>

                    <!-- internal -->
                    <ext-column align="center" :hidden="!internalNotificationsEnabled" text="Internal" width="110" @ready="_internalColReady"/>

                    <!-- email -->
                    <ext-column align="center" :hidden="!emailNotificationsEnabled" text="Email" width="110" @ready="_emailColReady"/>

                    <!-- telegram -->
                    <ext-column align="center" :hidden="!telegramNotificationsEnabled" text="Telegram" width="110" @ready="_telegramColReady"/>

                    <!-- push -->
                    <ext-column align="center" :hidden="!pushNotificationsEnabled" text="Push" width="110" @ready="_pushColReady"/>
                </ext-grid>
            </template>
        </CardsPanel>
    </ext-panel>
</template>

<script>
import Events from "#core/events";
import CardsPanel from "#src/components/cards.panel";
import OptionContainer from "#src/components/option.container";
import PushNotificationsButton from "#src/components/push-notifications.button";
import Model from "./models/notification-type";

export default {
    "components": { PushNotificationsButton, CardsPanel, OptionContainer },

    "props": {
        "aclId": {
            "type": Number,
            "default": null,
        },
    },

    "emits": [ "update" ],

    data () {
        return {
            "notificationTypesHidden": false,
            "internalNotificationsEnabled": false,
            "emailNotificationsEnabled": false,
            "telegramNotificationsEnabled": false,
            "pushNotificationsEnabled": false,

            "telegramSupported": false,
            "telegramBotUrl": null,
            "linkedTelegramUser": null,
        };
    },

    "computed": {
        pusHidden () {
            return !this.$app.notifications.pushNotificationsSupported;
        },

        telegramLinked () {
            return !!this.linkedTelegramUser;
        },

        linkedTelegramUsername () {
            return this.linkedTelegramUser?.username;
        },

        linkedTelegramAvatarUrl () {
            return this.linkedTelegramUser?.avatar_url;
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

        this._events ??= new Events().link( this.$api ).on( "notifications/telegram/update", linkedTelegramUser => {
            this.linkedTelegramUser = linkedTelegramUser;
        } );
    },

    unmounted () {
        this._events.clear();
        this._events = null;
    },

    "methods": {
        _internalColReady ( e ) {
            this._toggleColReady( "internal", e );
        },

        _emailColReady ( e ) {
            this._toggleColReady( "email", e );
        },

        _telegramColReady ( e ) {
            this._toggleColReady( "telegram", e );
        },

        _pushColReady ( e ) {
            this._toggleColReady( "push", e );
        },

        _toggleColReady ( channel, e ) {
            const cmp = e.detail.cmp;

            cmp.setCell( {
                "xtype": "widgetcell",
                "widget": {
                    "xtype": "container",
                    "layout": { "type": "hbox", "pack": "center" },
                    "items": [
                        {
                            "xtype": "togglefield",
                            "bind": {
                                "hidden": `{!record.channels.${ channel }.enabled}`,
                                "disabled": `{!record.channels.${ channel }.editable}`,
                                "value": `{record.channels.${ channel }.subscribed}`,
                            },
                            "listeners": { "change": this.toggleChannelSubscribed.bind( this, channel ) },
                        },
                    ],
                },
            } );
        },

        async refresh () {
            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "account/notifications/get-user-notifications-profile", {
                "acl_id": this.aclId || null,
            } );

            this.$refs.cardsPanel.setResult( res );

            if ( res.ok ) {
                this.telegramSupported = res.data.telegramSupported;
                this.telegramBotUrl = res.data.telegramBotUrl;
                this.linkedTelegramUser = res.data.linkedTelegramUser;

                this.notificationTypesHidden = true;

                this.internalNotificationsEnabled = false;
                this.emailNotificationsEnabled = false;
                this.telegramNotificationsEnabled = false;
                this.pushNotificationsEnabled = false;

                if ( res.data.notifications ) {
                    this.store.loadRawData( res.data.notifications );

                    this.store.each( record => {
                        if ( !record.get( "editable" ) ) return;

                        const channels = record.get( "channels" );

                        // enable channels
                        for ( const channel of Object.keys( channels ) ) {
                            if ( channels[ channel ].editable ) {
                                this.notificationTypesHidden = false;

                                this[ channel + "NotificationsEnabled" ] = true;
                            }
                        }
                    } );
                }
            }
        },

        async toggleChannelSubscribed ( channel, button, newValue, oldValue ) {
            const record = button.up( "gridrow" ).getRecord(),
                typeChannel = record.get( "channels" )[ channel ],
                currentValue = typeChannel.subscribed;

            if ( newValue === currentValue ) return;

            button.disable();

            const res = await this.$api.call( "account/notifications/set-user-notification-subscribed", {
                "acl_id": this.aclId || null,
                "notification": record.id,
                channel,
                "subscribed": newValue,
            } );

            if ( !res.ok ) {
                typeChannel.subscribed = currentValue;
                button.setValue( currentValue );

                this.$toast( res );
            }
            else {
                button.setValue( newValue );

                typeChannel.subscribed = newValue;

                // re-calculate
                record.set( "subscribed", null );

                this.$emit( "update", record.id, channel, newValue );
            }

            button.enable();
        },

        _openTelegramBot () {
            this.$utils.clickUrl( this.telegramBotUrl );
        },
    },
};
</script>
