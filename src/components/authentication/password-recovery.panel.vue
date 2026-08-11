<template>
    <ext-panel layout="vbox" scrollable="true" @ready="_ready">
        <ext-toolbar docked="top">
            <ext-spacer/>
            <ext-container :html="l10n(`Password recovery`)"/>
            <ext-spacer/>
        </ext-toolbar>

        <ext-fieldpanel ref="form" defaults='{"margin":"0 0 0 0"}'>
            <ext-emailfield :label="l10n(`Email address`)" name="email" :placeholder="l10n(`Enter your email address`)" required="true" validators="email"/>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom">
            <ext-button iconCls="fa-solid fa-arrow-left" :text="l10n(`Back`)" @tap="back"/>
            <ext-spacer/>
            <ext-button :text="l10n(`Recover`)" ui="action" @tap="_submit"/>
        </ext-toolbar>
    </ext-panel>
</template>

<script>
export default {
    "emits": [ "signin" ],

    "methods": {
        _ready ( e ) {
            const cmp = e.detail.cmp;

            cmp.setKeyMap( { "ENTER": this._submit.bind( this ) } );

            this._backListener = this.back.bind( this );

            cmp.on( "activate", () => {
                this.$app.on( "device/back-button", this._backListener );
            } );
        },

        back () {
            this.$app.off( "device/back-button", this._backListener );

            this.$emit( "signin" );

            this.$refs.form.ext.reset();
        },

        async _submit () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            this.$app.mask();

            const res = await this.$api.call( "session/send-password-recovery-email", values.email );

            this.$app.unmask();

            if ( !res.ok ) {
                this.$toast( res );
            }
            else {
                form.reset();

                this.$toast( l10n( "Password change instructions were sent to the email address, associated with your account." ), 5000 );

                this.back();
            }
        },
    },
};
</script>
