<template>
    <ext-dialog height="350" layout="vbox" :title="l10n(`Password change`)" width="300" @destroy="_onDestroy" @ready="_ready">
        <ext-fieldpanel ref="form">
            <ext-hiddenfield name="token" :value="token"/>

            <ext-passwordfield :label="l10n(`New password`)" name="password" :placeholder="l10n(`Enter new password`)" required="true" revealable="true"/>

            <ext-passwordfield :label="l10n(`Confirm new password`)" name="confirmedPassword" :placeholder="l10n(`Confirm new password`)" required="true" revealable="true"/>

            <ext-container layout="center">
                <ext-button :text="l10n(`Generate random password`)" @tap="_generateRandomPassword"/>
            </ext-container>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom" layout='{"pack":"end","type":"hbox"}'>
            <ext-button :text="l10n(`Change password`)" ui="action" @tap="_submit"/>
        </ext-toolbar>
    </ext-dialog>
</template>

<script>
import Passwords from "#core/crypto/passwords";

export default {
    "computed": {
        token () {
            return this.$app.router.searchParams.get( "token" );
        },
    },

    "methods": {
        _ready ( e ) {
            this.ext = e.detail.cmp;

            if ( !this.token ) {
                this.$toast( l10n( "Password recovery token was not found" ), 5000 );

                this.close();
            }

            this.$refs.form.ext.getFields( "password" ).setValidators( {
                "type": "password-strength",
                "allowWeakPasswords": this.$app.settings.allowWeakPasswords,
            } );

            this.ext.setKeyMap( { "ENTER": this._submit.bind( this ) } );
        },

        _onDestroy () {
            this.$router.reload( "/", { "replace": true } );
        },

        close () {
            this.ext.close();
        },

        async _submit () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            if ( values.password !== values.confirmedPassword ) {
                form.getFields( "confirmedPassword" ).setError( l10n( "Passwords do not match" ) );

                return;
            }

            this.ext.mask();

            const res = await this.$api.call( "session/set-password-by-token", values.token, values.password );

            this.ext.unmask();

            if ( res.ok ) {
                this.$toast( l10n( "Password changed" ) );

                this.close();
            }
            else {
                this.$toast( res );
            }
        },

        _generateRandomPassword () {
            const password = Passwords.default.generateRandomPassword().password;

            this.$utils.copyToClipboard( password );

            this.$toast( l10n( "Password copied to the clipboard" ) );

            this.$refs.form.ext.getFields( "password" ).setValue( password );
            this.$refs.form.ext.getFields( "confirmedPassword" ).setValue( password );
        },
    },
};
</script>
