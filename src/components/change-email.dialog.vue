<template>
    <ext-dialog height="350" :title="title" width="300" @ready="_ready">
        <ext-fieldpanel ref="form">
            <ext-container :html="l10n(`Enter new email address which you want to use.`)" layout="center"/>

            <ext-emailfield :label="l10n(`New email address`)" name="email" :placeholder="l10n(`Enter new email address`)" required="true" validators="email"/>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom" layout='{"pack":"end","type":"hbox"}'>
            <ext-button :text="l10n(`Send token`)" ui="action" @tap="_sendToken"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
export default {
    "computed": {
        title () {
            return l10n( "Email change" );
        },
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;

            this.ext.setKeyMap( { "ENTER": this._sendToken.bind( this ) } );
        },

        async _sendToken () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            this.ext.mask();

            const res = await this.$api.call( "account/send-email-change-token", values.email );

            this.ext.unmask();

            if ( res.ok ) {
                this.$toast( l10n( "Change email address token was sent to the new email address" ) );

                this.ext.close();
            }
            else {
                this.$toast( res );
            }
        },
    },
};
</script>
