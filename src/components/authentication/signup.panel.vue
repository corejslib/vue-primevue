<template>
    <ext-panel layout="vbox" scrollable="true" @ready="_ready">
        <ext-toolbar docked="top">
            <ext-spacer/>
            <ext-container :html="l10n(`Sign up`)"/>
            <ext-spacer/>
        </ext-toolbar>

        <!-- oauth -->
        <ext-container layout="center">
            <OauthContainer margin="0 0 10 0" width="95%" @tap="_oauthTap"/>
        </ext-container>

        <ext-fieldpanel ref="form" defaults='{"margin":"0 0 0 0"}'>
            <ext-emailfield :label="l10n(`Email address`)" name="email" :placeholder="l10n(`Enter your email address`)" required="true" validators="email"/>

            <ext-passwordfield :label="l10n(`Password`)" name="password" :placeholder="l10n(`Enter password`)" required="true" revealable="true"/>

            <ext-passwordfield :label="l10n(`Confirm password`)" name="confirmedPassword" :placeholder="l10n(`Confirm password`)" required="true" revealable="true"/>
        </ext-fieldpanel>

        <ext-toolbar docked="bottom" layout='{"align":"center","type":"hbox"}'>
            <ext-button iconCls="fa-solid fa-arrow-left" :text="l10n(`Back`)" @tap="back"/>
            <ext-spacer/>
            <ext-button :text="l10n(`Sign up`)" ui="action" @tap="_submit"/>
        </ext-toolbar>
    </ext-panel>
</template>

<script>
import OauthContainer from "#src/components/oauth.container";

export default {
    "components": { OauthContainer },

    "emits": [ "signin" ],

    "methods": {
        _ready ( e ) {
            const cmp = e.detail.cmp;

            this.$refs.form.ext.getFields( "password" ).setValidators( {
                "type": "password-strength",
                "allowWeakPasswords": this.$app.settings.allowWeakPasswords,
            } );

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

            this.$refs.form.ext.getFields( "password" ).setRevealed( false );
            this.$refs.form.ext.getFields( "confirmedPassword" ).setRevealed( false );
        },

        _submit () {
            const form = this.$refs.form.ext;

            if ( !form.validate() ) return;

            const values = form.getValues();

            if ( values.password !== values.confirmedPassword ) {
                form.getFields( "confirmedPassword" ).setError( l10n( "Passwords do not match" ) );

                return;
            }

            delete values.confirmedPassword;

            const email = values.email;
            delete values.email;

            this._signUp( email, values );
        },

        _oauthTap ( oauthProvider ) {
            this._signUp( { oauthProvider } );
        },

        async _signUp ( email, fields ) {
            this.$app.mask();

            const res = await this.$app.signUp( email, fields );

            if ( res.ok ) {

                // sign in
                if ( res.data?.token ) return;

                this.$app.unmask();

                this.$toast( res, 5000 );

                this.back();
            }
            else {
                this.$app.unmask();

                this.$toast( res );
            }
        },
    },
};
</script>
