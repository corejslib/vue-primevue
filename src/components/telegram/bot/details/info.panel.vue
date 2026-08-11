<template>
    <CardsPanel ref="cardsPanel" @refresh="refresh">
        <template #dataPanel>
            <ext-panel ref="dataPanel" layout="vbox" padding="10 10 0 10" scrollable="true" viewModel="true">
                <ext-toolbar docked="top">
                    <ext-spacer/>
                    <ext-button bind='{"hidden":"{!record.can_update_acl}"}' iconCls="fa-solid fa-unlock-alt" :text="l10n(`Users & permissions`)" @tap="_showAclDialog"/>
                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>

                <ext-avatar bind="{record.avatar_url}" height="60" width="60"/>

                <ext-displayfield bind="{record.username}" :label="l10n(`Bot username`)" labelAlign="left" labelWidth="200"/>

                <ext-container layout="hbox">
                    <ext-displayfield bind="{record.url}" :label="l10n(`Bot link`)" labelAlign="left" labelWidth="200"/>
                    <ext-spacer/>
                    <ext-button bind='{"hidden":"{!record.can_read_links}"}' iconCls="fa-solid fa-link" :text="l10n(`Links`)" @tap="_showLinksDialog"/>
                    <ext-button iconCls="fa-regular fa-copy" :tooltip="l10n(`Copy to the clipboard`)" @tap="_copyBotUrl"/>
                    <ext-button iconCls="fa-solid fa-arrow-up-right-from-square" :tooltip="l10n(`Open bot in Telegram`)" @tap="_openBotUrl"/>
                </ext-container>

                <ext-container layout="hbox">
                    <ext-displayfield bind="{record.name}" :label="l10n(`Bot name`)" labelAlign="left" labelWidth="200"/>

                    <ext-spacer/>

                    <ext-button bind='{"hidden":"{!record.can_update}"}' iconCls="fa-solid fa-pen" :text="l10n(`Edit`)" @tap="_showEditDetailsDialog"/>
                </ext-container>

                <ext-displayfield bind="{record.short_description}" :label="l10n(`Short description`)" labelAlign="left" labelWidth="200"/>

                <!-- <ext-displayfield bind="{record.type}" :label="l10n( `Type` )"/> -->

                <!-- <ext-displayfield bind="{record.static}" :label="l10n( `Static` )"/> -->

                <!-- <ext-displayfield bind="{record.created}" :label="l10n( `Creation date` )" renderer="Ext.util.Format.dateRenderer('dateStyle:short,timeStyle:short')"/> -->

                <!-- status -->
                <ext-displayfield bind="{record.status_text}" :label="l10n(`Status`)" labelAlign="left" labelWidth="200"/>
                <ext-displayfield bind='{"hidden":"{!record.error}","value":"{record.error_text}"}' labelAlign="left" labelWidth="200"/>

                <!-- users stats -->
                <ext-displayfield bind="{record.last_user_created_text}" :label="l10n(`Last new user subscription date`)" labelAlign="left" labelWidth="200"/>

                <ext-container layout="hbox">
                    <ext-container defaults='{"labelAlign":"left","labelWidth":200}' flex="1" layout="vbox">
                        <ext-displayfield bind="{record.total_users}" :label="l10n(`Total users`)"/>
                        <ext-displayfield bind="{record.total_subscribed_users_text}" :label="l10n(`Subscribed users`)"/>
                        <ext-displayfield bind="{record.total_unsubscribed_users_text}" :label="l10n(`Unsubscribed users`)"/>
                    </ext-container>

                    <ext-container defaults='{"labelAlign":"left","labelWidth":200}' flex="1" layout="vbox">
                        <ext-displayfield bind="{record.total_returned_users_text}" :label="l10n(`Returned users`)"/>
                        <ext-displayfield bind="{record.total_disabled_users_text}" :label="l10n(`Disabled users`)"/>
                    </ext-container>
                </ext-container>

                <ext-spacer/>

                <ext-container defaults='{"ui":"decline","width":200}' layout='{"align":"center","type":"vbox"}'>
                    <!-- start -->
                    <ext-button bind='{"hidden":"{!record.can_start}"}' iconCls="fa-regular fa-circle-play" :text="l10n(`Start bot`)" @tap="_startBot"/>

                    <!-- stop -->
                    <ext-button bind='{"hidden":"{!record.can_stop}"}' iconCls="fa-regular fa-circle-stop" :text="l10n(`Stop bot`)" @tap="_stopBot"/>

                    <!-- change api token -->
                    <ext-button bind='{"hidden":"{!record.can_change_api_token}"}' iconCls="fa-regular fa-trash-can" :text="l10n(`Change bot API token`)" @tap="_showEditApiTokenDialog"/>

                    <!-- delete bot -->
                    <ext-button bind='{"hidden":"{!record.can_delete}"}' iconCls="fa-regular fa-trash-can" :text="l10n(`Delete bot`)" @tap="_deleteBot"/>
                </ext-container>
            </ext-panel>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import telegramComponents from "#src/components/telegram/components";
import AclDialog from "#vue/components/acl/dialog";
import LinksDialog from "../links/dialog";
import TelegramBotModel from "../models/bot";
import EditApiTokenGialog from "./edit-api-token.dialog";
import EditDetailsGialog from "./edit-details.dialog";

export default {
    "components": { CardsPanel },

    "props": {
        "telegramBotId": {
            "type": Number,
            "required": true,
        },
    },

    "methods": {
        async refresh () {
            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "telegram/bots/get-bot", this.telegramBotId );

            this.$refs.cardsPanel.setResult( res );

            if ( res.ok ) {
                const record = new TelegramBotModel( res.data );

                this.record = record;

                this.$refs.dataPanel.ext.getViewModel().set( "record", record );
            }
        },

        // protected
        async _startBot ( e ) {
            const button = e.detail.sender,
                record = this.record;

            button.disable();

            const res = await this.$api.call( "telegram/bots/set-bot-started", record.id, true );

            button.enable();

            if ( res.ok ) {
                record.set( "started", true );
                record.set( "error", false );
                record.set( "error_text", null );
            }
            else {
                this.$toast( res );
                record.set( "error", true );
                record.set( "error_text", res.statusText );
            }

            record.commit( false, [ "started", "error", "error_text" ] );
        },

        async _stopBot ( e ) {
            const button = e.detail.sender,
                record = this.record;

            button.disable();

            const res = await this.$api.call( "telegram/bots/set-bot-started", record.id, false );

            button.enable();

            if ( res.ok ) {
                record.set( "started", false );
                record.commit( false, [ "started" ] );
            }
            else {
                this.$toast( res );
            }
        },

        async _showAclDialog () {
            const cmp = await this.$mount( AclDialog, {
                "props": {
                    "aclId": this.record.get( "acl_id" ),
                },
            } );

            cmp.ext.show();
        },

        async _showEditDetailsDialog () {
            const cmp = await this.$mount( EditDetailsGialog, {
                "props": {
                    "record": this.record,
                },
            } );

            cmp.ext.show();
        },

        async _deleteBot ( e ) {
            if ( !( await this.$utils.confirm( l10n( "Are you sure you want to delete this bot and all it's data? This operation is not revertable." ) ) ) ) return;

            const record = this.record,
                button = e.detail.sender;

            button.disable();

            const res = await this.$api.call( "telegram/bots/delete-bot", record.id );

            button.enable();

            if ( res.ok ) {
                this.$toast( l10n( "Bot deleted" ) );

                telegramComponents.emit( "botDelete", this.telegramBotId );
            }
            else {
                this.$toast( res );
            }
        },

        _copyBotUrl () {
            this.$utils.copyToClipboard( this.record.get( "url" ) );

            this.$toast( l10n( "Link copied to the clipboard" ) );
        },

        _openBotUrl () {
            this.$utils.clickUrl( this.record.get( "url" ) );
        },

        async _showLinksDialog () {
            const cmp = await this.$mount( LinksDialog, {
                "props": {
                    "telegramBotRecord": this.record,
                },
            } );

            cmp.ext.show();
        },

        async _showEditApiTokenDialog () {
            const cmp = await this.$mount( EditApiTokenGialog, {
                "props": {
                    "telegramBotId": this.record.id,
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
