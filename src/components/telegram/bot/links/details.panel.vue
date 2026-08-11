<template>
    <CardsPanel ref="cardsPanel" @ready="ready" @refresh="refresh">
        <template #dataPanel>
            <ext-panel ref="dataPanel" layout="vbox" padding="0 10 0 0" scrollable="true" viewModel="true">
                <ext-toolbar docked="top">
                    <ext-button iconCls="fa-solid fa-chart-line" :text="l10n(`Open charts`)" width="200" @tap="_showChartsDialog"/>
                    <ext-spacer/>
                    <ext-button iconCls="fa-regular fa-copy" :text="l10n(`Copy link`)" @tap="_copyLink"/>
                    <ext-button iconCls="fa-solid fa-redo" :text="l10n(`Refresh`)" @tap="refresh"/>
                </ext-toolbar>

                <!-- name -->
                <ext-container bind='{"hidden":"{editName}"}' layout='{"align":"center","type":"hbox"}'>
                    <ext-displayfield bind="{telegramBotLinkRecord.name}" flex="1" :label="l10n(`Name`)" labelAlign="left" labelWidth="150"/>
                    <ext-button bind='{"hidden":"{!telegramBotRecord.can_update_link}"}' iconCls="fa-solid fa-pen" :text="l10n(`Edit`)" @tap="beginEditName"/>
                </ext-container>

                <ext-container bind='{"hidden":"{!editName}"}' layout='{"align":"center","type":"hbox"}'>
                    <ext-textfield ref="nameEditField" flex="1" :label="l10n(`Name`)" labelAlign="left" labelWidth="150" maxLength="100" required="true"/>

                    <ext-button iconCls="fa-solid fa-check" :text="l10n(`Save`)" @tap="saveName"/>

                    <ext-button iconCls="fa-solid fa-xmark" :text="l10n(`Cancel`)" ui="decline" @tap="cancelEditName"/>
                </ext-container>

                <!-- stats -->
                <ext-panel defaults='{"labelAlign":"left","labelWidth":150}'>
                    <ext-displayfield bind="{telegramBotLinkRecord.created_html}" :label="l10n(`Creation date`)"/>

                    <ext-displayfield bind="{telegramBotLinkRecord.last_user_created_html}" :label="l10n(`Last user creation date`)" labelAlign="top"/>
                </ext-panel>

                <!-- users -->
                <ext-container layout="hbox">
                    <ext-container defaults='{"labelAlign":"left","labelWidth":150}' flex="1" layout="vbox">
                        <ext-displayfield bind="{telegramBotLinkRecord.total_users}" :label="l10n(`Total users`)"/>
                        <ext-displayfield bind="{telegramBotLinkRecord.total_subscribed_users_text}" :label="l10n(`Subscribed users`)"/>
                        <ext-displayfield bind="{telegramBotLinkRecord.total_unsubscribed_users_text}" :label="l10n(`Unsubscribed users`)"/>
                    </ext-container>

                    <ext-container defaults='{"labelAlign":"left","labelWidth":150}' flex="1" layout="vbox">
                        <ext-displayfield bind="{telegramBotLinkRecord.total_returned_users_text}" :label="l10n(`Returned users`)"/>
                        <ext-displayfield bind="{telegramBotLinkRecord.total_disabled_users_text}" :label="l10n(`Disabled users`)"/>
                    </ext-container>
                </ext-container>

                <!-- description -->
                <ext-container bind='{"hidden":"{editDescription}"}' layout="vbox">
                    <ext-container layout='{"align":"center","type":"hbox"}'>
                        <ext-displayfield flex="1" :label="l10n(`Description`)" labelAlign="top"/>

                        <ext-button bind='{"hidden":"{!telegramBotRecord.can_update_link}"}' iconCls="fa-solid fa-pen" :text="l10n(`Edit`)" @tap="beginEditDescription"/>
                    </ext-container>

                    <ext-displayfield bind="{telegramBotLinkRecord.description_html}" encodeHtml="false"/>
                </ext-container>

                <ext-container bind='{"hidden":"{!editDescription}"}' layout="vbox">
                    <ext-container layout='{"align":"center","type":"hbox"}'>
                        <ext-displayfield flex="1" :label="l10n(`Description`)" labelAlign="top"/>

                        <ext-button iconCls="fa-solid fa-check" :text="l10n(`Save`)" @tap="saveDescription"/>

                        <ext-button iconCls="fa-solid fa-xmark" :text="l10n(`Cancel`)" ui="decline" @tap="cancelEditDescription"/>
                    </ext-container>

                    <ext-textareafield ref="descriptionEditField" height="200" maxLength="10000"/>
                </ext-container>

                <ext-spacer/>

                <ext-container layout='{"align":"center","type":"vbox"}'>
                    <ext-button bind='{"hidden":"{!telegramBotRecord.can_delete_link}"}' iconCls="fa-regular fa-trash-can" :text="l10n(`Delete link`)" ui="decline" width="250" @tap="_deleteLink"/>
                </ext-container>
            </ext-panel>
        </template>
    </CardsPanel>
</template>

<script>
import CardsPanel from "#src/components/cards.panel";
import ChartsDialog from "./charts.dialog";

export default {
    "components": { CardsPanel },

    "props": {
        "telegramBotRecord": {
            "type": Object,
            "required": true,
        },
        "telegramBotLinkRecord": {
            "type": Object,
            "required": true,
        },
    },

    "emits": [ "linkDelete" ],

    "methods": {
        async refresh () {
            this.$refs.cardsPanel.mask();

            const res = await this.$api.call( "telegram/bots/links/get-link", this.telegramBotLinkRecord.id );

            this.$refs.cardsPanel.setResult( res );

            if ( res.ok ) {
                this.telegramBotLinkRecord.set( res.data );
            }
            else {
                this.$toast( res );
            }
        },

        ready ( e ) {
            this.$refs.dataPanel.ext.getViewModel().set( "telegramBotRecord", this.telegramBotRecord );

            this._onRecordChange();
        },

        // protected
        _onRecordChange () {
            this.cancelEditName();
            this.cancelEditDescription();

            this.$refs.dataPanel.ext.getViewModel().set( "telegramBotLinkRecord", this.telegramBotLinkRecord );

            if ( this.telegramBotLinkRecord ) {
                this.$refs.cardsPanel.showDataPanel();
            }
            else {
                this.$refs.cardsPanel.showNoDataPanel();
            }
        },

        beginEditName () {
            this.$refs.nameEditField.ext.setValue( this.telegramBotLinkRecord.get( "name" ) );

            this.$refs.dataPanel.ext.getViewModel().set( "editName", true );
        },

        cancelEditName () {
            this.$refs.dataPanel.ext.getViewModel().set( "editName", false );
        },

        async saveName () {
            const field = this.$refs.nameEditField.ext,
                value = field.getValue().trim();

            field.setValue( value );

            // form is not valid
            if ( !field.validate() ) return;

            if ( value === this.telegramBotLinkRecord.get( "name" ) ) return this.cancelEditName();

            const res = await this.$api.call( "telegram/bots/links/update-link", this.telegramBotRecord.id, this.telegramBotLinkRecord.id, { "name": value } );

            if ( res.ok ) {
                this.telegramBotLinkRecord.set( "name", value );

                this.cancelEditName();

                this.$toast( l10n( "Link updated" ) );
            }
            else {
                this.$toast( res );
            }
        },

        beginEditDescription () {
            this.$refs.descriptionEditField.ext.setValue( this.telegramBotLinkRecord.get( "description" ) );

            this.$refs.dataPanel.ext.getViewModel().set( "editDescription", true );
        },

        cancelEditDescription () {
            this.$refs.dataPanel.ext.getViewModel().set( "editDescription", false );
        },

        async saveDescription () {
            const field = this.$refs.descriptionEditField.ext,
                value = field.getValue().trim();

            field.setValue( value );

            // form is not valid
            if ( value === this.telegramBotLinkRecord.get( "description" ) ) return this.cancelEditDescription();

            const res = await this.$api.call( "telegram/bots/links/update-link", this.telegramBotRecord.id, this.telegramBotLinkRecord.id, { "description": value } );

            if ( res.ok ) {
                this.telegramBotLinkRecord.set( "description", value );

                this.cancelEditDescription();

                this.$toast( l10n( "Link updated" ) );
            }
            else {
                this.$toast( res );
            }
        },

        async _deleteLink ( e ) {
            if ( !( await this.$utils.confirm( l10n( "Are you sure you want to delete this link and all it's data? This operation is not revertable." ) ) ) ) return;

            const button = e.detail.sender;

            button.disable();

            const res = await this.$api.call( "telegram/bots/links/delete-link", this.telegramBotRecord.id, this.telegramBotLinkRecord.id );

            button.enable();

            if ( res.ok ) {
                this.$toast( l10n( "Link deleted" ) );

                this.$refs.cardsPanel.showNoDataPanel();

                this.$emit( "linkDelete", this.telegramBotLinkRecord );
            }
            else {
                this.$toast( res );
            }
        },

        async _copyLink ( button ) {
            this.$utils.copyToClipboard( this.telegramBotLinkRecord.get( "link" ) );

            this.$toast( l10n( "Link copied to the clipboard" ) );
        },

        async _showChartsDialog () {
            const cmp = await this.$mount( ChartsDialog, {
                "props": {
                    "telegramBotRecord": this.telegramBotRecord,
                    "telegramBotLinkRecord": this.telegramBotLinkRecord,
                },
            } );

            cmp.ext.show();
        },
    },
};
</script>
