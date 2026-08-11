<template>
    <ext-dialog height="350" layout="fit" :title="l10n(`Change bot API token`)" width="300" @ready="_ready">
        <ext-fieldpanel ref="formPanel">
            <ext-textfield :label="l10n(`New API token`)" name="api_token" :placeholder="l10n(`Enter new API token`)" required="true"/>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom">
            <ext-spacer/>
            <ext-button :text="l10n(`Save`)" ui="action" @tap="_save"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
export default {
    "props": {
        "telegramBotId": {
            "type": Number,
            "required": true,
        },
    },

    "methods": {
        _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.on( "beforeClose", () => {
                if ( this._saving ) return false;
            } );
        },

        async _save () {
            const form = this.$refs.formPanel.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            this.ext.mask();
            this._saving = true;

            const res = await this.$api.call( "telegram/bots/set-bot-api-token", this.telegramBotId, values.api_token );

            this._saving = false;
            this.ext.unmask();

            if ( res.ok ) {
                this.$toast( l10n( "Bot updated" ) );

                this.ext.close();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
