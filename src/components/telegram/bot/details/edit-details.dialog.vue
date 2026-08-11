<template>
    <ext-dialog height="90%" layout="fit" :title="l10n(`Edit bot details`)" width="700" @ready="_ready">
        <ext-formpanel ref="formPanel" layout="vbox" trackResetOnLoad="true">
            <ext-textfield :label="l10n(`Bot name`)" labelAlign="top" maxLength="64" name="name" required="true"/>

            <ext-textareafield :label="l10n(`Short description`) + `.<br/>` + l10n(`Bot short description is shown on the bot profile page and is sent together with the link when users share the bot.`)" labelAlign="top" maxLength="120" name="short_description" wrap="off"/>

            <ext-textareafield flex="1" :label="l10n(`Description`) + `.<br/>` + l10n(`Bot description is shown in the chat with the bot if the chat is empty.`)" labelAlign="top" maxLength="512" name="description" wrap="off"/>
        </ext-formpanel>

        <ext-toolbar docked="bottom">
            <ext-spacer/>
            <ext-button ref="saveButton" disabled="true" :text="l10n(`Save`)" ui="action" @tap="_save"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
export default {
    "props": {
        "record": {
            "type": Object,
            "required": true,
        },
    },

    "methods": {
        _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.on( "beforeClose", () => {
                if ( this._saving ) return false;
            } );

            this.$refs.formPanel.ext.on( "dirtychange", ( cmp, dirty ) => this.$refs.saveButton.ext.setDisabled( !dirty ) );

            this.$refs.formPanel.ext.setRecord( this.record );
        },

        async _save () {
            const form = this.$refs.formPanel.ext,
                values = form.getValues();

            for ( const name in values ) values[ name ] = values[ name ].trim();

            if ( !form.validate() ) return;

            this.ext.mask();
            this._saving = true;

            const res = await this.$api.call( "telegram/bots/update-bot-details", this.record.id, values );

            this._saving = false;
            this.ext.unmask();

            if ( res.ok ) {
                form.setValues( values );

                this.$toast( l10n( "Bot updated" ) );

                form.fillRecord( this.record );

                this.ext.close();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
